#!/usr/bin/env python3
"""
Simple test to check if the server is running and accessible.
"""

import requests
import json

def test_server_status():
    """Test if the server is running and accessible."""
    try:
        print("🧪 Testing Server Status...")
        
        base_url = "http://localhost:8000"
        
        # Test basic connectivity
        print("1. Testing basic connectivity...")
        try:
            response = requests.get(f"{base_url}/")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Server is running")
            else:
                print(f"   ⚠️ Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Server not accessible: {e}")
            return False
        
        # Test docs endpoint
        print("\n2. Testing docs endpoint...")
        try:
            response = requests.get(f"{base_url}/docs")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ API docs accessible")
            else:
                print(f"   ⚠️ Docs not accessible: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Docs error: {e}")
        
        # Test openapi.json
        print("\n3. Testing OpenAPI spec...")
        try:
            response = requests.get(f"{base_url}/openapi.json")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                spec = response.json()
                paths = list(spec.get("paths", {}).keys())
                print(f"   ✅ OpenAPI spec accessible")
                print(f"   Available paths: {len(paths)}")
                print(f"   Sample paths: {paths[:5]}")
            else:
                print(f"   ⚠️ OpenAPI spec not accessible: {response.status_code}")
        except Exception as e:
            print(f"   ❌ OpenAPI error: {e}")
        
        print("\n🎉 Server status tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    print("Starting server status tests...")
    success = test_server_status()
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n💥 Tests failed!")
        import sys
        sys.exit(1)