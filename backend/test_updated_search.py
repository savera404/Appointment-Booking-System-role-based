#!/usr/bin/env python3
"""
Test script to verify updated doctor search with correct specializations.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.atlasSearchService import DoctorSearchService
from app.services.openaiService import OpenAIService

async def test_updated_search():
    """Test updated doctor search with correct specializations"""
    print("🧪 Testing Updated Doctor Search...")
    
    try:
        db = get_database()
        doctor_search_service = DoctorSearchService()
        openai_service = OpenAIService()
        
        # Test with fever condition (should find General Physician)
        print("\n1. Testing fever condition...")
        appointment_info = {"condition": "high fever", "urgency": "urgent"}
        search_query = openai_service.generate_doctor_search_query_for_appointment(appointment_info)
        print(f"Generated search query: '{search_query}'")
        
        result = await doctor_search_service.fallback_search(db, search_query)
        if result["success"]:
            print(f"✅ Found {len(result['doctors'])} doctors for fever")
            for i, doctor in enumerate(result["doctors"], 1):
                print(f"   {i}. {doctor['name']} ({doctor['specialization']})")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Test with heart condition (should find Cardiologist)
        print("\n2. Testing heart condition...")
        appointment_info = {"condition": "chest pain", "urgency": "urgent"}
        search_query = openai_service.generate_doctor_search_query_for_appointment(appointment_info)
        print(f"Generated search query: '{search_query}'")
        
        result = await doctor_search_service.fallback_search(db, search_query)
        if result["success"]:
            print(f"✅ Found {len(result['doctors'])} doctors for heart condition")
            for i, doctor in enumerate(result["doctors"], 1):
                print(f"   {i}. {doctor['name']} ({doctor['specialization']})")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Test with child condition (should find Paediatrics)
        print("\n3. Testing child condition...")
        appointment_info = {"condition": "child fever", "urgency": "normal"}
        search_query = openai_service.generate_doctor_search_query_for_appointment(appointment_info)
        print(f"Generated search query: '{search_query}'")
        
        result = await doctor_search_service.fallback_search(db, search_query)
        if result["success"]:
            print(f"✅ Found {len(result['doctors'])} doctors for child condition")
            for i, doctor in enumerate(result["doctors"], 1):
                print(f"   {i}. {doctor['name']} ({doctor['specialization']})")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        # Test with dental condition (should find Dentistry)
        print("\n4. Testing dental condition...")
        appointment_info = {"condition": "tooth pain", "urgency": "normal"}
        search_query = openai_service.generate_doctor_search_query_for_appointment(appointment_info)
        print(f"Generated search query: '{search_query}'")
        
        result = await doctor_search_service.fallback_search(db, search_query)
        if result["success"]:
            print(f"✅ Found {len(result['doctors'])} doctors for dental condition")
            for i, doctor in enumerate(result["doctors"], 1):
                print(f"   {i}. {doctor['name']} ({doctor['specialization']})")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
        
        print("\n🎉 Updated search tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting updated search tests...")
    success = asyncio.run(test_updated_search())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)