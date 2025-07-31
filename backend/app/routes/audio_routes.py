# backend/app/routes/audio_routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.services.audio_storage_service import save_audio_to_gridfs, get_audio_from_gridfs
from app.routes.auth_routes import get_current_user
from app.models.user import User
import io

router = APIRouter(prefix="/audio", tags=["Audio"])


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Only patients can upload audio
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can upload audio")
    
    if not file.filename.endswith((".mp3", ".wav", ".m4a", ".ogg")):
        raise HTTPException(status_code=400, detail="Invalid audio format")

    contents = await file.read()
    file_id = save_audio_to_gridfs(contents, file.filename)
    return {"file_id": file_id}


@router.get("/stream/{file_id}")
async def stream_audio(
    file_id: str,
    current_user: User = Depends(get_current_user)
):
    # Only patients can stream audio
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access audio")
    
    try:
        audio_bytes = get_audio_from_gridfs(file_id)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
    except Exception:
        raise HTTPException(status_code=404, detail="Audio not found")
