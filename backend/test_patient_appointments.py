#!/usr/bin/env python3
"""
Test script to verify patient appointment functionality.
"""

import asyncio
import sys
import os
from datetime import datetime, date, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.patient_service import get_patient_by_user_id
from app.services.appointment_service import get_appointments_by_patient_id, update_slot_status_to_booked

async def test_patient_appointments():
    """Test patient appointment functionality"""
    print("🧪 Testing Patient Appointment Functionality...")
    
    try:
        db = get_database()
        
        # Test 1: Check patients in the database
        print("\n1. Checking patients in database...")
        patients = await db.patients_new.find({}).to_list(length=10)
        print(f"Total patients in database: {len(patients)}")
        
        for patient in patients[:3]:  # Show first 3
            print(f"   - {patient.get('name', 'Unknown')} (ID: {patient.get('id', 'No ID')}) - Contact: {patient.get('contact', 'No contact')}")
        
        # Test 2: Check appointments in the database
        print("\n2. Checking appointments in database...")
        appointments = await db.appointments_new.find({}).to_list(length=10)
        print(f"Total appointments in database: {len(appointments)}")
        
        for appointment in appointments[:3]:  # Show first 3
            print(f"   - Patient: {appointment.get('patient_id', 'No patient')} | Doctor: {appointment.get('doctor_id', 'No doctor')} | Date: {appointment.get('date', 'No date')} | Time: {appointment.get('time', 'No time')} | Status: {appointment.get('status', 'No status')}")
        
        # Test 3: Check availabilities
        print("\n3. Checking availabilities in database...")
        availabilities = await db.availabilities.find({}).to_list(length=10)
        print(f"Total availabilities in database: {len(availabilities)}")
        
        # Group by status
        status_counts = {}
        for slot in availabilities:
            status = slot.get('status', 'Unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        for status, count in status_counts.items():
            print(f"   {status}: {count} slots")
        
        # Test 4: Test slot status update function
        print("\n4. Testing slot status update function...")
        if availabilities:
            # Find an available slot
            available_slot = None
            for slot in availabilities:
                if slot.get('status') == 'Available':
                    available_slot = slot
                    break
            
            if available_slot:
                doctor_id = available_slot.get('doctorId')
                date_str = available_slot.get('date')
                time_str = available_slot.get('startTime')
                
                print(f"   Testing with slot: Doctor {doctor_id} on {date_str} at {time_str}")
                
                # Test the update function
                result = await update_slot_status_to_booked(doctor_id, date_str, time_str)
                print(f"   Update result: {result}")
                
                # Check if it was actually updated
                updated_slot = await db.availabilities.find_one({
                    "doctorId": doctor_id,
                    "date": date_str,
                    "startTime": time_str
                })
                
                if updated_slot:
                    print(f"   Updated slot status: {updated_slot.get('status')}")
                else:
                    print(f"   Slot not found after update")
            else:
                print("   No available slots found to test with")
        
        # Test 5: Check appointment creation flow
        print("\n5. Testing appointment creation flow...")
        if patients and availabilities:
            patient = patients[0]
            available_slot = None
            for slot in availabilities:
                if slot.get('status') == 'Available':
                    available_slot = slot
                    break
            
            if available_slot:
                print(f"   Would create appointment for patient {patient.get('name')} with doctor {available_slot.get('doctorId')}")
                print(f"   Date: {available_slot.get('date')}, Time: {available_slot.get('startTime')}")
                print(f"   This would update slot status from 'Available' to 'Booked'")
            else:
                print("   No available slots to test appointment creation")
        
        print("\n🎉 Patient appointment tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting patient appointment tests...")
    success = asyncio.run(test_patient_appointments())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)