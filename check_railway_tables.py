#!/usr/bin/env python3
"""Check and create all missing tables in Railway database"""
import asyncio
import aiomysql
import sys

# All required tables from the app
REQUIRED_TABLES = [
    'users', 'email_verifications', 'password_resets', 'user_profiles',
    'alumni_profiles', 'profile_verification_requests', 'jobs', 'job_applications',
    'mentor_profiles', 'mentorship_requests', 'mentorship_sessions', 'events', 
    'event_rsvps', 'forum_posts', 'forum_comments', 'post_likes', 'comment_likes',
    'notifications', 'notification_preferences', 'privacy_settings', 'admin_actions',
    'system_metrics', 'skills', 'user_skills', 'skill_graph', 'badges', 'user_badges',
    'engagement_scores', 'contribution_history', 'content_flags', 'knowledge_capsules',
    'geographic_data', 'alumni_cards', 'talent_clusters', 'career_transition_matrix',
    'system_config'
]

async def check_and_create():
    print("🔍 Checking Railway database tables...\n")
    
    conn = await aiomysql.connect(
        host='trolley.proxy.rlwy.net',
        port=29610,
        user='root',
        password='nkdBwAiyhTVVwgJdaRjVvJWDWwYQanNZ',
        db='railway'
    )
    
    async with conn.cursor() as cursor:
        # Get all existing tables
        await cursor.execute("SHOW TABLES")
        existing = set(row[0] for row in await cursor.fetchall())
        
        print(f"✅ Found {len(existing)} existing tables")
        print(f"📋 Need {len(REQUIRED_TABLES)} total tables\n")
        
        missing = set(REQUIRED_TABLES) - existing
        
        if missing:
            print(f"❌ Missing tables ({len(missing)}):")
            for table in sorted(missing):
                print(f"   - {table}")
        else:
            print("✅ All required tables exist!")
        
        # Show existing tables
        print(f"\n✅ Existing tables ({len(existing)}):")
        for table in sorted(existing):
            print(f"   - {table}")
    
    conn.close()

asyncio.run(check_and_create())
