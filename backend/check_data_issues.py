#!/usr/bin/env python3
"""Check database data for mentorship, jobs, and skill graphs"""

import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'trolley.proxy.rlwy.net')
DB_PORT = int(os.getenv('DB_PORT', 29610))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'railway')

def check_data():
    """Check mentorship, job, and skill data"""
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with conn.cursor() as cursor:
            # Check mentors
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role IN ('mentor', 'alumni')")
            result = cursor.fetchone()
            print(f"✅ Total mentors/alumni: {result['count']}")
            
            # Check jobs
            cursor.execute("SELECT COUNT(*) as count FROM jobs")
            result = cursor.fetchone()
            print(f"✅ Total jobs: {result['count']}")
            
            # Check job applications
            cursor.execute("SELECT COUNT(*) as count FROM job_applications")
            result = cursor.fetchone()
            print(f"✅ Total job applications: {result['count']}")
            
            # Check skill graph
            cursor.execute("SELECT COUNT(*) as count FROM skill_graph")
            result = cursor.fetchone()
            print(f"✅ Total skill graph records: {result['count']}")
            
            # Check skill nodes
            cursor.execute("SELECT COUNT(*) as count FROM skills")
            result = cursor.fetchone()
            print(f"✅ Total skills: {result['count']}")
            
            # Check user_skills
            cursor.execute("SELECT COUNT(*) as count FROM user_skills")
            result = cursor.fetchone()
            print(f"✅ Total user-skill associations: {result['count']}")
            
            # Check users by role
            cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
            results = cursor.fetchall()
            print(f"\n📊 Users by role:")
            for row in results:
                print(f"   {row['role']}: {row['count']}")
            
            # Show sample jobs
            print(f"\n📋 Sample jobs:")
            cursor.execute("SELECT id, title, company, salary_range FROM jobs LIMIT 3")
            results = cursor.fetchall()
            for row in results:
                print(f"   - {row['title']} @ {row['company']} ({row['salary_range']})")
            
            # Show users with most skills
            print(f"\n🎯 Users with most skills:")
            cursor.execute("""
                SELECT u.id, u.email, COUNT(us.skill_id) as skill_count
                FROM users u
                LEFT JOIN user_skills us ON u.id = us.user_id
                GROUP BY u.id, u.email
                ORDER BY skill_count DESC
                LIMIT 5
            """)
            results = cursor.fetchall()
            for row in results:
                print(f"   - {row['email']}: {row['skill_count']} skills")
        
        conn.close()
        print(f"\n✅ Database check complete")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    check_data()
