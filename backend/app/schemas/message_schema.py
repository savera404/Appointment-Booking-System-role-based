from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DoctorRecommendation(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    specialization: Optional[str] = None
    location: Optional[str] = None
    contact: Optional[str] = None
    experience: Optional[int] = None
    rating: Optional[float] = None
    availability: Optional[str] = None
    description: Optional[str] = None

class MessageCreate(BaseModel):
    text: str
    isUser: bool
    timestamp: datetime
    doctorRecommendation: Optional[DoctorRecommendation] = None
    doctorRecommendations: Optional[List[DoctorRecommendation]] = None

class MessageResponse(MessageCreate):
    id: str
