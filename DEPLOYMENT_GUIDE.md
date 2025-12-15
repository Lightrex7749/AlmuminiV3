# 🚀 Deployment Guide - Railway + Netlify

## Complete Production Deployment Guide

This guide will deploy your application with:
- **Backend:** Railway (FastAPI + MySQL)
- **Frontend:** Netlify (React)
- **Database:** Railway MySQL (already set up)

---

## 📋 Prerequisites

- ✅ Railway account (free tier)
- ✅ Netlify account (free tier)
- ✅ GitHub repository with latest code
- ✅ Railway MySQL database running (you already have this!)

---

## 🔧 Part 1: Deploy Backend to Railway

### Step 1: Push All Changes to GitHub

```bash
git add .
git commit -m "Add Railway and Netlify deployment configs"
git push origin main
```

### Step 2: Create Railway Project for Backend

1. **Go to Railway:** https://railway.app/
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository:** `Lightrex7749/AlmuminiV3`
5. **Click "Deploy Now"**

### Step 3: Configure Environment Variables

In Railway project settings, add these environment variables:

```bash
# Database (use your existing Railway MySQL credentials)
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
DB_NAME=railway
USE_MOCK_DB=false

# JWT Secret (CRITICAL: Generate a new one!)
# Run this locally: openssl rand -hex 32
JWT_SECRET_KEY=<YOUR_GENERATED_SECRET_HERE>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# API Config
API_HOST=0.0.0.0
API_PORT=8001

# CORS (update after Netlify deployment)
CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000
FRONTEND_URL=https://your-app.netlify.app
```

### Step 4: Get Your Railway Backend URL

After deployment completes:
1. Click "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `your-project.up.railway.app`)
4. **Save this URL** - you'll need it for frontend!

---

## 🎨 Part 2: Deploy Frontend to Netlify

### Step 1: Update Frontend API URL

Before deploying, update Netlify config with your Railway backend URL:

**Edit `netlify.toml`:**
```toml
[build.environment]
  REACT_APP_BACKEND_URL = "https://your-railway-backend.up.railway.app"
```

**Commit and push:**
```bash
git add netlify.toml
git commit -m "Update backend URL for production"
git push origin main
```

### Step 2: Deploy to Netlify

**Option A: Netlify CLI (Recommended)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify deploy --prod
```

**Option B: Netlify Dashboard**
1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
5. Click "Deploy site"

### Step 3: Get Your Netlify URL

After deployment:
1. Copy your Netlify URL (e.g., `your-app.netlify.app`)
2. **Go back to Railway** and update CORS settings

### Step 4: Update Railway CORS Settings

In Railway backend environment variables, update:
```bash
CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000
FRONTEND_URL=https://your-app.netlify.app
```

Click "Deploy" to restart with new settings.

---

## 🔐 Part 3: Security Setup (CRITICAL!)

### 1. Generate Strong JWT Secret

**On your local machine:**
```bash
# Windows PowerShell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Update Railway environment variable:**
- Set `JWT_SECRET_KEY` to the generated value

### 2. Change Default Admin Password

After deployment:
1. Login to your app with: `admin@alumni.edu` / `Admin@123`
2. **Immediately** go to Settings and change password!

### 3. Update Sample Data Passwords (Optional)

If you want to change all test account passwords:
```bash
# Connect to Railway MySQL
# Delete old users and re-insert with new passwords
```

---

## ✅ Part 4: Verify Deployment

### Backend Health Check

Visit: `https://your-railway-backend.up.railway.app/api/health`

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "AlumUnity API"
}
```

### Frontend Check

Visit: `https://your-app.netlify.app`

1. Should see login page
2. Try logging in with test account
3. Check if dashboard loads with data

### API Connection Test

Open browser console on frontend and check Network tab:
- API calls should go to Railway backend
- Should see `200 OK` responses
- JWT token in Authorization headers

---

## 🔄 Part 5: Enable Auto-Deploy

### Railway Auto-Deploy
✅ **Already enabled!** Railway auto-deploys on every push to `main`

### Netlify Auto-Deploy
✅ **Already enabled!** Netlify auto-deploys on every push to `main`

**To deploy updates:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Railway and Netlify will automatically redeploy!

---

## 🌐 Part 6: Custom Domain (Optional)

### Add Custom Domain to Netlify

1. Go to Netlify Dashboard → Domain settings
2. Click "Add custom domain"
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions
5. Netlify provides free SSL certificate

### Add Custom Domain to Railway

1. Go to Railway project → Settings → Networking
2. Click "Custom Domain"
3. Enter your backend subdomain: `api.yourdomain.com`
4. Update DNS with provided CNAME record

**Update CORS after custom domain:**
```bash
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 Part 7: Monitoring & Logs

### Railway Logs
```bash
# View backend logs
Railway Dashboard → Your Project → Deployments → View Logs
```

### Netlify Logs
```bash
# View build and deploy logs
Netlify Dashboard → Your Site → Deploys → View Logs
```

### Database Monitoring
```bash
# Check Railway MySQL metrics
Railway Dashboard → MySQL Service → Metrics
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** 502 Bad Gateway
**Solution:** Check Railway logs for startup errors. Verify all environment variables are set.

**Problem:** Database connection failed
**Solution:** Verify Railway MySQL is running and credentials are correct.

**Problem:** CORS errors
**Solution:** Check `CORS_ORIGINS` includes your Netlify URL.

### Frontend Issues

**Problem:** API calls failing
**Solution:** Check `REACT_APP_BACKEND_URL` in `netlify.toml` matches Railway URL.

**Problem:** Build failed
**Solution:** Check Netlify build logs. Ensure Node version is 20 in `netlify.toml`.

**Problem:** 404 on page refresh
**Solution:** Already handled by `[[redirects]]` in `netlify.toml`.

---

## 📝 Deployment Checklist

**Before deploying:**
- [ ] Updated `netlify.toml` with Railway backend URL
- [ ] Generated strong JWT secret
- [ ] Committed all changes to GitHub
- [ ] Verified Railway MySQL has sample data

**After deploying:**
- [ ] Changed admin password
- [ ] Tested login on production frontend
- [ ] Verified API health endpoint
- [ ] Updated CORS origins in Railway
- [ ] Tested all major features (jobs, events, forum)
- [ ] Checked browser console for errors

---

## 🎉 Success!

Your application is now live:
- **Frontend:** https://your-app.netlify.app
- **Backend API:** https://your-backend.up.railway.app
- **Database:** Railway MySQL (shared with your friend)

**Share these URLs with your friend:**
- Frontend: For regular users
- Database: `yamabiko.proxy.rlwy.net:42030` (for database access)

---

## 🔄 Future Updates

To update your deployed app:

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main
```

✅ Railway redeploys backend automatically  
✅ Netlify redeploys frontend automatically  

**Deployment time:** ~2-5 minutes

---

## 💰 Cost Breakdown (Free Tier)

- **Railway:** $5/month credit (enough for backend + MySQL)
- **Netlify:** Free (100GB bandwidth/month)
- **Domain (optional):** ~$10/year

**Total:** FREE (within limits) ✅

---

**Need help?** Check logs first, then refer to troubleshooting section above.
