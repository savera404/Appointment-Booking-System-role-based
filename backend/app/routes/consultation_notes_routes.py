# backend/app/routes/consultation_notes_routes.py

from fastapi import APIRouter, HTTPException
from app.schemas.consultation_notes_schema import (
    ConsultationNoteCreate,
    ConsultationNoteResponse
)
from app.services.consultation_notes_service import (
    create_consultation_note_logic,
    get_all_consultation_notes,
    get_consultation_note_by_id,
    delete_consultation_note
)

router = APIRouter(prefix="/consultation-notes", tags=["ConsultationNotes"])

# POST: Create note
@router.post("/", response_model=ConsultationNoteResponse)
async def create_note(data: ConsultationNoteCreate):
    return await create_consultation_note_logic(data)

# GET: All notes
@router.get("/", response_model=list[ConsultationNoteResponse])
async def read_all_notes():
    return await get_all_consultation_notes()

# GET: Note by ID
@router.get("/{note_id}", response_model=ConsultationNoteResponse)
async def read_note_by_id(note_id: str):
    note = await get_consultation_note_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Consultation note not found")
    return note

# DELETE: Note by ID
@router.delete("/{note_id}", status_code=204)
async def delete_note_by_id(note_id: str):
    success = await delete_consultation_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Consultation note not found")
