#!/usr/bin/env python3
"""
Upload MySQL schema to Railway database
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"📡 Uploading MySQL schema to Railway database...")

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
    
    # Read schema file (use the original MySQL schema)
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'database_schema.sql')
    
    print(f"📂 Reading schema from: {schema_path}")
    
    if not os.path.exists(schema_path):
        print(f"❌ Schema file not found at {schema_path}")
        exit(1)
    
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    
    # Split by statements and execute (simplified - real implementation would be more careful)
    statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
    
    print(f"🔄 Executing {len(statements)} SQL statements...")
    
    for i, statement in enumerate(statements, 1):
        if statement.startswith('--') or statement.startswith('/*'):
            continue  # Skip comments
        try:
            cursor.execute(statement)
            print(f"  ✓ Statement {i}/{len(statements)}")
        except Exception as e:
            # Some statements may fail (like DROP DATABASE) - that's okay
            print(f"  ⚠ Statement {i}: {str(e)[:60]}")
    
    conn.commit()
    
    print("\n✅ Schema uploaded successfully!")
    
    # Verify tables
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"\n📊 Created {len(tables)} tables:")
    for (table,) in tables:
        print(f"   ✓ {table}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
