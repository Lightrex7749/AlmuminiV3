import aiomysql
import asyncio

async def test_connection():
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
        print("✅ Connected to Railway MySQL successfully!")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT VERSION()")
                result = await cursor.fetchone()
                print(f"✅ MySQL Version: {result[0]}")
                
                # Check if tables exist
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                if tables:
                    print(f"✅ Found {len(tables)} tables in database")
                else:
                    print("⚠️ No tables found - you need to load the schema")
        
        pool.close()
        await pool.wait_closed()
        print("✅ Connection test complete!")
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_connection())
