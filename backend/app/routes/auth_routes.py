from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth_schema import (
    PatientSignupRequest,
    PatientLoginRequest,
    AdminLoginRequest,
    LoginResponse
)
from app.services.auth_service import register_patient, login_user, verify_token, get_user_by_contact
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    print(f"Received token: {token[:20]}..." if token else "No token")
    
    payload = verify_token(token)
    print(f"Token payload: {payload}")
    
    if payload is None:
        print("Token verification failed")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    user = await get_user_by_contact(payload.get("sub"))
    print(f"Found user: {user.email if user else 'None'}")
    
    if user is None:
        print("User not found in database")
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

@router.post("/patient/signup", response_model=dict)
async def patient_signup(patient_data: PatientSignupRequest):
    try:
        user, patient = await register_patient(patient_data)
        return {
            "message": "Patient registered successfully",
            "user_id": user.id,
            "patient_id": patient.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/patient/login", response_model=LoginResponse)
async def patient_login(login_data: PatientLoginRequest):
    result = await login_user(login_data.contact, login_data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify it's a patient
    if result.role != "patient":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return result

@router.post("/admin/login", response_model=LoginResponse)
async def admin_login(login_data: AdminLoginRequest):
    result = await login_user(login_data.email, login_data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify it's an admin
    if result.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return result

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "contact": current_user.email,  # Return contact instead of email
        "role": current_user.role,
        "is_active": current_user.is_active
    } 