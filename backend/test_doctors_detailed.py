#!/usr/bin/env python3
"""
Detailed test script to examine doctors collection and debug search functionality.
"""

import asyncio
import sys
import os
import re

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.atlasSearchService import DoctorSearchService, parse_search_query, get_specialty_regex

async def test_doctors_detailed():
    """Detailed test of doctor search functionality"""
    print("🧪 Detailed Doctor Search Testing...")
    
    try:
        db = get_database()
        doctor_search_service = DoctorSearchService()
        
        # Test 1: Examine doctors collection structure
        print("\n1. Examining doctors collection structure...")
        sample_doctor = await db.doctors.find_one()
        if sample_doctor:
            print("Sample doctor document:")
            for key, value in sample_doctor.items():
                print(f"   {key}: {value}")
        else:
            print("❌ No doctors found in database")
            return False
        
        # Test 2: Test search query parsing
        print("\n2. Testing search query parsing...")
        test_queries = [
            "general practitioner",
            "cardiologist",
            "fever sore throat",
            "ent specialist"
        ]
        
        for query in test_queries:
            parsed = parse_search_query(query)
            print(f"   Query: '{query}' -> Parsed: {parsed}")
        
        # Test 3: Test specialty regex
        print("\n3. Testing specialty regex...")
        test_specialties = [
            "general practitioner",
            "cardiologist",
            "ent specialist"
        ]
        
        for specialty in test_specialties:
            regex = get_specialty_regex(specialty)
            print(f"   Specialty: '{specialty}' -> Regex: {regex.pattern}")
        
        # Test 4: Test direct database queries
        print("\n4. Testing direct database queries...")
        
        # Test for general practitioner
        print("\n   Testing 'general practitioner' search:")
        general_query = {
            "$or": [
                {"specialization": {"$regex": "general", "$options": "i"}},
                {"specialization": {"$regex": "physician", "$options": "i"}},
                {"description": {"$regex": "general", "$options": "i"}}
            ]
        }
        general_doctors = await db.doctors.find(general_query).to_list(length=5)
        print(f"   Found {len(general_doctors)} general practitioners")
        for doctor in general_doctors:
            print(f"     - {doctor.get('name')} ({doctor.get('specialization')})")
        
        # Test for cardiologist
        print("\n   Testing 'cardiologist' search:")
        cardio_query = {
            "$or": [
                {"specialization": {"$regex": "cardio", "$options": "i"}},
                {"description": {"$regex": "cardio", "$options": "i"}}
            ]
        }
        cardio_doctors = await db.doctors.find(cardio_query).to_list(length=5)
        print(f"   Found {len(cardio_doctors)} cardiologists")
        for doctor in cardio_doctors:
            print(f"     - {doctor.get('name')} ({doctor.get('specialization')})")
        
        # Test 5: Test fallback search method
        print("\n5. Testing fallback search method...")
        for query in test_queries:
            print(f"\n   Testing fallback search for: '{query}'")
            result = await doctor_search_service.fallback_search(db, query)
            if result["success"]:
                print(f"   ✅ Found {len(result['doctors'])} doctors")
                for doctor in result["doctors"][:3]:
                    print(f"     - {doctor['name']} ({doctor['specialization']})")
            else:
                print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Test 6: Test Atlas search method
        print("\n6. Testing Atlas search method...")
        for query in test_queries:
            print(f"\n   Testing Atlas search for: '{query}'")
            result = await doctor_search_service.search_doctors(db, query)
            if result["success"]:
                print(f"   ✅ Found {len(result['doctors'])} doctors")
                for doctor in result["doctors"][:3]:
                    print(f"     - {doctor['name']} ({doctor['specialization']})")
            else:
                print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
        
        print("\n🎉 Detailed doctor search tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting detailed doctor search tests...")
    success = asyncio.run(test_doctors_detailed())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)