# backend/app/models/consultation_note.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Summary(BaseModel):
    diagnosis: Optional[str]
    medications: Optional[List[str]]
    follow_up: Optional[str]
    advice: Optional[List[str]]


class ConsultationNotes(BaseModel):
    id: Optional[str] = Field(alias="_id")
    appointment_id: Optional[str]
    transcript: Dict[str, Any]
    summary: Summary
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
