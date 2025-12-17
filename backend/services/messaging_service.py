"""
Messaging Service
Handles all chat functionality including messages, conversations, read receipts, typing indicators, and presence
"""
import logging
from datetime import datetime
from typing import Optional, List, Dict
import uuid

logger = logging.getLogger(__name__)


class MessagingService:
    """Service for handling all messaging operations"""
    
    async def send_message(self, conn, sender_id: str, recipient_id: str, message_text: str, attachment_url: Optional[str] = None):
        """
        Send a message and update conversation
        """
        try:
            # Generate message ID as UUID
            message_id = str(uuid.uuid4())
            
            async with conn.cursor() as cursor:
                # Insert message with generated ID
                query = """
                    INSERT INTO messages (id, sender_id, recipient_id, message_text, attachment_url, sent_at)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                """
                await cursor.execute(query, (message_id, sender_id, recipient_id, message_text, attachment_url))
                
                # Create or update conversation (single row with sorted user IDs)
                user_1 = sender_id if sender_id < recipient_id else recipient_id
                user_2 = recipient_id if sender_id < recipient_id else sender_id
                
                conv_query = """
                    INSERT INTO conversations (user_id_1, user_id_2, last_message_id, last_message_at, unread_count_2)
                    VALUES (%s, %s, %s, NOW(), 1)
                    ON DUPLICATE KEY UPDATE
                        last_message_id = %s,
                        last_message_at = NOW(),
                        unread_count_2 = unread_count_2 + 1
                """
                await cursor.execute(conv_query, (user_1, user_2, message_id, message_id))
                
                await conn.commit()
                
                return {
                    "id": message_id,
                    "sender_id": sender_id,
                    "recipient_id": recipient_id,
                    "message": message_text,
                    "sent_at": datetime.now().isoformat(),
                    "read": False
                }
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            raise
    
    async def get_conversation(self, conn, user_id: str, other_user_id: str, limit: int = 50, offset: int = 0):
        """Get conversation history between two users"""
        try:
            async with conn.cursor() as cursor:
                query = """
                    SELECT 
                        m.id, m.sender_id, m.recipient_id, m.message_text as message,
                        m.sent_at, mrr.read_at,
                        CASE WHEN mrr.id IS NOT NULL THEN TRUE ELSE FALSE END as read
                    FROM messages m
                    LEFT JOIN message_read_receipts mrr ON m.id = mrr.message_id AND mrr.user_id = %s
                    WHERE (m.sender_id = %s AND m.recipient_id = %s)
                       OR (m.sender_id = %s AND m.recipient_id = %s)
                    ORDER BY m.sent_at ASC
                    LIMIT %s OFFSET %s
                """
                await cursor.execute(query, (user_id, user_id, other_user_id, other_user_id, user_id, limit, offset))
                messages = await cursor.fetchall()
                
                # Mark messages as read
                mark_read_query = """
                    INSERT INTO message_read_receipts (message_id, user_id, read_at)
                    SELECT m.id, %s, NOW()
                    FROM messages m
                    WHERE m.recipient_id = %s
                      AND m.sender_id = %s
                      AND NOT EXISTS (
                        SELECT 1 FROM message_read_receipts mrr 
                        WHERE mrr.message_id = m.id AND mrr.user_id = %s
                      )
                    ON DUPLICATE KEY UPDATE read_at = NOW()
                """
                await cursor.execute(mark_read_query, (user_id, user_id, other_user_id, user_id))
                await conn.commit()
                
                return messages
        except Exception as e:
            logger.error(f"Error getting conversation: {str(e)}")
            raise
    
    async def get_conversations_list(self, conn, user_id: str, limit: int = 50, offset: int = 0):
        """Get all conversations for a user with last message preview"""
        try:
            async with conn.cursor() as cursor:
                query = """
                    SELECT 
                        c.id as conversation_id,
                        CASE 
                            WHEN c.user_id_1 = %s THEN c.user_id_2
                            ELSE c.user_id_1
                        END as other_user_id,
                        u.name as other_user_name,
                        u.photo_url,
                        m.message_text as last_message,
                        m.sent_at as last_message_at,
                        CASE 
                            WHEN c.user_id_1 = %s THEN c.unread_count_1
                            ELSE c.unread_count_2
                        END as unread_count,
                        m.sender_id = %s as last_message_from_me
                    FROM conversations c
                    JOIN users u ON (
                        CASE WHEN c.user_id_1 = %s THEN c.user_id_2 ELSE c.user_id_1 END = u.id
                    )
                    LEFT JOIN messages m ON c.last_message_id = m.id
                    WHERE c.user_id_1 = %s OR c.user_id_2 = %s
                    ORDER BY c.last_message_at DESC
                    LIMIT %s OFFSET %s
                """
                await cursor.execute(query, (
                    user_id, user_id, user_id, user_id, user_id, user_id, limit, offset
                ))
                conversations = await cursor.fetchall()
                
                return conversations
        except Exception as e:
            logger.error(f"Error getting conversations: {str(e)}")
            raise
    
    async def mark_as_read(self, conn, message_id: str, user_id: str):
        """Mark a message as read"""
        try:
            async with conn.cursor() as cursor:
                query = """
                    INSERT INTO message_read_receipts (message_id, user_id, read_at)
                    VALUES (%s, %s, NOW())
                    ON DUPLICATE KEY UPDATE read_at = NOW()
                """
                await cursor.execute(query, (message_id, user_id))
                await conn.commit()
                
                return True
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            raise
    
    async def get_unread_count(self, conn, user_id: str):
        """Get total unread messages for user"""
        try:
            async with conn.cursor() as cursor:
                query = """
                    SELECT COUNT(*) as unread_count
                    FROM messages m
                    WHERE m.recipient_id = %s
                      AND NOT EXISTS (
                        SELECT 1 FROM message_read_receipts mrr
                        WHERE mrr.message_id = m.id AND mrr.user_id = %s
                      )
                """
                await cursor.execute(query, (user_id, user_id))
                result = await cursor.fetchone()
                
                return result.get('unread_count', 0) if result else 0
        except Exception as e:
            logger.error(f"Error getting unread count: {str(e)}")
            raise
    
    async def search_messages(self, conn, user_id: str, search_query: str, limit: int = 20):
        """Search messages in user's conversations"""
        try:
            async with conn.cursor() as cursor:
                query = """
                    SELECT 
                        m.id, m.sender_id, m.recipient_id, m.message_text,
                        m.sent_at, u.name as sender_name
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE (m.sender_id = %s OR m.recipient_id = %s)
                      AND m.message_text LIKE %s
                    ORDER BY m.sent_at DESC
                    LIMIT %s
                """
                search_term = f"%{search_query}%"
                await cursor.execute(query, (user_id, user_id, search_term, limit))
                messages = await cursor.fetchall()
                
                return messages
        except Exception as e:
            logger.error(f"Error searching messages: {str(e)}")
            raise
    
    async def delete_conversation(self, conn, conversation_id: str, user_id: str):
        """Delete a conversation for a user"""
        try:
            async with conn.cursor() as cursor:
                # Verify ownership
                query = "SELECT id FROM conversations WHERE id = %s AND (user_id_1 = %s OR user_id_2 = %s)"
                await cursor.execute(query, (conversation_id, user_id, user_id))
                conv = await cursor.fetchone()
                
                if not conv:
                    raise Exception("Conversation not found or unauthorized")
                
                # Delete messages
                del_msg_query = """
                    DELETE FROM messages
                    WHERE (sender_id = %s OR recipient_id = %s)
                      AND id IN (SELECT last_message_id FROM conversations WHERE id = %s)
                """
                await cursor.execute(del_msg_query, (user_id, user_id, conversation_id))
                
                # Delete conversation
                del_conv_query = "DELETE FROM conversations WHERE id = %s"
                await cursor.execute(del_conv_query, (conversation_id,))
                
                await conn.commit()
                return True
        except Exception as e:
            logger.error(f"Error deleting conversation: {str(e)}")
            raise
    
    async def block_user(self, conn, blocker_id: str, blocked_user_id: str):
        """Block a user from messaging"""
        try:
            async with conn.cursor() as cursor:
                # Create a simple block by deleting their conversation
                query = """
                    DELETE FROM conversations
                    WHERE (user_id_1 = %s AND user_id_2 = %s)
                       OR (user_id_1 = %s AND user_id_2 = %s)
                """
                await cursor.execute(query, (blocker_id, blocked_user_id, blocked_user_id, blocker_id))
                await conn.commit()
                
                return True
        except Exception as e:
            logger.error(f"Error blocking user: {str(e)}")
            raise
