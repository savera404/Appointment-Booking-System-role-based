#!/usr/bin/env python3
"""
Test script to verify appointment completion functionality.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.appointment_service import create_appointment_logic, update_appointment_status
from app.schemas.appointment_schema import AppointmentCreate
from datetime import datetime, timedelta

async def test_appointment_completion():
    """Test that appointments can be marked as completed."""
    try:
        print("🧪 Testing Appointment Completion Functionality...")
        
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
            condition="Test appointment for completion"
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
        print(f"   Initial Status: {created_appointment.status}")
        
        # Verify initial status is "Confirmed"
        if created_appointment.status != "Confirmed":
            print(f"❌ FAILED: Expected initial status 'Confirmed', got '{created_appointment.status}'")
            return False
        
        # Mark as completed
        print(f"\n🔄 Marking appointment as completed...")
        completed_appointment = await update_appointment_status(created_appointment.id, "Completed")
        
        if not completed_appointment:
            print("❌ FAILED: Could not update appointment status")
            return False
        
        print(f"✅ Appointment status updated successfully!")
        print(f"   New Status: {completed_appointment.status}")
        
        # Verify status is now "Completed"
        if completed_appointment.status == "Completed":
            print("🎉 SUCCESS: Appointment successfully marked as 'Completed'!")
        else:
            print(f"❌ FAILED: Expected status 'Completed', got '{completed_appointment.status}'")
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
    print("Starting appointment completion test...")
    success = asyncio.run(test_appointment_completion())
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n💥 Tests failed!")
        sys.exit(1) 