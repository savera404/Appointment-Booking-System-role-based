#!/usr/bin/env python3
"""
Test script to verify API endpoints are accessible.
"""

import asyncio
import sys
import os
import httpx

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_api_endpoints():
    """Test API endpoint accessibility"""
    print("🧪 Testing API Endpoints...")
    
    try:
        base_url = "http://localhost:8000"
        
        # Test 1: Check if server is running
        print("\n1. Testing server connectivity...")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{base_url}/docs")
                print(f"✅ Server is running (status: {response.status_code})")
            except Exception as e:
                print(f"❌ Server is not running: {e}")
                return False
        
        # Test 2: Test appointments endpoint (without auth - should fail)
        print("\n2. Testing appointments endpoint without auth...")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{base_url}/appointments/")
                print(f"   Response status: {response.status_code}")
                if response.status_code == 401:
                    print("   ✅ Correctly requires authentication")
                else:
                    print(f"   ⚠️ Unexpected status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        # Test 3: Test my-appointments endpoint (without auth - should fail)
        print("\n3. Testing my-appointments endpoint without auth...")
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{base_url}/appointments/my-appointments")
                print(f"   Response status: {response.status_code}")
                if response.status_code == 401:
                    print("   ✅ Correctly requires authentication")
                else:
                    print(f"   ⚠️ Unexpected status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        print("\n🎉 API endpoint tests completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Starting API endpoint tests...")
    success = asyncio.run(test_api_endpoints())
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)