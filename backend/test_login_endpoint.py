#!/usr/bin/env python3
"""Test login endpoint"""

import asyncio
import httpx

async def test_login():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                'http://localhost:8001/api/auth/login',
                json={
                    'email': 'admin@alumni.edu',
                    'password': 'password123'
                },
                timeout=10
            )
            
            print(f'Status: {response.status_code}')
            data = response.json()
            
            if response.status_code == 200:
                print(f'✅ Login successful!')
                token = data.get('access_token', '')[:30]
                print(f'Token: {token}...')
                user_role = data.get('user', {}).get('role')
                print(f'User role: {user_role}')
            else:
                print(f'❌ Login failed')
                print(f'Error: {data}')
        except Exception as e:
            print(f'❌ Error: {e}')
            import traceback
            traceback.print_exc()

asyncio.run(test_login())
