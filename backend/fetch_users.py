#!/usr/bin/env python3
"""
Fetch users from Railway MySQL database
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Fetching users from Railway MySQL database...\n")

try:
    import pymysql
    import json
    
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
    cursor.execute("SELECT id, email, role FROM users LIMIT 20")
    users = cursor.fetchall()
    
    if users:
        print(f"✅ Found {len(users)} users:\n")
        user_list = []
        for user_id, email, role in users:
            print(f"  • {email} ({role})")
            user_list.append({
                "email": email,
                "role": role
            })
        
        print(f"\n📋 User JSON for quick login:")
        print(json.dumps(user_list, indent=2))
    else:
        print("❌ No users found in database!")
        print("\nYou need to insert sample user data first.")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
