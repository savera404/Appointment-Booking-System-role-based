#!/usr/bin/env python3
"""
Test script to verify appointment status is set to "Confirmed" by default.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.appointment_service import create_appointment_logic
from app.schemas.appointment_schema import AppointmentCreate
from datetime import datetime, timedelta

async def test_appointment_status():
    """Test that appointments are created with 'Confirmed' status by default."""
    try:
        print("🧪 Testing Appointment Status Default...")
        
        db = get_database()
        
        # Get a sample patient and doctor for testing
        patient = await db.patients_new.find_one()
        doctor = await db.doctors.find_one()
        
        if not patient or not doctor:
            print("❌ Need at least one patient and doctor in database for testing")
            return False
        
        # Create test appointment data
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        test_appointment = AppointmentCreate(
            patient_id=patient["id"],
            doctor_id=str(doctor["_id"]),
            date=tomorrow,
            time="10:00",
            condition="Test appointment"
        )
        
        print(f"📝 Creating test appointment...")
        print(f"   Patient: {patient.get('name', 'Unknown')}")
        print(f"   Doctor: {doctor.get('name', 'Unknown')}")
        print(f"   Date: {tomorrow}")
        print(f"   Time: 10:00")
        
        # Create the appointment
        created_appointment = await create_appointment_logic(test_appointment)
        
        print(f"\n✅ Appointment created successfully!")
        print(f"   ID: {created_appointment.id}")
        print(f"   Status: {created_appointment.status}")
        
        # Verify status is "Confirmed"
        if created_appointment.status == "Confirmed":
            print("🎉 SUCCESS: Appointment status is 'Confirmed' by default!")
        else:
            print(f"❌ FAILED: Expected status 'Confirmed', got '{created_appointment.status}'")
            return False
        
        # Clean up - delete the test appointment
        await db.appointments_new.delete_one({"id": created_appointment.id})
        print("🧹 Cleaned up test appointment")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting appointment status test...")
    success = asyncio.run(test_appointment_status())
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n💥 Tests failed!")
        sys.exit(1) 