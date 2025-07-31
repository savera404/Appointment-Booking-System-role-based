#!/usr/bin/env python3
"""
Check what collections exist in the database and their structure.
"""

import asyncio
from app.database import get_database

async def check_collections():
    """Check what collections exist in the database."""
    try:
        print("🔍 Checking database collections...")
        
        db = get_database()
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"\n📋 Collections found: {len(collections)}")
        for i, collection in enumerate(collections, 1):
            print(f"  {i}. {collection}")
        
        # Check each collection structure
        for collection_name in collections:
            print(f"\n📊 Collection: {collection_name}")
            try:
                # Get one document to see structure
                doc = await db[collection_name].find_one()
                if doc:
                    print(f"  Sample document keys: {list(doc.keys())}")
                    print(f"  Document ID: {doc.get('_id', 'No _id')}")
                    if 'id' in doc:
                        print(f"  Custom ID: {doc['id']}")
                else:
                    print("  Empty collection")
            except Exception as e:
                print(f"  Error reading collection: {e}")
        
        # Check specific collections we need
        required_collections = ['users', 'patients_new', 'appointments_new', 'doctors', 'availabilities']
        print(f"\n🎯 Checking required collections:")
        for req_col in required_collections:
            exists = req_col in collections
            status = "✅" if exists else "❌"
            print(f"  {status} {req_col}")
        
        print("\n🎉 Collection check completed!")
        return True
        
    except Exception as e:
        print(f"❌ Check failed with error: {e}")
        return False

if __name__ == "__main__":
    print("Starting collection check...")
    asyncio.run(check_collections())