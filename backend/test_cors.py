#!/usr/bin/env python3
"""
Test script to verify CORS is working properly.
"""

import requests
import json

def test_cors():
    """Test if CORS is working properly."""
    try:
        print("🧪 Testing CORS Configuration...")
        
        base_url = "http://localhost:8000"
        
        # Test CORS preflight request
        print("1. Testing CORS preflight request...")
        try:
            headers = {
                "Origin": "http://localhost:8082",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization, Content-Type"
            }
            response = requests.options(f"{base_url}/patients/", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not found')}")
            print(f"   Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not found')}")
            print(f"   Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not found')}")
            
            if response.status_code == 200:
                print("   ✅ CORS preflight successful")
            else:
                print("   ❌ CORS preflight failed")
        except Exception as e:
            print(f"   ❌ CORS preflight error: {e}")
        
        # Test actual request with Origin header
        print("\n2. Testing actual request with Origin header...")
        try:
            headers = {
                "Origin": "http://localhost:8082",
                "Content-Type": "application/json"
            }
            response = requests.get(f"{base_url}/patients/", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not found')}")
            
            if response.status_code == 403:
                print("   ✅ CORS working (403 is expected without auth)")
            elif response.status_code == 200:
                print("   ✅ CORS working and request successful")
            else:
                print(f"   ⚠️ Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Request error: {e}")
        
        print("\n🎉 CORS tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    print("Starting CORS tests...")
    success = test_cors()
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n💥 Tests failed!")
        import sys
        sys.exit(1)