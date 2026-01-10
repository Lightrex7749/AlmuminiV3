#!/usr/bin/env python3
"""
Upload clean MySQL schema to Railway database
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"📡 Uploading MySQL schema to Railway database...\n")

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
    
    # Read clean schema file
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'database_schema_mysql_clean.sql')
    
    print(f"📂 Reading schema from: {schema_path}")
    
    if not os.path.exists(schema_path):
        print(f"❌ Schema file not found at {schema_path}")
        exit(1)
    
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    print(f"📄 File size: {len(schema_sql)} bytes\n")
    
    # Split by semicolon
    raw_statements = schema_sql.split(';')
    statements = []
    
    for s in raw_statements:
        s = s.strip()
        # Skip empty and comment-only lines, but allow statements that start after comments
        lines = [line.strip() for line in s.split('\n') if line.strip() and not line.strip().startswith('--')]
        if lines:
            full_stmt = ' '.join(lines)
            if full_stmt and not full_stmt.startswith('/*'):
                statements.append(full_stmt)
    
    print(f"🔄 Found {len(statements)} SQL statements...\n")
    
    success_count = 0
    error_count = 0
    
    for i, statement in enumerate(statements, 1):
        try:
            cursor.execute(statement)
            success_count += 1
            table_name = statement.split()[-2] if 'CREATE TABLE' in statement else f"stmt {i}"
            print(f"  ✓ {i:3d}. {table_name}")
        except Exception as e:
            error_count += 1
            print(f"  ✗ {i:3d}. Error: {str(e)[:60]}")
    
    conn.commit()
    
    print(f"\n✅ Schema upload complete!")
    print(f"   Success: {success_count} statements")
    print(f"   Errors: {error_count} statements")
    
    # Verify tables
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    
    if tables:
        print(f"\n📊 Created {len(tables)} tables:")
        for (table,) in sorted(tables):
            print(f"   ✓ {table}")
    else:
        print("\n⚠️  No tables created. Check schema syntax.")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
