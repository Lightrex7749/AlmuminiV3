"""Mock data provider for development mode"""
import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Cache for mock data
_mock_data_cache: Optional[Dict[str, Any]] = None


def load_mock_data() -> Dict[str, Any]:
    """Load mock data from mockdata.json"""
    global _mock_data_cache
    
    if _mock_data_cache is not None:
        return _mock_data_cache
    
    try:
        # Try to load from project root
        mock_file = Path(__file__).parent.parent.parent / 'mockdata.json'
        
        if not mock_file.exists():
            logger.warning(f"Mock data file not found at {mock_file}")
            return {}
        
        with open(mock_file, 'r') as f:
            _mock_data_cache = json.load(f)
        
        logger.info(f"✅ Loaded mock data from {mock_file}")
        return _mock_data_cache
    except Exception as e:
        logger.error(f"❌ Error loading mock data: {e}")
        return {}


def get_mock_profile_by_user_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get mock profile by user ID"""
    mock_data = load_mock_data()
    profiles = mock_data.get('alumni_profiles', [])
    
    for profile in profiles:
        if profile.get('user_id') == user_id:
            return profile
    
    return None


def get_mock_applications_by_user(user_id: str) -> List[Dict[str, Any]]:
    """Get mock job applications by user"""
    mock_data = load_mock_data()
    applications = mock_data.get('job_applications', [])
    
    return [app for app in applications if app.get('applicant_id') == user_id]


def get_mock_mentorship_requests_by_student(student_id: str) -> List[Dict[str, Any]]:
    """Get mock mentorship requests by student"""
    mock_data = load_mock_data()
    requests = mock_data.get('mentorship_requests', [])
    
    return [req for req in requests if req.get('student_id') == student_id]


def get_mock_engagement_score(user_id: str) -> Optional[Dict[str, Any]]:
    """Get mock engagement score for user"""
    mock_data = load_mock_data()
    scores = mock_data.get('engagement_scores', [])
    
    for score in scores:
        if score.get('user_id') == user_id:
            return score
    
    # Return default if not found
    return {
        'user_id': user_id,
        'current_score': 0,
        'current_rank': None,
        'total_users_ranked': 10,
        'percentile_rank': 50,
        'score_change_7days': 0,
        'score_change_30days': 0,
        'recent_contributions': [],
        'next_milestone': 100,
        'next_milestone_points_needed': 100,
        'badges_earned': [],
        'updated_at': '2024-12-16T00:00:00Z'
    }


def get_mock_profile_directory(page: int = 1, limit: int = 20) -> Dict[str, Any]:
    """Get mock alumni directory"""
    mock_data = load_mock_data()
    profiles = mock_data.get('alumni_profiles', [])
    
    # Calculate pagination
    start = (page - 1) * limit
    end = start + limit
    paginated = profiles[start:end]
    
    return {
        'profiles': paginated,
        'total': len(profiles),
        'page': page,
        'limit': limit,
        'total_pages': (len(profiles) + limit - 1) // limit
    }


def get_mock_mentorship_requests_by_mentor(mentor_id: str) -> List[Dict[str, Any]]:
    """Get mock mentorship requests by mentor"""
    mock_data = load_mock_data()
    requests = mock_data.get('mentorship_requests', [])
    
    return [req for req in requests if req.get('mentor_id') == mentor_id]


def get_mock_leaderboard_data() -> List[Dict[str, Any]]:
    """Get mock engagement leaderboard data"""
    mock_data = load_mock_data()
    
    # Try to get from mock data first
    leaderboard = mock_data.get('engagement_leaderboard', [])
    if leaderboard:
        return leaderboard
    
    # Fallback: Generate from engagement scores
    scores = mock_data.get('engagement_scores', [])
    profiles = {p.get('user_id'): p for p in mock_data.get('alumni_profiles', [])}
    
    leaderboard_data = []
    for score in scores:
        user_id = score.get('user_id')
        profile = profiles.get(user_id, {})
        
        leaderboard_data.append({
            'user_id': user_id,
            'name': profile.get('name', 'Anonymous'),
            'photo_url': profile.get('photo_url', ''),
            'role': score.get('role', 'student'),
            'total_score': score.get('current_score', 0),
            'rank_position': len(leaderboard_data) + 1,
            'rank': len(leaderboard_data) + 1,
            'level': 'Beginner',
            'contributions': {},
            'badges': [],
            'trend': 0
        })
    
    # Sort by score descending
    leaderboard_data.sort(key=lambda x: x['total_score'], reverse=True)
    
    # Update ranks
    for idx, entry in enumerate(leaderboard_data):
        entry['rank_position'] = idx + 1
        entry['rank'] = idx + 1
    
    return leaderboard_data
