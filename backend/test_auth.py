#!/usr/bin/env python3
"""
Test script to verify authentication flow and token generation/verification.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import create_user, login_user, verify_token, get_user_by_contact

async def test_auth():
    """Test authentication flow"""
    print("🧪 Testing Authentication Flow...")
    
    try:
        # Test 1: Create a test user
        print("\n1. Creating test user...")
        test_user = await create_user(
            contact="test@example.com",
            password="test123",
            role="patient"
        )
        print(f"✅ Test user created: {test_user.email} (ID: {test_user.id})")
        
        # Test 2: Login user
        print("\n2. Testing login...")
        login_result = await login_user("test@example.com", "test123")
        if login_result:
            print(f"✅ Login successful: {login_result.contact}")
            print(f"   Token: {login_result.access_token[:20]}...")
            print(f"   Token type: {login_result.token_type}")
        else:
            print("❌ Login failed")
            return False
        
        # Test 3: Verify token
        print("\n3. Testing token verification...")
        token_payload = verify_token(login_result.access_token)
        if token_payload:
            print(f"✅ Token verification successful")
            print(f"   Payload: {token_payload}")
        else:
            print("❌ Token verification failed")
            return False
        
        # Test 4: Get user by contact
        print("\n4. Testing user retrieval...")
        retrieved_user = await get_user_by_contact("test@example.com")
        if retrieved_user:
            print(f"✅ User retrieved: {retrieved_user.email}")
            print(f"   Role: {retrieved_user.role}")
        else:
            print("❌ User retrieval failed")
            return False
        
        print("\n🎉 Authentication tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting authentication tests...")
    success = asyncio.run(test_auth())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)