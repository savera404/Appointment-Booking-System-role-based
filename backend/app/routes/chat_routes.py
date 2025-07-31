from app.database import get_database
from fastapi import APIRouter, Depends, HTTPException
from app.models.chat import ChatHistoryRequest, ChatMessage
from app.services.chat_service import ChatService
from app.routes.auth_routes import get_current_user
from app.models.user import User

router = APIRouter()

chat_collection = get_database()["chat_history"]
chat_service = ChatService(chat_collection)


@router.post("/chat-history/")
def add_chat_message(
    request: ChatHistoryRequest,
    current_user: User = Depends(get_current_user)
):
    # Only patients can add chat messages
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can add chat messages")
    
    chat_service.add_message(
        appointment_id=request.appointment_id,
        sender=request.sender,
        message=request.message
    )
    return {"status": "message added"}


@router.get("/chat-history/{appointment_id}", response_model=list[ChatMessage])
def get_chat_history(
    appointment_id: str,
    current_user: User = Depends(get_current_user)
):
    # Only patients can view chat history
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can view chat history")
    
    return chat_service.get_history(appointment_id)
