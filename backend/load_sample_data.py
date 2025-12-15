import aiomysql
import asyncio
import re

async def load_sample_data():
    """Load sample data from sample_data_insert.sql to Railway MySQL"""
    try:
        print("=" * 60)
        print("Loading Sample Data to Railway MySQL")
        print("=" * 60)
        
        print("\n🔄 Connecting to Railway MySQL...")
        pool = await aiomysql.create_pool(
            host='yamabiko.proxy.rlwy.net',
            port=42030,
            user='root',
            password='dHWAplhWXQrMGslMpLEaIJrNJWOTSunB',
            db='railway',
            charset='utf8mb4',
            autocommit=True
        )
        print("✅ Connected!")
        
        # Read sample data SQL file
        print("\n📖 Reading sample_data_insert.sql...")
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sql_file = os.path.join(os.path.dirname(script_dir), 'sample_data_insert.sql')
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Remove "USE AlumUnity;" since we're already connected to railway database
        sql_content = sql_content.replace('USE AlumUnity;', '')
        
        # Split into statements (handle multi-line inserts properly)
        print("🔍 Parsing SQL statements...")
        
        # Remove comments
        sql_content = re.sub(r'--.*$', '', sql_content, flags=re.MULTILINE)
        sql_content = re.sub(r'/\*.*?\*/', '', sql_content, flags=re.DOTALL)
        
        # Split by semicolons but keep complete INSERT statements together
        statements = []
        current_statement = ""
        for line in sql_content.split('\n'):
            line = line.strip()
            if not line:
                continue
            current_statement += " " + line
            if line.endswith(';'):
                stmt = current_statement.strip()
                if stmt and not stmt.startswith('SET '):
                    statements.append(stmt)
                current_statement = ""
        
        print(f"📝 Found {len(statements)} data insertion statements")
        
        # Execute statements
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Disable foreign key checks
                print("\n⚙️  Disabling foreign key checks...")
                await cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                
                executed = 0
                failed = 0
                
                for i, statement in enumerate(statements, 1):
                    try:
                        if statement.strip().upper().startswith('INSERT'):
                            # Extract table name for better logging
                            table_match = re.search(r'INSERT INTO\s+(\w+)', statement, re.IGNORECASE)
                            table_name = table_match.group(1) if table_match else "unknown"
                            
                            await cursor.execute(statement)
                            executed += 1
                            print(f"✅ [{executed}/{len(statements)}] Inserted into {table_name}")
                        else:
                            print(f"⏭️  Skipping non-INSERT statement")
                    except Exception as e:
                        failed += 1
                        print(f"❌ Error on statement {i}: {str(e)[:100]}")
                        if failed > 10:
                            print("\n⚠️  Too many errors, stopping...")
                            break
                
                # Re-enable foreign key checks
                print("\n⚙️  Re-enabling foreign key checks...")
                await cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                
                # Verify data was loaded
                print("\n📊 Verifying loaded data...")
                tables_to_check = [
                    'users', 'alumni_profiles', 'jobs', 'events', 
                    'forum_posts', 'mentor_profiles', 'knowledge_capsules'
                ]
                
                total_rows = 0
                for table in tables_to_check:
                    try:
                        await cursor.execute(f'SELECT COUNT(*) FROM {table}')
                        result = await cursor.fetchone()
                        count = result[0]
                        total_rows += count
                        status = "✓" if count > 0 else "✗"
                        print(f"  {status} {table:25} {count:4} rows")
                    except Exception as e:
                        print(f"  ✗ {table:25} Error: {e}")
                
                print("\n" + "=" * 60)
                print(f"✅ Sample Data Load Complete!")
                print(f"   Successfully executed: {executed} statements")
                print(f"   Failed: {failed} statements")
                print(f"   Total rows loaded: {total_rows}")
                print("=" * 60)
                
                if total_rows > 0:
                    print("\n🎉 Your Railway MySQL database now has sample data!")
                    print("\nTest accounts you can use:")
                    print("  Admin:     admin@alumni.edu / Admin@123")
                    print("  Alumni:    sarah.johnson@alumni.edu / Alumni@123")
                    print("  Student:   emily.rodriguez@alumni.edu / Student@123")
                    print("  Recruiter: david.kim@techcorp.com / Recruiter@123")
                else:
                    print("\n⚠️  Warning: No rows were loaded. Check errors above.")
        
        pool.close()
        await pool.wait_closed()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(load_sample_data())
