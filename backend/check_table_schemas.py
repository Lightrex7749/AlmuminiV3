#!/usr/bin/env python3
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
    
    conn = pymysql.connect(host=host, port=int(port), user=user, password=password, database=db, connect_timeout=10)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Check all table schemas
    tables = ['jobs', 'job_applications', 'forum_posts', 'events', 'event_attendees', 'notifications']
    
    for table in tables:
        print(f"\n{table.upper()} SCHEMA:")
        print("=" * 50)
        cursor.execute(f"DESCRIBE {table}")
        for col in cursor.fetchall():
            print(f"  {col['Field']}: {col['Type']}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
