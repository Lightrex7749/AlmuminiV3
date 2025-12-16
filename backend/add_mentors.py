#!/usr/bin/env python3
"""
Get actual user IDs from the database and add mentors for them
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

async def add_mentors_for_existing_users():
    """Add mentor profiles for actual users in the database"""
    
    try:
        print("✅ Connecting to Railway MySQL Database...")
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Get existing users (limit to users that could be mentors)
                print("\n📋 Fetching existing users...")
                await cursor.execute("SELECT id, email FROM users LIMIT 10")
                users = await cursor.fetchall()
                
                if not users:
                    print("❌ No users found in database!")
                    return
                
                print(f"\n✅ Found {len(users)} users:")
                for user in users:
                    print(f"  - {user['email']}: {user['id']}")
                
                # Define mentor profiles for the first 5 users
                mentor_templates = [
                    {
                        'expertise_areas': ['Software Development', 'Python', 'Web Development'],
                        'max_mentees': 5,
                        'current_mentees_count': 2,
                        'rating': 4.8,
                        'total_sessions': 45,
                        'mentorship_approach': 'Senior developer passionate about helping junior developers grow their careers.'
                    },
                    {
                        'expertise_areas': ['Product Management', 'Career Transition', 'Leadership'],
                        'max_mentees': 4,
                        'current_mentees_count': 1,
                        'rating': 4.9,
                        'total_sessions': 32,
                        'mentorship_approach': 'Help aspiring PMs break into product management with practical guidance.'
                    },
                    {
                        'expertise_areas': ['Data Science', 'Machine Learning', 'Python', 'SQL'],
                        'max_mentees': 3,
                        'current_mentees_count': 0,
                        'rating': 4.7,
                        'total_sessions': 28,
                        'mentorship_approach': 'Expert in machine learning and data analysis.'
                    },
                    {
                        'expertise_areas': ['UX Design', 'UI Design', 'User Research', 'Figma'],
                        'max_mentees': 4,
                        'current_mentees_count': 2,
                        'rating': 4.6,
                        'total_sessions': 38,
                        'mentorship_approach': 'Specializing in user-centered design and UX research.'
                    },
                    {
                        'expertise_areas': ['AWS', 'DevOps', 'Cloud Architecture', 'Docker'],
                        'max_mentees': 5,
                        'current_mentees_count': 3,
                        'rating': 4.9,
                        'total_sessions': 52,
                        'mentorship_approach': 'AWS and cloud infrastructure expert.'
                    },
                ]
                
                print("\n📝 Adding mentor profiles...")
                for i, user in enumerate(users[:5]):
                    if i >= len(mentor_templates):
                        break
                    
                    mentor = mentor_templates[i]
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
                        user['id'],
                        expertise_json,
                        mentor['max_mentees'],
                        mentor['current_mentees_count'],
                        mentor['rating'],
                        mentor['total_sessions'],
                        1,  # is_available = true
                        mentor['mentorship_approach']
                    )
                    
                    try:
                        await cursor.execute(sql, values)
                        print(f"  ✅ Added mentor for {user['email']}")
                    except Exception as e:
                        print(f"  ❌ Failed for {user['email']}: {e}")
                
                await conn.commit()
                print("\n✅ All mentor profiles added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(add_mentors_for_existing_users())
