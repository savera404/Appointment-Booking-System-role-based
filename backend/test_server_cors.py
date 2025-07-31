#!/usr/bin/env python3
"""
Simple test to verify server is running with proper CORS headers.
"""

import requests

def test_server_cors():
    """Test if server is running with proper CORS headers."""
    try:
        print("🧪 Testing Server CORS Headers...")
        
        base_url = "http://localhost:8000"
        
        # Test basic request
        print("1. Testing basic request...")
        try:
            response = requests.get(f"{base_url}/")
            print(f"   Status: {response.status_code}")
            print(f"   Server is running: {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            print(f"   ❌ Server not accessible: {e}")
            return False
        
        # Test CORS headers on a protected endpoint
        print("\n2. Testing CORS headers on protected endpoint...")
        try:
            headers = {
                "Origin": "http://localhost:8082",
                "Content-Type": "application/json"
            }
            response = requests.get(f"{base_url}/patients/", headers=headers)
            print(f"   Status: {response.status_code}")
            print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not found')}")
            print(f"   Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'Not found')}")
            print(f"   Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'Not found')}")
            
            if response.headers.get('Access-Control-Allow-Origin'):
                print("   ✅ CORS headers present")
            else:
                print("   ❌ CORS headers missing")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print("\n🎉 Server CORS test completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    print("Starting server CORS test...")
    success = test_server_cors()
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n💥 Tests failed!")
        import sys
        sys.exit(1)