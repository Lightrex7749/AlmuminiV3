-- ============================================================================
-- BURNOUT DETECTION SYSTEM SCHEMA
-- AI-Powered Academic Burnout Detection and Early Warning System
-- ============================================================================

USE AlumUnity;

-- Student burnout data tracking table
CREATE TABLE IF NOT EXISTS student_burnout_data (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(50) NOT NULL,
    
    -- Attendance tracking (JSON array of records)
    -- Format: [{\"date\": \"2025-01-15\", \"status\": \"present/absent/late\", \"reason\": \"optional\"}]
    attendance_records JSON,
    
    -- Grade tracking (JSON array of records)
    -- Format: [{\"course\": \"Math\", \"grade\": 85, \"date\": \"2025-01-15\", \"previous_grade\": 90}]
    grade_records JSON,
    
    -- Assignment submission tracking (JSON array)
    -- Format: [{\"assignment\": \"Essay 1\", \"submitted_on\": \"2025-01-15\", \"due_date\": \"2025-01-14\", \"status\": \"on_time/late/missed\"}]
    assignment_submissions JSON,
    
    -- Sleep and activity patterns (JSON array)
    -- Format: [{\"date\": \"2025-01-15\", \"sleep_hours\": 6, \"activity_level\": \"low/medium/high\", \"notes\": \"optional\"}]
    sleep_activity JSON,
    
    -- Self-reported stress level (1-10 scale)
    stress_level INT DEFAULT 5 CHECK (stress_level >= 1 AND stress_level <= 10),
    
    -- Additional notes from student
    notes TEXT,
    
    -- Week identifier for tracking
    week_number INT,
    year INT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_week_year (week_number, year),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Burnout analysis results table
CREATE TABLE IF NOT EXISTS burnout_analysis (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(50) NOT NULL,
    
    -- Risk assessment
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
    
    -- AI-generated insights (JSON)
    -- Format: {\"attendance_concern\": true, \"grade_drop\": true, \"sleep_deprivation\": true, \"stress_level\": \"high\"}
    contributing_factors JSON,
    
    -- AI-generated recommendations (JSON array)
    -- Format: [\"Get more sleep\", \"Seek counseling\", \"Time management workshop\"]
    recommendations JSON,
    
    -- Trend analysis
    trend ENUM('improving', 'stable', 'declining', 'critical') DEFAULT 'stable',
    previous_score DECIMAL(5,2),
    
    -- Analysis metadata
    analysis_summary TEXT,  -- Full AI analysis text
    data_points_analyzed INT DEFAULT 0,
    confidence_level DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_level >= 0 AND confidence_level <= 1),
    
    -- Alert status
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_at TIMESTAMP NULL,
    
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_analyzed_at (analyzed_at),
    INDEX idx_alert_sent (alert_sent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Burnout alerts for counselors/admins
CREATE TABLE IF NOT EXISTS burnout_alerts (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(50) NOT NULL,
    analysis_id VARCHAR(50) NOT NULL,
    
    -- Alert details
    alert_type ENUM('medium_risk', 'high_risk', 'critical_risk', 'sudden_decline') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    
    -- Assignment to counselor/admin
    assigned_to VARCHAR(50) NULL,  -- counselor/admin user_id
    
    -- Status tracking
    status ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'dismissed') DEFAULT 'pending',
    
    -- Intervention tracking
    intervention_notes TEXT,
    intervention_date TIMESTAMP NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_id) REFERENCES burnout_analysis(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email notification log for burnout alerts
CREATE TABLE IF NOT EXISTS burnout_email_log (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    alert_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type ENUM('student', 'counselor', 'parent', 'admin') NOT NULL,
    
    email_type ENUM('alert', 'reminder', 'follow_up', 'resolution') NOT NULL,
    email_status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
    
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (alert_id) REFERENCES burnout_alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_alert_id (alert_id),
    INDEX idx_student_id (student_id),
    INDEX idx_email_status (email_status),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite index for quick student burnout history lookup
CREATE INDEX idx_student_week_lookup ON student_burnout_data(student_id, year DESC, week_number DESC);

-- Composite index for alert dashboard queries
CREATE INDEX idx_alert_dashboard ON burnout_alerts(status, priority DESC, created_at DESC);

-- Index for counselor workload queries
CREATE INDEX idx_counselor_workload ON burnout_alerts(assigned_to, status, created_at DESC);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Note: Sample data insertion can be done after the schema is created
-- This is just the schema definition

