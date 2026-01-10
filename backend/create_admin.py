#!/usr/bin/env python3
"""Create an admin test user for demo purposes"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.connection import get_mock_db
import uuid
from datetime import datetime
import json

def create_admin_user():
    """Create admin user for demo"""
    db = get_mock_db()
    
    # Admin user data
    user_id = str(uuid.uuid4())
    email = "admin@alumunity.com"
    password = "Admin123!"
    
    admin_user = {
        "id": user_id,
        "email": email,
        "password": password,
        "first_name": "Admin",
        "last_name": "Demo",
        "username": "admin",
        "bio": "AlumUnity Admin - Full Platform Access",
        "profile_photo": "https://via.placeholder.com/150",
        "role": "admin",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "verified": True,
        "status": "active",
        "is_admin": True,
        "permissions": ["read_all", "write_all", "delete_all", "manage_users"]
    }
    
    # Ensure users dict exists
    if "users" not in db:
        db["users"] = {}
    
    # Add admin user
    db["users"][user_id] = admin_user
    
    print("\n" + "="*60)
    print("✅ ADMIN USER CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"\n📧 Email:    admin@alumunity.com")
    print(f"🔐 Password: Admin123!")
    print("\n" + "="*60)
    print("Login with these credentials to access the admin dashboard!")
    print("="*60 + "\n")
    
    return admin_user

if __name__ == "__main__":
    create_admin_user()
