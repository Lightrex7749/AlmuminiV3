import aiomysql
import asyncio

async def check_data():
    """Check if Railway MySQL has sample data"""
    conn = await aiomysql.connect(
        host='yamabiko.proxy.rlwy.net',
        port=42030,
        user='root',
        password='dHWAplhWXQrMGslMpLEaIJrNJWOTSunB',
        db='railway'
    )
    
    cursor = await conn.cursor()
    
    tables_to_check = [
        'users',
        'jobs',
        'events',
        'forum_posts',
        'alumni_profiles',
        'mentor_profiles',
        'mentorship_requests',
        'job_applications',
        'event_registrations',
        'knowledge_capsules'
    ]
    
    print("=" * 60)
    print("Railway MySQL Data Check")
    print("=" * 60)
    
    total_rows = 0
    for table in tables_to_check:
        try:
            await cursor.execute(f'SELECT COUNT(*) FROM {table}')
            result = await cursor.fetchone()
            count = result[0]
            total_rows += count
            status = "✓ HAS DATA" if count > 0 else "✗ EMPTY"
            print(f"{table:30} {count:6} rows  {status}")
        except Exception as e:
            print(f"{table:30} ERROR: {e}")
    
    print("=" * 60)
    print(f"Total rows across all tables: {total_rows}")
    print("=" * 60)
    
    if total_rows == 0:
        print("\n🔴 DATABASE IS EMPTY - Only table structure exists, no sample data")
        print("\nTo load sample data, run:")
        print("  python load_sample_data.py")
    else:
        print(f"\n✅ DATABASE HAS DATA - {total_rows} total rows found")
    
    conn.close()

if __name__ == "__main__":
    asyncio.run(check_data())
