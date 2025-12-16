#!/usr/bin/env python3
"""
Insert sample mentor profiles into the database
Uses the backend's database connection configuration
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pathlib import Path
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

# Import after loading .env
import aiomysql
from database.connection import get_db_pool
import uuid
import json

async def add_mentor_profiles():
    """Add sample mentor profiles to the database"""
    
    sample_mentors = [
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440001',
            'expertise_areas': ['Software Development', 'Python', 'Web Development'],
            'max_mentees': 5,
            'current_mentees_count': 2,
            'rating': 4.8,
            'total_sessions': 45,
            'is_available': True,
            'mentorship_approach': 'Passionate about helping junior developers grow their careers. Specialized in Python and Web Development.'
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440002',
            'expertise_areas': ['Product Management', 'Career Transition', 'Leadership'],
            'max_mentees': 4,
            'current_mentees_count': 1,
            'rating': 4.9,
            'total_sessions': 32,
            'is_available': True,
            'mentorship_approach': 'Help aspiring PMs break into product management with practical guidance and career coaching.'
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440003',
            'expertise_areas': ['Data Science', 'Machine Learning', 'Python', 'SQL'],
            'max_mentees': 3,
            'current_mentees_count': 0,
            'rating': 4.7,
            'total_sessions': 28,
            'is_available': True,
            'mentorship_approach': 'Expert in machine learning and data analysis. Help you build strong foundations in ML and Python.'
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440004',
            'expertise_areas': ['UX Design', 'UI Design', 'User Research', 'Figma'],
            'max_mentees': 4,
            'current_mentees_count': 2,
            'rating': 4.6,
            'total_sessions': 38,
            'is_available': True,
            'mentorship_approach': 'Specializing in user-centered design and UX research. Guide you through design thinking and prototyping.'
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440005',
            'expertise_areas': ['AWS', 'DevOps', 'Cloud Architecture', 'Docker'],
            'max_mentees': 5,
            'current_mentees_count': 3,
            'rating': 4.9,
            'total_sessions': 52,
            'is_available': True,
            'mentorship_approach': 'AWS and cloud infrastructure expert. Help you master DevOps practices and cloud architecture.'
        },
    ]
    
    try:
        print("✅ Connecting to Railway MySQL Database...")
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                print("Adding mentor profiles...")
                
                for mentor in sample_mentors:
                    mentor_id = str(uuid.uuid4())
                    expertise_json = json.dumps(mentor['expertise_areas'])
                    
                    sql = """
                    INSERT INTO mentor_profiles 
                    (id, user_id, expertise_areas, max_mentees, current_mentees_count, 
                     rating, total_sessions, is_available, mentorship_approach, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """
                    
                    values = (
                        mentor_id,
                        mentor['user_id'],
                        expertise_json,
                        mentor['max_mentees'],
                        mentor['current_mentees_count'],
                        mentor['rating'],
                        mentor['total_sessions'],
                        1 if mentor['is_available'] else 0,
                        mentor['mentorship_approach']
                    )
                    
                    await cursor.execute(sql, values)
                    print(f"  ✅ Added mentor for user: {mentor['user_id']}")
                
                await conn.commit()
                print("\n✅ All mentor profiles added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(add_mentor_profiles())
