from pydantic import BaseModel
from typing import Optional, Literal


class DoctorAvailability(BaseModel):
    id: Optional[str]
    doctorId: str
    doctorName: str
    date: str  # YYYY-MM-DD as string
    startTime: str
    endTime: str
    status: Literal["Available", "Booked", "Blocked"]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
