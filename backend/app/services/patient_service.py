from typing import Optional, List
from datetime import datetime
import uuid

from app.schemas.patient_schema import PatientCreate, PatientResponse, PatientUpdate
from app.models.patient import Patient
from app.utils.serializers import serialize_mongo_doc
from app.database import get_database
from bson import ObjectId


# CREATE
async def create_patient_logic(patient_data: PatientCreate, user_id: str) -> Patient:
    db = get_database()
    patient_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    patient_dict = patient_data.dict()
    patient_dict.update({
        "id": patient_id,
        "user_id": user_id,
        "created_at": now,
        "updated_at": now
    })
    
    result = await db.patients_new.insert_one(patient_dict)
    created_patient = await db.patients_new.find_one({"_id": result.inserted_id})
    return Patient(**serialize_mongo_doc(created_patient))

# READ ALL (admin only)
async def get_all_patients() -> List[Patient]:
    db = get_database()
    cursor = db.patients_new.find()
    patients = [Patient(**serialize_mongo_doc(doc)) async for doc in cursor]
    return patients

# READ by ID
async def get_patient_by_id(patient_id: str) -> Optional[Patient]:
    db = get_database()
    doc = await db.patients_new.find_one({"id": patient_id})
    return Patient(**serialize_mongo_doc(doc)) if doc else None

# READ by user_id (for patients to get their own profile)
async def get_patient_by_user_id(user_id: str) -> Optional[Patient]:
    db = get_database()
    doc = await db.patients_new.find_one({"user_id": user_id})
    return Patient(**serialize_mongo_doc(doc)) if doc else None

# DELETE
async def delete_patient(patient_id: str) -> bool:
    db = get_database()
    result = await db.patients_new.delete_one({"id": patient_id})
    return result.deleted_count == 1

# UPDATE
async def update_patient(patient_id: str, data: PatientUpdate) -> Optional[Patient]:
    db = get_database()
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.patients_new.find_one_and_update(
        {"id": patient_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        return None
    return Patient(**serialize_mongo_doc(result))