#!/usr/bin/env python3
"""
Check what's running on port 8000 and verify FastAPI app.
"""

import requests
import json

def check_server():
    """Check what's running on port 8000."""
    try:
        print("🔍 Checking what's running on port 8000...")
        
        base_url = "http://localhost:8000"
        
        # Test root endpoint
        print("1. Testing root endpoint...")
        try:
            response = requests.get(f"{base_url}/")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test FastAPI docs
        print("\n2. Testing FastAPI docs...")
        try:
            response = requests.get(f"{base_url}/docs")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ FastAPI docs accessible")
            else:
                print("   ❌ FastAPI docs not accessible")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test OpenAPI spec
        print("\n3. Testing OpenAPI spec...")
        try:
            response = requests.get(f"{base_url}/openapi.json")
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                spec = response.json()
                print(f"   ✅ OpenAPI spec accessible")
                print(f"   Title: {spec.get('info', {}).get('title', 'Unknown')}")
                print(f"   Version: {spec.get('info', {}).get('version', 'Unknown')}")
            else:
                print("   ❌ OpenAPI spec not accessible")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test a specific endpoint
        print("\n4. Testing patients endpoint...")
        try:
            response = requests.get(f"{base_url}/patients/")
            print(f"   Status: {response.status_code}")
            print(f"   CORS Origin: {response.headers.get('Access-Control-Allow-Origin', 'Not found')}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print("\n🎉 Server check completed!")
        return True
        
    except Exception as e:
        print(f"❌ Check failed with error: {e}")
        return False

if __name__ == "__main__":
    print("Starting server check...")
    success = check_server()
    
    if success:
        print("\n✅ Check completed!")
    else:
        print("\n💥 Check failed!")
        import sys
        sys.exit(1)