
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Appointment(BaseModel):
    id: Optional[str]
    patient_id: str
    doctor_id: str
    patientName: Optional[str] = None  # For frontend display
    doctorName: Optional[str] = None   # For frontend display
    date: str
    time: str
    condition: str  # Symptoms or condition the patient is facing
    status: str = "Pending"
    type: Optional[str] = "Consultation"  # For frontend display
    notes: Optional[str] = None  # For frontend display (will be set to condition)
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
