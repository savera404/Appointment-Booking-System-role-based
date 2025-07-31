from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from app.schemas.appointment_schema import AppointmentCreate
from app.services.openaiService import OpenAIService
from app.services.atlasSearchService import DoctorSearchService
from app.services.appointment_service import create_appointment_logic, update_slot_status_to_booked
from app.services.patient_service import get_patient_by_user_id
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.routes.auth_routes import get_current_user
from app.models.user import User
import re
from bson import ObjectId
from app.utils.serializers import serialize_mongo_doc

router = APIRouter(prefix="/api")
openai_service = OpenAIService()
doctor_search_service = DoctorSearchService()


class ChatMessage(BaseModel):
    role: str
    content: str
    isUser: Optional[bool] = False


class ChatRequest(BaseModel):
    message: str
    conversationHistory: List[ChatMessage]


@router.post("/chat")
async def chat_endpoint(
        body: ChatRequest,
        current_user: User = Depends(get_current_user),
        db: AsyncIOMotorDatabase = Depends(get_database),
):
    # Only patients can use the chat
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can use the chat")
    
    message = body.message
    conversation_history = [msg.dict() for msg in body.conversationHistory]

    # Get patient profile
    patient = await get_patient_by_user_id(current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    ai_response = openai_service.chat_with_patient(message, conversation_history)

    if not ai_response.get("success"):
        return {"error": ai_response["message"]}

    extracted_info = openai_service.extract_appointment_info_with_llm(ai_response["conversationHistory"])
    clean_extracted_info = {}

    for key, value in extracted_info.items():
        if value:
            cleaned_value = value.strip()

            if key == "condition":
                cleaned_value = re.sub(
                    r"\b(doctor|recommendation|help|please|thanks|thank you|yes|no|okay|sure|proceed with recommendations)\b",
                    "",
                    value,
                    flags=re.I,
                ).strip()

            if key == "date":
                # Basic date validation
                if re.match(r'\d{4}-\d{2}-\d{2}', value):
                    cleaned_value = value

            if key == "time":
                # Basic time validation
                if re.match(r'\d{2}:\d{2}', value):
                    cleaned_value = value

            if cleaned_value:
                clean_extracted_info[key] = cleaned_value

    appointment_info = clean_extracted_info.copy()

    # Check if we have enough condition information to search for doctors
    has_valid_condition = appointment_info.get("condition") and 2 < len(appointment_info["condition"]) < 200
    has_enough_info = has_valid_condition  # Only need condition to start doctor search

    is_confirming = openai_service.is_confirming_recommendations(message)

    doctor_recommendations: Optional[List[DoctorRecommendation]] = None

    # Search for doctors if we have a condition and user is asking for recommendations
    if has_valid_condition and (is_confirming or "recommend" in message.lower() or "doctor" in message.lower()):
        search_query = openai_service.generate_doctor_search_query_for_appointment(appointment_info)
        print(f"Searching for doctors with query: {search_query}")
        print(f"Appointment info: {appointment_info}")
        
        # Try Atlas search first, then fallback
        for method_name, method in [("Atlas", doctor_search_service.search_doctors), ("Fallback", doctor_search_service.fallback_search)]:
            print(f"Trying {method_name} search...")
            result = await method(db, search_query)
            print(f"{method_name} search result: {result}")
            if result["success"] and result["doctors"]:
                doctor_recommendations = result["doctors"]
                print(f"Found {len(doctor_recommendations)} doctors using {method_name} search")
                break
            else:
                print(f"{method_name} search failed or returned no doctors: {result.get('error', 'No error message')}")
        
        if not doctor_recommendations:
            print("❌ No doctors found with any search method")
            # Add a message indicating no doctors were found
            ai_response["message"] = "I apologize, but I couldn't find any doctors in our database who specialize in treating your condition at the moment. Please try again later or contact our support team for assistance."
        else:
            print(f"✅ Successfully found {len(doctor_recommendations)} doctors")
            
            # If we found doctors, modify the AI response to include them
            if doctor_recommendations:
                # Create a message with the actual doctor data
                doctor_list = "\n".join([
                    f"{i+1}. **{doctor['name']}** - {doctor['specialization']}, {doctor.get('location', 'Unknown location')}"
                    for i, doctor in enumerate(doctor_recommendations)
                ])
                
                # Add the doctor information to the conversation history
                doctor_message = f"""Great! I found {len(doctor_recommendations)} doctors who can help with your condition:

{doctor_list}

These are real doctors from our database who specialize in treating conditions like yours. Please let me know which doctor you'd like to book with, and I can help schedule your appointment!"""
                
                # Update the AI response to include the real doctor data
                ai_response["message"] = doctor_message

    return {
        "message": ai_response["message"],
        "conversationHistory": ai_response["conversationHistory"],
        "appointmentInfo": {
            **appointment_info,
            "id": patient.id,  # Include patient ID for appointment booking
            "name": patient.name,  # Include patient name for display
            "contact": patient.contact  # Include patient contact for display
        },
        "doctorRecommendations": doctor_recommendations or [],
        "hasEnoughInfo": has_enough_info,
        "isConfirming": is_confirming,
        "patientId": patient.id,
    }


@router.post("/clear-session")
async def clear_session(current_user: User = Depends(get_current_user)):
    """Clear the chat session for the current user"""
    # Only patients can clear their session
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can clear their session")
    
    # For now, just return success since we're not storing session state on backend
    # In a real implementation, you might clear conversation history from a database
    return {"message": "Session cleared successfully"}


@router.post("/book-appointment-from-chat")
async def book_appointment_from_chat(
        body: dict,
        current_user: User = Depends(get_current_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Only patients can book appointments
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    try:
        patient_id = body.get("patientId")
        doctor_id = body.get("doctorId")
        date = body.get("date")
        time = body.get("time")
        condition = body.get("condition", "General consultation")

        if not all([patient_id, doctor_id, date, time]):
            raise HTTPException(status_code=400, detail="All fields are required")

        # Verify patient exists and belongs to current user
        patient = await get_patient_by_user_id(current_user.id)
        if not patient or patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Verify doctor exists
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail=f"Doctor not found for id: {doctor_id}")

        # Check if the slot is still available
        slot = await db.availabilities.find_one({
            "doctorId": doctor_id,
            "date": date,
            "startTime": time,
            "status": "Available"
        })
        
        if not slot:
            raise HTTPException(status_code=400, detail="Selected time slot is no longer available")

        # Create appointment in appointments_new collection
        appointment_data = AppointmentCreate(
            patient_id=patient_id,
            doctor_id=doctor_id,
            date=date,
            time=time,
            condition=condition
        )

        created_appointment = await create_appointment_logic(appointment_data)

        # Update the availability slot status to "Booked"
        slot_updated = await update_slot_status_to_booked(doctor_id, date, time)
        
        if slot_updated:
            print(f"✅ Successfully updated slot status to 'Booked' for appointment {created_appointment.id}")
        else:
            print(f"⚠️ Warning: Could not update slot status for appointment {created_appointment.id}")

        return {
            "success": True,
            "appointment": created_appointment.dict(),
            "message": "Appointment booked successfully"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error booking appointment: {e}")


@router.get("/doctors/{doctor_id}/availability")
async def get_doctor_availability(
        doctor_id: str,
        current_user: User = Depends(get_current_user),
        db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Only patients can check availability
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can check availability")
    
    try:
        result = await doctor_search_service.get_available_time_slots(db, doctor_id)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))

        return result["timeSlots"]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching availability: {e}")
