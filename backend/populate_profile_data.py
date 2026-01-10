#!/usr/bin/env python3
"""
Populate detailed profile data for the 6 users
"""
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Populating detailed profile data for users...\n")

try:
    import pymysql
    
    # Parse connection string
    url = DATABASE_URL.replace('mysql://', '')
    user_pass, host_db = url.split('@')
    user, password = user_pass.split(':')
    host_port, db = host_db.split('/')
    host, port = host_port.split(':')
    
    conn = pymysql.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=db,
        connect_timeout=10
    )
    
    cursor = conn.cursor()
    
    # Profile data for each user
    user_profiles = [
        {
            "email": "admin@alumni.edu",
            "first_name": "Admin",
            "last_name": "User",
            "headline": "Platform Administrator | System Manager",
            "bio": "Dedicated administrator managing the AlumUnity platform. Passionate about connecting alumni and fostering meaningful professional relationships.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            "location": "San Francisco, CA",
            "company": "AlumUnity",
            "job_title": "Platform Admin",
            "university": "Stanford University",
            "graduation_year": 2014
        },
        {
            "email": "sarah.johnson@alumni.edu",
            "first_name": "Sarah",
            "last_name": "Johnson",
            "headline": "VP Engineering @ Google | Career Mentor | Tech Leader",
            "bio": "VP of Engineering at Google with 15+ years of tech leadership experience. Passionate about mentoring early-career engineers and helping them navigate their careers in tech. Specializing in system design, team leadership, and building scalable solutions.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            "location": "Mountain View, CA",
            "company": "Google",
            "job_title": "VP of Engineering",
            "university": "MIT",
            "graduation_year": 2009
        },
        {
            "email": "emily.rodriguez@alumni.edu",
            "first_name": "Emily",
            "last_name": "Rodriguez",
            "headline": "Recent Graduate | Software Developer | Tech Enthusiast",
            "bio": "Recent computer science graduate excited to launch my career in software development. I'm actively learning full-stack development and looking for mentorship opportunities. Interested in building impactful products and growing with a great team.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
            "location": "Austin, TX",
            "company": "Tech Startup",
            "job_title": "Junior Software Developer",
            "university": "University of Texas at Austin",
            "graduation_year": 2025
        },
        {
            "email": "david.kim@techcorp.com",
            "first_name": "David",
            "last_name": "Kim",
            "headline": "Senior Recruiter @ TechCorp | Talent Acquisition Expert",
            "bio": "Senior recruiter at TechCorp with 8 years of experience in tech talent acquisition. Specializing in sourcing and placing top engineering talent. Always looking to connect with talented professionals and understand their career goals.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            "location": "San Jose, CA",
            "company": "TechCorp",
            "job_title": "Senior Recruiter",
            "university": "UC Berkeley",
            "graduation_year": 2016
        },
        {
            "email": "michael.chen@google.com",
            "first_name": "Michael",
            "last_name": "Chen",
            "headline": "Senior Software Engineer @ Google | Cloud Infrastructure",
            "bio": "Senior software engineer at Google focused on cloud infrastructure and distributed systems. 12 years in software development. Active in the alumni community and mentor to several junior engineers. Interested in discussing career paths in tech.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
            "location": "Mountain View, CA",
            "company": "Google",
            "job_title": "Senior Software Engineer",
            "university": "Carnegie Mellon University",
            "graduation_year": 2012
        },
        {
            "email": "priya.patel@apple.com",
            "first_name": "Priya",
            "last_name": "Patel",
            "headline": "Product Manager @ Apple | Innovation & Strategy",
            "bio": "Product manager at Apple with 10 years of experience in product development and strategy. Passionate about building innovative products that impact millions of users. Active alumni member committed to helping others succeed in tech.",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
            "location": "Cupertino, CA",
            "company": "Apple",
            "job_title": "Product Manager",
            "university": "Stanford University",
            "graduation_year": 2014
        }
    ]
    
    # Fetch user IDs and insert profiles
    for profile_data in user_profiles:
        email = profile_data["email"]
        
        # Get user ID
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
        
        if result:
            user_id = result[0]
            
            # Insert profile
            sql = """
            INSERT INTO user_profiles 
            (id, user_id, first_name, last_name, headline, bio, avatar_url, location, company, job_title, university, graduation_year)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            profile_id = str(uuid.uuid4())
            cursor.execute(sql, (
                profile_id,
                user_id,
                profile_data["first_name"],
                profile_data["last_name"],
                profile_data["headline"],
                profile_data["bio"],
                profile_data["avatar"],
                profile_data["location"],
                profile_data["company"],
                profile_data["job_title"],
                profile_data["university"],
                profile_data["graduation_year"]
            ))
            
            print(f"✅ {profile_data['first_name']} {profile_data['last_name']}")
            print(f"   {profile_data['headline']}")
            print()
    
    conn.commit()
    
    # Add skills for each user
    print("\n" + "=" * 70)
    print("Adding Skills")
    print("=" * 70 + "\n")
    
    user_skills = {
        "admin@alumni.edu": ["Leadership", "System Administration", "Database Management", "Security"],
        "sarah.johnson@alumni.edu": ["System Design", "Team Leadership", "Cloud Architecture", "Backend Development", "Mentoring"],
        "emily.rodriguez@alumni.edu": ["Python", "JavaScript", "React", "SQL", "Git"],
        "david.kim@techcorp.com": ["Talent Acquisition", "Recruiting", "Networking", "LinkedIn", "Interview Skills"],
        "michael.chen@google.com": ["Go", "Python", "Kubernetes", "Distributed Systems", "Cloud Infrastructure"],
        "priya.patel@apple.com": ["Product Strategy", "UX Design", "Market Analysis", "Agile", "Data Analysis"]
    }
    
    for email, skills in user_skills.items():
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        user_result = cursor.fetchone()
        
        if user_result:
            user_id = user_result[0]
            
            for skill_name in skills:
                # Insert or get skill
                cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
                skill_result = cursor.fetchone()
                
                if not skill_result:
                    skill_id = str(uuid.uuid4())
                    cursor.execute(
                        "INSERT INTO skills (id, name, category) VALUES (%s, %s, %s)",
                        (skill_id, skill_name, "Technical")
                    )
                else:
                    skill_id = skill_result[0]
                
                # Link user to skill
                user_skill_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO user_skills (id, user_id, skill_id, proficiency_level) VALUES (%s, %s, %s, %s)",
                    (user_skill_id, user_id, skill_id, "Intermediate")
                )
            
            print(f"✅ {email}: {', '.join(skills)}")
    
    conn.commit()
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    
    cursor.execute("SELECT COUNT(*) FROM user_profiles")
    profiles_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM skills")
    skills_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_skills")
    user_skills_count = cursor.fetchone()[0]
    
    print(f"✅ User Profiles Created: {profiles_count}")
    print(f"✅ Skills Added: {skills_count}")
    print(f"✅ User-Skill Links: {user_skills_count}")
    print(f"\n📊 All 6 users now have complete profile data!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
