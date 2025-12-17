#!/usr/bin/env python3
"""
Test the message sending endpoint
"""
import requests
import json

# Test user IDs from the database
sender_id = "8967047e-f984-4ffe-8e01-e8e49e9348f8"  # sarthakpandey6162@gmail.com
recipient_id = "257ab149-000b-4e1a-86d1-dec67c4fcb98"  # ava.hernandez@alumni.edu

print("\n" + "="*70)
print("TESTING MESSAGE SENDING ENDPOINT")
print("="*70)

print(f"\nSender ID: {sender_id}")
print(f"Recipient ID: {recipient_id}")

# Create FormData like the frontend does
data = {
    'recipient_id': recipient_id,
    'message_text': 'Test message'
}

headers = {
    'Authorization': f'Bearer fake_token_for_testing'
}

print(f"\nSending POST to http://localhost:8001/api/messages/send")
print(f"Data: {data}")

try:
    response = requests.post(
        'http://localhost:8001/api/messages/send',
        data=data,
        headers=headers,
        timeout=10
    )
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
        
except Exception as e:
    print(f"\n❌ ERROR: {e}")
