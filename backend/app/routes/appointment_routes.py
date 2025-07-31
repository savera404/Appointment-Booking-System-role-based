# backend/app/routes/appointment_routes.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.database import get_database
from app.schemas.appointment_schema import AppointmentCreate, AppointmentResponse
from app.services.appointment_service import (
    create_appointment_logic,
    get_all_appointments,
    get_appointment_by_id,
    get_appointments_by_patient_id,
    delete_appointment, 
    attach_audio_to_appointment,
    update_appointment_logic,
    update_appointment_status
)
from app.services.audio_storage_service import save_audio_to_gridfs
from app.services.consultation_notes_service import save_consultation_note
from app.services.rag_service import build_vector_store_from_appointment
from app.utils.transcription import transcribe_audio_from_gridfs
from app.services.whisper_transcriber_service import merge_segments_by_token_limit, test_whisper_installation
from app.routes.auth_routes import get_current_user
from app.models.user import User
from app.services.patient_service import get_patient_by_user_id
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# POST: Create appointment (admin only)
@router.post("/", response_model=AppointmentResponse)
async def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create appointments")
    
    return await create_appointment_logic(data)

# POST: Create appointment (patient can create their own)
@router.post("/patient-create", response_model=AppointmentResponse)
async def create_patient_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can create their own appointments")
    
    try:
        # Get patient profile
        patient = await get_patient_by_user_id(current_user.id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # Verify the appointment is for the current patient
        if data.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="You can only create appointments for yourself")
        
        # Verify doctor exists
        doctor = await db.doctors.find_one({"_id": ObjectId(data.doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail=f"Doctor not found for id: {data.doctor_id}")
        
        # Check if the slot is available
        slot = await db.availabilities.find_one({
            "doctorId": data.doctor_id,
            "date": data.date,
            "startTime": data.time,
            "status": "Available"
        })
        
        if not slot:
            raise HTTPException(status_code=400, detail="Selected time slot is no longer available")
        
        # Create appointment
        created_appointment = await create_appointment_logic(data)
        
        # Update the availability slot status to "Booked"
        from app.services.appointment_service import update_slot_status_to_booked
        slot_updated = await update_slot_status_to_booked(data.doctor_id, data.date, data.time)
        
        if slot_updated:
            print(f"✅ Successfully updated slot status to 'Booked' for appointment {created_appointment.id}")
        else:
            print(f"⚠️ Warning: Could not update slot status for appointment {created_appointment.id}")
        
        return created_appointment
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error creating appointment: {e}")

# GET: All appointments (admin only)
@router.get("/", response_model=list[AppointmentResponse])
async def read_all_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all appointments")
    
    return await get_all_appointments()

# GET: Patient's own appointments
@router.get("/my-appointments", response_model=list[AppointmentResponse])
async def read_my_appointments(current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can view their appointments")
    
    # Get patient profile
    patient = await get_patient_by_user_id(current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    return await get_appointments_by_patient_id(patient.id)

# GET: Appointment by ID (admin can see any, patient can see their own)
@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def read_appointment_by_id(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    appointment = await get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If patient, verify they own this appointment
    if current_user.role == "patient":
        patient = await get_patient_by_user_id(current_user.id)
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return appointment

# DELETE: Delete appointment by ID (admin only)
@router.delete("/{appointment_id}", status_code=204)
async def delete_appointment_by_id(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete appointments")
    
    success = await delete_appointment(appointment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found")

# PATCH: Update appointment status (admin only)
@router.patch("/status/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_status_by_id(
    appointment_id: str,
    status_update: dict,
    current_user: User = Depends(get_current_user)
):
    print(f"🔍 PATCH route called with appointment_id: {appointment_id}")
    print(f"🔍 Status update data: {status_update}")
    print(f"🔍 Current user: {current_user.email}, role: {current_user.role}")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update appointment status")
    
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status field is required")
    
    # Validate status values
    valid_statuses = ["Confirmed", "Pending", "Cancelled", "Completed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    print(f"🔍 Calling update_appointment_status with id: {appointment_id}, status: {new_status}")
    updated = await update_appointment_status(appointment_id, new_status)
    if not updated:
        print(f"❌ Appointment not found: {appointment_id}")
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    print(f"✅ Appointment updated successfully: {appointment_id}")
    return updated

# PUT: Update appointment (admin only)
@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment_by_id(
    appointment_id: str, 
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update appointments")
    
    updated = await update_appointment_logic(appointment_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated

# POST: Upload audio file for an existing appointment (patient can upload to their own appointments)
@router.post("/{appointment_id}/upload-audio")
async def upload_audio_for_appointment(
    appointment_id: str,
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    print(f"🎵 Starting audio upload for appointment: {appointment_id}")
    print(f"📁 Audio file: {audio_file.filename}, size: {audio_file.size} bytes")
    
    # Verify appointment exists and user has access
    appointment = await get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If patient, verify they own this appointment
    if current_user.role == "patient":
        patient = await get_patient_by_user_id(current_user.id)
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db = get_database()
    file_bytes = await audio_file.read()
    print(f"💾 Saving {len(file_bytes)} bytes to GridFS...")
    file_id = save_audio_to_gridfs(file_bytes, audio_file.filename)
    print(f"✅ File saved with ID: {file_id}")

    await attach_audio_to_appointment(appointment_id, file_id)
    print(f"🔗 Audio attached to appointment")

    # Transcribe after saving
    print(f"🎤 Starting transcription process...")
    transcript = await transcribe_audio_from_gridfs(db, file_id)
    print(f"📝 Transcription result: {transcript}")

    segments = transcript.get("segments", [])
    print(f"📊 Found {len(segments)} segments")

    #Divide into chunks
    transcript = merge_segments_by_token_limit(segments, max_tokens=300)
    print(f"📦 Created {len(transcript)} chunks")

    # Saving to consultation notes
    print(f"💾 Saving to consultation notes...")
    await save_consultation_note(appointment_id, transcript)
    print(f"✅ Consultation note saved")

    print(f"🔍 Building vector store...")
    await build_vector_store_from_appointment(appointment_id)
    print(f"✅ Vector store built")

    return {"message": "Audio uploaded and transcribed", "file_id": str(file_id), "transcript": transcript}


# GET: Check transcription status for an appointment
@router.get("/{appointment_id}/transcription-status")
async def get_transcription_status(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Check if transcription is complete for an appointment"""
    
    # Verify appointment exists and user has access
    appointment = await get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If patient, verify they own this appointment
    if current_user.role == "patient":
        patient = await get_patient_by_user_id(current_user.id)
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if consultation note exists
    db = get_database()
    consultation_note = await db.consultation_notes.find_one({"appointment_id": appointment_id})
    
    if not consultation_note:
        return {
            "status": "not_started",
            "message": "No transcription found for this appointment"
        }
    
    transcript = consultation_note.get("transcript", [])
    if not transcript:
        return {
            "status": "not_started",
            "message": "No transcript data found"
        }
    
    # Check if we have actual transcription or placeholder
    first_segment = transcript[0] if transcript else {}
    text = first_segment.get("text", "")
    
    if "Audio file uploaded successfully" in text or "Transcription failed" in text:
        return {
            "status": "failed",
            "message": "Transcription failed or returned placeholder text",
            "transcript_preview": text[:100]
        }
    
    return {
        "status": "completed",
        "message": "Transcription completed successfully",
        "transcript_preview": text[:100],
        "segment_count": len(transcript)
    }


# POST: Manually rebuild vector store for an appointment
@router.post("/{appointment_id}/rebuild-vector-store")
async def rebuild_vector_store(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Manually rebuild the vector store for an appointment"""
    
    # Verify appointment exists and user has access
    appointment = await get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If patient, verify they own this appointment
    if current_user.role == "patient":
        patient = await get_patient_by_user_id(current_user.id)
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    print(f"🔧 Manually rebuilding vector store for appointment: {appointment_id}")
    success = await build_vector_store_from_appointment(appointment_id)
    
    if success:
        return {"message": "Vector store rebuilt successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to rebuild vector store")


# GET: Test Whisper installation
@router.get("/test-whisper")
async def test_whisper():
    """Test if Whisper is properly installed and working"""
    try:
        result = test_whisper_installation()
        return {
            "status": "success" if result else "failed",
            "message": "Whisper test completed",
            "working": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Whisper test failed: {str(e)}",
            "working": False
        }