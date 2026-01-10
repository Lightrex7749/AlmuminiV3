#!/usr/bin/env python3
"""
Create Missing Tables in Railway - Batch Mode
Creates tables individually to avoid timeout issues
"""

import asyncio
import os
from dotenv import load_dotenv
import aiomysql
import sys

# Load from backend .env file
load_dotenv('backend/.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'trolley.proxy.rlwy.net'),
    'port': int(os.getenv('DB_PORT', '29610')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'db': os.getenv('DB_NAME', 'railway'),
}

# Critical tables first
CRITICAL_TABLES = [
    ('alumni_profiles', """
    CREATE TABLE IF NOT EXISTS alumni_profiles (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        photo_url VARCHAR(500),
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        headline VARCHAR(500),
        current_company VARCHAR(255),
        current_role VARCHAR(255),
        location VARCHAR(255),
        batch_year INT,
        experience_timeline JSON,
        education_details JSON,
        skills JSON,
        achievements JSON,
        social_links JSON,
        cv_url VARCHAR(500),
        industry VARCHAR(255),
        years_of_experience INT DEFAULT 0,
        willing_to_mentor BOOLEAN DEFAULT FALSE,
        willing_to_hire BOOLEAN DEFAULT FALSE,
        profile_completion_percentage INT DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_by VARCHAR(50) NULL,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """),
    
    ('profile_verification_requests', """
    CREATE TABLE IF NOT EXISTS profile_verification_requests (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_by VARCHAR(50) NULL,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """),
    
    ('mentor_profiles', """
    CREATE TABLE IF NOT EXISTS mentor_profiles (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        is_available BOOLEAN DEFAULT TRUE,
        expertise_areas JSON,
        max_mentees INT DEFAULT 5,
        current_mentees_count INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_sessions INT DEFAULT 0,
        total_reviews INT DEFAULT 0,
        mentorship_approach TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """),
]

async def test_connection():
    """Test database connection"""
    try:
        print("🔌 Testing Railway database connection...")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Port: {DB_CONFIG['port']}")
        print(f"   User: {DB_CONFIG['user']}")
        print(f"   Database: {DB_CONFIG['db']}")
        
        conn = await asyncio.wait_for(
            aiomysql.connect(
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                db=DB_CONFIG['db'],
                connect_timeout=10
            ),
            timeout=10
        )
        print("✅ Connection successful!\n")
        return conn
    except asyncio.TimeoutError:
        print("❌ Connection timeout - Railway server is not responding")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        sys.exit(1)

async def create_critical_tables():
    """Create critical tables only"""
    conn = await test_connection()
    
    try:
        cursor = await conn.cursor()
        
        print(f"📋 Creating {len(CRITICAL_TABLES)} critical tables...\n")
        
        for table_name, create_stmt in CRITICAL_TABLES:
            try:
                print(f"Creating {table_name}... ", end='', flush=True)
                await asyncio.wait_for(cursor.execute(create_stmt), timeout=30)
                await conn.commit()
                print("✅")
            except Exception as e:
                print(f"❌ {str(e)[:60]}")
                continue
        
        # Show all tables
        print("\n📊 Verifying tables...")
        await cursor.execute("SHOW TABLES")
        tables = [row[0] for row in await cursor.fetchall()]
        print(f"\n✅ Railway database has {len(tables)} tables")
        
        await cursor.close()
        
    finally:
        conn.close()

if __name__ == "__main__":
    asyncio.run(create_critical_tables())
