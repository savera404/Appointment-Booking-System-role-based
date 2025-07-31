# from pydantic import BaseModel
# from datetime import date
# from app.schemas.enums import DoctorSpecialty
#
# class AvailabilitySlot(BaseModel):
#     date: date
#     start_time: str
#     end_time: str
#
# class DoctorCreate(BaseModel):
#     name: str
#     specialty: DoctorSpecialty
#     clinic_location: str
#     max_daily_appointments: int
#     active: bool = True
#
# class DoctorResponse(DoctorCreate):
#     id: str
from pydantic import BaseModel
from typing import Optional, Literal


class DoctorCreate(BaseModel):
    name: str
    specialization: str
    location: str
    contact: str
    experience: int
    rating: float
    availability: Literal["Available", "Busy", "Offline"]
    description: Optional[str]


class DoctorResponse(DoctorCreate):
    id: str
