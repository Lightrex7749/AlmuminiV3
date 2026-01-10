#!/usr/bin/env python3
"""
Create Missing Tables - Using pymysql (synchronous)
This avoids asyncio timeout issues
"""

import pymysql
import os
from dotenv import load_dotenv
import time

load_dotenv('backend/.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

# Simplified table creation - most critical first
TABLES_TO_CREATE = {
    'alumni_profiles': """
    CREATE TABLE IF NOT EXISTS alumni_profiles (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255),
        bio TEXT,
        current_company VARCHAR(255),
        current_role VARCHAR(255),
        location VARCHAR(255),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )""",
    
    'profile_verification_requests': """
    CREATE TABLE IF NOT EXISTS profile_verification_requests (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )""",
    
    'mentor_profiles': """
    CREATE TABLE IF NOT EXISTS mentor_profiles (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        is_available BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )""",
    
    'admin_actions': """
    CREATE TABLE IF NOT EXISTS admin_actions (
        id VARCHAR(50) PRIMARY KEY,
        admin_id VARCHAR(50) NOT NULL,
        action_type VARCHAR(100),
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
    )""",
    
    'badges': """
    CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""",
    
    'user_badges': """
    CREATE TABLE IF NOT EXISTS user_badges (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        badge_id VARCHAR(50) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id)
    )""",
    
    'email_verifications': """
    CREATE TABLE IF NOT EXISTS email_verifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        otp_code VARCHAR(6),
        expires_at TIMESTAMP,
        is_used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )""",
    
    'password_resets': """
    CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        reset_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP,
        is_used BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )""",
    
    'notification_preferences': """
    CREATE TABLE IF NOT EXISTS notification_preferences (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )""",
    
    'privacy_settings': """
    CREATE TABLE IF NOT EXISTS privacy_settings (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        profile_visibility VARCHAR(50) DEFAULT 'public',
        allow_messages BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )""",
}

try:
    print("🔌 Connecting to Railway MySQL...")
    conn = pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        connect_timeout=15,
        read_timeout=30,
        write_timeout=30
    )
    print("✅ Connected!\n")
    
    cursor = conn.cursor()
    
    created = 0
    failed = 0
    
    for table_name, create_sql in TABLES_TO_CREATE.items():
        try:
            print(f"Creating {table_name}...", end=' ', flush=True)
            cursor.execute(create_sql)
            conn.commit()
            print("✅")
            created += 1
        except Exception as e:
            print(f"❌ {str(e)[:50]}")
            failed += 1
            continue
        
        # Pause between statements
        time.sleep(0.5)
    
    print(f"\n✅ Created: {created} tables")
    print(f"❌ Failed: {failed} tables")
    
    # Verify
    print("\n📊 Checking all tables...")
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"✅ Total tables: {len(tables)}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
