# Deploy Backend to Render - Quick Steps

## Step 1: Prepare for Render Deployment

Your backend is ready to deploy. For now, we'll deploy with mock mode enabled (USE_MOCK_DB=true) until the database connection is fixed.

### Update .env for Render:
```
USE_MOCK_DB=true
FLASK_ENV=production
SECRET_KEY=your-random-secret-key
```

## Step 2: Push to GitHub

```powershell
cd D:\ProjectsGit\v3\AluminiV2
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

## Step 3: Create Render Web Service

1. Go to: https://dashboard.render.com
2. Click **"New"** → **"Web Service"**
3. Select your GitHub repository
4. Fill in:
   - **Name**: `alumunity-backend`
   - **Environment**: `Python 3.11`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python server.py`
   - **Region**: Select Singapore (same as DB)
5. Click **"Create Web Service"**

## Step 4: Add Environment Variables in Render

In your Web Service → **Environment**:
```
DATABASE_URL=postgresql://aluminidb_9z47_user:25SmqZ6xAzaA3WmXqAnNshUsZeiTn0KZ@dpg-d5h1rdmr433s73bf3e30-a.singapore-postgres.render.com/aluminidb_9z47
USE_MOCK_DB=true
JWT_SECRET=316c808f1b97ac0cd433159cc092d4ed93224a030493eb939f8c1ac66bdac0bd
```

## Step 5: Deploy & Get Backend URL

Render will auto-deploy from GitHub. Once done (green checkmark), you'll get a URL like:
```
https://alumunity-backend.onrender.com
```

## Step 6: Update Frontend

Update `frontend/.env`:
```
REACT_APP_BACKEND_URL=https://alumunity-backend.onrender.com
```

Then deploy frontend.

---

## Database Issue - Alternative Solution

Since the Render database connection is failing:

**Option A**: Wait 24 hours - sometimes Render databases need time to fully initialize
**Option B**: Delete and recreate the database on Render
**Option C**: Use Railway database instead (faster provisioning)
**Option D**: Continue with mock mode - works perfectly for demo

Which would you prefer?
