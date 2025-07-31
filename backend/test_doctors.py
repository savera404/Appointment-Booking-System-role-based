#!/usr/bin/env python3
"""
Test script to check doctors in the database and verify doctor search functionality.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.atlasSearchService import DoctorSearchService

async def test_doctors():
    """Test doctor search functionality"""
    print("🧪 Testing Doctor Search...")
    
    try:
        db = get_database()
        doctor_search_service = DoctorSearchService()
        
        # Test 1: Check if doctors collection exists and has data
        print("\n1. Checking doctors collection...")
        doctors_count = await db.doctors.count_documents({})
        print(f"✅ Found {doctors_count} doctors in the database")
        
        if doctors_count == 0:
            print("❌ No doctors found in database. Please add some doctors first.")
            return False
        
        # Test 2: Show some sample doctors
        print("\n2. Sample doctors in database:")
        sample_doctors = await db.doctors.find().limit(3).to_list(length=3)
        for doctor in sample_doctors:
            print(f"   - {doctor.get('name', 'Unknown')} ({doctor.get('specialization', 'Unknown')})")
            print(f"     Location: {doctor.get('location', 'Unknown')}")
            print(f"     Contact: {doctor.get('contact', 'Unknown')}")
        
        # Test 3: Test doctor search
        print("\n3. Testing doctor search...")
        search_queries = [
            "general practitioner",
            "ent specialist",
            "cardiologist",
            "fever sore throat"
        ]
        
        for query in search_queries:
            print(f"\n   Searching for: '{query}'")
            result = await doctor_search_service.search_doctors(db, query)
            if result["success"]:
                print(f"   ✅ Found {len(result['doctors'])} doctors")
                for doctor in result["doctors"][:2]:  # Show first 2
                    print(f"     - {doctor['name']} ({doctor['specialization']})")
            else:
                print(f"   ❌ Search failed: {result.get('error', 'Unknown error')}")
            
            # Try fallback search
            fallback_result = await doctor_search_service.fallback_search(db, query)
            if fallback_result["success"]:
                print(f"   ✅ Fallback found {len(fallback_result['doctors'])} doctors")
            else:
                print(f"   ❌ Fallback failed: {fallback_result.get('error', 'Unknown error')}")
        
        # Test 4: Check availabilities collection
        print("\n4. Checking availabilities collection...")
        availabilities_count = await db.availabilities.count_documents({})
        print(f"✅ Found {availabilities_count} availability slots in the database")
        
        if availabilities_count > 0:
            sample_availabilities = await db.availabilities.find().limit(3).to_list(length=3)
            print("   Sample availability slots:")
            for slot in sample_availabilities:
                print(f"     - Doctor: {slot.get('doctorName', 'Unknown')}")
                print(f"       Date: {slot.get('date', 'Unknown')} at {slot.get('startTime', 'Unknown')}")
                print(f"       Status: {slot.get('status', 'Unknown')}")
        
        print("\n🎉 Doctor search tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting doctor search tests...")
    success = asyncio.run(test_doctors())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)