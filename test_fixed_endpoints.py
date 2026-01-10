#!/usr/bin/env python3
import asyncio
import aiohttp
import sys

async def test_endpoints():
    """Test the fixed admin endpoints"""
    
    # First, get a token
    async with aiohttp.ClientSession() as session:
        # Login
        login_data = {
            "email": "admin@alumni.edu",
            "password": "password123"
        }
        
        try:
            async with session.post(
                "http://localhost:8001/api/auth/login",
                json=login_data
            ) as resp:
                if resp.status != 200:
                    print(f"❌ Login failed: {resp.status}")
                    return
                
                data = await resp.json()
                token = data.get("access_token")
                print(f"✅ Logged in, token: {token[:20]}...")
                
                # Test admin/stats endpoint
                headers = {"Authorization": f"Bearer {token}"}
                
                print("\n📊 Testing /api/admin/stats...")
                async with session.get(
                    "http://localhost:8001/api/admin/stats",
                    headers=headers
                ) as resp:
                    print(f"   Status: {resp.status}")
                    if resp.status == 200:
                        data = await resp.json()
                        print(f"   ✅ Success!")
                        print(f"      Total Users: {data.get('data', {}).get('totalUsers')}")
                        print(f"      Total Jobs: {data.get('data', {}).get('totalJobs')}")
                        print(f"      Total Events: {data.get('data', {}).get('totalEvents')}")
                    else:
                        error = await resp.text()
                        print(f"   ❌ Error: {error[:200]}")
                
                # Test career data stats
                print("\n📊 Testing /api/career-data/admin/stats...")
                async with session.get(
                    "http://localhost:8001/api/career-data/admin/stats",
                    headers=headers
                ) as resp:
                    print(f"   Status: {resp.status}")
                    if resp.status == 200:
                        data = await resp.json()
                        print(f"   ✅ Success!")
                        stats = data.get('data', {})
                        print(f"      Total Transitions: {stats.get('total_transitions')}")
                        print(f"      ML Ready: {stats.get('ml_ready')}")
                    else:
                        error = await resp.text()
                        print(f"   ❌ Error: {error[:200]}")
        
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_endpoints())
