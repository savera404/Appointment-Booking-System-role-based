# backend/app/services/audio_storage_service.py

import gridfs
from app.database import sync_db
from bson import ObjectId

fs = gridfs.GridFS(sync_db)


def save_audio_to_gridfs(file_bytes: bytes, filename: str) -> str:
    file_id = fs.put(file_bytes, filename=filename)
    return str(file_id)


def get_audio_from_gridfs(file_id: str) -> bytes:
    audio = fs.get(ObjectId(file_id))
    return audio.read()
