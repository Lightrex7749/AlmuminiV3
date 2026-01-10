"""Check existing tables in Railway and create missing ones"""
import asyncio
import aiomysql
import sys

async def check_and_create():
    try:
        conn = await aiomysql.connect(
            host='trolley.proxy.rlwy.net',
            port=29610,
            user='root',
            password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
            db='railway',
            timeout=30
        )
        print("✅ Connected to Railway database")
        
        async with conn.cursor() as cursor:
            # List all tables
            await cursor.execute("SHOW TABLES")
            tables = await cursor.fetchall()
            table_names = [t[0] for t in tables]
            
            print(f"\n📊 Found {len(table_names)} tables:")
            for t in sorted(table_names):
                print(f"  - {t}")
            
            # Check for alumni_profiles
            if 'alumni_profiles' in table_names:
                print("\n✅ alumni_profiles table EXISTS")
            else:
                print("\n❌ alumni_profiles table MISSING - Creating...")
                await cursor.execute("""
                    CREATE TABLE alumni_profiles (
                        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
                        user_id VARCHAR(50) NOT NULL UNIQUE,
                        photo_url VARCHAR(500),
                        name VARCHAR(255),
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
                        INDEX idx_user_id (user_id),
                        INDEX idx_is_verified (is_verified)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                await conn.commit()
                print("✅ alumni_profiles table created")
            
            # Check for profile_verification_requests
            if 'profile_verification_requests' in table_names:
                print("✅ profile_verification_requests table EXISTS")
            else:
                print("❌ profile_verification_requests table MISSING - Creating...")
                await cursor.execute("""
                    CREATE TABLE profile_verification_requests (
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
                """)
                await conn.commit()
                print("✅ profile_verification_requests table created")
        
        conn.close()
        print("\n✅ All tables verified/created successfully")
        return True
        
    except asyncio.TimeoutError:
        print("❌ Connection timeout - Railway database may be unreachable")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

try:
    result = asyncio.run(check_and_create())
    sys.exit(0 if result else 1)
except KeyboardInterrupt:
    print("\n⚠️ Interrupted")
    sys.exit(1)
