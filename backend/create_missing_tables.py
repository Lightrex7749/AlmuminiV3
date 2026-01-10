"""Create missing alumni_profiles and related tables in Railway"""
import asyncio
import aiomysql

async def create_tables():
    try:
        conn = await aiomysql.connect(
            host='trolley.proxy.rlwy.net',
            port=29610,
            user='root',
            password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
            db='railway'
        )
        
        async with conn.cursor() as cursor:
            # Check if alumni_profiles exists
            await cursor.execute("""
                SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'alumni_profiles'
            """)
            exists = await cursor.fetchone()
            
            if exists:
                print("✅ alumni_profiles table already exists")
            else:
                print("Creating alumni_profiles table...")
                
                # Create alumni_profiles table
                await cursor.execute("""
                    CREATE TABLE alumni_profiles (
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
                        INDEX idx_user_id (user_id),
                        INDEX idx_current_company (current_company),
                        INDEX idx_location (location),
                        INDEX idx_batch_year (batch_year),
                        INDEX idx_is_verified (is_verified),
                        INDEX idx_industry (industry),
                        INDEX idx_willing_to_mentor (willing_to_mentor),
                        FULLTEXT idx_name_bio (name, bio, headline)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                await conn.commit()
                print("✅ alumni_profiles table created")
            
            # Check if profile_verification_requests exists
            await cursor.execute("""
                SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'profile_verification_requests'
            """)
            exists = await cursor.fetchone()
            
            if exists:
                print("✅ profile_verification_requests table already exists")
            else:
                print("Creating profile_verification_requests table...")
                
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
            
            print("\n✅ Database tables verified/created successfully")
        
        conn.close()
    except Exception as e:
        print(f"❌ Error: {str(e)}")

asyncio.run(create_tables())
