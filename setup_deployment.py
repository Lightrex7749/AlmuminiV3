#!/usr/bin/env python3
"""
Interactive Deployment Configuration Helper
Helps set up environment variables on your deployment platform
"""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

def get_env_vars():
    """Get all environment variables needed for production"""
    return {
        'DB_HOST': os.getenv('DB_HOST'),
        'DB_PORT': os.getenv('DB_PORT'),
        'DB_USER': os.getenv('DB_USER'),
        'DB_PASSWORD': os.getenv('DB_PASSWORD'),
        'DB_NAME': os.getenv('DB_NAME'),
        'USE_MOCK_DB': 'false',
        'JWT_SECRET': os.getenv('JWT_SECRET'),
        'JWT_ALGORITHM': os.getenv('JWT_ALGORITHM', 'HS256'),
        'JWT_EXPIRATION_HOURS': os.getenv('JWT_EXPIRATION_HOURS', '24'),
        'CORS_ORIGINS': os.getenv('CORS_ORIGINS', '*'),
        'DEBUG': 'false',
    }

def print_env_vars():
    """Print environment variables in copy-paste format"""
    vars = get_env_vars()
    
    print("\n" + "=" * 70)
    print("COPY-PASTE THESE ENVIRONMENT VARIABLES TO YOUR DEPLOYMENT PLATFORM")
    print("=" * 70 + "\n")
    
    for key, value in vars.items():
        print(f"{key}={value}")
    
    print("\n" + "=" * 70 + "\n")

def print_railway_instructions():
    """Print Railway specific instructions"""
    print("""
🚂 RAILWAY DEPLOYMENT INSTRUCTIONS
=====================================

1. Go to: https://railway.app/account
2. Select your project (AluminiV2)
3. Click on your WEB SERVICE (not the MySQL)
4. Click "Variables" tab
5. Paste all the variables from above
6. Click "Deploy"

Done! Your server will restart with the real database.
    """)

def print_render_instructions():
    """Print Render specific instructions"""
    print("""
🎨 RENDER DEPLOYMENT INSTRUCTIONS
===================================

1. Go to: https://dashboard.render.com
2. Click your WEB SERVICE
3. Go to "Environment" section
4. Click "Add Environment Variable"
5. Paste all the variables from above
6. Click "Save"
7. Render will auto-deploy with new variables

Done! Your server will restart with the real database.
    """)

def main():
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║         AlumUnity Deployment Configuration Helper                 ║
║                   (Use Real Database)                             ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    # Show the variables
    print_env_vars()
    
    # Ask which platform
    print("\nWhich platform are you deploying on?")
    print("1. Railway")
    print("2. Render")
    print("3. Other")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        print_railway_instructions()
    elif choice == "2":
        print_render_instructions()
    else:
        print("""
For other platforms:
1. Copy the environment variables above
2. Set them in your platform's environment/variables section
3. Make sure USE_MOCK_DB=false
4. Redeploy/restart your service
        """)
    
    print("\n✅ After setting the variables:")
    print("   - Redeploy your service")
    print("   - Wait 2-3 minutes for startup")
    print("   - Test: curl https://your-url/api/health")
    print("   - Should show 'production' mode\n")

if __name__ == "__main__":
    main()
