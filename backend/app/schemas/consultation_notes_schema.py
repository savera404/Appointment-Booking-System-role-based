# backend/app/schemas/consultation_note_schema.py

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class SummarySchema(BaseModel):
    diagnosis: Optional[str]
    medications: Optional[List[str]]
    follow_up: Optional[str]
    advice: Optional[List[str]]


class ConsultationNoteCreate(BaseModel):
    appointment_id: Optional[str]
    transcript: Dict[str, Any]
    summary: SummarySchema


class ConsultationNoteResponse(ConsultationNoteCreate):
    id: str
    created_at: datetime
