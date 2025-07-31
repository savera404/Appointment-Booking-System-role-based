from fastapi import APIRouter
from pydantic import BaseModel
from app.rag.notes_chatbot import generate_answer, summarize_key_points, retrieve_relevant_chunks

router = APIRouter()

print("✅ note_chatbot_routes.py is being loaded")
# Request + Response models
class ChatRequest(BaseModel):
    message: str
    appointment_id: str  

class ChatResponse(BaseModel):
    response: str

class SummaryResponse(BaseModel):
    summary: str

# Chat endpoint
@router.post("/chatV", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    response = generate_answer(req.message, req.appointment_id)
    return ChatResponse(response=response)

@router.get("/appointments/{appointment_id}/summary", response_model=SummaryResponse)
async def summary_endpoint(appointment_id: str):
    chunks = retrieve_relevant_chunks("summary", appointment_id=appointment_id, top_k=5)
    summary = summarize_key_points(chunks)
    return SummaryResponse(summary=summary)