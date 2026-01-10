#!/usr/bin/env python3
"""Export real database data to mockdata.json for local development"""

import json
import os
import sys
from datetime import datetime
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'trolley.proxy.rlwy.net')
DB_PORT = int(os.getenv('DB_PORT', 29610))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'railway')

def get_db_connection():
    """Create database connection"""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def export_table_data(connection, table_name):
    """Export all data from a table"""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            # Convert datetime objects to ISO strings
            for row in rows:
                for key, value in row.items():
                    if isinstance(value, datetime):
                        row[key] = value.isoformat() + 'Z'
                    elif isinstance(value, bytes):
                        row[key] = value.decode('utf-8')
            
            return rows
    except Exception as e:
        print(f"Error exporting {table_name}: {e}")
        return []

def main():
    """Export all database tables to mockdata.json"""
    try:
        connection = get_db_connection()
        print("✅ Connected to Railway database")
        
        # Tables to export
        tables = [
            'users',
            'user_profiles',
            'skills',
            'user_skills',
            'jobs',
            'job_applications',
            'forum_posts',
            'forum_replies',
            'events',
            'event_registrations',
            'user_connections',
            'notifications',
            'messages',
            'message_threads',
            'resource_recommendations',
            'achievement_badges',
            'mentor_connections'
        ]
        
        # Export all tables
        mock_data = {
            "_meta": {
                "description": "Comprehensive mock data for AlumUnity System - Exported from Railway",
                "version": "2.0",
                "compatible_with": "MySQL 8.0+ / MariaDB 10.5+",
                "last_updated": datetime.now().isoformat() + 'Z',
                "usage_note": "This mock data is exported from the live Railway database and reflects current application state."
            }
        }
        
        for table in tables:
            print(f"Exporting {table}...")
            mock_data[table] = export_table_data(connection, table)
            print(f"  ✅ {table}: {len(mock_data[table])} records")
        
        connection.close()
        
        # Write to mockdata.json
        output_path = os.path.join(os.path.dirname(__file__), '..', 'mockdata.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(mock_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully exported all data to {output_path}")
        print(f"\nSummary:")
        for table in tables:
            print(f"  {table}: {len(mock_data[table])} records")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
