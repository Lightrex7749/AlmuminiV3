#!/usr/bin/env python3
"""
Add extensive data to Railway MySQL database - comprehensive dataset
"""
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import random

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Adding extensive data to Railway MySQL database...\n")

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
    
    # Get existing users
    cursor.execute("SELECT id, email, role FROM users")
    existing_users = cursor.fetchall()
    user_dict = {email: (user_id, role) for user_id, email, role in existing_users}
    
    print("=" * 70)
    print("ADDING MORE USERS & PROFILES")
    print("=" * 70 + "\n")
    
    new_users = [
        {
            "email": "james.wilson@alumni.edu",
            "password_hash": "password123",
            "role": "student",
            "first_name": "James",
            "last_name": "Wilson",
            "headline": "Computer Science Student | Full-Stack Developer",
            "bio": "Senior CS student passionate about web development and open source contributions. Looking for internship opportunities.",
            "company": "University of Tech",
            "job_title": "Student Developer",
            "university": "University of Tech",
            "graduation_year": 2026,
            "location": "Los Angeles, CA"
        },
        {
            "email": "maria.garcia@alumni.edu",
            "password_hash": "password123",
            "role": "student",
            "first_name": "Maria",
            "last_name": "Garcia",
            "headline": "Data Science Enthusiast | Machine Learning Student",
            "bio": "Data science student with interests in ML, AI, and business analytics. Working on several projects.",
            "company": "Data Science Bootcamp",
            "job_title": "Student",
            "university": "UC Davis",
            "graduation_year": 2026,
            "location": "Sacramento, CA"
        },
        {
            "email": "robert.taylor@startupventures.com",
            "password_hash": "password123",
            "role": "recruiter",
            "first_name": "Robert",
            "last_name": "Taylor",
            "headline": "Tech Recruiter | Startup Ventures Founder",
            "bio": "Founder and tech recruiter focused on connecting top talent with innovative startups.",
            "company": "Startup Ventures",
            "job_title": "Founder & Recruiter",
            "university": "Tech University",
            "graduation_year": 2017,
            "location": "Austin, TX"
        },
        {
            "email": "jessica.lee@microsoft.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Jessica",
            "last_name": "Lee",
            "headline": "Senior Product Manager @ Microsoft | Former Amazon",
            "bio": "Product manager with 8 years of experience building consumer and enterprise products at Microsoft and Amazon.",
            "company": "Microsoft",
            "job_title": "Senior Product Manager",
            "university": "Stanford University",
            "graduation_year": 2016,
            "location": "Seattle, WA"
        },
        {
            "email": "alex.kumar@apple.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Alex",
            "last_name": "Kumar",
            "headline": "Software Engineer @ Apple | Swift Specialist",
            "bio": "iOS engineer with passion for building beautiful, performant applications. Active open source contributor.",
            "company": "Apple",
            "job_title": "Senior Software Engineer",
            "university": "IIT Delhi",
            "graduation_year": 2015,
            "location": "Cupertino, CA"
        },
        {
            "email": "sophia.martinez@netflix.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Sophia",
            "last_name": "Martinez",
            "headline": "Data Scientist @ Netflix | Recommendation Systems",
            "bio": "Data scientist working on recommendation algorithms and personalization at Netflix. Published researcher.",
            "company": "Netflix",
            "job_title": "Senior Data Scientist",
            "university": "UC Berkeley",
            "graduation_year": 2017,
            "location": "Los Gatos, CA"
        },
        {
            "email": "daniel.wong@meta.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Daniel",
            "last_name": "Wong",
            "headline": "Software Engineer @ Meta | React Core Team",
            "bio": "Backend engineer at Meta contributing to core infrastructure and API services.",
            "company": "Meta",
            "job_title": "Software Engineer",
            "university": "MIT",
            "graduation_year": 2018,
            "location": "Menlo Park, CA"
        },
        {
            "email": "rachel.johnson@stripe.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Rachel",
            "last_name": "Johnson",
            "headline": "Engineering Manager @ Stripe | Payment Systems",
            "bio": "Engineering leader at Stripe managing a team of 8 engineers building payment infrastructure.",
            "company": "Stripe",
            "job_title": "Engineering Manager",
            "university": "Carnegie Mellon University",
            "graduation_year": 2016,
            "location": "San Francisco, CA"
        },
        {
            "email": "christopher.brown@uber.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Christopher",
            "last_name": "Brown",
            "headline": "Technical Program Manager @ Uber",
            "bio": "TPM focused on cross-functional projects connecting backend services and mobile platforms.",
            "company": "Uber",
            "job_title": "Technical Program Manager",
            "university": "University of Washington",
            "graduation_year": 2017,
            "location": "San Francisco, CA"
        },
        {
            "email": "nicole.anderson@adobe.com",
            "password_hash": "password123",
            "role": "alumni",
            "first_name": "Nicole",
            "last_name": "Anderson",
            "headline": "UX Designer @ Adobe | Design Systems Lead",
            "bio": "Design leader at Adobe building design systems and tools for millions of creators.",
            "company": "Adobe",
            "job_title": "Senior UX Designer",
            "university": "RISD",
            "graduation_year": 2015,
            "location": "San Jose, CA"
        }
    ]
    
    new_user_dict = {}
    for user in new_users:
        user_id = str(uuid.uuid4())
        email = user["email"]
        
        # Insert user
        sql = """
        INSERT INTO users (id, email, password_hash, role, is_verified, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, 1, 1, NOW(), NOW())
        """
        cursor.execute(sql, (user_id, email, user["password_hash"], user["role"]))
        
        # Insert profile
        profile_id = str(uuid.uuid4())
        sql = """
        INSERT INTO user_profiles 
        (id, user_id, first_name, last_name, headline, bio, avatar_url, location, company, job_title, university, graduation_year, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(sql, (
            profile_id, user_id, user["first_name"], user["last_name"],
            user["headline"], user["bio"],
            f"https://api.dicebear.com/7.x/avataaars/svg?seed={user['first_name']}",
            user["location"], user["company"], user["job_title"],
            user["university"], user["graduation_year"]
        ))
        
        new_user_dict[email] = (user_id, user["role"])
        print(f"✅ {user['first_name']} {user['last_name']} ({user['role']})")
    
    user_dict.update(new_user_dict)
    conn.commit()
    print(f"\n✅ Added {len(new_users)} new users\n")
    
    # Add more jobs
    print("=" * 70)
    print("ADDING MORE JOBS")
    print("=" * 70 + "\n")
    
    more_jobs = [
        {
            "title": "Backend Engineer (Python)",
            "description": "Build scalable backend services using Python and FastAPI. Work with distributed systems and microservices.",
            "company": "Tech Startup XYZ",
            "location": "Remote",
            "job_type": "full-time",
            "experience_level": "3+ years",
            "salary_min": 130000,
            "salary_max": 160000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "iOS Developer",
            "description": "Develop iOS applications using Swift. Focus on creating intuitive mobile experiences.",
            "company": "Mobile First Inc",
            "location": "San Francisco, CA",
            "job_type": "full-time",
            "experience_level": "4+ years",
            "salary_min": 140000,
            "salary_max": 170000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Data Analyst",
            "description": "Analyze business data and create insights for decision making. Work with SQL, Python, and BI tools.",
            "company": "Analytics Pro",
            "location": "New York, NY",
            "job_type": "full-time",
            "experience_level": "2+ years",
            "salary_min": 90000,
            "salary_max": 120000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "QA Automation Engineer",
            "description": "Write automated tests for web and mobile applications. Improve testing frameworks and infrastructure.",
            "company": "Quality Labs",
            "location": "Austin, TX",
            "job_type": "full-time",
            "experience_level": "2+ years",
            "salary_min": 95000,
            "salary_max": 125000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Security Engineer",
            "description": "Work on security infrastructure and vulnerability management. Help protect our systems and users.",
            "company": "SecureIT",
            "location": "Remote",
            "job_type": "full-time",
            "experience_level": "5+ years",
            "salary_min": 150000,
            "salary_max": 190000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "UX/UI Designer",
            "description": "Design intuitive interfaces for web and mobile applications. Collaborate with product and engineering teams.",
            "company": "Design Studio",
            "location": "Remote",
            "job_type": "full-time",
            "experience_level": "3+ years",
            "salary_min": 100000,
            "salary_max": 140000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Solutions Architect",
            "description": "Design cloud solutions for enterprise clients. Work with AWS, GCP, and Azure.",
            "company": "Cloud Solutions Corp",
            "location": "Chicago, IL",
            "job_type": "full-time",
            "experience_level": "6+ years",
            "salary_min": 160000,
            "salary_max": 200000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        }
    ]
    
    for job in more_jobs:
        job_id = str(uuid.uuid4())
        
        sql = """
        INSERT INTO jobs 
        (id, title, description, company, location, job_type, experience_level, salary_min, salary_max, posted_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        cursor.execute(sql, (
            job_id, job["title"], job["description"], job["company"], job["location"],
            job["job_type"], job["experience_level"], job["salary_min"], job["salary_max"],
            job["posted_by"]
        ))
        print(f"✅ {job['title']} at {job['company']}")
    
    conn.commit()
    print(f"\n✅ Added {len(more_jobs)} more jobs\n")
    
    # Add more forum posts
    print("=" * 70)
    print("ADDING MORE FORUM POSTS & COMMENTS")
    print("=" * 70 + "\n")
    
    forum_posts = [
        {
            "title": "Salary Negotiation Tips for Tech Jobs",
            "content": "I've negotiated salaries at 3 different companies. Here are my tips: Research market rates, practice your pitch, don't accept first offer, negotiate all benefits not just salary.",
            "author_email": "rachel.johnson@stripe.com"
        },
        {
            "title": "Best Practices for Code Reviews",
            "content": "Code reviews are crucial for code quality. Focus on learning, be respectful, provide constructive feedback, review in batches to save time.",
            "author_email": "alex.kumar@apple.com"
        },
        {
            "title": "Remote Work Tips & Tricks",
            "content": "After 3 years of remote work, here's what works: Set boundaries, have dedicated workspace, take breaks, stay connected with team, be over-communicative.",
            "author_email": "jessica.lee@microsoft.com"
        },
        {
            "title": "Breaking into Data Science",
            "content": "The path to data science: Learn Python and SQL, do projects, build portfolio, learn statistics, practice ML algorithms, apply to jobs/internships.",
            "author_email": "sophia.martinez@netflix.com"
        },
        {
            "title": "Building Side Projects",
            "content": "Side projects help you learn and build portfolio. Start small, pick something you care about, share your work, get feedback, iterate.",
            "author_email": "daniel.wong@meta.com"
        },
        {
            "title": "Interview Preparation Guide",
            "content": "System design interviews: understand tradeoffs, communicate your thinking, ask clarifying questions. Behavioral: use STAR method, have examples ready.",
            "author_email": "christopher.brown@uber.com"
        }
    ]
    
    for post in forum_posts:
        if post["author_email"] in user_dict:
            post_id = str(uuid.uuid4())
            user_id, role = user_dict[post["author_email"]]
            
            sql = """
            INSERT INTO forum_posts (id, author_id, title, content, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            """
            
            cursor.execute(sql, (post_id, user_id, post["title"], post["content"]))
            print(f"✅ {post['title']}")
    
    conn.commit()
    print(f"\n✅ Added {len(forum_posts)} forum posts\n")
    
    # Add more events
    print("=" * 70)
    print("ADDING MORE EVENTS")
    print("=" * 70 + "\n")
    
    events = [
        {
            "title": "Web Development Bootcamp",
            "description": "4-week intensive bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners.",
            "location": "Virtual",
            "event_type": "workshop",
            "event_date": datetime.now() + timedelta(days=20),
            "created_by": user_dict["sarah.johnson@alumni.edu"][0]
        },
        {
            "title": "Product Management Panel Discussion",
            "description": "Learn from PMs at top tech companies about their roles, challenges, and career paths.",
            "location": "Virtual",
            "event_type": "webinar",
            "event_date": datetime.now() + timedelta(days=25),
            "created_by": user_dict["jessica.lee@microsoft.com"][0]
        },
        {
            "title": "Startup Founder Meetup",
            "description": "Network with startup founders and entrepreneurs. Share ideas and learn from each other's experiences.",
            "location": "Austin, TX",
            "event_type": "networking",
            "event_date": datetime.now() + timedelta(days=35),
            "created_by": user_dict["robert.taylor@startupventures.com"][0]
        },
        {
            "title": "AI/ML Conference 2025",
            "description": "Annual conference featuring talks on artificial intelligence, machine learning, and their applications.",
            "location": "San Francisco, CA",
            "event_type": "conference",
            "event_date": datetime.now() + timedelta(days=45),
            "created_by": user_dict["sophia.martinez@netflix.com"][0]
        },
        {
            "title": "System Design Workshop",
            "description": "Deep dive into system design patterns. Learn how to design scalable systems.",
            "location": "Virtual",
            "event_type": "workshop",
            "event_date": datetime.now() + timedelta(days=28),
            "created_by": user_dict["rachel.johnson@stripe.com"][0]
        }
    ]
    
    for event in events:
        event_id = str(uuid.uuid4())
        
        sql = """
        INSERT INTO events (id, title, description, location, event_type, event_date, organizer_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        cursor.execute(sql, (
            event_id, event["title"], event["description"], event["location"],
            event["event_type"], event["event_date"], event["created_by"]
        ))
        print(f"✅ {event['title']}")
    
    conn.commit()
    print(f"\n✅ Added {len(events)} events\n")
    
    # Add more skills
    print("=" * 70)
    print("ADDING MORE SKILLS")
    print("=" * 70 + "\n")
    
    new_skills = [
        "FastAPI", "Kubernetes", "GraphQL", "Redis", "Elasticsearch", "Hadoop",
        "Spark", "Tableau", "Power BI", "Figma", "XD", "Sketch", "Product Strategy",
        "Agile", "Scrum", "OKR", "Pitch Deck", "Public Speaking", "Negotiation",
        "Swift", "Kotlin", "React Native", "Flutter", "Selenium", "Jenkins",
        "Git", "SVN", "JIRA", "Confluence", "Slack", "Zoom"
    ]
    
    added_skills = 0
    for skill_name in new_skills:
        try:
            skill_id = str(uuid.uuid4())
            sql = "INSERT INTO skills (id, name, category) VALUES (%s, %s, %s)"
            cursor.execute(sql, (skill_id, skill_name, "Technical"))
            added_skills += 1
        except:
            pass  # Skip if skill already exists
    
    conn.commit()
    print(f"✅ Added {added_skills} new skills\n")
    
    # Add skills to new users
    cursor.execute("SELECT id FROM skills LIMIT 30")
    all_skills = [row[0] for row in cursor.fetchall()]
    
    for email, (user_id, role) in new_user_dict.items():
        # Assign 5 random skills to each new user
        user_skills = random.sample(all_skills, min(5, len(all_skills)))
        for skill_id in user_skills:
            user_skill_id = str(uuid.uuid4())
            sql = """
            INSERT INTO user_skills (id, user_id, skill_id, proficiency_level)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(sql, (user_skill_id, user_id, skill_id, "Intermediate"))
    
    conn.commit()
    print(f"✅ Assigned skills to {len(new_user_dict)} new users\n")
    
    # Summary
    print("=" * 70)
    print("DATABASE SUMMARY")
    print("=" * 70 + "\n")
    
    cursor.execute("SELECT COUNT(*) FROM users")
    users_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_profiles")
    profiles_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM jobs")
    jobs_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM job_applications")
    apps_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM forum_posts")
    posts_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM forum_comments")
    comments_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM events")
    events_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM event_attendees")
    attendees_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM notifications")
    notifs_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM skills")
    skills_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM user_skills")
    user_skills_count = cursor.fetchone()[0]
    
    print(f"✅ Users: {users_count}")
    print(f"✅ User Profiles: {profiles_count}")
    print(f"✅ Jobs: {jobs_count}")
    print(f"✅ Job Applications: {apps_count}")
    print(f"✅ Forum Posts: {posts_count}")
    print(f"✅ Forum Comments: {comments_count}")
    print(f"✅ Events: {events_count}")
    print(f"✅ Event Attendees: {attendees_count}")
    print(f"✅ Notifications: {notifs_count}")
    print(f"✅ Skills: {skills_count}")
    print(f"✅ User-Skills: {user_skills_count}")
    print(f"\n📊 Database is now RICH with comprehensive test data!\n")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
