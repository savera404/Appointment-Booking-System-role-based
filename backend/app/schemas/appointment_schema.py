from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: str
    date: str
    time: str
    condition: str  # Symptoms or condition the patient is facing


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    patientName: Optional[str] = None  # For frontend display
    doctorName: Optional[str] = None   # For frontend display
    date: str
    time: str
    condition: str
    status: str = "Pending"
    type: Optional[str] = "Consultation"  # For frontend display
    notes: Optional[str] = None  # For frontend display (will be set to condition)
    created_at: datetime
    updated_at: datetime
