# #patient_schema
# from pydantic import BaseModel
#
#
# class PatientCreate(BaseModel):  # for incoming request
#     name: str
#     dob: str
#     gender: str
#     contact: str
#
# class PatientResponse(PatientCreate):  # for outgoing response
#     id: str
from datetime import datetime
from pydantic import BaseModel, validator
from typing import Literal, Optional


class PatientCreate(BaseModel):
    name: str
    date_of_birth: str
    gender: Literal["male", "female", "other"]
    contact: str  # Either email or phone number
    password: str

    @validator('contact')
    def validate_contact(cls, v):
        # Simple validation - check if it looks like email or phone
        if '@' in v:
            # Email validation
            if len(v) < 5 or '.' not in v.split('@')[1]:
                raise ValueError('Invalid email format')
        else:
            # Phone validation - at least 10 digits
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Phone number must have at least 10 digits')
        return v


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[Literal["male", "female", "other"]] = None
    contact: Optional[str] = None
    password: Optional[str] = None

    @validator('contact')
    def validate_contact(cls, v):
        if v is None:
            return v
        # Simple validation - check if it looks like email or phone
        if '@' in v:
            # Email validation
            if len(v) < 5 or '.' not in v.split('@')[1]:
                raise ValueError('Invalid email format')
        else:
            # Phone validation - at least 10 digits
            digits = ''.join(filter(str.isdigit, v))
            if len(digits) < 10:
                raise ValueError('Phone number must have at least 10 digits')
        return v


class PatientResponse(BaseModel):
    id: str
    user_id: str
    name: str
    date_of_birth: str
    gender: Literal["male", "female", "other"]
    contact: str
    condition: Optional[str] = None
    status: Literal["Active", "Inactive", "Critical"] = "Active"
    created_at: datetime
    updated_at: datetime