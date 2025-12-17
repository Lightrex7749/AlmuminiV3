# 🚀 Quick Deployment Commands

## Deploy Backend to Railway

```bash
# 1. Make sure all files are committed
git add .
git commit -m "Ready for Railway deployment"
git push origin main

# 2. Install Railway CLI (if not already installed)
npm install -g @railway/cli

# 3. Login to Railway
railway login

# 4. Link to your Railway project
railway link

# 5. Deploy backend
railway up

# 6. Set environment variables
railway variables set DB_HOST=yamabiko.proxy.rlwy.net
railway variables set DB_PORT=42030
railway variables set DB_USER=root
railway variables set DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
railway variables set DB_NAME=railway
railway variables set USE_MOCK_DB=false
railway variables set JWT_SECRET_KEY=$(openssl rand -hex 32)
railway variables set CORS_ORIGINS=http://localhost:3000

# 7. Get your Railway URL
railway domain
```

## Deploy Frontend to Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Update netlify.toml with Railway backend URL
# Edit netlify.toml and replace REACT_APP_BACKEND_URL

# 4. Commit changes
git add netlify.toml
git commit -m "Update backend URL"
git push origin main

# 5. Deploy to Netlify
cd frontend
netlify deploy --prod

# 6. Follow prompts:
# - Create & configure new site: Yes
# - Build command: npm run build
# - Publish directory: build
```

## Update CORS After Netlify Deployment

```bash
# Get your Netlify URL and update Railway CORS
railway variables set CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000
railway variables set FRONTEND_URL=https://your-app.netlify.app
```

## Generate Strong JWT Secret (Windows PowerShell)

```powershell
# Generate random 32-byte hex string
-join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

## Verify Deployment

```bash
# Check Railway backend health
curl https://your-railway-app.up.railway.app/api/health

# Check Netlify frontend
curl https://your-app.netlify.app

# Test login API
curl -X POST https://your-railway-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alumni.edu","password":"Admin@123"}'
```

## Quick Test After Deployment

1. **Frontend:** Visit `https://your-app.netlify.app`
2. **Login:** Use `admin@alumni.edu` / `Admin@123`
3. **Check Dashboard:** Should load with sample data
4. **Test Jobs:** Create a new job posting
5. **Change Password:** Go to settings and change admin password

## Redeploy After Changes

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Railway and Netlify will auto-deploy!
```

## Troubleshooting

**Railway deployment failed:**
```bash
railway logs  # View deployment logs
railway status  # Check project status
```

**Netlify build failed:**
```bash
netlify logs  # View build logs
```

**CORS errors:**
```bash
# Check CORS_ORIGINS includes your Netlify URL
railway variables
```

**Database connection issues:**
```bash
# Test Railway MySQL connection
railway run python backend/check_data.py
```
