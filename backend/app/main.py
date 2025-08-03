from fastapi import FastAPI
from app.routes import patient_routes, consultation_notes_routes
from app.routes import doctor_routes
from app.routes import availability_routes
from app.routes import appointment_routes
from app.routes import audio_routes
from app.routes import note_chatbot_routes
from app.routes import appointment_chatbot_routes
from app.routes import message_routes
from app.routes import auth_routes
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat_routes

app = FastAPI(
    title="Doctor Appointment Booking API",
    description="Backend for AI-powered doctor booking system",
    version="1.0.0"
)

# CORS setup - More explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Root endpoint for debugging
@app.get("/")
async def root():
    return {
        "message": "Doctor Appointment Booking API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

# Include your routes here
app.include_router(auth_routes.router)
app.include_router(patient_routes.router)
app.include_router(doctor_routes.router)
app.include_router(availability_routes.router)
app.include_router(appointment_routes.router)
app.include_router(audio_routes.router)
app.include_router(consultation_notes_routes.router)
app.include_router(message_routes.router)
app.include_router(chat_routes.router)
app.include_router(appointment_chatbot_routes.router, tags=["Appointment Chatbot"])
app.include_router(note_chatbot_routes.router, tags=["VoiceNote Chatbot"])
app.router.redirect_slashes = False
