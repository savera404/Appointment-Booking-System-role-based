from pydantic import BaseModel, EmailStr, validator
from typing import Literal, Optional
from datetime import datetime


class PatientSignupRequest(BaseModel):
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


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class PatientLoginRequest(BaseModel):
    contact: str  # Either email or phone number
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    contact: str


class UserResponse(BaseModel):
    id: str
    contact: str
    role: str
    is_active: bool
    created_at: datetime 