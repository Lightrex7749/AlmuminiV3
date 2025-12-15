import aiomysql
import asyncio
import re

async def load_schema_simple():
    """Load schema by executing only CREATE TABLE statements, skipping complex triggers/procedures"""
    try:
        print("🔄 Connecting to Railway MySQL...")
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
        
        # Read schema file
        print("📖 Reading database_schema.sql...")
        with open('../database_schema.sql', 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Extract only CREATE TABLE statements
        print("🔍 Extracting CREATE TABLE statements...")
        create_table_pattern = r'CREATE TABLE[^;]+;'
        create_statements = re.findall(create_table_pattern, schema_sql, re.IGNORECASE | re.DOTALL)
        
        print(f"📝 Found {len(create_statements)} CREATE TABLE statements")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                success_count = 0
                error_count = 0
                
                for i, statement in enumerate(create_statements, 1):
                    try:
                        # Clean up the statement
                        clean_statement = statement.strip()
                        
                        # Skip if it references a database name
                        if 'AlumUnity' in clean_statement:
                            clean_statement = clean_statement.replace('`AlumUnity`.', '')
                        
                        print(f"⏳ Creating table {i}/{len(create_statements)}...", end='\r')
                        await cursor.execute(clean_statement)
                        success_count += 1
                        
                    except Exception as e:
                        error_count += 1
                        # Extract table name for error reporting
                        table_match = re.search(r'CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?', clean_statement, re.IGNORECASE)
                        table_name = table_match.group(1) if table_match else f"statement_{i}"
                        
                        error_msg = str(e)
                        if 'already exists' in error_msg:
                            print(f"\n⚠️  Table {table_name} already exists (skipping)")
                        elif 'Unknown table' not in error_msg:
                            print(f"\n⚠️  Error creating {table_name}: {error_msg[:100]}")
                
                print(f"\n\n✅ Schema loading complete!")
                print(f"   ✅ Success: {success_count} tables")
                print(f"   ⚠️  Skipped/Errors: {error_count}")
                
                # Verify tables
                print("\n📊 Verifying created tables...")
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                
                if tables:
                    print(f"✅ Successfully created {len(tables)} tables:")
                    for table in sorted(tables[:20]):  # Show first 20
                        print(f"   • {table[0]}")
                    if len(tables) > 20:
                        print(f"   ... and {len(tables) - 20} more")
                else:
                    print("❌ No tables created!")
        
        pool.close()
        await pool.wait_closed()
        print("\n🎉 Database setup complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(load_schema_simple())
    exit(0 if success else 1)
