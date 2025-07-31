from pymongo.collection import Collection
from datetime import datetime


class ChatService:
    def __init__(self, chat_collection: Collection):
        self.chat_collection = chat_collection

    def add_message(self, appointment_id: str, sender: str, message: str):
        chat_message = {
            "sender": sender,
            "message": message,
            "timestamp": datetime.utcnow()
        }

        self.chat_collection.update_one(
            {"appointment_id": appointment_id},
            {"$push": {"chat_history": chat_message}},
            upsert=True
        )

    def get_history(self, appointment_id: str):
        doc = self.chat_collection.find_one({"appointment_id": appointment_id})
        return doc.get("chat_history", []) if doc else []
