#!/usr/bin/env python3
"""
Apply chat system schema to Railway database
"""
import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(Path(__file__).parent / 'backend' / '.env')

try:
    # Connect to database
    conn = mysql.connector.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', 3306)),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'railway'),
        charset='utf8mb4'
    )
    
    cursor = conn.cursor()
    
    print("\n" + "="*70)
    print("APPLYING CHAT SYSTEM SCHEMA TO RAILWAY DATABASE")
    print("="*70)
    
    # SQL statements to create tables
    sql_statements = [
        # Messages table
        """
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Conversations table
        """
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Message read receipts table
        """
        CREATE TABLE IF NOT EXISTS message_read_receipts (
            id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
            message_id VARCHAR(50) NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_receipt (message_id, user_id),
            INDEX idx_message_id (message_id),
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Typing indicators table
        """
        CREATE TABLE IF NOT EXISTS typing_indicators (
            id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
            conversation_id VARCHAR(50) NOT NULL,
            user_id VARCHAR(50) NOT NULL,
            typing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_conversation_id (conversation_id),
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # User presence table
        """
        CREATE TABLE IF NOT EXISTS user_presence (
            id VARCHAR(50) PRIMARY KEY DEFAULT (UUID()),
            user_id VARCHAR(50) UNIQUE NOT NULL,
            status ENUM('online', 'away', 'offline', 'do_not_disturb') DEFAULT 'offline',
            last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            current_conversation_id VARCHAR(50) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (current_conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    ]
    
    tables = ['messages', 'conversations', 'message_read_receipts', 'typing_indicators', 'user_presence']
    
    # Create tables
    for i, sql in enumerate(sql_statements):
        try:
            cursor.execute(sql)
            print(f"✅ {tables[i]} - Created successfully")
        except mysql.connector.Error as err:
            if "already exists" in str(err):
                print(f"✅ {tables[i]} - Already exists")
            else:
                print(f"❌ {tables[i]} - Error: {err}")
    
    conn.commit()
    
    # Verify tables exist
    print("\n" + "="*70)
    print("VERIFICATION")
    print("="*70)
    
    for table in tables:
        cursor.execute(f"SHOW TABLES LIKE '{table}'")
        if cursor.fetchone():
            print(f"✅ {table} - Verified")
        else:
            print(f"❌ {table} - Not found")
    
    print("\n" + "="*70)
    print("✅ SCHEMA APPLIED SUCCESSFULLY!")
    print("="*70)
    print("\nYour chat system is ready to use!")
    print("Messages you send will now be saved to the database.\n")
    
    cursor.close()
    conn.close()
    
except mysql.connector.Error as err:
    print(f"\n❌ DATABASE ERROR: {err}")
    print("\nMake sure:")
    print("  1. Railway database is running")
    print("  2. Database credentials in backend/.env are correct")
    print("  3. You have internet connection")
    print("  4. The 'users' table exists (required for foreign keys)")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
