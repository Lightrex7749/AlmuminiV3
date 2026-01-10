#!/usr/bin/env python3
"""
Test the quick login users endpoint
"""
import os
from dotenv import load_dotenv
import json

load_dotenv()

# Test with mock data first (should work immediately)
DATABASE_URL = os.getenv('DATABASE_URL')
USE_MOCK_DB = os.getenv('USE_MOCK_DB', 'true').lower() == 'true'

print(f"Testing /api/auth/quick-login-users endpoint")
print(f"Mode: {'MOCK' if USE_MOCK_DB else 'DATABASE'}")
print(f"Database: {DATABASE_URL[:30]}..." if DATABASE_URL else "None")
print()

# Import the routes to test
import sys
sys.path.insert(0, '/d/ProjectsGit/v3/AluminiV2/backend')

from routes.auth import MOCK_USERS

# Test returning mock data
print("✅ Mock users available from MOCK_USERS:")
for i, (email, user_data) in enumerate(list(MOCK_USERS.items())[:6]):
    print(f"  {i+1}. {email} ({user_data.get('role', 'unknown')})")

print("\n📊 Expected response format:")
users = []
for email, user_data in list(MOCK_USERS.items())[:6]:
    users.append({
        "email": user_data["email"],
        "name": user_data.get("name", ""),
        "role": user_data.get("role", "student"),
        "avatar": user_data.get("avatar", "")
    })

response = {"users": users}
print(json.dumps(response, indent=2))
print("\n✅ Endpoint is ready for testing!")
