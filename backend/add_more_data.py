"""
Add more sample data to Railway MySQL database
"""
import pymysql
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import uuid

# Load env from backend directory
load_dotenv('.env')

# Connect to Railway MySQL
conn = pymysql.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME'),
    autocommit=True
)

cursor = conn.cursor()

# Sample data - More Users
additional_users = [
    ('marcus.johnson@alumni.edu', 'marcus123456', 'alumni', 'Marcus Johnson'),
    ('emma.davis@alumni.edu', 'emma123456', 'student', 'Emma Davis'),
    ('liam.garcia@alumni.edu', 'liam123456', 'alumni', 'Liam Garcia'),
    ('ava.hernandez@alumni.edu', 'ava123456', 'student', 'Ava Hernandez'),
    ('noah.miller@alumni.edu', 'noah123456', 'recruiter', 'Noah Miller'),
    ('isabella.wilson@alumni.edu', 'isabella123456', 'student', 'Isabella Wilson'),
    ('ethan.moore@alumni.edu', 'ethan123456', 'recruiter', 'Ethan Moore'),
]

# More Jobs
additional_jobs = [
    ('Senior Software Engineer', 'We are looking for experienced engineers', 'Tech Company Inc', 'Full-time', 'San Francisco, CA'),
    ('Product Manager', 'Lead our product vision and strategy', 'Innovation Labs', 'Full-time', 'New York, NY'),
    ('Data Science Lead', 'Build and maintain ML models', 'Analytics Corp', 'Full-time', 'Boston, MA'),
    ('DevOps Engineer', 'Manage cloud infrastructure', 'Cloud Systems Ltd', 'Full-time', 'Seattle, WA'),
    ('Frontend Developer', 'Create beautiful user interfaces', 'Web Solutions', 'Full-time', 'Remote'),
    ('Marketing Manager', 'Drive growth and engagement', 'Digital Agency', 'Full-time', 'Los Angeles, CA'),
    ('Business Analyst', 'Analyze business requirements', 'Consulting Group', 'Full-time', 'Chicago, IL'),
]

# More Events
additional_events = [
    ('Career Fair 2025', 'Meet with top companies', '2025-03-15 10:00:00', 'Virtual'),
    ('Tech Talk: AI Future', 'Discussion on AI trends', '2025-02-28 14:00:00', 'Auditorium A'),
    ('Networking Breakfast', 'Alumni networking event', '2025-02-20 08:00:00', 'Cafe'),
    ('Resume Workshop', 'Learn resume tips', '2025-02-10 15:00:00', 'Room 101'),
    ('Interview Prep Seminar', 'Practice interview skills', '2025-02-05 16:00:00', 'Online'),
]

try:
    print("Adding more users...")
    for email, pwd, role, name in additional_users:
        user_id = str(uuid.uuid4())
        sql = """
        INSERT INTO users (id, email, password_hash, role, is_verified, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, 1, 1, NOW(), NOW())
        """
        # Using a simple hash (in production, use bcrypt)
        cursor.execute(sql, (user_id, email, pwd, role))
        print(f"  ✅ Added user: {email}")
    
    print("\nAdding more jobs...")
    for title, description, company, job_type, location in additional_jobs:
        job_id = str(uuid.uuid4())
        sql = """
        INSERT INTO jobs (id, title, description, company, job_type, location, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, 'active', NOW(), NOW())
        """
        cursor.execute(sql, (job_id, title, description, company, job_type, location))
        print(f"  ✅ Added job: {title} at {company}")
    
    print("\nAdding more events...")
    for title, description, event_date, location in additional_events:
        event_id = str(uuid.uuid4())
        sql = """
        INSERT INTO events (id, title, description, event_date, location, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, 'upcoming', NOW(), NOW())
        """
        cursor.execute(sql, (event_id, title, description, event_date, location))
        print(f"  ✅ Added event: {title}")
    
    print("\n" + "="*50)
    print("✅ All additional data added successfully!")
    print("="*50)
    
    # Verify counts
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM jobs")
    job_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM events")
    event_count = cursor.fetchone()[0]
    
    print(f"\nDatabase Summary:")
    print(f"  👥 Total Users: {user_count}")
    print(f"  💼 Total Jobs: {job_count}")
    print(f"  📅 Total Events: {event_count}")

except Exception as e:
    print(f"❌ Error: {e}")
finally:
    cursor.close()
    conn.close()
