#!/usr/bin/env python3
"""
Add rich data to existing Railway tables
"""
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Adding rich data to existing Railway MySQL tables...\n")

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
    
    # Get existing user IDs
    cursor.execute("SELECT id, email, role FROM users")
    users = cursor.fetchall()
    user_dict = {email: (user_id, role) for user_id, email, role in users}
    
    print("=" * 70)
    print("ADDING JOBS DATA")
    print("=" * 70 + "\n")
    
    jobs_data = [
        {
            "title": "Senior Full-Stack Engineer",
            "description": "We're looking for an experienced full-stack engineer to join our growing engineering team. You'll work on building scalable web applications and APIs that serve millions of users.",
            "company": "TechCorp Solutions",
            "location": "San Francisco, CA",
            "job_type": "full-time",
            "experience_required": "5+ years",
            "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
            "salary_min": 150000,
            "salary_max": 200000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Product Designer",
            "description": "Join our design team to create beautiful and intuitive user experiences. You'll work closely with engineers and product managers.",
            "company": "DesignFirst Inc",
            "location": "Remote",
            "job_type": "full-time",
            "experience_required": "3+ years",
            "skills": ["UX Design", "Figma", "User Research", "Prototyping"],
            "salary_min": 100000,
            "salary_max": 130000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Machine Learning Engineer",
            "description": "We're seeking a talented ML engineer to help us build intelligent systems that power our products.",
            "company": "AI Innovations Lab",
            "location": "Boston, MA",
            "job_type": "full-time",
            "experience_required": "4+ years",
            "skills": ["Python", "Machine Learning", "TensorFlow", "AWS"],
            "salary_min": 140000,
            "salary_max": 180000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "Frontend Developer Intern",
            "description": "Great opportunity for students or recent graduates to gain hands-on experience in web development.",
            "company": "Startup Ventures",
            "location": "Austin, TX",
            "job_type": "internship",
            "experience_required": "0-1 years",
            "skills": ["HTML", "CSS", "JavaScript", "React"],
            "salary_min": 25,
            "salary_max": 35,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        },
        {
            "title": "DevOps Engineer",
            "description": "Join our infrastructure team to build and maintain scalable, reliable systems. You'll work on automation and CI/CD pipelines.",
            "company": "CloudTech Systems",
            "location": "New York, NY",
            "job_type": "full-time",
            "experience_required": "3+ years",
            "skills": ["AWS", "Docker", "Kubernetes", "CI/CD"],
            "salary_min": 120000,
            "salary_max": 160000,
            "posted_by": user_dict["david.kim@techcorp.com"][0]
        }
    ]
    
    job_ids = []
    for job in jobs_data:
        job_id = str(uuid.uuid4())
        job_ids.append(job_id)
        
        sql = """
        INSERT INTO jobs 
        (id, title, description, company, location, job_type, experience_level, salary_min, salary_max, posted_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        cursor.execute(sql, (
            job_id,
            job["title"],
            job["description"],
            job["company"],
            job["location"],
            job["job_type"],
            job["experience_required"],
            job["salary_min"],
            job["salary_max"],
            job["posted_by"]
        ))
        print(f"✅ {job['title']} at {job['company']}")
    
    conn.commit()
    
    print(f"\n✅ {len(jobs_data)} jobs added\n")
    
    # Add job applications
    print("=" * 70)
    print("ADDING JOB APPLICATIONS")
    print("=" * 70 + "\n")
    
    if len(job_ids) > 0:
        applications = [
            {"job_idx": 3, "user_email": "emily.rodriguez@alumni.edu", "status": "shortlisted"},
            {"job_idx": 3, "user_email": "michael.chen@google.com", "status": "reviewed"},
            {"job_idx": 1, "user_email": "emily.rodriguez@alumni.edu", "status": "pending"},
            {"job_idx": 0, "user_email": "michael.chen@google.com", "status": "pending"},
            {"job_idx": 2, "user_email": "sarah.johnson@alumni.edu", "status": "reviewed"},
        ]
        
        for app in applications:
            if app["user_email"] in user_dict:
                app_id = str(uuid.uuid4())
                user_id, role = user_dict[app["user_email"]]
                job_id = job_ids[app["job_idx"]]
                
                sql = """
                INSERT INTO job_applications 
                (id, job_id, user_id, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                """
                
                cursor.execute(sql, (app_id, job_id, user_id, app["status"]))
                print(f"✅ Application: {app['user_email']} -> {app['status']}")
        
        conn.commit()
        print(f"\n✅ {len(applications)} job applications added\n")
    
    # Add forum posts
    print("=" * 70)
    print("ADDING FORUM POSTS & COMMENTS")
    print("=" * 70 + "\n")
    
    forum_posts = [
        {
            "title": "Tips for Landing Your First Software Engineering Job",
            "content": "After going through countless interviews and finally landing my first job at Google, I wanted to share some tips that helped me. Build real projects, contribute to open source, practice LeetCode daily, do mock interviews, and network actively.",
            "author_email": "sarah.johnson@alumni.edu",
            "tags": ["career-advice", "software-engineering", "interviews"]
        },
        {
            "title": "Transitioning from Engineering to Product Management",
            "content": "I recently made the switch from software engineering to product management and wanted to share my journey. Why I made the switch: wanted more impact on product strategy. How I prepared: took on PM responsibilities, read PM books, networked with PMs, built side projects.",
            "author_email": "michael.chen@google.com",
            "tags": ["product-management", "career-transition"]
        },
        {
            "title": "Best Resources for Learning React in 2025",
            "content": "As someone who recently learned React, here are the resources I found most helpful: Free resources include React official docs and FreeCodeCamp. Paid resources: Udemy courses and Frontend Masters. Practice by building projects!",
            "author_email": "emily.rodriguez@alumni.edu",
            "tags": ["react", "web-development", "learning"]
        }
    ]
    
    post_ids = []
    for post in forum_posts:
        if post["author_email"] in user_dict:
            post_id = str(uuid.uuid4())
            post_ids.append(post_id)
            user_id, role = user_dict[post["author_email"]]
            
            sql = """
            INSERT INTO forum_posts 
            (id, title, content, author_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            """
            
            cursor.execute(sql, (post_id, post["title"], post["content"], user_id))
            print(f"✅ Forum post: {post['title']}")
    
    conn.commit()
    print(f"\n✅ {len(forum_posts)} forum posts added\n")
    
    # Add forum comments
    if len(post_ids) > 0:
        comments = [
            {
                "post_idx": 0,
                "author_email": "emily.rodriguez@alumni.edu",
                "content": "This is super helpful! How many hours a day did you dedicate to LeetCode?"
            },
            {
                "post_idx": 1,
                "author_email": "emily.rodriguez@alumni.edu",
                "content": "This is exactly what I'm considering! How did you communicate your interest in PM during interviews?"
            },
            {
                "post_idx": 2,
                "author_email": "michael.chen@google.com",
                "content": "Great recommendations! I also found Josh Comeau's blog very helpful for understanding React deeply."
            }
        ]
        
        for comment in comments:
            if post_idx := comment.get("post_idx") and post_idx < len(post_ids):
                if comment["author_email"] in user_dict:
                    comment_id = str(uuid.uuid4())
                    user_id, role = user_dict[comment["author_email"]]
                    post_id = post_ids[comment["post_idx"]]
                    
                    sql = """
                    INSERT INTO forum_comments 
                    (id, post_id, author_id, content, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                    """
                    
                    cursor.execute(sql, (comment_id, post_id, user_id, comment["content"]))
                    print(f"✅ Comment added to post {comment['post_idx'] + 1}")
        
        conn.commit()
        print(f"\n✅ {len(comments)} forum comments added\n")
    
    # Add events
    print("=" * 70)
    print("ADDING EVENTS")
    print("=" * 70 + "\n")
    
    events = [
        {
            "title": "Tech Career Fair 2025",
            "description": "Annual career fair bringing together alumni, recruiters, and students. Meet representatives from top tech companies.",
            "location": "Tech University Main Hall",
            "event_type": "conference",
            "event_date": datetime.now() + timedelta(days=30),
            "created_by": user_dict["admin@alumni.edu"][0]
        },
        {
            "title": "Machine Learning Workshop: From Theory to Practice",
            "description": "Hands-on workshop covering fundamental ML concepts and practical implementation led by industry experts.",
            "location": "Virtual",
            "event_type": "workshop",
            "event_date": datetime.now() + timedelta(days=15),
            "created_by": user_dict["michael.chen@google.com"][0]
        },
        {
            "title": "Alumni Networking Mixer",
            "description": "Casual networking event for alumni to reconnect and share experiences. Great opportunity to expand your network!",
            "location": "Downtown Alumni Center",
            "event_type": "networking",
            "event_date": datetime.now() + timedelta(days=10),
            "created_by": user_dict["sarah.johnson@alumni.edu"][0]
        }
    ]
    
    event_ids = []
    for event in events:
        event_id = str(uuid.uuid4())
        event_ids.append(event_id)
        
        sql = """
        INSERT INTO events 
        (id, title, description, location, event_type, event_date, organizer_id, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        cursor.execute(sql, (
            event_id,
            event["title"],
            event["description"],
            event["location"],
            event["event_type"],
            event["event_date"],
            event["created_by"]
        ))
        print(f"✅ Event: {event['title']}")
    
    conn.commit()
    print(f"\n✅ {len(events)} events added\n")
    
    # Add event attendees
    if len(event_ids) > 0:
        print("=" * 70)
        print("ADDING EVENT ATTENDEES")
        print("=" * 70 + "\n")
        
        attendees = [
            {"event_idx": 0, "user_email": "emily.rodriguez@alumni.edu"},
            {"event_idx": 0, "user_email": "michael.chen@google.com"},
            {"event_idx": 1, "user_email": "emily.rodriguez@alumni.edu"},
            {"event_idx": 2, "user_email": "sarah.johnson@alumni.edu"},
            {"event_idx": 2, "user_email": "michael.chen@google.com"},
        ]
        
        for attendee in attendees:
            if attendee["user_email"] in user_dict:
                attendee_id = str(uuid.uuid4())
                user_id, role = user_dict[attendee["user_email"]]
                event_id = event_ids[attendee["event_idx"]]
                
                sql = """
                INSERT INTO event_attendees 
                (id, event_id, user_id, status, created_at)
                VALUES (%s, %s, %s, %s, NOW())
                """
                
                cursor.execute(sql, (attendee_id, event_id, user_id, "attending"))
                print(f"✅ {attendee['user_email']} -> Event {attendee['event_idx'] + 1}")
        
        conn.commit()
        print(f"\n✅ {len(attendees)} event attendees added\n")
    
    # Add notifications
    print("=" * 70)
    print("ADDING NOTIFICATIONS")
    print("=" * 70 + "\n")
    
    notifications = [
        {
            "user_email": "emily.rodriguez@alumni.edu",
            "title": "Job Application Update",
            "message": "Your application for Frontend Developer Intern has been shortlisted!",
            "type": "job"
        },
        {
            "user_email": "michael.chen@google.com",
            "title": "Event Reminder",
            "message": "Tech Career Fair 2025 is coming up in 30 days!",
            "type": "event"
        },
        {
            "user_email": "sarah.johnson@alumni.edu",
            "title": "New Comment on Your Post",
            "message": "Emily Rodriguez commented on your post about career tips.",
            "type": "forum"
        }
    ]
    
    for notif in notifications:
        if notif["user_email"] in user_dict:
            notif_id = str(uuid.uuid4())
            user_id, role = user_dict[notif["user_email"]]
            
            sql = """
            INSERT INTO notifications 
            (id, user_id, title, message, type, is_read, created_at)
            VALUES (%s, %s, %s, %s, %s, 0, NOW())
            """
            
            cursor.execute(sql, (notif_id, user_id, notif["title"], notif["message"], notif["type"]))
            print(f"✅ Notification for {notif['user_email']}: {notif['title']}")
    
    conn.commit()
    print(f"\n✅ {len(notifications)} notifications added\n")
    
    # Summary
    print("=" * 70)
    print("FINAL DATA SUMMARY")
    print("=" * 70 + "\n")
    
    cursor.execute("SELECT COUNT(*) FROM users")
    users_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM jobs")
    jobs_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM job_applications")
    applications_count = cursor.fetchone()[0]
    
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
    
    print(f"✅ Users: {users_count}")
    print(f"✅ Jobs: {jobs_count}")
    print(f"✅ Job Applications: {applications_count}")
    print(f"✅ Forum Posts: {posts_count}")
    print(f"✅ Forum Comments: {comments_count}")
    print(f"✅ Events: {events_count}")
    print(f"✅ Event Attendees: {attendees_count}")
    print(f"✅ Notifications: {notifs_count}")
    print(f"\n📊 Database is now populated with rich test data!\n")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
