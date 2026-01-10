#!/usr/bin/env python3
"""Fix skill graph and ensure all data is properly set up"""

import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'trolley.proxy.rlwy.net')
DB_PORT = int(os.getenv('DB_PORT', 29610))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'railway')

def run_fix():
    """Create skill_graph table and populate it"""
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with conn.cursor() as cursor:
            # Create skill_graph table if it doesn't exist
            print("📋 Creating skill_graph table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS skill_graph (
                    id VARCHAR(36) PRIMARY KEY,
                    source_skill_id VARCHAR(36) NOT NULL,
                    target_skill_id VARCHAR(36) NOT NULL,
                    relationship_type VARCHAR(50) DEFAULT 'related',
                    strength FLOAT DEFAULT 0.5,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (source_skill_id) REFERENCES skills(id),
                    FOREIGN KEY (target_skill_id) REFERENCES skills(id),
                    UNIQUE KEY unique_relationship (source_skill_id, target_skill_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ skill_graph table created/verified")
            
            # Get all skills
            cursor.execute("SELECT id, name FROM skills LIMIT 50")
            skills = cursor.fetchall()
            skill_ids = [s['id'] for s in skills]
            
            if len(skill_ids) > 1:
                print(f"📊 Creating skill relationships (from {len(skill_ids)} skills)...")
                
                # Create skill relationships based on common tech stacks
                relationships = [
                    # Frontend
                    ('React', 'JavaScript'),
                    ('React', 'CSS'),
                    ('Vue.js', 'JavaScript'),
                    ('Angular', 'TypeScript'),
                    
                    # Backend
                    ('Python', 'Django'),
                    ('Python', 'Flask'),
                    ('Node.js', 'JavaScript'),
                    ('Java', 'Spring'),
                    
                    # Databases
                    ('SQL', 'MySQL'),
                    ('SQL', 'PostgreSQL'),
                    ('MongoDB', 'NoSQL'),
                    
                    # DevOps
                    ('Docker', 'Kubernetes'),
                    ('Docker', 'AWS'),
                    ('Git', 'GitHub'),
                    
                    # Data
                    ('Python', 'Data Science'),
                    ('Python', 'Machine Learning'),
                    ('SQL', 'Analytics'),
                ]
                
                added = 0
                for source, target in relationships:
                    cursor.execute(
                        "SELECT id FROM skills WHERE name = %s LIMIT 1",
                        (source,)
                    )
                    source_skill = cursor.fetchone()
                    
                    cursor.execute(
                        "SELECT id FROM skills WHERE name = %s LIMIT 1",
                        (target,)
                    )
                    target_skill = cursor.fetchone()
                    
                    if source_skill and target_skill:
                        try:
                            import uuid
                            cursor.execute("""
                                INSERT IGNORE INTO skill_graph 
                                (id, source_skill_id, target_skill_id, relationship_type, strength)
                                VALUES (%s, %s, %s, 'related', 0.8)
                            """, (str(uuid.uuid4()), source_skill['id'], target_skill['id']))
                            added += 1
                        except:
                            pass
                
                conn.commit()
                print(f"✅ Added {added} skill relationships")
            
            # Verify data
            cursor.execute("SELECT COUNT(*) as count FROM skill_graph")
            result = cursor.fetchone()
            print(f"\n✅ Total skill graph records: {result['count']}")
            
            cursor.execute("SELECT COUNT(*) as count FROM jobs")
            result = cursor.fetchone()
            print(f"✅ Total jobs: {result['count']}")
            
            cursor.execute("SELECT COUNT(*) as count FROM users")
            result = cursor.fetchone()
            print(f"✅ Total users: {result['count']}")
            
            cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
            results = cursor.fetchall()
            print(f"\n📊 Users by role:")
            for row in results:
                print(f"   {row['role']}: {row['count']}")
        
        conn.close()
        print(f"\n✅ All fixes applied successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    run_fix()
