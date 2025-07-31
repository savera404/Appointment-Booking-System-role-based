from fastapi import APIRouter, HTTPException, Depends
from app.schemas.patient_schema import PatientCreate, PatientResponse, PatientUpdate
from app.services.patient_service import (
    create_patient_logic,
    get_all_patients,
    get_patient_by_id,
    get_patient_by_user_id,
    delete_patient, 
    update_patient,
)
from app.routes.auth_routes import get_current_user
from app.models.user import User

router = APIRouter(prefix="/patients", tags=["Patients"])

# Admin only - CREATE (for admin to add patients)
@router.post("/", response_model=PatientResponse)
async def create_patient(
    patient: PatientCreate, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create patients")
    
    created = await create_patient_logic(patient, current_user.id)
    return PatientResponse(**created.dict())

# Admin only - READ all
@router.get("/", response_model=list[PatientResponse])
async def list_patients(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all patients")
    
    patients = await get_all_patients()
    return [PatientResponse(**patient.dict()) for patient in patients]

# Admin only - READ by ID
@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view patient details")
    
    patient = await get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(**patient.dict())

# Patient - Get own profile
@router.get("/me/profile", response_model=PatientResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access their profile")
    
    patient = await get_patient_by_user_id(current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return PatientResponse(**patient.dict())

# Admin only - DELETE
@router.delete("/{patient_id}")
async def remove_patient(
    patient_id: str, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete patients")
    
    success = await delete_patient(patient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found or already deleted")
    return {"message": "Patient deleted successfully"}

# Admin only - UPDATE
@router.put("/{patient_id}", response_model=PatientResponse)
async def update_existing_patient(
    patient_id: str, 
    patient: PatientUpdate, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update patients")
    
    updated = await update_patient(patient_id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(**updated.dict())

# Patient - Update own profile
@router.put("/me/profile", response_model=PatientResponse)
async def update_my_profile(
    patient: PatientUpdate, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can update their profile")
    
    # Get patient profile
    patient_profile = await get_patient_by_user_id(current_user.id)
    if not patient_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    updated = await update_patient(patient_profile.id, patient)
    if not updated:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse(**updated.dict())