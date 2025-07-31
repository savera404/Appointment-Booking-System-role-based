from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime


class User(BaseModel):
    id: Optional[str]
    email: str
    password_hash: str
    role: Literal["admin", "patient"]
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True 