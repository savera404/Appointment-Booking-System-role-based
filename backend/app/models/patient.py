# # backend/app/models/patient.py
# from pydantic import BaseModel, Field
# from typing import Optional
#
# class Patient(BaseModel):
#     id: Optional[str] = Field(alias="_id")  # MongoDB _id → Pydantic id
#     name: str
#     dob: str
#     gender: str
#     contact: str
#
#     class Config:
#         allow_population_by_field_name = True
#         arbitrary_types_allowed = True
#
#
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class Patient(BaseModel):
    id: Optional[str]
    user_id: str  # Reference to User model
    name: str
    date_of_birth: str
    gender: Literal["male", "female", "other"]
    contact: str  # Either email or phone number
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
