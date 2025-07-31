# from pydantic import BaseModel, Field
# from typing import Optional
# from app.schemas.enums import DoctorSpecialty
#
# class Doctor(BaseModel):
#     id: Optional[str] = Field(alias="_id")
#     name: str
#     specialty: DoctorSpecialty
#     clinic_location: str
#     max_daily_appointments: int
#     active: bool = True
#
#     class Config:
#         allow_population_by_field_name = True
#         arbitrary_types_allowed = True
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class Doctor(BaseModel):
    id: Optional[str]
    name: str
    specialization: str
    location: str
    contact: str
    experience: int
    rating: float
    availability: Literal["Available", "Busy", "Offline"]
    description: Optional[str]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
