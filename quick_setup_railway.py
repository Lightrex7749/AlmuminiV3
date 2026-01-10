#!/usr/bin/env python3
"""Create missing Railway tables with sample data"""
import asyncio
import aiomysql

async def setup():
    conn = await aiomysql.connect(
        host='trolley.proxy.rlwy.net',
        port=29610,
        user='root',
        password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
        db='railway'
    )
    
    async with conn.cursor() as cursor:
        # Create alumni_profiles with sample data
        print("Creating alumni_profiles...")
        await cursor.execute("""
            CREATE TABLE IF NOT EXISTS alumni_profiles (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255),
                headline VARCHAR(500),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Insert sample data for existing users
        await cursor.execute("""
            INSERT IGNORE INTO alumni_profiles (id, user_id, name, headline, is_verified)
            SELECT UUID(), id, CONCAT(first_name, ' ', last_name), job_title, TRUE
            FROM user_profiles
            WHERE user_id IN (SELECT id FROM users WHERE role IN ('alumni', 'student'))
        """)
        
        # Create profile_verification_requests
        print("Creating profile_verification_requests...")
        await cursor.execute("""
            CREATE TABLE IF NOT EXISTS profile_verification_requests (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        await conn.commit()
        print("✅ Tables created and populated with data!")
    
    conn.close()

asyncio.run(setup())
