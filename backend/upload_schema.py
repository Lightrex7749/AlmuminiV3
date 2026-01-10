#!/usr/bin/env python3
"""
Upload PostgreSQL schema to Render database
Run: python upload_schema.py
"""

import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in .env file")
    exit(1)

print(f"📡 Connecting to Render PostgreSQL database...")
print(f"   URL: {DATABASE_URL[:50]}...")

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Read and execute schema
    schema_path = os.path.join(os.path.dirname(__file__), 'database_schema_postgres.sql')
    
    if not os.path.exists(schema_path):
        print(f"❌ ERROR: Schema file not found at {schema_path}")
        exit(1)
    
    print(f"📂 Reading schema from: {schema_path}")
    
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Execute schema
    print("🔄 Executing schema...")
    cursor.execute(schema_sql)
    conn.commit()
    
    print("✅ Schema uploaded successfully!")
    
    # Verify tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    
    tables = cursor.fetchall()
    print(f"\n📊 Created {len(tables)} tables:")
    for (table,) in tables:
        print(f"   ✓ {table}")
    
    cursor.close()
    conn.close()
    
except psycopg2.Error as e:
    print(f"❌ Database error: {e}")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
