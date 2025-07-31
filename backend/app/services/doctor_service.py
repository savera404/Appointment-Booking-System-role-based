# backend/app/services/doctor_service.py
from app.schemas.doctor_schema import DoctorCreate
from app.models.doctor import Doctor
from app.database import db
from bson import ObjectId
from app.utils.serializers import serialize_mongo_doc

# CREATE
async def create_doctor_logic(doctor_data: DoctorCreate) -> Doctor:
    doc_dict = doctor_data.dict()
    result = await db.doctors.insert_one(doc_dict)
    created_doc = await db.doctors.find_one({"_id": result.inserted_id})
    return Doctor(**serialize_mongo_doc(created_doc))

# READ ALL
async def get_all_doctors() -> list[Doctor]:
    cursor = db.doctors.find()
    return [Doctor(**serialize_mongo_doc(doc)) async for doc in cursor]

# READ BY ID
async def get_doctor_by_id(doctor_id: str) -> Doctor | None:
    doc = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    return Doctor(**serialize_mongo_doc(doc)) if doc else None

# DELETE
async def delete_doctor(doctor_id: str) -> bool:
    result = await db.doctors.delete_one({"_id": ObjectId(doctor_id)})
    return result.deleted_count == 1


# UPDATE
async def update_doctor(doctor_id: str, data: DoctorCreate) -> Doctor | None:
    updated_doc = await db.doctors.find_one_and_update(
        {"_id": ObjectId(doctor_id)},
        {"$set": data.dict()},
        return_document=True  # Ensures the updated document is returned
    )
    if not updated_doc:
        return None
    return Doctor(**serialize_mongo_doc(updated_doc))
