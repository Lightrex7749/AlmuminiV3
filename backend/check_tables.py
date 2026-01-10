#!/usr/bin/env python3
"""
Check what tables exist in Railway MySQL database
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Checking tables in Railway MySQL database...\n")

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
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    if tables:
        print(f"✅ Found {len(tables)} tables:")
        for (table,) in tables:
            print(f"   • {table}")
    else:
        print("❌ No tables found!")
        print("\nYou need to upload the database schema.")
        print("Run: python upload_mysql_schema.py")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
