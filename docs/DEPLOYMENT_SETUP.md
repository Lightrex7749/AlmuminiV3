# Deployment Setup Guide

This guide explains how to properly configure the AlumUnity application for production deployment.

## Current Stack

- **Frontend**: React on Netlify (https://flourishing-strudel-8f0d0b.netlify.app)
- **Backend**: FastAPI on Render (https://alumunity-backendv3.onrender.com)
- **Database**: Railway MySQL
- **Email**: SendGrid

## Critical Configuration Issues & Solutions

### 1. Email Verification & SendGrid Setup ✅

**Issue**: Email verification endpoint returning 400 Bad Request; SendGrid HTTP 403 Forbidden

**Root Cause**: Missing `SENDGRID_API_KEY` and `FROM_EMAIL` environment variables

**Solution**:

1. **Get SendGrid API Key**:
   - Go to https://app.sendgrid.com
   - Navigate to Settings → API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key (you'll only see it once!)

2. **Configure on Render**:
   - Login to Render dashboard
   - Go to "alumunity-backendv3" service
   - Click "Environment"
   - Add these variables:
     ```
     SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
     FROM_EMAIL=noreply@alumunity.com
     ```

3. **Verify Sender Email**:
   - In SendGrid, go to Settings → Sender Authentication
   - Verify the email domain or single sender (noreply@alumunity.com)
   - This prevents the 403 Forbidden error

4. **Test the Flow**:
   ```
   Register new user → Email sent with OTP → User verifies email → Auto-login
   ```

### 2. Database Connection ✅

**Variables needed on Render**:
```
DB_HOST=yamabiko.proxy.rlwy.net
DB_PORT=42030
DB_USER=root
DB_PASSWORD=dHWAplhWXQrMGslMpLEaIJrNJWOTSunB
DB_NAME=railway
USE_MOCK_DB=false
```

### 3. JWT Authentication ✅

**Variable needed**:
```
JWT_SECRET=<strong-random-secret-key>
```

Generate with:
```bash
openssl rand -hex 32
```

### 4. CORS Configuration ✅

**Variables needed**:
```
CORS_ORIGINS=https://flourishing-strudel-8f0d0b.netlify.app,http://localhost:3000,http://localhost:5999
FRONTEND_URL=https://flourishing-strudel-8f0d0b.netlify.app
```

## Recent Fixes (Deployed)

### Backend Changes

1. **Mentor Profile Endpoint** (routes/mentorship.py)
   - Changed endpoint to use `get_mentor_with_details()` instead of `get_mentor_profile()`
   - Now returns nested profile data including photo URLs
   - Status: ✅ Working

2. **SendGrid Configuration** (.env)
   - Added `SENDGRID_API_KEY` and `FROM_EMAIL`
   - Email service now initializes correctly
   - Status: ✅ Committed

### Frontend Changes

1. **JobCard Component Optimization**
   - Added `profileFetched` state to prevent repeated API calls
   - Eliminates 404 error spam in console
   - Status: ✅ Committed and deployed

2. **Axios Response Interceptor**
   - Added caching for failed profile lookups
   - Suppresses expected 404 errors
   - Status: ✅ Committed and deployed

## Deployment Checklist

### Before Production Deploy

- [ ] SendGrid API key configured on Render
- [ ] Sender email verified in SendGrid
- [ ] Database credentials verified
- [ ] JWT secret configured
- [ ] CORS origins include production frontend URL
- [ ] All commits pushed to GitHub
- [ ] Render service redeploys from main branch

### Testing Production

1. **Email Verification Flow**:
   ```
   1. Go to https://flourishing-strudel-8f0d0b.netlify.app/register
   2. Fill out form and submit
   3. Check email for verification code
   4. Enter code on verification page
   5. Should auto-login to dashboard
   ```

2. **Mentor Profile**:
   ```
   1. Go to Mentorship page
   2. Click on mentor profile
   3. Profile picture should display (from photo_url)
   4. No repeated 404 errors in console
   ```

## Troubleshooting

### Email not sending (403 Forbidden)

1. Check SendGrid API key is correct in Render environment
2. Verify sender email is authenticated in SendGrid settings
3. Check that API key has "Mail Send" permissions

### Email not sending (401 Unauthorized)

1. Regenerate API key in SendGrid
2. Update in Render environment
3. Restart the service

### 400 Bad Request on /api/auth/verify-email

1. Check that payload includes both `email` and `otp_code`
2. OTP code must be exactly 6 digits
3. OTP must not be expired (15 minute window)

### Mentor profile pictures not showing

1. Verify backend endpoint returns `profile.photo_url`
2. Test: GET `/api/mentors/{user_id}` should return full nested profile
3. Check that response structure matches expected format:
   ```json
   {
     "success": true,
     "data": {
       "profile": {
         "photo_url": "https://..."
       }
     }
   }
   ```

## Production Environment File Template

See `.env.production` for a template. Key differences from development:

| Variable | Dev | Prod |
|----------|-----|------|
| `USE_MOCK_DB` | false | false |
| `DEBUG` | True | False |
| `API_RELOAD` | true | false |
| `SENDGRID_API_KEY` | test-key | real SG key |
| `JWT_SECRET` | simple | strong random |

## Monitoring

Monitor these error logs on Render:

1. **Email Service Errors**: Look for SendGrid HTTP 403 or 401
2. **Verification Errors**: Look for "Invalid or expired OTP"
3. **Database Errors**: Look for connection timeouts or auth failures

Set up email alerts in Render to notify on deploy failures.

## Next Steps

1. Configure SendGrid API key on Render
2. Verify sender email in SendGrid
3. Test registration → verification → login flow
4. Deploy recent fixes to production
5. Monitor error logs for 24 hours
6. Celebrate! 🎉

