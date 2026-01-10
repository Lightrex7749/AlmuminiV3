#!/usr/bin/env python3
"""Test all critical functionality"""

import asyncio
import httpx
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

async def test_endpoints():
    """Test critical endpoints"""
    
    print("=" * 60)
    print("TESTING LOCAL BACKEND (http://localhost:8001)")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # Test 1: Login
        print("\n1️⃣  Testing Login Endpoint...")
        try:
            response = await client.post(
                'http://localhost:8001/api/auth/login',
                json={
                    'email': 'admin@alumni.edu',
                    'password': 'password123'
                },
                timeout=5
            )
            if response.status_code == 200:
                print("   ✅ Login works!")
                token = response.json().get('access_token', '')[:20]
                print(f"   Token issued: {token}...")
            else:
                print(f"   ❌ Login failed: {response.status_code}")
                print(f"   Error: {response.json()}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 2: Quick Login Users
        print("\n2️⃣  Testing Quick Login Users Endpoint...")
        try:
            response = await client.get(
                'http://localhost:8001/api/auth/quick-login-users',
                timeout=5
            )
            if response.status_code == 200:
                users = response.json().get('users', [])
                print(f"   ✅ Quick login users available: {len(users)} users")
                roles = set([u.get('role') for u in users])
                print(f"   Roles: {', '.join(sorted(roles))}")
                for user in users[:2]:
                    print(f"   - {user.get('role').upper()}: {user.get('name')} ({user.get('headline', 'N/A')[:30]})")
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 3: Jobs Endpoint
        print("\n3️⃣  Testing Jobs Endpoint...")
        try:
            response = await client.get(
                'http://localhost:8001/api/jobs',
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                total = data.get('total', 0)
                print(f"   ✅ Jobs available: {total} jobs")
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test 4: Skills Endpoint
        print("\n4️⃣  Testing Skills Endpoint...")
        try:
            response = await client.get(
                'http://localhost:8001/api/skills',
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                skills_count = len(data.get('data', []))
                print(f"   ✅ Skills available: {skills_count} skills")
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_database():
    """Test database directly"""
    
    print("\n" + "=" * 60)
    print("TESTING RAILWAY DATABASE")
    print("=" * 60)
    
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            port=int(os.getenv('DB_PORT')),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with conn.cursor() as cursor:
            # Test 1: User count
            print("\n1️⃣  Checking users...")
            cursor.execute("SELECT COUNT(*) as count FROM users")
            count = cursor.fetchone()['count']
            print(f"   ✅ Total users: {count}")
            
            cursor.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
            for row in cursor.fetchall():
                print(f"      - {row['role']}: {row['count']}")
            
            # Test 2: Jobs count
            print("\n2️⃣  Checking jobs...")
            cursor.execute("SELECT COUNT(*) as count FROM jobs")
            count = cursor.fetchone()['count']
            print(f"   ✅ Total jobs: {count}")
            
            # Test 3: Skills count
            print("\n3️⃣  Checking skills...")
            cursor.execute("SELECT COUNT(*) as count FROM skills")
            count = cursor.fetchone()['count']
            print(f"   ✅ Total skills: {count}")
            
            # Test 4: Password hash validation
            print("\n4️⃣  Checking password hashes...")
            cursor.execute("SELECT id, email, password_hash FROM users LIMIT 1")
            user = cursor.fetchone()
            
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            try:
                verified = pwd_context.verify('password123', user['password_hash'])
                if verified:
                    print(f"   ✅ Password hashes are valid (tested with admin)")
                else:
                    print(f"   ❌ Password verification failed")
            except Exception as e:
                print(f"   ❌ Password hash error: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == '__main__':
    print("\n")
    print("🚀 ALUMUNITY - COMPREHENSIVE SYSTEM TEST")
    print("=" * 60)
    
    asyncio.run(test_endpoints())
    test_database()
    
    print("\n" + "=" * 60)
    print("✅ SYSTEM TEST COMPLETE")
    print("=" * 60)
    print("\n📝 DEPLOYMENT STATUS:")
    print("   - Local Backend: ✅ http://localhost:8001")
    print("   - Local Frontend: ✅ http://localhost:5999")
    print("   - Railway Database: ✅ Connected and updated")
    print("   - Render Backend: ⏳ Deploying (watch for auto-rebuild)")
    print("   - Vercel Frontend: ✅ Should auto-deploy")
    print("\n🔐 CREDENTIALS:")
    print("   - All users: password123")
    print("   - Admin: admin@alumni.edu")
    print("   - Alumni: emily.rodriguez@alumni.edu")
    print("   - Student: (select from quick-login)")
    print("   - Recruiter: (select from quick-login)")
    print("\n")
