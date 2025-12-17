import asyncio
import aiomysql
import os

async def test_connection():
    print("Attempting to connect to local MySQL...")
    try:
        # Try common local configurations
        configs = [
            {'user': 'root', 'password': '', 'db': 'AlumUnity'},
            {'user': 'root', 'password': 'password', 'db': 'AlumUnity'},
            {'user': 'root', 'password': 'root', 'db': 'AlumUnity'},
            {'user': 'alumni_user', 'password': 'alumni_pass_123', 'db': 'AlumUnity'}, # Default in connection.py
        ]
        
        for config in configs:
            print(f"Trying user='{config['user']}', password='{config['password']}'...")
            try:
                pool = await aiomysql.create_pool(
                    host='localhost',
                    port=3306,
                    user=config['user'],
                    password=config['password'],
                    db=config['db'],
                    connect_timeout=5
                )
                print(f"✅ SUCCESS! Connected with user='{config['user']}'")
                pool.close()
                await pool.wait_closed()
                return
            except Exception as e:
                print(f"❌ Failed: {e}")
                
        print("Could not connect with common defaults.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_connection())
