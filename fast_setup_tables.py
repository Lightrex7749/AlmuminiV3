#!/usr/bin/env python3
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
        tables = [
            "CREATE TABLE IF NOT EXISTS alumni_profiles (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL UNIQUE, name VARCHAR(255), headline VARCHAR(500), is_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)",
            "CREATE TABLE IF NOT EXISTS profile_verification_requests (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)",
            "CREATE TABLE IF NOT EXISTS email_verifications (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, otp_code VARCHAR(6), expires_at TIMESTAMP, is_used BOOLEAN DEFAULT FALSE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)",
            "CREATE TABLE IF NOT EXISTS password_resets (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL, reset_token VARCHAR(255), expires_at TIMESTAMP, is_used BOOLEAN DEFAULT FALSE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)",
            "CREATE TABLE IF NOT EXISTS mentor_profiles (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) NOT NULL UNIQUE, bio TEXT, expertise VARCHAR(500), years_experience INT, hourly_rate INT, availability VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)",
            "CREATE TABLE IF NOT EXISTS mentorship_sessions (id VARCHAR(50) PRIMARY KEY, request_id VARCHAR(50), mentor_id VARCHAR(50), mentee_id VARCHAR(50), session_date TIMESTAMP, duration_minutes INT, notes TEXT, status VARCHAR(50) DEFAULT 'scheduled', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (mentor_id) REFERENCES users(id), FOREIGN KEY (mentee_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS event_rsvps (id VARCHAR(50) PRIMARY KEY, event_id VARCHAR(50), user_id VARCHAR(50), status VARCHAR(50) DEFAULT 'yes', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (event_id) REFERENCES events(id), FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS badges (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT, icon_url VARCHAR(255), criteria VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS user_badges (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), badge_id VARCHAR(50), earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (badge_id) REFERENCES badges(id))",
            "CREATE TABLE IF NOT EXISTS engagement_scores (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), score INT DEFAULT 0, category VARCHAR(100), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS contribution_history (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), contribution_type VARCHAR(50), contribution_id VARCHAR(50), points INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS knowledge_capsules (id VARCHAR(50) PRIMARY KEY, creator_id VARCHAR(50), title VARCHAR(255), content LONGTEXT, category VARCHAR(100), tags VARCHAR(500), is_public BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (creator_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS capsule_views (id VARCHAR(50) PRIMARY KEY, capsule_id VARCHAR(50), user_id VARCHAR(50), viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (capsule_id) REFERENCES knowledge_capsules(id), FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS capsule_ratings (id VARCHAR(50) PRIMARY KEY, capsule_id VARCHAR(50), user_id VARCHAR(50), rating INT, review TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (capsule_id) REFERENCES knowledge_capsules(id), FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS geographic_data (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), city VARCHAR(100), country VARCHAR(100), coordinates POINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS alumni_cards (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), card_image_url VARCHAR(255), linkedin_url VARCHAR(255), visibility VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS talent_clusters (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT, skill_tags VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS career_transition_matrix (id VARCHAR(50) PRIMARY KEY, from_role VARCHAR(100), to_role VARCHAR(100), transition_count INT DEFAULT 0, success_rate DECIMAL(5,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS career_predictions (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), predicted_role VARCHAR(100), confidence_score DECIMAL(5,2), reasoning TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS skill_recommendations (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), skill_id VARCHAR(50), recommended_for VARCHAR(100), confidence_score DECIMAL(5,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (skill_id) REFERENCES skills(id))",
            "CREATE TABLE IF NOT EXISTS notification_preferences (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), email_notifications BOOLEAN DEFAULT TRUE, push_notifications BOOLEAN DEFAULT TRUE, sms_notifications BOOLEAN DEFAULT FALSE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS privacy_settings (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50), profile_visibility VARCHAR(50) DEFAULT 'public', show_email BOOLEAN DEFAULT FALSE, show_phone BOOLEAN DEFAULT FALSE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS system_config (id VARCHAR(50) PRIMARY KEY, config_key VARCHAR(100) UNIQUE, config_value LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS system_metrics (id VARCHAR(50) PRIMARY KEY, metric_name VARCHAR(100), metric_value INT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS post_likes (id VARCHAR(50) PRIMARY KEY, post_id VARCHAR(50), user_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES forum_posts(id), FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS comment_likes (id VARCHAR(50) PRIMARY KEY, comment_id VARCHAR(50), user_id VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (comment_id) REFERENCES forum_comments(id), FOREIGN KEY (user_id) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS content_flags (id VARCHAR(50) PRIMARY KEY, content_type VARCHAR(50), content_id VARCHAR(50), reported_by VARCHAR(50), reason VARCHAR(255), status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (reported_by) REFERENCES users(id))",
            "CREATE TABLE IF NOT EXISTS admin_actions (id VARCHAR(50) PRIMARY KEY, admin_id VARCHAR(50), action_type VARCHAR(50), target_type VARCHAR(50), target_id VARCHAR(50), details LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (admin_id) REFERENCES users(id))"
        ]
        
        created = 0
        for sql in tables:
            try:
                await cursor.execute(sql)
                created += 1
            except Exception as e:
                if "already exists" not in str(e):
                    print(f"Error: {e}")
        
        await conn.commit()
        print(f"✓ Created/verified {created} tables")
    
    conn.close()

asyncio.run(setup())
