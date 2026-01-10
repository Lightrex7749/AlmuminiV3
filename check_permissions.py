#!/usr/bin/env python3
"""
Check user permissions and database info
"""

import pymysql
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

try:
    print("🔌 Connecting...")
    conn = pymysql.connect(**DB_CONFIG, connect_timeout=10)
    cursor = conn.cursor()
    
    print("\n📊 Database info:")
    cursor.execute("SELECT DATABASE()")
    print(f"   Current DB: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT VERSION()")
    print(f"   MySQL Version: {cursor.fetchone()[0]}")
    
    print("\n👤 User info:")
    cursor.execute("SELECT USER()")
    print(f"   Current User: {cursor.fetchone()[0]}")
    
    print("\n🔐 User privileges:")
    cursor.execute("SHOW GRANTS")
    for grant in cursor.fetchall():
        print(f"   {grant[0]}")
    
    print("\n📋 Database status:")
    cursor.execute("SHOW VARIABLES LIKE 'read_only'")
    result = cursor.fetchone()
    if result:
        print(f"   read_only: {result[1]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
