#!/usr/bin/env python3
"""
Test message sending with valid JWT token
"""
import requests
import json
import os
from datetime import datetime, timedelta, UTC
from jose import jwt
from dotenv import load_dotenv
from pathlib import Path

# Load environment
load_dotenv(Path('backend/.env'))

# JWT config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Test user IDs
sender_id = "8967047e-f984-4ffe-8e01-e8e49e9348f8"  # sarthakpandey6162@gmail.com
recipient_id = "257ab149-000b-4e1a-86d1-dec67c4fcb98"  # ava.hernandez@alumni.edu

print("\n" + "="*70)
print("TESTING MESSAGE SENDING WITH JWT TOKEN")
print("="*70)

# Create JWT token
token_data = {
    "sub": sender_id,
    "email": "sarthakpandey6162@gmail.com",
    "role": "student",
    "is_verified": True
}

expire = datetime.now(UTC) + timedelta(hours=24)
token_data.update({"exp": expire})
token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)

print(f"\nSender ID: {sender_id}")
print(f"Recipient ID: {recipient_id}")
print(f"JWT Token: {token[:50]}...")

# Send message
data = {
    'recipient_id': recipient_id,
    'message_text': 'Test message from Python'
}

headers = {
    'Authorization': f'Bearer {token}'
}

print(f"\n📤 Sending POST to http://localhost:8001/api/messages/send")
print(f"   Recipient: {recipient_id}")
print(f"   Message: Test message from Python")

try:
    response = requests.post(
        'http://localhost:8001/api/messages/send',
        data=data,
        headers=headers,
        timeout=10
    )
    
    print(f"\n📊 Response Status: {response.status_code}")
    print(f"\n📝 Response Body:")
    try:
        resp_json = response.json()
        print(json.dumps(resp_json, indent=2))
    except:
        print(response.text)
    
    if response.status_code == 200:
        print("\n✅ MESSAGE SENT SUCCESSFULLY!")
    else:
        print(f"\n❌ ERROR (Status {response.status_code})")
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
