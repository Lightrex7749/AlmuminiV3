#!/usr/bin/env python3
"""
Verify that chat system tables exist and have data in Railway database
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
    
    print("\n" + "="*60)
    print("CHAT SYSTEM DATABASE VERIFICATION")
    print("="*60)
    
    # Check if tables exist
    tables_to_check = [
        'messages',
        'conversations',
        'message_read_receipts',
        'typing_indicators',
        'user_presence'
    ]
    
    print("\n1️⃣  CHECKING FOR REQUIRED TABLES:")
    print("-" * 60)
    
    for table in tables_to_check:
        cursor.execute(f"SHOW TABLES LIKE '{table}'")
        result = cursor.fetchone()
        status = "✅ EXISTS" if result else "❌ MISSING"
        print(f"  {table:<30} {status}")
    
    # Check message count
    print("\n2️⃣  MESSAGE COUNT:")
    print("-" * 60)
    
    cursor.execute("SELECT COUNT(*) FROM messages")
    message_count = cursor.fetchone()[0]
    print(f"  Total messages: {message_count}")
    
    if message_count > 0:
        # Show latest messages
        cursor.execute("""
            SELECT id, sender_id, recipient_id, message_text, sent_at 
            FROM messages 
            ORDER BY sent_at DESC 
            LIMIT 5
        """)
        print("\n  📨 Latest 5 messages:")
        for msg in cursor.fetchall():
            print(f"    - ID: {msg[0]}, From: {msg[1][:8]}..., Text: {msg[3][:40]}...")
    
    # Check conversations count
    print("\n3️⃣  CONVERSATION COUNT:")
    print("-" * 60)
    
    cursor.execute("SELECT COUNT(*) FROM conversations")
    conv_count = cursor.fetchone()[0]
    print(f"  Total conversations: {conv_count}")
    
    if conv_count > 0:
        # Show latest conversations
        cursor.execute("""
            SELECT id, user_id_1, user_id_2, last_message_at 
            FROM conversations 
            ORDER BY last_message_at DESC 
            LIMIT 5
        """)
        print("\n  💬 Latest 5 conversations:")
        for conv in cursor.fetchall():
            print(f"    - ID: {conv[0]}, Users: {conv[1][:8]}... ↔ {conv[2][:8]}..., Last: {conv[3]}")
    
    # Check read receipts count
    print("\n4️⃣  READ RECEIPT COUNT:")
    print("-" * 60)
    
    cursor.execute("SELECT COUNT(*) FROM message_read_receipts")
    receipt_count = cursor.fetchone()[0]
    print(f"  Total read receipts: {receipt_count}")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY:")
    print("="*60)
    
    if message_count > 0 and conv_count > 0:
        print("✅ Chat system is working!")
        print(f"   - {message_count} messages stored")
        print(f"   - {conv_count} conversations created")
        print(f"   - {receipt_count} read receipts recorded")
    else:
        print("⚠️  Database tables exist but no data yet")
        print("   Send a message in the chat to populate the database")
    
    print("="*60 + "\n")
    
    cursor.close()
    conn.close()
    
except mysql.connector.Error as err:
    print(f"\n❌ DATABASE CONNECTION ERROR: {err}")
    print("\nMake sure:")
    print("  1. Railway database is running")
    print("  2. Database credentials in backend/.env are correct")
    print("  3. You're connected to internet")
except Exception as e:
    print(f"\n❌ ERROR: {e}")
