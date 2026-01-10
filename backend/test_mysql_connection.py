#!/usr/bin/env python3
"""
Test MySQL connection to Railway
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Testing MySQL connection...")
print(f"URL: {DATABASE_URL[:50]}...")

try:
    import pymysql
    
    # Parse connection string manually
    # mysql://user:password@host:port/database
    url = DATABASE_URL.replace('mysql://', '')
    user_pass, host_db = url.split('@')
    user, password = user_pass.split(':')
    host_port, db = host_db.split('/')
    host, port = host_port.split(':')
    
    print(f"\nConnecting to:")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Database: {db}")
    print(f"  User: {user}")
    
    conn = pymysql.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=db,
        connect_timeout=10
    )
    
    print("\n✅ Connected successfully!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT VERSION()")
    version = cursor.fetchone()
    print(f"✅ MySQL version: {version[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\nMake sure:")
    print("1. Railway MySQL database is running")
    print("2. Connection string is correct")
    print("3. Network allows access to trolley.proxy.rlwy.net:29610")
