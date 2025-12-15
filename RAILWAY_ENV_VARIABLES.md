# Railway Environment Variables Configuration

Copy and paste these exact values into your Railway project environment variables.

## 🔧 Railway Dashboard Setup

1. Go to: https://railway.app/
2. Select your backend project
3. Click "Variables" tab
4. Click "New Variable" for each one below
5. Copy-paste the exact values

---

## 📋 Required Environment Variables

### Database Configuration (Railway MySQL)
```bash
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
DB_NAME=railway
USE_MOCK_DB=false
```

### JWT Authentication
```bash
JWT_SECRET_KEY=REPLACE_WITH_GENERATED_SECRET_BELOW
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
```

**Generate your JWT secret:**
Run this command locally:
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and replace `REPLACE_WITH_GENERATED_SECRET_BELOW` above.

### CORS Configuration (Frontend Access)
```bash
CORS_ORIGINS=https://flourishing-strudel-8f0d0b.netlify.app,http://localhost:3000
FRONTEND_URL=https://flourishing-strudel-8f0d0b.netlify.app
```

### API Configuration
```bash
API_HOST=0.0.0.0
PORT=8001
```

**Note:** Railway uses `PORT` environment variable (not `API_PORT`)

---

## 🚀 Quick Copy-Paste (One by One)

**Variable 1:**
- Name: `DB_HOST`
- Value: `yamabiko.proxy.rlwy.net`

**Variable 2:**
- Name: `DB_PORT`
- Value: `42030`

**Variable 3:**
- Name: `DB_USER`
- Value: `root`

**Variable 4:**
- Name: `DB_PASSWORD`
- Value: `dHWAplhWXQrMGslMpLEaIJrNJWOTSunB`

**Variable 5:**
- Name: `DB_NAME`
- Value: `railway`

**Variable 6:**
- Name: `USE_MOCK_DB`
- Value: `false`

**Variable 7:**
- Name: `JWT_SECRET_KEY`
- Value: `[RUN: python -c "import secrets; print(secrets.token_hex(32))"]`

**Variable 8:**
- Name: `JWT_ALGORITHM`
- Value: `HS256`

**Variable 9:**
- Name: `JWT_EXPIRATION_MINUTES`
- Value: `1440`

**Variable 10:**
- Name: `CORS_ORIGINS`
- Value: `https://flourishing-strudel-8f0d0b.netlify.app,http://localhost:3000`

**Variable 11:**
- Name: `FRONTEND_URL`
- Value: `https://flourishing-strudel-8f0d0b.netlify.app`

**Variable 12:**
- Name: `PORT`
- Value: `8001`

---

## ✅ Verification After Adding Variables

1. Click "Deploy" in Railway to restart with new variables
2. Wait for deployment to complete (~2-3 minutes)
3. Check deployment logs for:
   - ✅ "Connected to Railway MySQL"
   - ✅ "AlumUnity API started successfully"
4. Get your Railway domain (Settings → Networking → Generate Domain)
5. Test health endpoint: `https://your-app.up.railway.app/api/health`

---

## 🔄 After Railway Deployment

Update Netlify with your Railway backend URL:

**Option A: Update netlify.toml**
```toml
[build.environment]
  REACT_APP_BACKEND_URL = "https://your-railway-app.up.railway.app"
```

Then commit and push:
```bash
git add netlify.toml
git commit -m "Update backend URL to Railway production"
git push origin main
```

**Option B: Netlify Dashboard**
1. Go to: https://app.netlify.com/sites/flourishing-strudel-8f0d0b/settings/deploys
2. Click "Environment" → "Environment variables"
3. Add new variable:
   - Key: `REACT_APP_BACKEND_URL`
   - Value: `https://your-railway-app.up.railway.app`
4. Click "Save"
5. Trigger new deploy: Deploys → Trigger deploy → Deploy site

---

## 🧪 Test Your Live Application

Once both frontend and backend are deployed:

1. **Visit:** https://flourishing-strudel-8f0d0b.netlify.app/
2. **Login:** `admin@alumni.edu` / `Admin@123`
3. **Test:**
   - Dashboard loads with data ✅
   - Jobs page shows 5 jobs ✅
   - Events page shows 5 events ✅
   - Forum shows 4 posts ✅

4. **Check browser console:**
   - API calls to `https://your-railway-app.up.railway.app` ✅
   - No CORS errors ✅
   - 200 OK responses ✅

---

## ⚠️ Security Reminder

**IMMEDIATELY after successful deployment:**

1. **Login to your app**
2. **Go to Settings → Change Password**
3. **Change admin password from `Admin@123` to a strong password**

---

## 📝 Checklist

- [ ] Added all 12 environment variables to Railway
- [ ] Generated unique JWT secret key
- [ ] Railway deployment completed successfully
- [ ] Got Railway domain URL
- [ ] Updated Netlify with Railway backend URL
- [ ] Netlify redeployed with new backend URL
- [ ] Tested login on production site
- [ ] Changed admin password
- [ ] Verified all features work

---

**Your app will be fully live once all variables are set!** 🚀
