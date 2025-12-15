import aiomysql
import asyncio

async def load_schema():
    try:
        print("🔄 Connecting to Railway MySQL...")
        pool = await aiomysql.create_pool(
            host='yamabiko.proxy.rlwy.net',
            port=42030,
            user='root',
            password='dHWAplhWXQrMGslMpLEaIJrNJWOTSunB',
            db='railway',
            charset='utf8mb4'
        )
        print("✅ Connected!")
        
        # Read schema file
        print("📖 Reading database_schema.sql...")
        with open('../database_schema.sql', 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Split by statements (basic splitting on semicolons)
        statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
        
        print(f"📝 Found {len(statements)} SQL statements")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                for i, statement in enumerate(statements, 1):
                    # Skip comments and empty lines
                    if statement.startswith('--') or statement.startswith('/*') or not statement:
                        continue
                    
                    try:
                        print(f"⏳ Executing statement {i}/{len(statements)}...", end='\r')
                        await cursor.execute(statement)
                        await conn.commit()
                    except Exception as e:
                        # Skip errors for DROP IF EXISTS, etc.
                        if 'Unknown table' not in str(e) and 'already exists' not in str(e):
                            print(f"\n⚠️ Warning on statement {i}: {str(e)[:100]}")
                
                print(f"\n✅ Schema loaded successfully!")
                
                # Verify tables
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                print(f"✅ Created {len(tables)} tables:")
                for table in tables[:10]:  # Show first 10
                    print(f"   - {table[0]}")
                if len(tables) > 10:
                    print(f"   ... and {len(tables) - 10} more")
        
        pool.close()
        await pool.wait_closed()
        print("\n🎉 Database setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(load_schema())
