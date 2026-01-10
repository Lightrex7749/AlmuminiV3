#!/usr/bin/env python3
"""Fix password hashes for all database users"""

import os
import pymysql
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_HOST = os.getenv('DB_HOST', 'trolley.proxy.rlwy.net')
DB_PORT = int(os.getenv('DB_PORT', 29610))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'railway')

def fix_passwords():
    """Fix password hashes for all users"""
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
            # Get all users
            cursor.execute("SELECT id, email, password_hash FROM users LIMIT 20")
            users = cursor.fetchall()
            
            print(f"Found {len(users)} users to fix")
            
            # Generate proper bcrypt hash for password123
            proper_hash = pwd_context.hash('password123')
            print(f"Generated hash for 'password123': {proper_hash[:50]}...")
            
            # Update all user password hashes
            fixed = 0
            for user in users:
                cursor.execute(
                    "UPDATE users SET password_hash = %s WHERE id = %s",
                    (proper_hash, user['id'])
                )
                fixed += 1
            
            conn.commit()
            print(f"✅ Fixed {fixed} user passwords")
            
            # Verify changes
            cursor.execute("SELECT id, email FROM users LIMIT 3")
            sample = cursor.fetchall()
            print(f"\n✅ Sample users updated:")
            for user in sample:
                print(f"   - {user['email']}")
        
        conn.close()
        print(f"\n✅ Password fix complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    fix_passwords()
