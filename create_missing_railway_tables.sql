-- Create missing tables in Railway
-- These 24 tables are required by the app

-- 1. Alumni profiles
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255),
    headline VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Profile verification requests
CREATE TABLE IF NOT EXISTS profile_verification_requests (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Email verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    otp_code VARCHAR(6),
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Password resets
CREATE TABLE IF NOT EXISTS password_resets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255),
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Mentor profiles
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    expertise VARCHAR(500),
    years_experience INT,
    hourly_rate INT,
    availability VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Mentorship sessions
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50),
    mentor_id VARCHAR(50),
    mentee_id VARCHAR(50),
    session_date TIMESTAMP,
    duration_minutes INT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id),
    FOREIGN KEY (mentee_id) REFERENCES users(id)
);

-- 7. Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
    id VARCHAR(50) PRIMARY KEY,
    event_id VARCHAR(50),
    user_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'yes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Badges
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    icon_url VARCHAR(255),
    criteria VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    badge_id VARCHAR(50),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- 10. Engagement scores
CREATE TABLE IF NOT EXISTS engagement_scores (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    score INT DEFAULT 0,
    category VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 11. Contribution history
CREATE TABLE IF NOT EXISTS contribution_history (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    contribution_type VARCHAR(50),
    contribution_id VARCHAR(50),
    points INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Knowledge capsules
CREATE TABLE IF NOT EXISTS knowledge_capsules (
    id VARCHAR(50) PRIMARY KEY,
    creator_id VARCHAR(50),
    title VARCHAR(255),
    content LONGTEXT,
    category VARCHAR(100),
    tags VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- 13. Capsule views
CREATE TABLE IF NOT EXISTS capsule_views (
    id VARCHAR(50) PRIMARY KEY,
    capsule_id VARCHAR(50),
    user_id VARCHAR(50),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES knowledge_capsules(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 14. Capsule ratings
CREATE TABLE IF NOT EXISTS capsule_ratings (
    id VARCHAR(50) PRIMARY KEY,
    capsule_id VARCHAR(50),
    user_id VARCHAR(50),
    rating INT,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES knowledge_capsules(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 15. Geographic data
CREATE TABLE IF NOT EXISTS geographic_data (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    coordinates POINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 16. Alumni cards
CREATE TABLE IF NOT EXISTS alumni_cards (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    card_image_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    visibility VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 17. Talent clusters
CREATE TABLE IF NOT EXISTS talent_clusters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    skill_tags VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Career transition matrix
CREATE TABLE IF NOT EXISTS career_transition_matrix (
    id VARCHAR(50) PRIMARY KEY,
    from_role VARCHAR(100),
    to_role VARCHAR(100),
    transition_count INT DEFAULT 0,
    success_rate DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Career predictions
CREATE TABLE IF NOT EXISTS career_predictions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    predicted_role VARCHAR(100),
    confidence_score DECIMAL(5,2),
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 20. Skill recommendations
CREATE TABLE IF NOT EXISTS skill_recommendations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    skill_id VARCHAR(50),
    recommended_for VARCHAR(100),
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- 21. Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 22. Privacy settings
CREATE TABLE IF NOT EXISTS privacy_settings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    profile_visibility VARCHAR(50) DEFAULT 'public',
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 23. System config
CREATE TABLE IF NOT EXISTS system_config (
    id VARCHAR(50) PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE,
    config_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. System metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id VARCHAR(50) PRIMARY KEY,
    metric_name VARCHAR(100),
    metric_value INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. Post likes (bonus - for forum posts)
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50),
    user_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 26. Comment likes (bonus)
CREATE TABLE IF NOT EXISTS comment_likes (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50),
    user_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES forum_comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 27. Content flags (bonus - for moderation)
CREATE TABLE IF NOT EXISTS content_flags (
    id VARCHAR(50) PRIMARY KEY,
    content_type VARCHAR(50),
    content_id VARCHAR(50),
    reported_by VARCHAR(50),
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- 28. Admin actions (bonus - for audit logging)
CREATE TABLE IF NOT EXISTS admin_actions (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50),
    action_type VARCHAR(50),
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    details LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Add some sample data
INSERT IGNORE INTO alumni_profiles (id, user_id, name, headline, is_verified)
SELECT UUID(), id, CONCAT(
    COALESCE((SELECT first_name FROM user_profiles WHERE user_id = users.id), 'User'), ' ',
    COALESCE((SELECT last_name FROM user_profiles WHERE user_id = users.id), 'Profile')
), 
    (SELECT job_title FROM user_profiles WHERE user_id = users.id), 
    TRUE
FROM users WHERE role IN ('alumni', 'student') LIMIT 10;

INSERT IGNORE INTO mentor_profiles (id, user_id, bio, expertise, years_experience, hourly_rate)
SELECT UUID(), id, 'Experienced mentor ready to guide', 'Tech Leadership', 10, 50
FROM users WHERE role = 'alumni' LIMIT 5;

INSERT IGNORE INTO engagement_scores (id, user_id, score, category)
SELECT UUID(), id, 100, 'overall' FROM users LIMIT 10;

INSERT IGNORE INTO notification_preferences (id, user_id, email_notifications, push_notifications)
SELECT UUID(), id, TRUE, TRUE FROM users LIMIT 10;

INSERT IGNORE INTO privacy_settings (id, user_id, profile_visibility, show_email)
SELECT UUID(), id, 'public', FALSE FROM users LIMIT 10;

INSERT IGNORE INTO system_config (id, config_key, config_value)
VALUES 
    (UUID(), 'app_name', 'AlumUnity'),
    (UUID(), 'app_version', '1.0.0'),
    (UUID(), 'max_file_upload_mb', '50');

-- Show results
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'railway';
