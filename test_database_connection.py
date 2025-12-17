#!/usr/bin/env python3
"""
Database Connection Tester
Test your MySQL connection before deploying
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load local .env
ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

def test_mysql_connection():
    """Test MySQL connection with current environment variables"""
    try:
        import pymysql
        
        config = {
            'host': os.getenv('DB_HOST'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'charset': 'utf8mb4',
            'connect_timeout': 10,
        }
        
        print("🔍 Testing Database Connection...")
        print(f"  Host: {config['host']}")
        print(f"  Port: {config['port']}")
        print(f"  User: {config['user']}")
        print(f"  Database: {config['database']}")
        print()
        
        conn = pymysql.connect(**config)
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        print("✅ Database Connection Successful!")
        print(f"   Result: {result}")
        return True
        
    except Exception as e:
        print(f"❌ Database Connection Failed!")
        print(f"   Error: {str(e)}")
        print()
        print("💡 Common fixes:")
        print("   1. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env")
        print("   2. Make sure database is publicly accessible")
        print("   3. Try telnet: telnet <host> <port>")
        return False

def test_required_env_vars():
    """Check if all required environment variables are set"""
    required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    missing = []
    
    print("🔍 Checking Environment Variables...")
    for var in required:
        value = os.getenv(var)
        if value:
            masked = value[:5] + "***" if len(value) > 5 else value
            print(f"   ✅ {var} = {masked}")
        else:
            print(f"   ❌ {var} = NOT SET")
            missing.append(var)
    
    if missing:
        print()
        print(f"❌ Missing: {', '.join(missing)}")
        print("💡 Add these to your .env file!")
        return False
    
    print()
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("AlumUnity Database Connection Test")
    print("=" * 60)
    print()
    
    env_ok = test_required_env_vars()
    
    if env_ok:
        print()
        db_ok = test_mysql_connection()
        sys.exit(0 if db_ok else 1)
    else:
        sys.exit(1)
