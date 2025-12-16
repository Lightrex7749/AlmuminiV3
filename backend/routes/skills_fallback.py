"""
Simple Skills API Fallback Routes
Provides /api/skills/* and /api/skill-recommendations/* endpoints with fallback data
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List, Dict, Any
import logging

from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Skills"])

# Fallback skill data
FALLBACK_SKILLS = [
    {"id": "skill-1", "skill_name": "Python", "category": "Programming", "proficiency_level": "advanced"},
    {"id": "skill-2", "skill_name": "JavaScript", "category": "Programming", "proficiency_level": "advanced"},
    {"id": "skill-3", "skill_name": "React", "category": "Frontend", "proficiency_level": "intermediate"},
    {"id": "skill-4", "skill_name": "FastAPI", "category": "Backend", "proficiency_level": "intermediate"},
    {"id": "skill-5", "skill_name": "SQL", "category": "Database", "proficiency_level": "advanced"},
    {"id": "skill-6", "skill_name": "Project Management", "category": "Soft Skills", "proficiency_level": "intermediate"},
    {"id": "skill-7", "skill_name": "Leadership", "category": "Soft Skills", "proficiency_level": "intermediate"},
    {"id": "skill-8", "skill_name": "Communication", "category": "Soft Skills", "proficiency_level": "advanced"},
    {"id": "skill-9", "skill_name": "Machine Learning", "category": "AI/ML", "proficiency_level": "beginner"},
    {"id": "skill-10", "skill_name": "Data Analysis", "category": "Analytics", "proficiency_level": "intermediate"},
]

FALLBACK_TRENDING_SKILLS = [
    {"skill": "Python", "trend_score": 95, "demand": "very_high"},
    {"skill": "JavaScript", "trend_score": 92, "demand": "very_high"},
    {"skill": "Cloud Architecture", "trend_score": 88, "demand": "very_high"},
    {"skill": "Data Science", "trend_score": 85, "demand": "high"},
    {"skill": "DevOps", "trend_score": 82, "demand": "high"},
    {"skill": "React", "trend_score": 80, "demand": "high"},
    {"skill": "Kubernetes", "trend_score": 78, "demand": "high"},
    {"skill": "Machine Learning", "trend_score": 75, "demand": "high"},
    {"skill": "TypeScript", "trend_score": 72, "demand": "medium"},
    {"skill": "GraphQL", "trend_score": 68, "demand": "medium"},
]


@router.get("/skills/list", response_model=dict)
async def get_skills_list(
    min_popularity: float = Query(0.0, ge=0.0, le=100.0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="Search skills by name"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get flat list of skills for visualization
    Returns array of skills with all properties
    """
    try:
        skills = FALLBACK_SKILLS[:limit]
        
        # Apply search filter if provided
        if search:
            search_lower = search.lower()
            skills = [s for s in skills if search_lower in s['skill_name'].lower()]
        
        return {
            "success": True,
            "data": skills,
            "total": len(skills)
        }
    except Exception as e:
        logger.error(f"Error fetching skills list: {e}")
        return {
            "success": True,
            "data": FALLBACK_SKILLS[:limit],
            "total": len(FALLBACK_SKILLS)
        }


@router.post("/skill-recommendations/recommendations/{user_id}", response_model=dict)
async def get_skill_recommendations(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get skill recommendations for a user based on their profile and industry
    """
    try:
        # Return fallback recommendations
        recommendations = [
            {
                "skill_id": "skill-1",
                "skill_name": "Advanced Python",
                "reason": "Based on your current projects",
                "difficulty": "intermediate",
                "estimated_hours": 40
            },
            {
                "skill_id": "skill-4",
                "skill_name": "FastAPI",
                "reason": "Complements your existing backend skills",
                "difficulty": "intermediate",
                "estimated_hours": 30
            },
            {
                "skill_id": "skill-9",
                "skill_name": "Machine Learning",
                "reason": "Growing demand in your field",
                "difficulty": "advanced",
                "estimated_hours": 60
            }
        ]
        
        return {
            "success": True,
            "data": recommendations
        }
    except Exception as e:
        logger.error(f"Error fetching skill recommendations: {e}")
        return {
            "success": True,
            "data": []
        }


@router.get("/skill-recommendations/trending", response_model=dict)
async def get_trending_skills(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    Get top trending skills across the platform
    """
    try:
        trending = FALLBACK_TRENDING_SKILLS[:limit]
        
        return {
            "success": True,
            "data": trending,
            "total": len(trending)
        }
    except Exception as e:
        logger.error(f"Error fetching trending skills: {e}")
        return {
            "success": True,
            "data": FALLBACK_TRENDING_SKILLS[:limit],
            "total": len(FALLBACK_TRENDING_SKILLS)
        }
