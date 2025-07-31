from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class DoctorRecommendation(BaseModel):
    id: Optional[str]
    name: str
    specialization: str
    location: str
    contact: str
    experience: int
    rating: float
    availability: str
    description: Optional[str]


class Message(BaseModel):
    id: Optional[str]
    text: str
    isUser: bool
    timestamp: datetime
    doctorRecommendation: Optional[DoctorRecommendation]= None
    doctorRecommendations: Optional[List[DoctorRecommendation]] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
