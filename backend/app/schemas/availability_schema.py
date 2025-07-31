from pydantic import BaseModel
from typing import Literal


class DoctorAvailabilityCreate(BaseModel):
    doctorId: str
    doctorName: str
    date: str
    startTime: str
    endTime: str
    status: Literal["Available", "Booked", "Blocked"]


class DoctorAvailabilityResponse(DoctorAvailabilityCreate):
    id: str
