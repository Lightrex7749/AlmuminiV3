#!/usr/bin/env python3
"""
Check users in database and debug message sending issue
"""
import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(Path(__file__).parent / 'backend' / '.env')

try:
    # Connect to database
    conn = mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'railway'),
        charset='utf8mb4'
    )
    
    cursor = conn.cursor()
    
    print("\n" + "="*70)
    print("DEBUGGING MESSAGE SENDING ISSUE")
    print("="*70)
    
    # Check users table
    print("\n1️⃣  USERS IN DATABASE:")
    print("-" * 70)
    
    cursor.execute("SELECT id, name, email FROM users LIMIT 10")
    users = cursor.fetchall()
    
    if users:
        print(f"Found {len(users)} users:\n")
        for user in users:
            print(f"  ID: {user[0]}")
            print(f"  Name: {user[1]}")
            print(f"  Email: {user[2]}")
            print()
    else:
        print("❌ NO USERS FOUND!")
        print("   This is why messages are failing - no valid sender/recipient IDs")
    
    # Check current user (from localStorage)
    print("\n2️⃣  WHAT USER ID ARE YOU USING?")
    print("-" * 70)
    print("Check your browser's Application/Storage tab:")
    print("  1. Open browser DevTools (F12)")
    print("  2. Go to 'Application' tab")
    print("  3. Click 'Local Storage'")
    print("  4. Find 'user' key")
    print("  5. Copy the 'id' value")
    print("  6. Paste it below to verify it exists in database")
    
    # Test query with a sample user ID
    print("\n3️⃣  VERIFY USER EXISTS:")
    print("-" * 70)
    
    if users:
        test_id = users[0][0]
        print(f"\nTesting with first user ID: {test_id}")
        cursor.execute(f"SELECT id FROM users WHERE id = '{test_id}'")
        result = cursor.fetchone()
        if result:
            print(f"✅ User {test_id} exists in database")
        else:
            print(f"❌ User {test_id} NOT found")
    
    # Check message table structure
    print("\n4️⃣  MESSAGE TABLE STRUCTURE:")
    print("-" * 70)
    
    cursor.execute("DESCRIBE messages")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  {col[0]:<20} {col[1]}")
    
    # Check if there are foreign key constraints
    print("\n5️⃣  FOREIGN KEY CONSTRAINTS:")
    print("-" * 70)
    
    cursor.execute("""
        SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'messages' AND REFERENCED_TABLE_NAME IS NOT NULL
    """)
    
    fk_constraints = cursor.fetchall()
    if fk_constraints:
        for fk in fk_constraints:
            print(f"  {fk[0]}: {fk[1]} → {fk[2]}.id")
    
    print("\n" + "="*70)
    print("SOLUTION:")
    print("="*70)
    print("""
If no users were found:
  1. You need to create test users first
  2. Login with valid credentials
  3. The system will create a user in the users table
  4. Then you can send messages

If users exist but messages still fail:
  1. Check the user ID in localStorage matches a database user
  2. Make sure recipient_id is also a valid user ID
  3. Check backend logs for detailed error
    """)
    
    cursor.close()
    conn.close()
    
except mysql.connector.Error as err:
    print(f"\n❌ DATABASE ERROR: {err}")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
