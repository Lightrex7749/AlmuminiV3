#!/usr/bin/env python3
"""Test login with correct hash verification"""

import pymysql
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_HOST = os.getenv('DB_HOST', 'trolley.proxy.rlwy.net')
DB_PORT = int(os.getenv('DB_PORT', 29610))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'railway')

def test_login():
    """Test if login will work"""
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with conn.cursor() as cursor:
            # Test with a known user
            email = 'admin@alumni.edu'
            password = 'password123'
            
            cursor.execute("SELECT id, email, password_hash, role FROM users WHERE email = %s LIMIT 1", (email,))
            user = cursor.fetchone()
            
            if not user:
                print(f"❌ User {email} not found")
                return False
            
            print(f"✅ User found: {user['email']}")
            print(f"   Hash: {user['password_hash'][:50]}...")
            
            # Try to verify password
            try:
                verified = pwd_context.verify(password, user['password_hash'])
                if verified:
                    print(f"✅ Password verification successful!")
                    print(f"   User role: {user['role']}")
                    return True
                else:
                    print(f"❌ Password verification failed - password doesn't match")
                    return False
            except Exception as e:
                print(f"❌ Password verification error: {e}")
                return False
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

if __name__ == '__main__':
    success = test_login()
    if success:
        print("\n✅ Login should work now!")
    else:
        print("\n❌ Login will still fail - investigate further")
