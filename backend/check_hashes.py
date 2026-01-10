#!/usr/bin/env python3
"""Check password hashes in Railway database"""
import pymysql
import os
from dotenv import load_dotenv
from pathlib import Path

# Load env vars
load_dotenv(Path(__file__).parent / '.env')

DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'railway')
DB_PORT = int(os.environ.get('DB_PORT', 29610))

print(f"Connecting to {DB_HOST}:{DB_PORT}/{DB_NAME}...")

try:
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    
    # Get first 5 users with their hashes
    cursor.execute('SELECT id, email, password_hash FROM users LIMIT 5')
    rows = cursor.fetchall()
    
    print(f"\n✅ Found {len(rows)} users\n")
    for row in rows:
        user_id, email, pwd_hash = row
        print(f"Email: {email}")
        print(f"Hash: {pwd_hash}")
        print(f"Hash type: {type(pwd_hash)}")
        print(f"Hash valid: {pwd_hash.startswith('$2') if pwd_hash else False}")
        print()
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
