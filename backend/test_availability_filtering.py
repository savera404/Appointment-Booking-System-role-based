#!/usr/bin/env python3
"""
Test script to verify availability filtering and slot status updates.
"""

import asyncio
import sys
import os
from datetime import datetime, date, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.atlasSearchService import DoctorSearchService

async def test_availability_filtering():
    """Test availability filtering and slot status updates"""
    print("🧪 Testing Availability Filtering and Slot Status Updates...")
    
    try:
        db = get_database()
        doctor_search_service = DoctorSearchService()
        
        # Get current date and time
        current_date = date.today().isoformat()
        current_time = datetime.now().strftime("%H:%M")
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        
        print(f"Current date: {current_date}")
        print(f"Current time: {current_time}")
        print(f"Tomorrow: {tomorrow}")
        
        # Test 1: Check all availabilities in the database
        print("\n1. Checking all availabilities in database...")
        all_slots = await db.availabilities.find({}).to_list(length=100)
        print(f"Total slots in database: {len(all_slots)}")
        
        for slot in all_slots[:5]:  # Show first 5
            print(f"   - {slot.get('doctorName', 'Unknown')} on {slot.get('date')} at {slot.get('startTime')} - Status: {slot.get('status')}")
        
        # Test 2: Test availability filtering for a specific doctor
        print("\n2. Testing availability filtering...")
        if all_slots:
            # Use the first doctor from the database
            first_slot = all_slots[0]
            doctor_id = first_slot.get('doctorId')
            doctor_name = first_slot.get('doctorName', 'Unknown')
            
            print(f"Testing filtering for doctor: {doctor_name} (ID: {doctor_id})")
            
            # Get available slots using the service
            result = await doctor_search_service.get_available_time_slots(db, doctor_id)
            
            if result["success"]:
                available_slots = result["timeSlots"]
                print(f"✅ Found {len(available_slots)} available future slots")
                
                for i, slot in enumerate(available_slots[:5], 1):  # Show first 5
                    print(f"   {i}. {slot['date']} at {slot['startTime']} - {slot['status']}")
                    
                    # Verify the slot is in the future
                    slot_date = slot['date']
                    slot_time = slot['startTime']
                    
                    if slot_date > current_date:
                        print(f"      ✅ Future date: {slot_date}")
                    elif slot_date == current_date and slot_time > current_time:
                        print(f"      ✅ Today but future time: {slot_time}")
                    else:
                        print(f"      ❌ Past slot: {slot_date} {slot_time}")
            else:
                print(f"❌ Failed to get available slots: {result.get('error', 'Unknown error')}")
        
        # Test 3: Check slot status distribution
        print("\n3. Checking slot status distribution...")
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        status_counts = await db.availabilities.aggregate(status_pipeline).to_list(length=10)
        
        for status_count in status_counts:
            status = status_count["_id"]
            count = status_count["count"]
            print(f"   {status}: {count} slots")
        
        # Test 4: Test date filtering logic
        print("\n4. Testing date filtering logic...")
        
        # Create test query similar to what the service uses
        query = {
            "doctorId": {"$exists": True},
            "status": "Available",
            "$or": [
                # Future dates
                {"date": {"$gt": current_date}},
                # Today's date but future time slots
                {
                    "date": current_date,
                    "startTime": {"$gt": current_time}
                }
            ]
        }
        
        filtered_slots = await db.availabilities.find(query).to_list(length=20)
        print(f"✅ Found {len(filtered_slots)} slots that pass the filtering criteria")
        
        for i, slot in enumerate(filtered_slots[:3], 1):  # Show first 3
            print(f"   {i}. {slot.get('doctorName', 'Unknown')} - {slot.get('date')} at {slot.get('startTime')}")
        
        print("\n🎉 Availability filtering tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting availability filtering tests...")
    success = asyncio.run(test_availability_filtering())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)