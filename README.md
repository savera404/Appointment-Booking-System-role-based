# Doctor Appointment Booking System

A comprehensive healthcare management system with role-based access control, featuring AI-powered appointment booking, voice note analysis, and chatbot assistance.

## Features

### Admin Role
- **Dashboard**: Overview of all system data
- **Patient Management**: View, add, edit, and delete patient records
- **Doctor Management**: Manage doctor profiles and specializations
- **Availability Management**: Set and manage doctor availability schedules
- **Appointment Management**: Create, view, and manage all appointments
- **System Administration**: Full system control and oversight

### Patient Role
- **Personal Dashboard**: View personal information and appointments
- **Appointment Viewing**: See only their own appointments
- **AI Chat Assistant**: Interactive chatbot for appointment-related queries
- **Voice Note Analysis**: Upload and analyze voice notes with AI
- **Profile Management**: Update personal information

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor for async operations
- **JWT Authentication**: Secure token-based authentication
- **OpenAI Integration**: AI-powered chatbot and voice analysis
- **Whisper**: Audio transcription service
- **ChromaDB**: Vector database for RAG operations

### Frontend
- **React + TypeScript**: Modern frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful component library
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   MONGO_DB_NAME=medflow_db
   OPENAI_API_KEY=your_openai_api_key
   SECRET_KEY=your_jwt_secret_key
   ```

5. **Create admin user**:
   ```bash
   python create_admin.py
   ```
   This creates an admin user with:
   - Email: `admin@medflow.com`
   - Password: `admin123`

6. **Start the backend server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Admin Access
1. Navigate to `http://localhost:5173/login`
2. Select "Admin" tab
3. Login with:
   - Email: `admin@medflow.com`
   - Password: `admin123`

### Patient Access
1. Navigate to `http://localhost:5173/signup`
2. Create a new patient account
3. Or login with existing credentials at `http://localhost:5173/login`

## API Endpoints

### Authentication
- `POST /auth/patient/signup` - Patient registration
- `POST /auth/patient/login` - Patient login
- `POST /auth/admin/login` - Admin login
- `GET /auth/me` - Get current user info

### Patients (Admin Only)
- `GET /patients` - Get all patients
- `POST /patients` - Create patient
- `GET /patients/{id}` - Get patient by ID
- `PUT /patients/{id}` - Update patient
- `DELETE /patients/{id}` - Delete patient

### Patients (Patient Only)
- `GET /patients/me/profile` - Get own profile
- `PUT /patients/me/profile` - Update own profile

### Appointments
- `GET /appointments` - Get all appointments (Admin)
- `GET /appointments/my-appointments` - Get own appointments (Patient)
- `POST /appointments` - Create appointment (Admin)
- `PUT /appointments/{id}` - Update appointment (Admin)
- `DELETE /appointments/{id}` - Delete appointment (Admin)

### AI Features (Patient Only)
- `POST /chat-history/` - Add chat message
- `GET /chat-history/{appointment_id}` - Get chat history
- `POST /appointments/{id}/upload-audio` - Upload voice note

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for admin and patient roles
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin resource sharing configuration
- **Input Validation**: Pydantic models for data validation

## Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "email": "string",
  "password_hash": "string",
  "role": "admin|patient",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Patients Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "date_of_birth": "string",
  "gender": "male|female|other",
  "contact": "string",
  "condition": "string",
  "status": "Active|Inactive|Critical",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
