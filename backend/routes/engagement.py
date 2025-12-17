"""
Engagement Routes - Engagement scoring and leaderboard
Phase 8: Smart Algorithms
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import logging

from database.connection import get_db_pool
from database.models import (
    EngagementScoreResponse,
    LeaderboardResponse,
    ContributionHistoryResponse,
    BadgeResponse,
    UserBadgeResponse
)
from middleware.auth_middleware import get_current_user, require_role

router = APIRouter(prefix="/api/engagement", tags=["Engagement"])
logger = logging.getLogger(__name__)


@router.post(
    "/calculate",
    response_model=EngagementScoreResponse,
    summary="Calculate user engagement score"
)
async def calculate_engagement_score(
    current_user: dict = Depends(get_current_user)
):
    """
    Calculate or recalculate engagement score for the current user.
    """
    try:
        from services.engagement_service import engagement_service
        from services.mock_data_provider import get_mock_engagement_score
        
        user_id = current_user['id']
        
        pool = await get_db_pool()
        
        if pool is None:
            return get_mock_engagement_score(user_id)
            
        async with pool.acquire() as conn:
            score = await engagement_service.calculate_engagement_score(conn, user_id)
        
        return score
        
    except Exception as e:
        logger.error(f"Error calculating engagement score: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate engagement score"
        )


@router.get(
    "/my-score",
    response_model=EngagementScoreResponse,
    summary="Get current user's engagement score"
)
async def get_my_engagement_score(
    current_user: dict = Depends(get_current_user)
):
    """
    Get the engagement score for the currently logged-in user.
    """
    try:
        from services.engagement_service import engagement_service
        from database.connection import USE_MOCK_DB
        from services.mock_data_provider import get_mock_engagement_score
        
        user_id = current_user['id']
        
        if USE_MOCK_DB:
            score = get_mock_engagement_score(user_id)
            return score
        
        pool = await get_db_pool()
        
        if pool is None:
            return get_mock_engagement_score(user_id)
            
        async with pool.acquire() as conn:
            score = await engagement_service.get_user_score(conn, user_id)
        
        if not score:
            # Calculate score if not exists
            async with pool.acquire() as conn:
                score = await engagement_service.calculate_engagement_score(conn, user_id)
        
        return score
        
    except Exception as e:
        logger.error(f"Error getting engagement score: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get engagement score"
        )


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Get engagement leaderboard"
)
async def get_engagement_leaderboard(
    limit: int = Query(50, ge=1, le=100, description="Number of top users to retrieve"),
    role: Optional[str] = Query(None, description="Filter by user role (student, alumni, recruiter)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get the engagement leaderboard showing top contributors.
    """
    try:
        from services.engagement_service import engagement_service
        
        user_id = current_user['id']
        
        pool = await get_db_pool()
        
        if pool is None:
            # Return mock leaderboard matching LeaderboardResponse model
            return {
                "entries": [],
                "total_users": 0,
                "user_rank": 0
            }
            
        async with pool.acquire() as conn:
            leaderboard = await engagement_service.get_leaderboard(
                conn,
                limit=limit,
                current_user_id=user_id,
                role_filter=role
            )
        
        return leaderboard
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get leaderboard"
        )


