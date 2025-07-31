# backend/app/services/appointment_service.py

from app.schemas.appointment_schema import AppointmentCreate
from app.models.appointment import Appointment
from app.database import get_database
from bson import ObjectId
from datetime import datetime
from app.utils.serializers import serialize_mongo_doc
from typing import List
import uuid


# CREATE Appointment
async def create_appointment_logic(data: AppointmentCreate) -> Appointment:
    db = get_database()
    appointment_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    appointment_dict = data.dict()
    appointment_dict.update({
        "id": appointment_id,
        "status": "Confirmed",
        "created_at": now,
        "updated_at": now
    })

    result = await db.appointments_new.insert_one(appointment_dict)
    created_doc = await db.appointments_new.find_one({"_id": result.inserted_id})
    return Appointment(**serialize_mongo_doc(created_doc))

# READ ALL Appointments
async def get_all_appointments() -> List[Appointment]:
    db = get_database()
    cursor = db.appointments_new.find()
    appointments = []
    
    async for doc in cursor:
        # Get patient and doctor names
        # Try to find patient by ObjectId first, then by UUID string
        patient = None
        patient_id = doc.get("patient_id")
        if patient_id:
            # Try as ObjectId first (old format)
            try:
                from bson import ObjectId
                patient = await db.patients_new.find_one({"_id": ObjectId(patient_id)})
            except:
                pass
            
            # If not found, try as UUID string (new format)
            if not patient:
                patient = await db.patients_new.find_one({"id": patient_id})
        
        # Get doctor by ObjectId
        doctor = None
        doctor_id = doc.get("doctor_id")
        if doctor_id:
            try:
                from bson import ObjectId
                doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
            except:
                pass
        
        appointment_data = serialize_mongo_doc(doc)
        appointment_data["patientName"] = patient.get("name", "Unknown") if patient else "Unknown"
        appointment_data["doctorName"] = doctor.get("name", "Unknown") if doctor else "Unknown"
        appointment_data["type"] = "Consultation"  # Default type
        appointment_data["notes"] = doc.get("condition", "")  # Use condition as notes
        
        appointments.append(Appointment(**appointment_data))
    
    return appointments

# READ by ID
async def get_appointment_by_id(appointment_id: str) -> Appointment | None:
    db = get_database()
    # Try to find by either 'id' field or '_id' field
    try:
        from bson import ObjectId
        doc = await db.appointments_new.find_one({
            "$or": [{"id": appointment_id}, {"_id": ObjectId(appointment_id)}]
        })
    except:
        # If ObjectId conversion fails, just search by id field
        doc = await db.appointments_new.find_one({"id": appointment_id})
    
    if not doc:
        return None
    
    # Get patient and doctor names
    # Try to find patient by ObjectId first, then by UUID string
    patient = None
    patient_id = doc.get("patient_id")
    if patient_id:
        # Try as ObjectId first (old format)
        try:
            from bson import ObjectId
            patient = await db.patients_new.find_one({"_id": ObjectId(patient_id)})
        except:
            pass
        
        # If not found, try as UUID string (new format)
        if not patient:
            patient = await db.patients_new.find_one({"id": patient_id})
    
    # Get doctor by ObjectId
    doctor = None
    doctor_id = doc.get("doctor_id")
    if doctor_id:
        try:
            from bson import ObjectId
            doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        except:
            pass
    
    appointment_data = serialize_mongo_doc(doc)
    appointment_data["patientName"] = patient.get("name", "Unknown") if patient else "Unknown"
    appointment_data["doctorName"] = doctor.get("name", "Unknown") if doctor else "Unknown"
    appointment_data["type"] = "Consultation"  # Default type
    appointment_data["notes"] = doc.get("condition", "")  # Use condition as notes
    
    return Appointment(**appointment_data)

# READ by Patient ID
async def get_appointments_by_patient_id(patient_id: str) -> List[Appointment]:
    db = get_database()
    cursor = db.appointments_new.find({"patient_id": patient_id})
    appointments = []
    
    async for doc in cursor:
        # Get doctor name
        doctor = None
        doctor_id = doc.get("doctor_id")
        if doctor_id:
            try:
                from bson import ObjectId
                doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
            except:
                pass
        
        appointment_data = serialize_mongo_doc(doc)
        appointment_data["patientName"] = "You"  # Since it's the patient's own appointments
        appointment_data["doctorName"] = doctor.get("name", "Unknown") if doctor else "Unknown"
        appointment_data["type"] = "Consultation"  # Default type
        appointment_data["notes"] = doc.get("condition", "")  # Use condition as notes
        
        appointments.append(Appointment(**appointment_data))
    
    return appointments

