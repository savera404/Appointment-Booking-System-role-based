#!/usr/bin/env python3
"""
Script to create an admin user in the database.
Run this script to create the initial admin user.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import create_user
from app.database import get_database

async def create_admin_user():
    """Create an admin user in the database."""
    try:
        # Create admin user
        admin_user = await create_user(
            contact="admin@medflow.com",
            password="admin123",
            role="admin"
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"Email: {admin_user.email}")
        print(f"Role: {admin_user.role}")
        print(f"ID: {admin_user.id}")
        print("\nYou can now login with:")
        print("Email: admin@medflow.com")
        print("Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Creating admin user...")
    success = asyncio.run(create_admin_user())
    
    if success:
        print("\n🎉 Admin user setup complete!")
    else:
        print("\n💥 Failed to create admin user!")
        sys.exit(1) 