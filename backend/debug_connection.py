#!/usr/bin/env python3
"""
Debug connection issues
"""
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('DATABASE_URL')
print("Current DATABASE_URL:")
print(url)
print("\nParsed components:")

# Parse URL manually
from urllib.parse import urlparse
parsed = urlparse(url)
print(f"  Host: {parsed.hostname}")
print(f"  Port: {parsed.port}")
print(f"  Database: {parsed.path}")
print(f"  User: {parsed.username}")
print(f"  Password: {parsed.password[:5]}...")

print("\n⚠️  If any of these look wrong, update .env file")
print("\nTry copying the EXACT connection string from Render dashboard:")
print("  Dashboard → PostgreSQL DB → Connect → External URL")
