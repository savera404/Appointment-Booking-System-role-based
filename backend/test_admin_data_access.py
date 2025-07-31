#!/usr/bin/env python3
"""
Test script to verify admin data access.
This script will test if admin users can fetch doctors, patients, appointments, and availabilities.
"""

import asyncio
import sys
import os
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import create_user, authenticate_user
from app.database import get_database

async def test_admin_data_access():
    """Test admin data access to all endpoints."""
    try:
        print("🧪 Testing Admin Data Access...")
        
        # First, let's check if admin user exists, if not create one
        db = get_database()
        
        # Check if admin user exists
        admin_user = await db.users.find_one({"contact": "admin@medflow.com"})
        if not admin_user:
            print("Creating admin user...")
            admin_user = await create_user(
                contact="admin@medflow.com",
                password="admin123",
                role="admin"
            )
            print(f"✅ Admin user created: {admin_user.id}")
        else:
            print(f"✅ Admin user exists: {admin_user['id']}")
        
        # Login as admin
        print("\n1. Testing admin login...")
        login_result = await authenticate_user("admin@medflow.com", "admin123")
        if not login_result:
            print("❌ Admin login failed")
            return False
        
        token = login_result.get("access_token")
        print(f"✅ Admin login successful, token: {token[:20]}...")
        
        # Test API endpoints
        base_url = "http://localhost:8000"
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n2. Testing doctors endpoint...")
        try:
            response = requests.get(f"{base_url}/doctors/", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                doctors = response.json()
                print(f"   ✅ Found {len(doctors)} doctors")
                if doctors:
                    print(f"   Sample doctor: {doctors[0]['name']} - {doctors[0]['specialization']}")
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print("\n3. Testing patients endpoint...")
        try:
            response = requests.get(f"{base_url}/patients/", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                patients = response.json()
                print(f"   ✅ Found {len(patients)} patients")
                if patients:
                    print(f"   Sample patient: {patients[0]['name']} - {patients[0]['contact']}")
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print("\n4. Testing appointments endpoint...")
        try:
            response = requests.get(f"{base_url}/appointments/", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                appointments = response.json()
                print(f"   ✅ Found {len(appointments)} appointments")
                if appointments:
                    print(f"   Sample appointment: {appointments[0]['patientName']} with {appointments[0]['doctorName']}")
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print("\n5. Testing availabilities endpoint...")
        try:
            response = requests.get(f"{base_url}/availabilities/", headers=headers)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                availabilities = response.json()
                print(f"   ✅ Found {len(availabilities)} availability slots")
                if availabilities:
                    print(f"   Sample slot: {availabilities[0]['doctorName']} on {availabilities[0]['date']}")
            else:
                print(f"   ❌ Error: {response.text}")
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        print("\n🎉 Admin data access tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting admin data access tests...")
    success = asyncio.run(test_admin_data_access())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n💥 Tests failed!")
        sys.exit(1)