# DELETE
async def delete_appointment(appointment_id: str) -> bool:
    db = get_database()
    result = await db.appointments_new.delete_one({"id": appointment_id})
    return result.deleted_count == 1

async def update_appointment_logic(appointment_id: str, data: AppointmentCreate) -> Appointment | None:
    db = get_database()
    update_data = data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.appointments_new.find_one_and_update(
        {"id": appointment_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        return None
    return Appointment(**serialize_mongo_doc(result))

async def update_appointment_status(appointment_id: str, status: str) -> Appointment | None:
    """Update only the status of an appointment."""
    print(f"🔍 update_appointment_status called with id: {appointment_id}, status: {status}")
    db = get_database()
    
    # First, let's check if the appointment exists
    existing = await db.appointments_new.find_one({"id": appointment_id})
    print(f"🔍 Existing appointment found: {existing is not None}")
    if existing:
        print(f"🔍 Current appointment data: {existing}")
    
    # Let's also check what appointments exist in the database
    all_appointments = await db.appointments_new.find().to_list(length=10)
    print(f"🔍 All appointments in database: {[app.get('id') for app in all_appointments]}")
    
    # Try searching by ObjectId as well
    try:
        from bson import ObjectId
        existing_by_objectid = await db.appointments_new.find_one({"_id": ObjectId(appointment_id)})
        print(f"🔍 Found by ObjectId: {existing_by_objectid is not None}")
        if existing_by_objectid:
            print(f"🔍 Appointment found by ObjectId: {existing_by_objectid}")
    except:
        print(f"🔍 Could not search by ObjectId for: {appointment_id}")
    
    # Try to find and update by either 'id' field or '_id' field
    result = await db.appointments_new.find_one_and_update(
        {"$or": [{"id": appointment_id}, {"_id": ObjectId(appointment_id)}]},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    print(f"🔍 Update result: {result is not None}")
    if not result:
        print(f"❌ No appointment found with id: {appointment_id}")
        return None
    
    # Get patient and doctor names for the response
    doc = result
    patient = None
    patient_id = doc.get("patient_id")
    if patient_id:
        try:
            from bson import ObjectId
            patient = await db.patients_new.find_one({"_id": ObjectId(patient_id)})
        except:
            pass
        
        if not patient:
            patient = await db.patients_new.find_one({"id": patient_id})
    
    doctor = None
    doctor_id = doc.get("doctor_id")
    if doctor_id:
        try:
            from bson import ObjectId
            doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        except:
            pass
    
    appointment_data = serialize_mongo_doc(doc)
    appointment_data["patientName"] = patient.get("name", "Unknown") if patient else "Unknown"
    appointment_data["doctorName"] = doctor.get("name", "Unknown") if doctor else "Unknown"
    appointment_data["type"] = "Consultation"  # Default type
    appointment_data["notes"] = doc.get("condition", "")  # Use condition as notes
    
    return Appointment(**appointment_data)

# UPDATE: Add/Update audio file reference
async def attach_audio_to_appointment(appointment_id: str, audio_file_id: str) -> bool:
    db = get_database()
    result = await db.appointments_new.update_one(
        {"id": appointment_id},
        {
            "$set": {
                "audio_file_id": audio_file_id,
                "updated_at": datetime.utcnow()
            }
        }
    )
    return result.modified_count == 1

# UPDATE: Update availability slot status to "Booked"
async def update_slot_status_to_booked(doctor_id: str, date: str, time: str) -> bool:
    """
    Update the status of an availability slot to "Booked" when an appointment is created.
    
    Args:
        doctor_id: The ID of the doctor
        date: The appointment date (YYYY-MM-DD format)
        time: The appointment time (HH:MM format)
    
    Returns:
        bool: True if slot was updated successfully, False otherwise
    """
    try:
        db = get_database()
        
        # Find and update the specific slot
        result = await db.availabilities.update_one(
            {
                "doctorId": doctor_id,
                "date": date,
                "startTime": time,
                "status": "Available"  # Only update if still available
            },
            {
                "$set": {
                    "status": "Booked",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 1:
            print(f"✅ Successfully updated slot status to 'Booked' for doctor {doctor_id} on {date} at {time}")
            return True
        else:
            print(f"⚠️ No slot found or already booked for doctor {doctor_id} on {date} at {time}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating slot status: {e}")
        return False