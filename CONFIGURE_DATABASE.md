# 🗄️ Configure Real Database on Free Tier Deployment

## Your Database Info
You're using **Railway MySQL** with these connection details:
- **Host**: yamabiko.proxy.rlwy.net
- **Port**: 42030
- **User**: root
- **Password**: dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
- **Database**: railway

## ⚠️ IMPORTANT SECURITY NOTICE
Your `.env` file is in `.gitignore`, so credentials are NOT pushed to GitHub (good!).
But you MUST set these in your deployment platform.

---

## If Deploying on RAILWAY

### Step 1: Add MySQL Database to Your Project
1. Go to your Railway project dashboard
2. Click **New** → **Database** → **MySQL**
3. Wait for it to provision (2-3 minutes)

### Step 2: Get Connection Variables
1. Click the MySQL service in the dashboard
2. Go to **Variables** tab
3. You'll see all connection variables

### Step 3: Copy Environment Variables
Copy these EXACTLY to your web service:
```
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
DB_NAME=railway
USE_MOCK_DB=false
```

### Step 4: How to Set Variables on Railway
1. Click your **web service** (AluminiV2 or whatever you named it)
2. Go to **Variables** tab
3. Add each variable manually OR
4. Click "View variables" → paste from above

### Step 5: Deploy
Click **Deploy** button. Your server will restart with real database!

---

## If Deploying on RENDER

### Step 1: Create PostgreSQL Database (or use external MySQL)
- Render free tier uses PostgreSQL, not MySQL
- Your MySQL is already on Railway, so we'll connect to that instead

### Step 2: Set Environment Variables on Render
1. Go to your Render service dashboard
2. Click **Environment**
3. Add these variables:
```
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
DB_NAME=railway
USE_MOCK_DB=false
JWT_SECRET=316c808f1b97ac0cd433159cc092d4ed93224a030493eb939f8c1ac66bdac0bd
CORS_ORIGINS=https://your-frontend-url.com
```

### Step 3: Deploy
Click **Manual Deploy** or push to GitHub to trigger auto-deploy.

---

## ✅ Testing Your Database Connection

After deploying, test with:
```
curl https://your-deployment-url/api/health
```

You should see:
```json
{
  "status": "healthy",
  "mode": "production",
  "database": "connected",
  "service": "AlumUnity API"
}
```

If it says "mock" mode, your environment variables didn't get set!

---

## 🔧 Troubleshooting

### "Port scan timeout reached"
- ❌ Environment variables not set on deployment platform
- ✅ Solution: Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` explicitly

### "Connection refused"
- ❌ Firewall blocking connection to Railway MySQL
- ✅ Solution: Make sure your Railway MySQL allows external connections
  - Go to Railway MySQL service → Settings → check "Public Networking" is enabled

### "Unknown database 'railway'"
- ❌ Database name wrong
- ✅ Check your Railway dashboard for correct database name

---

## 📋 Checklist

- [ ] Database connection variables set on deployment platform
- [ ] `USE_MOCK_DB=false` in environment variables
- [ ] Database is accessible from internet (not blocked by firewall)
- [ ] Redeployed after setting variables
- [ ] Tested `/api/health` endpoint shows "production" mode

