#!/usr/bin/env python3
"""Test password verification"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# The hash from the database
stored_hash = "$2b$12$13cp6Pzo41QQ.lLRxwFEVeF1P2HZE7ErHQtr.PT68Mj3vCDPF4unG"
password = "password123"

print(f"Testing password verification...")
print(f"Hash: {stored_hash}")
print(f"Password: {password}")
print()

try:
    result = pwd_context.verify(password, stored_hash)
    print(f"✅ Verification result: {result}")
except Exception as e:
    print(f"❌ Error during verification: {e}")
