#!/usr/bin/env python3
"""Execute SQL file to create missing Railway tables"""
import asyncio
import aiomysql
import sqlparse

async def execute_sql_file():
    # Read the SQL file
    with open('create_missing_railway_tables.sql', 'r') as f:
        sql_content = f.read()
    
    conn = await aiomysql.connect(
        host='trolley.proxy.rlwy.net',
        port=29610,
        user='root',
        password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
        db='railway',
        autocommit=True  # Auto-commit each statement
    )
    
    async with conn.cursor() as cursor:
        # Use sqlparse to properly split statements
        statements = sqlparse.split(sql_content)
        
        executed = 0
        errors = 0
        create_count = 0
        insert_count = 0
        
        print(f"Found {len(statements)} SQL statements\n")
        
        for idx, statement in enumerate(statements, 1):
            statement = statement.strip()
            if not statement:
                continue
            
            # Skip comment-only statements
            lines = [l.strip() for l in statement.split('\n') if l.strip() and not l.strip().startswith('--')]
            if not lines:
                continue
            
            # Reconstruct statement without leading comments
            statement = '\n'.join(lines)
            
            stmt_type = "CREATE" if statement.upper().startswith('CREATE') else "INSERT"
            
            try:
                # Add semicolon if missing
                if not statement.endswith(';'):
                    statement += ';'
                
                print(f"[{idx}] {stmt_type}: {statement[:70].replace(chr(10), ' ')}...")
                await cursor.execute(statement)
                executed += 1
                
                if stmt_type == "CREATE":
                    create_count += 1
                else:
                    insert_count += 1
                print(f"     [OK] Success")
            except Exception as e:
                error_msg = str(e)
                if "already exists" in error_msg:
                    print(f"     [WARN] Already exists (OK)")
                elif "doesn't exist" in error_msg:
                    print(f"     [WARN] Dependency missing (may be created later)")
                    errors += 1
                else:
                    print(f"     [ERROR] {error_msg[:80]}")
                    errors += 1
        
        print(f"\n{'='*70}")
        print(f"[OK] CREATE statements: {create_count}")
        print(f"[OK] INSERT statements: {insert_count}")
        print(f"[OK] Total executed: {executed}")
        print(f"[ERROR] Errors: {errors}")
        print(f"{'='*70}")
    
    conn.close()

asyncio.run(execute_sql_file())
