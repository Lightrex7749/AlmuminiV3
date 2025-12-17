# ⚠️ IMPORTANT: Security Checklist Before Going Live

## 🔴 CRITICAL - Do These BEFORE Production Deployment

### 1. Change JWT Secret Key ⚠️
**Current:** Using default/weak secret  
**Action Required:**

```bash
# Generate strong secret (32 bytes)
openssl rand -hex 32

# Or PowerShell:
-join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Update in Railway:
railway variables set JWT_SECRET_KEY=<YOUR_GENERATED_SECRET>
```

### 2. Change Admin Password ⚠️
**Current:** `Admin@123` (publicly visible in sample data)  
**Action Required:**
1. Deploy application
2. Login with `admin@alumni.edu` / `Admin@123`
3. **IMMEDIATELY** go to Settings → Change Password
4. Use strong password (12+ chars, mixed case, numbers, symbols)

### 3. Update CORS Origins ⚠️
**Current:** Allows all origins (`*`)  
**Action Required:**

```bash
# After getting Netlify URL, update:
railway variables set CORS_ORIGINS=https://your-app.netlify.app,http://localhost:3000
railway variables set FRONTEND_URL=https://your-app.netlify.app
```

### 4. Review Sample Data ⚠️
**Current:** Sample users with weak passwords  
**Action Required:**

Either:
- **Option A:** Delete sample users after testing
- **Option B:** Change all sample user passwords
- **Option C:** Add disclaimer that sample data is for demo only

```sql
-- Delete all sample users (keep admin)
DELETE FROM users WHERE email != 'admin@alumni.edu';
```

### 5. Environment Variables Check ⚠️

**Verify Railway has these set:**
```bash
✅ DB_HOST=yamabiko.proxy.rlwy.net
✅ DB_PORT=42030
✅ DB_USER=root
✅ DB_PASSWORD=<YOUR_RAILWAY_PASSWORD>
✅ DB_NAME=railway
✅ USE_MOCK_DB=false
✅ JWT_SECRET_KEY=<STRONG_SECRET_HERE>
✅ JWT_ALGORITHM=HS256
✅ CORS_ORIGINS=<YOUR_NETLIFY_URL>
```

### 6. Sensitive Files Check ⚠️

**Verify NOT in GitHub:**
```bash
✅ backend/.env (in .gitignore)
✅ backend/.env.production (in .gitignore)
✅ Database credentials not in code
```

**Check .gitignore includes:**
```
backend/.env
backend/.env.*
*.pyc
__pycache__/
node_modules/
.DS_Store
```

## ✅ RECOMMENDED - Security Enhancements

### 1. Enable Email Verification
**Status:** Currently optional  
**Recommendation:** Make email verification required

```python
# In backend/.env
REQUIRE_EMAIL_VERIFICATION=true
```

### 2. Rate Limiting
**Status:** Already implemented ✅  
**Verify:** Rate limiter is active in middleware

### 3. HTTPS Only
**Status:** Netlify provides free SSL ✅  
**Railway:** Also provides free SSL ✅  
**Action:** Ensure `https://` URLs are used

### 4. Database Backups
**Action Required:**
```bash
# Set up automated backups in Railway
Railway Dashboard → MySQL Service → Backups → Enable
```

### 5. Session Timeout
**Current:** JWT expires in 24 hours  
**Recommendation:** Consider reducing to 4-8 hours

```bash
railway variables set JWT_EXPIRATION_MINUTES=480  # 8 hours
```

## 🔒 POST-DEPLOYMENT Security Tasks

### Immediately After Going Live:

1. **Test Security:**
```bash
# Try login with wrong credentials (should fail)
# Try accessing admin routes without token (should 401)
# Try SQL injection in forms (should be sanitized)
```

2. **Monitor Logs:**
```bash
# Watch for suspicious activity
railway logs --tail

# Check for failed login attempts
# Look for unusual API patterns
```

3. **Set Up Alerts:**
- Railway: Enable email alerts for downtime
- Netlify: Enable deploy notifications
- Consider using Sentry for error tracking

4. **Document Credentials:**
- Store admin credentials in password manager
- Share database access securely (not via plain text)
- Keep Railway/Netlify login secure

## 📋 Security Checklist

**Before deployment:**
- [ ] Generated strong JWT secret (32+ bytes)
- [ ] Removed sample data or changed passwords
- [ ] Updated CORS to specific domains
- [ ] Verified .env files not in git
- [ ] Enabled HTTPS on both frontend/backend
- [ ] Set up database backups

**After deployment:**
- [ ] Changed admin password
- [ ] Tested authentication works
- [ ] Verified CORS blocking unauthorized origins
- [ ] Checked logs for errors
- [ ] Tested all major features work
- [ ] Set up monitoring/alerts

## ⚠️ Known Weak Points to Address

1. **Sample Data Passwords:** All use same format (`Alumni@123`)
2. **Default Admin:** Email is `admin@alumni.edu` (predictable)
3. **No 2FA:** Consider adding two-factor authentication
4. **No Rate Limiting on Login:** Could be brute-forced
5. **Session Management:** No session invalidation on password change

## 🛡️ Recommended Next Steps

1. **Add 2FA** for admin accounts
2. **Implement login rate limiting** (5 attempts per IP per hour)
3. **Add password complexity requirements**
4. **Set up monitoring** (Sentry, LogRocket, etc.)
5. **Regular security audits** of dependencies
6. **Add CAPTCHA** on registration/login
7. **Implement session management** with Redis

## 📞 Emergency Contacts

If your application is compromised:

1. **Immediately:**
   - Change all passwords
   - Rotate JWT secret
   - Review Railway logs for breach
   - Disable compromised accounts

2. **Notify:**
   - Database administrator
   - All registered users (if data exposed)

3. **Investigate:**
   - Check audit logs
   - Review database for unauthorized changes
   - Scan for malicious code injection

---

**Remember:** Security is an ongoing process, not a one-time setup!

🔒 **Deploy safely!**
