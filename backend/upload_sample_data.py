#!/usr/bin/env python3
"""
Upload sample data from sample_data_insert.sql to Railway MySQL
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Uploading sample data to Railway MySQL database...\n")

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
    
    # Read SQL file - use absolute path
    import os
    sql_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'sample_data_insert.sql')
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()
    
    # Remove USE statement and split by ;
    sql_content = sql_content.replace('USE AlumUnity;', '').replace('USE railway;', '')
    
    # Split into individual statements
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
    
    # Filter out comments and SELECT statements
    data_statements = []
    for stmt in statements:
        # Skip SELECT statements (for verification)
        if stmt.upper().startswith('SELECT'):
            continue
        # Skip comments
        if stmt.upper().startswith('--'):
            continue
        if stmt.strip():
            data_statements.append(stmt)
    
    print(f"Found {len(data_statements)} SQL statements to execute\n")
    
    # Execute statements
    successful = 0
    failed = 0
    
    for i, stmt in enumerate(data_statements, 1):
        try:
            cursor.execute(stmt)
            successful += 1
            
            # Print progress for major data sections
            if 'INSERT INTO users' in stmt:
                print(f"  ✅ {i}. Users inserted")
            elif 'INSERT INTO alumni_profiles' in stmt:
                print(f"  ✅ {i}. Alumni profiles inserted")
            elif 'INSERT INTO jobs' in stmt:
                print(f"  ✅ {i}. Jobs inserted")
            elif 'INSERT INTO job_applications' in stmt:
                print(f"  ✅ {i}. Job applications inserted")
            elif 'INSERT INTO mentor_profiles' in stmt:
                print(f"  ✅ {i}. Mentor profiles inserted")
            elif 'INSERT INTO mentorship_requests' in stmt:
                print(f"  ✅ {i}. Mentorship requests inserted")
            elif 'INSERT INTO mentorship_sessions' in stmt:
                print(f"  ✅ {i}. Mentorship sessions inserted")
            elif 'INSERT INTO events' in stmt:
                print(f"  ✅ {i}. Events inserted")
            elif 'INSERT INTO event_rsvps' in stmt:
                print(f"  ✅ {i}. Event RSVPs inserted")
            elif 'INSERT INTO forum_posts' in stmt:
                print(f"  ✅ {i}. Forum posts inserted")
            elif 'INSERT INTO forum_comments' in stmt:
                print(f"  ✅ {i}. Forum comments inserted")
            elif 'INSERT INTO notifications' in stmt:
                print(f"  ✅ {i}. Notifications inserted")
            elif 'INSERT INTO badges' in stmt:
                print(f"  ✅ {i}. Badges inserted")
            elif 'INSERT INTO user_badges' in stmt:
                print(f"  ✅ {i}. User badges inserted")
            elif 'INSERT INTO engagement_scores' in stmt:
                print(f"  ✅ {i}. Engagement scores inserted")
            elif 'INSERT INTO contribution_history' in stmt:
                print(f"  ✅ {i}. Contribution history inserted")
            elif 'INSERT INTO skill_graph' in stmt:
                print(f"  ✅ {i}. Skill graph data inserted")
            elif 'INSERT INTO knowledge_capsules' in stmt:
                print(f"  ✅ {i}. Knowledge capsules inserted")
            elif 'INSERT INTO geographic_data' in stmt:
                print(f"  ✅ {i}. Geographic data inserted")
            elif 'INSERT INTO alumni_cards' in stmt:
                print(f"  ✅ {i}. Alumni cards inserted")
            elif 'INSERT INTO talent_clusters' in stmt:
                print(f"  ✅ {i}. Talent clusters inserted")
            elif 'INSERT INTO career_transition_matrix' in stmt:
                print(f"  ✅ {i}. Career transitions inserted")
            elif 'INSERT INTO system_config' in stmt:
                print(f"  ✅ {i}. System config inserted")
        except Exception as e:
            failed += 1
            if 'Duplicate entry' not in str(e):  # Ignore duplicate key errors
                print(f"  ⚠️  Statement {i}: {str(e)[:60]}")
    
    conn.commit()
    
    print(f"\n{'=' * 70}")
    print(f"✅ Sample data upload completed!")
    print(f"{'=' * 70}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    
    # Verify data
    print(f"\n{'=' * 70}")
    print("DATA VERIFICATION")
    print(f"{'=' * 70}\n")
    
    tables_to_check = [
        'users', 'alumni_profiles', 'jobs', 'job_applications',
        'mentor_profiles', 'mentorship_requests', 'mentorship_sessions',
        'events', 'event_rsvps', 'forum_posts', 'forum_comments',
        'notifications', 'badges', 'user_badges', 'engagement_scores',
        'contribution_history', 'skill_graph', 'knowledge_capsules',
        'geographic_data', 'alumni_cards', 'talent_clusters',
        'career_transition_matrix', 'system_config'
    ]
    
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"✅ {table}: {count} rows")
        except:
            print(f"⚠️  {table}: Error querying")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
