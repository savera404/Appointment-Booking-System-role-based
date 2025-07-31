from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.database import get_db
from app.schemas.message_schema import MessageCreate, MessageResponse
from app.models.message import Message as MessageModel
from app.utils.serializers import serialize_mongo_doc

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/", response_model=List[MessageResponse])
async def list_messages(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db.messages.find()
    messages = [MessageResponse(**serialize_mongo_doc(doc)) async for doc in cursor]
    return messages


@router.post("/", response_model=MessageResponse)
async def create_message(message: MessageCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    message_dict = message.dict(by_alias=True)

    # Ensure datetime is in proper format for MongoDB
    if message_dict.get("timestamp") and isinstance(message_dict["timestamp"], str):
        from datetime import datetime
        message_dict["timestamp"] = datetime.fromisoformat(message_dict["timestamp"])

    result = await db.messages.insert_one(message_dict)
    created_message = await db.messages.find_one({"_id": result.inserted_id})

    return MessageResponse(**serialize_mongo_doc(created_message))
@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(message_id: str, message: MessageCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db.messages.find_one_and_update(
        {"_id": ObjectId(message_id)},
        {"$set": message.dict()},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Message not found")
    return MessageResponse(id=str(result["_id"]), **result)


@router.delete("/{message_id}")
async def delete_message(message_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    result = await db.messages.delete_one({"_id": ObjectId(message_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found or already deleted")
    return {"message": "Message deleted successfully"}
