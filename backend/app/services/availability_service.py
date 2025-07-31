from app.schemas.availability_schema import DoctorAvailabilityCreate
from app.models.availability import DoctorAvailability
from app.database import db
from bson import ObjectId
from app.utils.serializers import serialize_mongo_doc


# CREATE
async def create_availability_logic(data: DoctorAvailabilityCreate) -> DoctorAvailability:
    availability_dict = data.dict()
    result = await db.availabilities.insert_one(availability_dict)
    created_doc = await db.availabilities.find_one({"_id": result.inserted_id})
    return DoctorAvailability(**serialize_mongo_doc(created_doc))


# READ ALL
async def get_all_availabilities() -> list[DoctorAvailability]:
    cursor = db.availabilities.find()
    return [DoctorAvailability(**serialize_mongo_doc(doc)) async for doc in cursor]


# READ BY DOCTOR ID
async def get_availabilities_by_doctor(doctor_id: str) -> list[DoctorAvailability]:
    cursor = db.availabilities.find({"doctorId": doctor_id})
    return [DoctorAvailability(**serialize_mongo_doc(doc)) async for doc in cursor]


# DELETE
async def delete_availability_by_id(availability_id: str) -> bool:
    result = await db.availabilities.delete_one({"_id": ObjectId(availability_id)})
    return result.deleted_count == 1


# UPDATE
async def update_availability(availability_id: str, data: DoctorAvailabilityCreate) -> DoctorAvailability | None:
    result = await db.availabilities.find_one_and_update(
        {"_id": ObjectId(availability_id)},
        {"$set": data.dict()},
        return_document=True
    )
    if not result:
        return None
    return DoctorAvailability(**serialize_mongo_doc(result))
