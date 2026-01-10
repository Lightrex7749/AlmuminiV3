#!/usr/bin/env python3
"""Test quick login query directly"""

import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

conn = pymysql.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME'),
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

with conn.cursor() as cursor:
    roles = ["student", "recruiter", "alumni", "admin"]
    
    for role in roles:
        query = """
            SELECT u.id, u.email, u.role, 
                   CONCAT(COALESCE(up.first_name, ''), ' ', COALESCE(up.last_name, '')) as name,
                   up.headline, up.bio, up.company, up.job_title
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_skills us ON u.id = us.user_id
            WHERE u.role = %s
            GROUP BY u.id, u.email, u.role, up.first_name, up.last_name, up.headline, up.bio, up.company, up.job_title
            ORDER BY COUNT(us.skill_id) DESC
            LIMIT 1
        """
        cursor.execute(query, (role,))
        result = cursor.fetchone()
        
        if result:
            # Get skills separately
            skill_query = """
                SELECT s.name FROM skills s
                INNER JOIN user_skills us ON s.id = us.skill_id
                WHERE us.user_id = %s
                LIMIT 5
            """
            cursor.execute(skill_query, (result['id'],))
            skill_results = cursor.fetchall()
            skills = [s['name'] if isinstance(s, dict) else s[0] for s in skill_results] if skill_results else []
            
            print(f"\n✅ {role.upper()}:")
            print(f"   ID: {result['id']}")
            print(f"   Email: {result['email']}")
            print(f"   Name: {result['name']}")
            print(f"   Headline: {result['headline']}")
            print(f"   Skills: {', '.join(skills)}")
        else:
            print(f"\n❌ {role.upper()}: No user found")

conn.close()
