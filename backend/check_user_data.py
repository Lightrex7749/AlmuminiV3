#!/usr/bin/env python3
"""
Check what data exists for the inserted users
"""
import os
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Checking user data in Railway MySQL database...\n")

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
    
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # Check users table data
    print("=" * 70)
    print("USERS TABLE DATA")
    print("=" * 70)
    cursor.execute("SELECT id, email, role, is_verified, is_active, created_at FROM users LIMIT 10")
    users = cursor.fetchall()
    
    if users:
        for i, user in enumerate(users, 1):
            print(f"\n{i}. {user['email']}")
            print(f"   ID: {user['id']}")
            print(f"   Role: {user['role']}")
            print(f"   Verified: {user['is_verified']}")
            print(f"   Active: {user['is_active']}")
            print(f"   Created: {user['created_at']}")
    else:
        print("❌ No users found")
    
    # Check user_profiles table
    print("\n" + "=" * 70)
    print("USER PROFILES TABLE DATA")
    print("=" * 70)
    cursor.execute("SELECT COUNT(*) as count FROM user_profiles")
    profile_count = cursor.fetchone()['count']
    print(f"Total profiles: {profile_count}")
    
    if profile_count > 0:
        cursor.execute("""
            SELECT up.user_id, up.first_name, up.last_name, up.bio, up.avatar_url, up.headline
            FROM user_profiles up
            LIMIT 10
        """)
        profiles = cursor.fetchall()
        for i, profile in enumerate(profiles, 1):
            print(f"\n{i}. User ID: {profile['user_id']}")
            print(f"   Name: {profile['first_name']} {profile['last_name']}")
            print(f"   Headline: {profile['headline']}")
            print(f"   Bio: {profile['bio'][:100]}..." if profile['bio'] else "   Bio: (empty)")
            print(f"   Avatar: {profile['avatar_url'][:50]}..." if profile['avatar_url'] else "   Avatar: (empty)")
    else:
        print("❌ No profiles found")
    
    # Summary statistics
    print("\n" + "=" * 70)
    print("SUMMARY STATISTICS")
    print("=" * 70)
    
    tables = [
        'users', 'user_profiles', 'jobs', 'job_applications',
        'mentorships', 'mentorship_requests', 'forum_posts', 'messages',
        'notifications', 'events', 'skills', 'user_skills'
    ]
    
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = cursor.fetchone()['count']
            status = "✅" if count > 0 else "⚠️ "
            print(f"{status} {table}: {count} rows")
        except:
            print(f"❌ {table}: Error querying")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
