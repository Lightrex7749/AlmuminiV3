import os
import uuid
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

# Load environment variables
load_dotenv('.env')

# Database connection
try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        port=int(os.getenv('DB_PORT', 3306))
    )
    
    if connection.is_connected():
        print(f"✅ Connected to Railway MySQL Database")
    
    cursor = connection.cursor()

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

    # Add jobs
    print("Adding more jobs...")
    for title, description, company, job_type, location in additional_jobs:
        job_id = str(uuid.uuid4())
        sql = """
        INSERT INTO jobs (id, title, description, company, job_type, location, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, 'active', NOW(), NOW())
        """
        cursor.execute(sql, (job_id, title, description, company, job_type, location))
        print(f"  ✅ Added job: {title} at {company}")
    
    # Add events
    print("\nAdding more events...")
    for title, description, event_date, location in additional_events:
        event_id = str(uuid.uuid4())
        sql = """
        INSERT INTO events (id, title, description, event_date, location, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, 'upcoming', NOW(), NOW())
        """
        cursor.execute(sql, (event_id, title, description, event_date, location))
        print(f"  ✅ Added event: {title}")

    connection.commit()
    print("\n✅ All data added successfully!")
    
except Error as e:
    print(f"❌ Error: {e}")
    if connection.is_connected():
        connection.rollback()

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("✅ Database connection closed")
