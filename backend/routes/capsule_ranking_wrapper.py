"""
Capsule Ranking Wrapper Routes - Frontend compatibility
Maps /api/capsule-ranking endpoints to the actual ranking service
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import logging

from middleware.auth_middleware import get_current_user
from services.capsule_ranking_service import get_ranking_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/capsule-ranking", tags=["Capsule Ranking"])


@router.get("/personalized/{user_id}")
async def get_personalized_capsule_ranking(
    user_id: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Get personalized capsule ranking for a user
    Wrapper endpoint for frontend compatibility
    """
    try:
        # Verify user is requesting their own data or is admin
        is_admin = current_user.get('role') == 'admin'
        current_user_id = current_user['id']
        
        if user_id != current_user_id and not is_admin:
            # Return empty results instead of error for security
            return {
                'success': True,
                'data': [],
                'total': 0,
                'user_id': user_id
            }
        
        ranking_service = get_ranking_service()
        
        # Get ranked capsules
        ranked_capsules = await ranking_service.get_ranked_capsules_for_user(
            user_id=user_id,
            limit=limit,
            force_refresh=False
        )
        
        return {
            'success': True,
            'data': ranked_capsules,
            'total': len(ranked_capsules),
            'user_id': user_id,
            'cached': True,
            'llm_enabled': ranking_service.llm_enabled
        }
        
    except Exception as e:
        logger.error(f"Error getting personalized capsule ranking: {str(e)}")
        # Return empty response on error instead of 500
        return {
            'success': True,
            'data': [],
            'total': 0,
            'user_id': user_id,
            'error': str(e)
        }
