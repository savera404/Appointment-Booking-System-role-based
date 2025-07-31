from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessageSchema(BaseModel):
    sender: str
    message: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "sender": "user",
                "message": "Hello, doctor.",
                "timestamp": "2025-07-17T12:30:00Z"
            }
        }


class ChatHistoryCreateSchema(BaseModel):
    appointment_id: str
    sender: str
    message: str

    class Config:
        schema_extra = {
            "example": {
                "appointment_id": "abc123",
                "sender": "assistant",
                "message": "Hello, how can I assist you today?"
            }
        }


class ChatHistoryResponseSchema(BaseModel):
    appointment_id: str
    chat_history: List[ChatMessageSchema]

    class Config:
        schema_extra = {
            "example": {
                "appointment_id": "abc123",
                "chat_history": [
                    {
                        "sender": "user",
                        "message": "Hi",
                        "timestamp": "2025-07-17T12:30:00Z"
                    },
                    {
                        "sender": "assistant",
                        "message": "How can I help?",
                        "timestamp": "2025-07-17T12:31:00Z"
                    }
                ]
            }
        }
