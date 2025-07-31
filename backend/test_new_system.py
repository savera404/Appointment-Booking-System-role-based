#!/usr/bin/env python3
"""
Test script for the new multi-role system with new collections.
This script tests the authentication and basic functionality.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import create_user, register_patient, login_user
from app.services.patient_service import get_all_patients, get_patient_by_user_id
from app.services.appointment_service import create_appointment_logic, get_all_appointments
from app.schemas.auth_schema import PatientSignupRequest
from app.schemas.appointment_schema import AppointmentCreate
from app.database import get_database

async def test_new_system():
    """Test the new system functionality"""
    print("🧪 Testing New Multi-Role System...")
    
    try:
        # Test 1: Create admin user
        print("\n1. Testing admin user creation...")
        admin_user = await create_user(
            contact="admin@medflow.com",
            password="admin123",
            role="admin"
        )
        print(f"✅ Admin user created: {admin_user.email} (ID: {admin_user.id})")
        
        # Test 2: Register a patient
        print("\n2. Testing patient registration...")
        patient_data = PatientSignupRequest(
            name="John Doe",
            date_of_birth="1990-01-01",
            gender="male",
            contact="john.doe@example.com",
            password="patient123"
        )
        
        user, patient = await register_patient(patient_data)
        print(f"✅ Patient registered: {patient.name} (ID: {patient.id})")
        print(f"   User ID: {user.id}, Contact: {user.email}")
        
        # Test 3: Login patient
        print("\n3. Testing patient login...")
        login_result = await login_user("john.doe@example.com", "patient123")
        if login_result:
            print(f"✅ Patient login successful: {login_result.contact}")
            print(f"   Token: {login_result.access_token[:20]}...")
        else:
            print("❌ Patient login failed")
            return False
        
        # Test 4: Get patient from new collection
        print("\n4. Testing patient retrieval from patients_new...")
        retrieved_patient = await get_patient_by_user_id(user.id)
        if retrieved_patient:
            print(f"✅ Patient retrieved: {retrieved_patient.name}")
            print(f"   Contact: {retrieved_patient.contact}")
            print(f"   Gender: {retrieved_patient.gender}")
        else:
            print("❌ Patient not found in patients_new collection")
            return False
        
        # Test 5: Create an appointment
        print("\n5. Testing appointment creation...")
        appointment_data = AppointmentCreate(
            patient_id=patient.id,
            doctor_id="507f1f77bcf86cd799439011",  # Example ObjectId
            date="2025-08-01",
            time="10:00",
            condition="General consultation"
        )
        
        appointment = await create_appointment_logic(appointment_data)
        print(f"✅ Appointment created: {appointment.id}")
        print(f"   Patient ID: {appointment.patient_id}")
        print(f"   Doctor ID: {appointment.doctor_id}")
        print(f"   Date: {appointment.date} at {appointment.time}")
        
        # Test 6: Get all patients from new collection
        print("\n6. Testing get all patients from patients_new...")
        all_patients = await get_all_patients()
        print(f"✅ Found {len(all_patients)} patients in patients_new collection")
        for p in all_patients:
            print(f"   - {p.name} ({p.contact})")
        
        # Test 7: Get all appointments from new collection
        print("\n7. Testing get all appointments from appointments_new...")
        all_appointments = await get_all_appointments()
        print(f"✅ Found {len(all_appointments)} appointments in appointments_new collection")
        for a in all_appointments:
            print(f"   - Appointment {a.id}: {a.date} at {a.time}")
        
        print("\n🎉 All tests passed! New system is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting new system tests...")
    success = asyncio.run(test_new_system())
    
    if success:
        print("\n✅ All tests completed successfully!")
        print("The new multi-role system with new collections is working correctly.")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)