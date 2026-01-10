"""Test local Railway database connection"""
import asyncio
import aiomysql

async def test():
    try:
        conn = await aiomysql.connect(
            host='trolley.proxy.rlwy.net',
            port=29610,
            user='root',
            password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
            db='railway'
        )
        print('✅ Direct connection works')
        
        async with conn.cursor() as cursor:
            await cursor.execute('SELECT email, password_hash FROM users LIMIT 1')
            result = await cursor.fetchone()
            if result:
                print(f'✅ Query works: {result[0]}')
                print(f'✅ Hash exists: {result[1][:20]}...')
        
        conn.close()
    except Exception as e:
        print(f'❌ Error: {str(e)}')

asyncio.run(test())
