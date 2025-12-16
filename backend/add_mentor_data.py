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

    # Sample mentors with their expertise areas
    sample_mentors = [
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440001',
            'headline': 'Senior Software Engineer | Tech Mentor',
            'bio': 'Passionate about helping junior developers grow their careers',
            'expertise_areas': ['Software Development', 'Python', 'Web Development'],
            'years_of_experience': 10,
            'max_mentees': 5,
            'current_mentees_count': 2,
            'hourly_rate': 50,
            'availability_status': 'available',
            'rating': 4.8,
            'total_sessions': 45,
            'verified_mentor': True
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440002',
            'headline': 'Product Manager | Career Coach',
            'bio': 'Helping aspiring PMs break into product management',
            'expertise_areas': ['Product Management', 'Career Transition', 'Leadership'],
            'years_of_experience': 8,
            'max_mentees': 4,
            'current_mentees_count': 1,
            'hourly_rate': 60,
            'availability_status': 'available',
            'rating': 4.9,
            'total_sessions': 32,
            'verified_mentor': True
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440003',
            'headline': 'Data Scientist | ML Specialist',
            'bio': 'Expert in machine learning and data analysis',
            'expertise_areas': ['Data Science', 'Machine Learning', 'Python', 'SQL'],
            'years_of_experience': 7,
            'max_mentees': 3,
            'current_mentees_count': 0,
            'hourly_rate': 55,
            'availability_status': 'available',
            'rating': 4.7,
            'total_sessions': 28,
            'verified_mentor': True
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440004',
            'headline': 'UX/UI Designer | Design Mentor',
            'bio': 'Specializing in user-centered design and UX research',
            'expertise_areas': ['UX Design', 'UI Design', 'User Research', 'Figma'],
            'years_of_experience': 6,
            'max_mentees': 4,
            'current_mentees_count': 2,
            'hourly_rate': 45,
            'availability_status': 'available',
            'rating': 4.6,
            'total_sessions': 38,
            'verified_mentor': True
        },
        {
            'user_id': '880e8400-e29b-41d4-a716-446655440005',
            'headline': 'DevOps Engineer | Cloud Architect',
            'bio': 'AWS and cloud infrastructure expert',
            'expertise_areas': ['AWS', 'DevOps', 'Cloud Architecture', 'Docker'],
            'years_of_experience': 9,
            'max_mentees': 5,
            'current_mentees_count': 3,
            'hourly_rate': 65,
            'availability_status': 'available',
            'rating': 4.9,
            'total_sessions': 52,
            'verified_mentor': True
        },
    ]

    print("Adding mentor profiles...")
    for mentor in sample_mentors:
        mentor_id = str(uuid.uuid4())
        
        # Convert expertise areas list to JSON string
        expertise_json = '["' + '","'.join(mentor['expertise_areas']) + '"]'
        
        sql = """
        INSERT INTO mentor_profiles 
        (id, user_id, headline, bio, expertise_areas, years_of_experience, max_mentees, 
         current_mentees_count, hourly_rate, availability_status, rating, total_sessions, 
         verified_mentor, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        values = (
            mentor_id,
            mentor['user_id'],
            mentor['headline'],
            mentor['bio'],
            expertise_json,
            mentor['years_of_experience'],
            mentor['max_mentees'],
            mentor['current_mentees_count'],
            mentor['hourly_rate'],
            mentor['availability_status'],
            mentor['rating'],
            mentor['total_sessions'],
            1 if mentor['verified_mentor'] else 0
        )
        
        cursor.execute(sql, values)
        print(f"  ✅ Added mentor: {mentor['headline']}")

    connection.commit()
    print("\n✅ All mentor profiles added successfully!")
    
except Error as e:
    print(f"❌ Error: {e}")
    if connection.is_connected():
        connection.rollback()

finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("✅ Database connection closed")
