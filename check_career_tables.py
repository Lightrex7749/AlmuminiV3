import aiomysql
import asyncio

async def check():
    conn = await aiomysql.connect(
        host='trolley.proxy.rlwy.net',
        port=29610,
        user='root',
        password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
        db='railway'
    )
    
    cursor = await conn.cursor()
    
    # List all tables starting with career
    await cursor.execute("SHOW TABLES LIKE 'career%'")
    tables = await cursor.fetchall()
    print('Career tables:')
    for table in tables:
        print(f'  - {table[0]}')
    
    # Check career_paths columns
    await cursor.execute('DESCRIBE career_transition_matrix')
    print('\ncareer_transition_matrix columns:')
    for col in await cursor.fetchall():
        print(f'  - {col[0]} ({col[1]})')
    
    cursor.close()
    conn.close()

asyncio.run(check())
