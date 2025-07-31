from fastapi import APIRouter, Request

router = APIRouter(prefix="/api")

@router.post("/clear-session")
async def clear_session(request: Request):
    request.session.clear()
    return {"success": True, "message": "Session cleared"}