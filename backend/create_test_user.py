#!/usr/bin/env python3
"""Create a test user in the mock database for demo purposes"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.connection import get_mock_db
import uuid
from datetime import datetime

def create_test_user():
    """Create test user for demo"""
    db = get_mock_db()
    
    # Test user data
    user_id = str(uuid.uuid4())
    email = "demo@alumunity.com"
    password = "Demo123!"  # Already hashed in the app, but storing simple for demo
    
    user = {
        "id": user_id,
        "email": email,
        "password": password,  # In real app, this would be hashed
        "first_name": "Demo",
        "last_name": "User",
        "username": "demouser",
        "bio": "Testing AlumUnity platform features",
        "profile_photo": "https://via.placeholder.com/150",
        "role": "user",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "verified": True,
        "status": "active"
    }
    
    # Add to mock database
    if "users" not in db:
        db["users"] = {}
    
    db["users"][user_id] = user
    
    print("✅ TEST USER CREATED")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("\nUse these credentials to log in to the app!")
    
    return user

if __name__ == "__main__":
    create_test_user()
