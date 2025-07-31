# backend/app/services/consultation_note_service.py

from app.schemas.consultation_notes_schema import ConsultationNoteCreate
from app.models.consultation_notes import ConsultationNotes
from app.database import db
from bson import ObjectId
from datetime import datetime
from app.utils.serializers import serialize_mongo_doc
from typing import Dict, Any


# CREATE
async def create_consultation_note_logic(data: ConsultationNoteCreate) -> ConsultationNotes:
    note_dict = data.dict()
    note_dict["created_at"] = datetime.utcnow()

    result = await db.consultation_notes.insert_one(note_dict)
    created_doc = await db.consultation_notes.find_one({"_id": result.inserted_id})
    return ConsultationNotes(**serialize_mongo_doc(created_doc))


# READ ALL
async def get_all_consultation_notes() -> list[ConsultationNotes]:
    cursor = db.consultation_notes.find()
    return [ConsultationNotes(**serialize_mongo_doc(doc)) async for doc in cursor]


# READ BY ID
async def get_consultation_note_by_id(note_id: str) -> ConsultationNotes | None:
    doc = await db.consultation_notes.find_one({"_id": ObjectId(note_id)})
    return ConsultationNotes(**serialize_mongo_doc(doc)) if doc else None


# DELETE
async def delete_consultation_note(note_id: str) -> bool:
    result = await db.consultation_notes.delete_one({"_id": ObjectId(note_id)})
    return result.deleted_count == 1


# whisper output to consultation notes transcript
async def save_consultation_note(appointment_id: str, transcript: Dict[str, Any]):
    print(f"Saving consultation note for appointment: {appointment_id}")
    print(f"Transcript type: {type(transcript)}")
    print(f"Transcript content: {transcript}")
    
    # Check if a consultation note already exists for this appointment
    existing_note = await db.consultation_notes.find_one({"appointment_id": appointment_id})
    
    if existing_note:
        # Update existing note
        print(f"Updating existing consultation note: {existing_note['_id']}")
        result = await db.consultation_notes.update_one(
            {"appointment_id": appointment_id},
            {
                "$set": {
                    "transcript": transcript,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        print(f"Updated {result.modified_count} document(s)")
        return str(existing_note["_id"])
    else:
        # Create new note
        consultation_note = {
            "appointment_id": appointment_id,
            "transcript": transcript,
            "summary": {},  # or provide default structure
            "created_at": datetime.utcnow()
        }
        result = await db["consultation_notes"].insert_one(consultation_note)
        print("SAVED")
        return str(result.inserted_id)
