#!/usr/bin/env python3
"""
Create Missing Tables in Railway Database
Extracts CREATE TABLE statements for only the missing tables
"""

import asyncio
import json
import os
from dotenv import load_dotenv
import aiomysql

load_dotenv()

# Railway database connection
# Load from backend .env file
load_dotenv('backend/.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'trolley.proxy.rlwy.net'),
    'port': int(os.getenv('DB_PORT', '29610')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'db': os.getenv('DB_NAME', 'railway'),
}

# CREATE TABLE statements for missing tables (extracted from schema)
CREATE_TABLE_STATEMENTS = [
    # Admin tables
    """
    CREATE TABLE IF NOT EXISTS admin_actions (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        admin_id VARCHAR(50) NOT NULL,
        action_type ENUM('user_management', 'content_moderation', 'verification', 'system_config', 'other') NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(50),
        description TEXT NOT NULL,
        metadata JSON,
        ip_address VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_admin_id (admin_id),
        INDEX idx_action_type (action_type),
        INDEX idx_timestamp (timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Alumni cards
    """
    CREATE TABLE IF NOT EXISTS alumni_cards (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        card_number VARCHAR(20) NOT NULL UNIQUE,
        qr_code_data TEXT NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        verification_count INT DEFAULT 0,
        last_verified TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_card_number (card_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Alumni profiles (CRITICAL)
    """
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
        INDEX idx_user_id (user_id),
        INDEX idx_current_company (current_company),
        INDEX idx_location (location),
        INDEX idx_batch_year (batch_year),
        INDEX idx_is_verified (is_verified),
        INDEX idx_industry (industry),
        INDEX idx_willing_to_mentor (willing_to_mentor)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Badges
    """
    CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon_url VARCHAR(500),
        requirements JSON,
        rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
        points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_rarity (rarity)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Career transition matrix
    """
    CREATE TABLE IF NOT EXISTS career_transition_matrix (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        from_role VARCHAR(255) NOT NULL,
        to_role VARCHAR(255) NOT NULL,
        transition_count INT DEFAULT 0,
        transition_probability DECIMAL(5,4),
        avg_duration_months INT,
        required_skills JSON,
        success_rate DECIMAL(5,4),
        college_id VARCHAR(50),
        last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_transition (from_role, to_role, college_id),
        INDEX idx_from_role (from_role),
        INDEX idx_to_role (to_role),
        INDEX idx_probability (transition_probability DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Comment likes
    """
    CREATE TABLE IF NOT EXISTS comment_likes (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        comment_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (comment_id, user_id),
        INDEX idx_comment_id (comment_id),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Content flags
    """
    CREATE TABLE IF NOT EXISTS content_flags (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        content_type ENUM('post', 'comment', 'job', 'event', 'profile') NOT NULL,
        content_id VARCHAR(50) NOT NULL,
        flagged_by VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'removed') DEFAULT 'pending',
        reviewed_by VARCHAR(50) NULL,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flagged_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_content_type_id (content_type, content_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Contribution history
    """
    CREATE TABLE IF NOT EXISTS contribution_history (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL,
        contribution_type ENUM('profile_update', 'mentorship', 'job_post', 'event_attend', 'forum_post', 'forum_comment', 'help_others') NOT NULL,
        points_earned INT DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_contribution_type (contribution_type),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Email verifications
    """
    CREATE TABLE IF NOT EXISTS email_verifications (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Engagement scores
    """
    CREATE TABLE IF NOT EXISTS engagement_scores (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        total_score INT DEFAULT 0,
        contributions JSON,
        rank_position INT,
        level VARCHAR(50),
        last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_total_score (total_score),
        INDEX idx_rank_position (rank_position)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Event RSVPs
    """
    CREATE TABLE IF NOT EXISTS event_rsvps (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        event_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        status ENUM('attending', 'maybe', 'not_attending') DEFAULT 'attending',
        rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_rsvp (event_id, user_id),
        INDEX idx_event_id (event_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Geographic data
    """
    CREATE TABLE IF NOT EXISTS geographic_data (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        location_name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        city VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        alumni_count INT DEFAULT 0,
        jobs_count INT DEFAULT 0,
        top_skills JSON,
        top_companies JSON,
        top_industries JSON,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_location (location_name),
        INDEX idx_country (country),
        INDEX idx_city (city),
        INDEX idx_coordinates (latitude, longitude)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Knowledge capsules
    """
    CREATE TABLE IF NOT EXISTS knowledge_capsules (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id VARCHAR(50) NOT NULL,
        category ENUM('technical', 'career', 'entrepreneurship', 'life_lessons', 'industry_insights', 'other') NOT NULL,
        tags JSON,
        duration_minutes INT,
        featured_image VARCHAR(500),
        likes_count INT DEFAULT 0,
        views_count INT DEFAULT 0,
        bookmarks_count INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_author_id (author_id),
        INDEX idx_category (category),
        INDEX idx_is_featured (is_featured),
        INDEX idx_views_count (views_count)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Mentor profiles
    """
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
        INDEX idx_user_id (user_id),
        INDEX idx_is_available (is_available),
        INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Mentorship sessions
    """
    CREATE TABLE IF NOT EXISTS mentorship_sessions (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        mentorship_request_id VARCHAR(50) NOT NULL,
        scheduled_date TIMESTAMP NOT NULL,
        duration INT DEFAULT 60,
        status ENUM('scheduled', 'completed', 'cancelled', 'missed') DEFAULT 'scheduled',
        meeting_link VARCHAR(500),
        agenda TEXT,
        notes TEXT,
        feedback TEXT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (mentorship_request_id) REFERENCES mentorship_requests(id) ON DELETE CASCADE,
        INDEX idx_mentorship_request_id (mentorship_request_id),
        INDEX idx_scheduled_date (scheduled_date),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Notification preferences
    """
    CREATE TABLE IF NOT EXISTS notification_preferences (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        job_alerts BOOLEAN DEFAULT TRUE,
        event_reminders BOOLEAN DEFAULT TRUE,
        mentorship_updates BOOLEAN DEFAULT TRUE,
        forum_activity BOOLEAN DEFAULT TRUE,
        notification_types JSON,
        notification_frequency ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
        quiet_hours_start TIME,
        quiet_hours_end TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Password resets
    """
    CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL,
        reset_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_reset_token (reset_token),
        INDEX idx_expires_at (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Post likes
    """
    CREATE TABLE IF NOT EXISTS post_likes (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        post_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (post_id, user_id),
        INDEX idx_post_id (post_id),
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Privacy settings
    """
    CREATE TABLE IF NOT EXISTS privacy_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL UNIQUE,
        profile_visibility ENUM('public', 'alumni', 'connections', 'private') DEFAULT 'public',
        show_email BOOLEAN DEFAULT FALSE,
        show_phone BOOLEAN DEFAULT FALSE,
        allow_messages BOOLEAN DEFAULT TRUE,
        allow_mentorship_requests BOOLEAN DEFAULT TRUE,
        show_in_directory BOOLEAN DEFAULT TRUE,
        show_activity BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Profile verification requests (CRITICAL)
    """
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
    """,
    
    # System config
    """
    CREATE TABLE IF NOT EXISTS system_config (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT NOT NULL,
        config_type VARCHAR(50),
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_config_key (config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # System metrics
    """
    CREATE TABLE IF NOT EXISTS system_metrics (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,2) NOT NULL,
        metric_unit VARCHAR(50),
        category VARCHAR(50),
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_metric_name (metric_name),
        INDEX idx_category (category),
        INDEX idx_recorded_at (recorded_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # Talent clusters
    """
    CREATE TABLE IF NOT EXISTS talent_clusters (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        cluster_name VARCHAR(255) NOT NULL,
        center_latitude DECIMAL(10, 8),
        center_longitude DECIMAL(11, 8),
        radius_km DECIMAL(8, 2),
        alumni_ids JSON,
        dominant_skills JSON,
        dominant_industries JSON,
        cluster_size INT,
        cluster_density DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cluster_name (cluster_name),
        INDEX idx_coordinates (center_latitude, center_longitude)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """,
    
    # User badges
    """
    CREATE TABLE IF NOT EXISTS user_badges (
        id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(50) NOT NULL,
        badge_id VARCHAR(50) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_id),
        INDEX idx_user_id (user_id),
        INDEX idx_earned_at (earned_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """
]

async def create_tables():
    """Create all missing tables in Railway"""
    conn = None
    try:
        print("🔌 Connecting to Railway database...")
        conn = await aiomysql.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            db=DB_CONFIG['db']
        )
        
        cursor = await conn.cursor()
        
        print(f"\n📋 Creating {len(CREATE_TABLE_STATEMENTS)} missing tables...\n")
        
        created_count = 0
        failed_count = 0
        
        for i, statement in enumerate(CREATE_TABLE_STATEMENTS, 1):
            try:
                await cursor.execute(statement)
                # Extract table name from statement
                table_name = statement.split('`')[1] if '`' in statement else statement.split('TABLE')[2].strip().split('(')[0].strip()
                print(f"✅ [{i}/{len(CREATE_TABLE_STATEMENTS)}] Created: {table_name}")
                created_count += 1
            except Exception as e:
                print(f"❌ [{i}/{len(CREATE_TABLE_STATEMENTS)}] Error: {str(e)[:80]}")
                failed_count += 1
        
        await conn.commit()
        
        print(f"\n{'='*60}")
        print(f"✅ Created: {created_count} tables")
        print(f"❌ Failed:  {failed_count} tables")
        print(f"{'='*60}\n")
        
        # Verify all tables
        print("📊 Verifying created tables...")
        await cursor.execute("SHOW TABLES")
        tables = [row[0] for row in await cursor.fetchall()]
        print(f"\n✅ Railway now has {len(tables)} total tables")
        print("\nAll tables:")
        for table in sorted(tables):
            print(f"  - {table}")
        
        await cursor.close()
        
    except Exception as e:
        print(f"\n❌ Connection Error: {str(e)}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    asyncio.run(create_tables())
