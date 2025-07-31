#!/usr/bin/env python3
"""
Test script to verify appointment routes are working correctly.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.appointment_service import get_all_appointments, get_appointments_by_patient_id
from app.services.patient_service import get_patient_by_user_id

async def test_appointment_routes():
    """Test appointment route functionality"""
    print("🧪 Testing Appointment Routes...")
    
    try:
        db = get_database()
        
        # Test 1: Check appointments in database
        print("\n1. Checking appointments in database...")
        appointments = await db.appointments_new.find({}).to_list(length=10)
        print(f"Total appointments in database: {len(appointments)}")
        
        for appointment in appointments:
            print(f"   - ID: {appointment.get('id', 'No ID')}")
            print(f"     Patient ID: {appointment.get('patient_id', 'No patient')}")
            print(f"     Doctor ID: {appointment.get('doctor_id', 'No doctor')}")
            print(f"     Date: {appointment.get('date', 'No date')}")
            print(f"     Time: {appointment.get('time', 'No time')}")
            print(f"     Status: {appointment.get('status', 'No status')}")
            print(f"     Condition: {appointment.get('condition', 'No condition')}")
            print()
        
        # Test 2: Test get_all_appointments function
        print("\n2. Testing get_all_appointments function...")
        all_appointments = await get_all_appointments()
        print(f"Retrieved {len(all_appointments)} appointments")
        
        for appointment in all_appointments:
            print(f"   - Patient: {appointment.patientName}")
            print(f"     Doctor: {appointment.doctorName}")
            print(f"     Date: {appointment.date}")
            print(f"     Time: {appointment.time}")
            print(f"     Status: {appointment.status}")
            print(f"     Type: {appointment.type}")
            print(f"     Notes: {appointment.notes}")
            print()
        
        # Test 3: Test get_appointments_by_patient_id function
        print("\n3. Testing get_appointments_by_patient_id function...")
        if appointments:
            # Use the first appointment's patient_id
            patient_id = appointments[0].get('patient_id')
            print(f"Testing with patient ID: {patient_id}")
            
            patient_appointments = await get_appointments_by_patient_id(patient_id)
            print(f"Retrieved {len(patient_appointments)} appointments for patient")
            
            for appointment in patient_appointments:
                print(f"   - Patient: {appointment.patientName}")
                print(f"     Doctor: {appointment.doctorName}")
                print(f"     Date: {appointment.date}")
                print(f"     Time: {appointment.time}")
                print(f"     Status: {appointment.status}")
                print(f"     Type: {appointment.type}")
                print(f"     Notes: {appointment.notes}")
                print()
        
        # Test 4: Check if patient and doctor data exists
        print("\n4. Checking patient and doctor data...")
        patients = await db.patients_new.find({}).to_list(length=5)
        doctors = await db.doctors.find({}).to_list(length=5)
        
        print(f"Patients in database: {len(patients)}")
        for patient in patients[:2]:
            print(f"   - {patient.get('name', 'Unknown')} (ID: {patient.get('id', 'No ID')})")
        
        print(f"Doctors in database: {len(doctors)}")
        for doctor in doctors[:2]:
            print(f"   - {doctor.get('name', 'Unknown')} (ID: {doctor.get('_id', 'No ID')})")
        
        print("\n🎉 Appointment route tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting appointment route tests...")
    success = asyncio.run(test_appointment_routes())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)