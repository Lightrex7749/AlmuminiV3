-- ============================================================================
-- MESSAGING SYSTEM SCHEMA
-- Tables for real-time chat functionality
-- ============================================================================

USE AlumUnity;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    sender_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    message_text LONGTEXT NOT NULL,
    attachment_url VARCHAR(500) NULL,
    attachment_type ENUM('image', 'file', 'video') NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_conversation (sender_id, recipient_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversations table (cache for quick lookup)
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    user_id_1 VARCHAR(50) NOT NULL,
    user_id_2 VARCHAR(50) NOT NULL,
    last_message_id VARCHAR(50) NULL,
    last_message_at TIMESTAMP NULL,
    unread_count_1 INT DEFAULT 0,
    unread_count_2 INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    UNIQUE KEY unique_conversation (user_id_1, user_id_2),
    INDEX idx_user_id_1 (user_id_1),
    INDEX idx_user_id_2 (user_id_2),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message read receipts table
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    message_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_receipt (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User typing indicators (transient, can be cleaned up)
CREATE TABLE IF NOT EXISTS typing_indicators (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    typing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_typing (conversation_id, user_id),
    INDEX idx_conversation_id (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User presence/status
CREATE TABLE IF NOT EXISTS user_presence (
    id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('online', 'away', 'offline', 'do_not_disturb') DEFAULT 'offline',
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_conversation_id VARCHAR(50) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (current_conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_last_seen_at (last_seen_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
