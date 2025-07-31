import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Optional
from app.models.user import User
from app.models.patient import Patient
from app.schemas.auth_schema import PatientSignupRequest, LoginResponse
from app.database import get_database
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def create_user(contact: str, password: str, role: str) -> User:
    db = get_database()
    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    user = User(
        id=user_id,
        email=contact,  # Store contact in email field for consistency
        password_hash=get_password_hash(password),
        role=role,
        created_at=now,
        updated_at=now
    )
    
    await db.users.insert_one(user.dict())
    return user

async def get_user_by_contact(contact: str) -> Optional[User]:
    db = get_database()
    user_data = await db.users.find_one({"email": contact})  # Search by contact in email field
    if user_data:
        return User(**user_data)
    return None

async def authenticate_user(contact: str, password: str) -> Optional[User]:
    user = await get_user_by_contact(contact)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def register_patient(patient_data: PatientSignupRequest) -> tuple[User, Patient]:
    # Check if user already exists
    existing_user = await get_user_by_contact(patient_data.contact)
    if existing_user:
        raise ValueError("User with this contact already exists")
    
    # Create user
    user = await create_user(
        contact=patient_data.contact,
        password=patient_data.password,
        role="patient"
    )
    
    # Create patient profile in patients_new collection
    db = get_database()
    patient_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    patient = Patient(
        id=patient_id,
        user_id=user.id,
        name=patient_data.name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        contact=patient_data.contact,
        created_at=now,
        updated_at=now
    )
    
    await db.patients_new.insert_one(patient.dict())
    
    return user, patient

async def login_user(contact: str, password: str) -> Optional[LoginResponse]:
    user = await authenticate_user(contact, password)
    if not user:
        return None
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},  # sub contains contact
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        contact=user.email  # Return contact instead of email
    )

def verify_token(token: str) -> Optional[dict]:
    try:
        print(f"Verifying token: {token[:20]}..." if token else "No token")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token payload: {payload}")
        return payload
    except jwt.PyJWTError as e:
        print(f"JWT verification error: {e}")
        return None 