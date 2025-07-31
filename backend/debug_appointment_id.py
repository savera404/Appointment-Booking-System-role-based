#!/usr/bin/env python3
"""
Debug script to check appointment ID format and test update function.
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.appointment_service import create_appointment_logic, update_appointment_status
from app.schemas.appointment_schema import AppointmentCreate
from datetime import datetime, timedelta

async def debug_appointment_id():
    """Debug appointment ID format and update function."""
    try:
        print("🔍 Debugging Appointment ID and Update Function...")
        
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
            condition="Debug appointment"
        )
        
        print(f"📝 Creating test appointment...")
        
        # Create the appointment
        created_appointment = await create_appointment_logic(test_appointment)
        
        print(f"✅ Appointment created successfully!")
        print(f"   ID: {created_appointment.id}")
        print(f"   ID type: {type(created_appointment.id)}")
        print(f"   Initial Status: {created_appointment.status}")
        
        # Check if appointment exists in database
        db_appointment = await db.appointments_new.find_one({"id": created_appointment.id})
        if db_appointment:
            print(f"✅ Found appointment in database with ID: {db_appointment.get('id')}")
            print(f"   Database ID type: {type(db_appointment.get('id'))}")
        else:
            print(f"❌ Could not find appointment in database")
            return False
        
        # Try to update status
        print(f"\n🔄 Attempting to update appointment status...")
        try:
            completed_appointment = await update_appointment_status(created_appointment.id, "Completed")
            if completed_appointment:
                print(f"✅ Appointment status updated successfully!")
                print(f"   New Status: {completed_appointment.status}")
            else:
                print(f"❌ update_appointment_status returned None")
        except Exception as e:
            print(f"❌ Error updating appointment status: {e}")
            import traceback
            traceback.print_exc()
        
        # Clean up - delete the test appointment
        await db.appointments_new.delete_one({"id": created_appointment.id})
        print("🧹 Cleaned up test appointment")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting appointment ID debug...")
    success = asyncio.run(debug_appointment_id())
    if success:
        print("\n🎉 Debug completed!")
    else:
        print("\n💥 Debug failed!")
        sys.exit(1) 