@router.get(
    "/contribution-history",
    response_model=List[ContributionHistoryResponse],
    summary="Get contribution history"
)
async def get_contribution_history(
    limit: int = Query(50, ge=1, le=200, description="Number of contributions to retrieve"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get the contribution history for the current user.
    """
    try:
        from services.engagement_service import engagement_service
        
        user_id = current_user['id']
        
        pool = await get_db_pool()
        
        if pool is None:
            return []
            
        async with pool.acquire() as conn:
            history = await engagement_service.get_contribution_history(
                conn,
                user_id=user_id,
                limit=limit
            )
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting contribution history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get contribution history"
        )


@router.get(
    "/badges",
    response_model=List[BadgeResponse],
    summary="Get all available badges"
)
async def get_all_badges(
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of all available achievement badges in the system.
    """
    try:
        from services.engagement_service import engagement_service
        from datetime import datetime
        
        pool = await get_db_pool()
        
        if pool is None:
            # Return mock badges matching BadgeResponse model
            return [
                {
                    "id": "badge-1",
                    "name": "Early Adopter",
                    "description": "Joined in the early days",
                    "icon_url": "https://placehold.co/100x100/orange/white?text=EA",
                    "rarity": "rare",
                    "points": 50,
                    "created_at": datetime.now()
                },
                {
                    "id": "badge-2",
                    "name": "Profile Completed",
                    "description": "Completed your profile",
                    "icon_url": "https://placehold.co/100x100/blue/white?text=PC",
                    "rarity": "common",
                    "points": 20,
                    "created_at": datetime.now()
                }
            ]
            
        async with pool.acquire() as conn:
            badges = await engagement_service.get_all_badges(conn)
        
        return badges
        
    except Exception as e:
        logger.error(f"Error getting badges: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get badges"
        )


@router.get(
    "/my-badges",
    summary="Get user's earned badges"
)
async def get_my_badges(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all badges earned by the current user.
    """
    try:
        from services.engagement_service import engagement_service
        
        user_id = current_user['id']
        
        pool = await get_db_pool()
        
        if pool is None:
            return {
                'success': True,
                'data': []
            }
            
        async with pool.acquire() as conn:
            user_badges = await engagement_service.get_user_badges(conn, user_id)
        
        return {
            'success': True,
            'data': user_badges
        }
        
    except Exception as e:
        logger.error(f"Error getting user badges: {str(e)}")
        # Return empty badges array on error instead of 500
        return {
            'success': True,
            'data': []
        }


@router.post(
    "/check-badges",
    response_model=List[str],
    summary="Check and award new badges"
)
async def check_and_award_badges(
    current_user: dict = Depends(get_current_user)
):
    """
    Check if user qualifies for any new badges and award them.
    """
    try:
        from services.engagement_service import engagement_service
        
        user_id = current_user['id']
        
        pool = await get_db_pool()
        
        if pool is None:
            return []
            
        async with pool.acquire() as conn:
            newly_awarded = await engagement_service.check_and_award_badges(conn, user_id)
        
        return newly_awarded
        
    except Exception as e:
        logger.error(f"Error checking badges: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check badges"
        )


@router.get(
    "/insights/{user_id}",
    summary="Get user engagement insights"
)
async def get_user_engagement_insights(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed engagement insights for a user.
    """
    try:
        from services.engagement_service import engagement_service
        
        pool = await get_db_pool()
        
        if pool is None:
            from services.mock_data_provider import get_mock_engagement_score
            score = get_mock_engagement_score(user_id)
            return {
                "success": True,
                "data": {
                    "current_score": score,
                    "prediction": {"predicted_score": score.get("total_score", 0) * 1.1, "trend": "increasing"},
                    "recent_contributions": [],
                    "insights": {
                        "activity_pattern": "consistent",
                        "level": score.get('level', 'Beginner'),
                        "rank_position": score.get('rank_position', 1)
                    }
                }
            }
            
        async with pool.acquire() as conn:
            # Get current score and activity pattern
            score = await engagement_service.get_user_score(conn, user_id)
            
            if not score:
                # Calculate score if not exists (auto-initialize)
                score = await engagement_service.calculate_engagement_score(conn, user_id)
            
            # Get predictions
            prediction = await engagement_service.predict_future_engagement(conn, user_id)
            
            # Get contribution history
            history = await engagement_service.get_contribution_history(conn, user_id, limit=10)
            
            return {
                "success": True,
                "data": {
                    "current_score": score,
                    "prediction": prediction,
                    "recent_contributions": history,
                    "insights": {
                        "activity_pattern": score.get('activity_pattern', 'unknown'),
                        "level": score.get('level', 'Beginner'),
                        "rank_position": score.get('rank_position')
                    }
                }
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting engagement insights: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get engagement insights"
        )
