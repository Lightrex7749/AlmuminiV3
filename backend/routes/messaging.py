"""
Messaging Routes
Provides endpoints for user-to-user messaging with read receipts, typing indicators, and presence
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Form
from typing import Optional
from datetime import datetime
import logging
import json
import os

from middleware.auth_middleware import get_current_user
from database.connection import get_db_pool, USE_MOCK_DB
from services.messaging_service import MessagingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/messages", tags=["Messaging"])
messaging_service = MessagingService()


@router.post("/send")
async def send_message(
    recipient_id: str = Form(...),
    message_text: str = Form(...),
    attachment_url: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message to another user
    """
    sender_id = current_user.get("id")
    
    if not message_text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if USE_MOCK_DB:
        # Mock response
        return {
            "success": True,
            "data": {
                "id": f"msg_{datetime.now().timestamp()}",
                "sender_id": sender_id,
                "recipient_id": recipient_id,
                "message": message_text,
                "sent_at": datetime.now().isoformat(),
                "read": False,
                "attachment_url": attachment_url
            },
            "message": "Message sent successfully (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            result = await messaging_service.send_message(
                conn, sender_id, recipient_id, message_text, attachment_url
            )
            return {
                "success": True,
                "data": result,
                "message": "Message sent successfully"
            }
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


@router.get("/inbox")
async def get_inbox(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all conversations for current user with last message preview
    """
    user_id = current_user.get("id")
    
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": [
                {
                    "conversation_id": "conv_1",
                    "other_user_id": "660e8400-e29b-41d4-a716-446655440001",
                    "other_user_name": "Sarah Johnson",
                    "photo_url": None,
                    "last_message": "Thanks for connecting!",
                    "last_message_at": "2024-12-27T10:00:00Z",
                    "unread_count": 0,
                    "last_message_from_me": False
                }
            ],
            "total": 1,
            "message": "Conversations retrieved (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            conversations = await messaging_service.get_conversations_list(
                conn, user_id, limit, offset
            )
            
            return {
                "success": True,
                "data": conversations,
                "total": len(conversations),
                "message": "Conversations retrieved successfully"
            }
    except Exception as e:
        logger.error(f"Error retrieving inbox: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve messages: {str(e)}")


@router.get("/conversation/{user_id}")
async def get_conversation(
    user_id: str,
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation history with a specific user
    """
    current_user_id = current_user.get("id")
    
    if USE_MOCK_DB:
        # Return mock conversation
        return {
            "success": True,
            "data": [
                {
                    "id": f"msg_1",
                    "sender_id": user_id,
                    "message": "Hello! How are you?",
                    "sent_at": "2024-12-27T10:00:00Z",
                    "read": True
                },
                {
                    "id": f"msg_2",
                    "sender_id": current_user_id,
                    "message": "Great! Thanks for reaching out.",
                    "sent_at": "2024-12-27T10:15:00Z",
                    "read": True
                }
            ],
            "message": "Conversation retrieved (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Get conversation between two users
                query = """
                    SELECT id, sender_id, message_text as message, sent_at, read
                    FROM messages
                    WHERE (sender_id = %s AND recipient_id = %s)
                       OR (sender_id = %s AND recipient_id = %s)
                    ORDER BY sent_at DESC
                    LIMIT %s
                """
                await cursor.execute(query, (current_user_id, user_id, user_id, current_user_id, limit))
                messages = await cursor.fetchall()
                
                return {
                    "success": True,
                    "data": list(reversed(messages)),
                    "message": "Conversation retrieved successfully"
                }
    
    except Exception as e:
        logger.error(f"Error retrieving conversation: {str(e)}")
        # Return empty data instead of raising 500 if database query fails (e.g., table missing)
        return {
            "success": True,
            "data": [],
            "message": f"Failed to retrieve conversation: {str(e)}. Returning empty data."
        }


@router.put("/mark-as-read/{message_id}")
async def mark_as_read(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a message as read
    """
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": {"id": message_id, "read": True},
            "message": "Message marked as read (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                query = "UPDATE messages SET read = TRUE WHERE id = %s"
                await cursor.execute(query, (message_id,))
                await conn.commit()
                
                return {
                    "success": True,
                    "data": {"id": message_id, "read": True},
                    "message": "Message marked as read"
                }
    
    except Exception as e:
        logger.error(f"Error marking message as read: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark message as read: {str(e)}"
        )


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """
    Get total unread messages for current user
    """
    user_id = current_user.get("id")
    
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": {"unread_count": 0},
            "message": "Unread count retrieved (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            count = await messaging_service.get_unread_count(conn, user_id)
            
            return {
                "success": True,
                "data": {"unread_count": count},
                "message": "Unread count retrieved successfully"
            }
    except Exception as e:
        logger.error(f"Error getting unread count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get unread count: {str(e)}")


@router.get("/search")
async def search_messages(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Search messages in user's conversations
    """
    user_id = current_user.get("id")
    
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": [],
            "message": "Search completed (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            messages = await messaging_service.search_messages(
                conn, user_id, query, limit
            )
            
            return {
                "success": True,
                "data": messages,
                "message": "Search completed successfully"
            }
    except Exception as e:
        logger.error(f"Error searching messages: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search messages: {str(e)}")


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a conversation
    """
    user_id = current_user.get("id")
    
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": {"id": conversation_id},
            "message": "Conversation deleted (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            await messaging_service.delete_conversation(conn, conversation_id, user_id)
            
            return {
                "success": True,
                "data": {"id": conversation_id},
                "message": "Conversation deleted successfully"
            }
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")


@router.post("/block-user")
async def block_user(
    blocked_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Block a user from messaging
    """
    blocker_id = current_user.get("id")
    
    if USE_MOCK_DB:
        return {
            "success": True,
            "data": {"blocked_user_id": blocked_user_id},
            "message": "User blocked (mock mode)"
        }
    
    try:
        pool = await get_db_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database unavailable")
        
        async with pool.acquire() as conn:
            await messaging_service.block_user(conn, blocker_id, blocked_user_id)
            
            return {
                "success": True,
                "data": {"blocked_user_id": blocked_user_id},
                "message": "User blocked successfully"
            }
    except Exception as e:
        logger.error(f"Error blocking user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to block user: {str(e)}")
