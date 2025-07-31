#!/usr/bin/env python3
"""
Script to check what specialization values exist in the doctors collection.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database

async def check_specializations():
    """Check what specialization values exist in the database"""
    print("🔍 Checking Doctor Specializations...")
    
    try:
        db = get_database()
        
        # Get all unique specializations
        pipeline = [
            {"$group": {"_id": "$specialization", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        
        specializations = await db.doctors.aggregate(pipeline).to_list(length=50)
        
        print(f"\nFound {len(specializations)} unique specializations:")
        print("=" * 50)
        
        for spec in specializations:
            specialization = spec["_id"]
            count = spec["count"]
            print(f"'{specialization}' - {count} doctors")
        
        # Show sample doctors for each specialization
        print(f"\nSample doctors by specialization:")
        print("=" * 50)
        
        for spec in specializations:
            specialization = spec["_id"]
            count = spec["count"]
            
            print(f"\n{specialization} ({count} doctors):")
            sample_doctors = await db.doctors.find({"specialization": specialization}).limit(3).to_list(length=3)
            
            for doctor in sample_doctors:
                print(f"  - {doctor.get('name', 'Unknown')}")
                print(f"    Location: {doctor.get('location', 'Unknown')}")
                print(f"    Contact: {doctor.get('contact', 'Unknown')}")
                if doctor.get('description'):
                    print(f"    Description: {doctor.get('description', '')[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting specialization check...")
    success = asyncio.run(check_specializations())
    
    if success:
        print("\n✅ Specialization check completed!")
    else:
        print("\n❌ Check failed!")
        sys.exit(1)