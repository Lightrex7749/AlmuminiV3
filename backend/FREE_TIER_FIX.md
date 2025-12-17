# 🚀 Free Tier Deployment Fix Guide

## Problem
Server works initially but times out after 2 hours on free tier (Render, Railway).

## Why This Happens
Free tier services:
- ❌ Spin down after inactivity (10-15 minutes)
- ❌ Have limited database/Redis connections
- ❌ May not have external services available
- ❌ Require explicit environment variables

## Solutions

### Option 1: Use Mock Database Mode (Recommended for Free Tier)
This is the **fastest** solution:

1. On your deployment platform (Render/Railway), set these environment variables:
   ```
   USE_MOCK_DB=true
   CORS_ORIGINS=*
   DEBUG=false
   ```

2. That's it! The server will use in-memory mock data and won't need a real database.

### Option 2: Fix Your Database Configuration
If you want to use a real database:

1. **On Railway**: 
   - Add MySQL service to your project
   - Go to MySQL → Variables tab
   - Copy `DATABASE_URL` or the individual connection variables
   - Set them in your service variables

2. **On Render**:
   - Create a PostgreSQL database (Render doesn't offer MySQL on free tier)
   - Add connection variables to your service

3. Make sure these are set:
   ```
   DB_HOST=your-host
   DB_PORT=3306
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_NAME=your-database
   USE_MOCK_DB=false
   ```

### Option 3: Add Health Check Endpoint
Prevent spin-down by adding ping traffic:
- Use a free service like **Uptime Robot** (uptime-robot.com)
- Set it to ping `https://your-domain/health` every 5 minutes
- This keeps your service active

## Testing Locally First
Before deploying, test with:
```bash
cd backend
export USE_MOCK_DB=true
python -m uvicorn server:app --host 0.0.0.0 --port 8001
```

Then visit: `http://localhost:8001/docs` to see if API works

## Current Setup
Your server already has fallback support for:
- ✅ Mock database (when DB_HOST not available)
- ✅ Graceful Redis connection failure
- ✅ Dynamic port binding from environment

Just set `USE_MOCK_DB=true` and you're good to go!
