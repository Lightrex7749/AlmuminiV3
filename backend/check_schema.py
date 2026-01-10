#!/usr/bin/env python3
"""
Check user_profiles table schema
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

try:
    import pymysql
    
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
    
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    print("USER_PROFILES TABLE SCHEMA:")
    print("=" * 70)
    cursor.execute("DESCRIBE user_profiles")
    columns = cursor.fetchall()
    
    for col in columns:
        print(f"  {col['Field']}: {col['Type']} {col['Null']} {col['Key']}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
