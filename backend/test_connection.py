#!/usr/bin/env python3
"""
Simple connection test to Render database
"""
import os
import time
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
print(f"Testing connection to: {DATABASE_URL[:60]}...")

# Try psycopg2
try:
    import psycopg2
    print("Attempting connection...")
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
    print("✅ Connected successfully!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"✅ Database version: {version[0][:50]}...")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\nDatabase might still be starting up...")
    print("Render free tier databases can take 5-10 minutes to initialize.")
    print("\nAlternatives:")
    print("1. Wait 5 minutes and try again")
    print("2. Go to https://dashboard.render.com and manually check database status")
    print("3. Use DBeaver (Option C) for visual connection")
