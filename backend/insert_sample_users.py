#!/usr/bin/env python3
"""
Insert sample user data into Railway MySQL database
"""
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Inserting sample users into Railway MySQL database...\n")

try:
    import pymysql
    
    # Parse connection string
    url = DATABASE_URL.replace('mysql://', '')
    user_pass, host_db = url.split('@')
    user, password = user_pass.split(':')
    host_port, db = host_db.split('/')
    host, port = host_port.split(':')
    
    conn = pymysql.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=db,
        connect_timeout=10
    )
    
    cursor = conn.cursor()
    
    # Sample users data (same as in mock)
    sample_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@alumni.edu",
            "password_hash": "password123",  # In real app, this would be hashed
            "role": "admin",
            "is_verified": True,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "sarah.johnson@alumni.edu",
            "password_hash": "password123",
            "role": "alumni",
            "is_verified": True,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "emily.rodriguez@alumni.edu",
            "password_hash": "password123",
            "role": "student",
            "is_verified": True,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "david.kim@techcorp.com",
            "password_hash": "password123",
            "role": "recruiter",
            "is_verified": True,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "michael.chen@google.com",
            "password_hash": "password123",
            "role": "alumni",
            "is_verified": True,
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "priya.patel@apple.com",
            "password_hash": "password123",
            "role": "alumni",
            "is_verified": True,
            "is_active": True
        },
    ]
    
    print(f"Inserting {len(sample_users)} users...\n")
    
    for user_data in sample_users:
        try:
            sql = """
            INSERT INTO users (id, email, password_hash, role, is_verified, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                user_data['id'],
                user_data['email'],
                user_data['password_hash'],
                user_data['role'],
                user_data['is_verified'],
                user_data['is_active']
            ))
            print(f"  ✓ {user_data['email']} ({user_data['role']})")
        except Exception as e:
            print(f"  ✗ {user_data['email']}: {str(e)[:50]}")
    
    conn.commit()
    
    print(f"\n✅ Sample users inserted successfully!")
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    print(f"📊 Total users in database: {count}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
