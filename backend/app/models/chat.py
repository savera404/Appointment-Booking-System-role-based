from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    sender: str
    message: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)


class ChatHistoryRequest(BaseModel):
    appointment_id: str
    sender: str
    message: str


class ChatHistoryResponse(BaseModel):
    appointment_id: str
    chat_history: List[ChatMessage]
