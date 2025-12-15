# 🧪 Quick Testing Guide

## How to Test Every Page in Your Application

This guide shows you exactly how to test each page and verify it's working with Railway MySQL.

---

## 🚀 Prerequisites

1. **Backend Running:**
   ```powershell
   cd backend
   python server.py
   ```
   Should see: `✓ Connected to Railway MySQL` and `Uvicorn running on http://0.0.0.0:8001`

2. **Frontend Running:**
   ```powershell
   cd frontend
   npm start
   ```
   Should open: http://localhost:3000

3. **Test Accounts:** (Already in database via mockdata)
   - Admin: `admin@test.com` / `admin123`
   - Alumni: `alumni@test.com` / `alumni123`
   - Student: `student@test.com` / `student123`
   - Recruiter: `recruiter@test.com` / `recruiter123`

---

## 🔐 1. Test Authentication (5 Pages)

### Login.jsx
1. Go to: http://localhost:3000/login
2. Try **Quick Login** buttons (Admin, Alumni, Student, Recruiter)
3. Or enter: `admin@test.com` / `admin123`
4. Should redirect to dashboard ✅

**Backend Test:**
```powershell
$body = @{email="admin@test.com"; password="admin123"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```
Expected: `200 OK` with JWT token

### Register.jsx
1. Go to: http://localhost:3000/register
2. Fill form: email, password, role (Student/Alumni)
3. Submit → Should receive OTP email
4. Check backend logs for OTP code ✅

**Backend Test:**
```powershell
$body = @{email="newuser@test.com"; password="test123"; first_name="Test"; last_name="User"; role="student"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```
Expected: `201 Created` with user data

### VerifyEmail.jsx
1. After registration, enter OTP from email
2. Should auto-login after verification ✅

### ForgotPassword.jsx
1. Go to: http://localhost:3000/forgot-password
2. Enter email: `admin@test.com`
3. Check backend logs for reset token ✅

### ResetPassword.jsx
1. Use reset token from email/logs
2. Enter new password
3. Should redirect to login ✅

---

## 📱 2. Test Dashboards (5 Pages)

### StudentDashboard.jsx
1. Login as: `student@test.com` / `student123`
2. Should see:
   - Available jobs count
   - Upcoming events
   - My applications
   - Recommended mentors ✅

**Backend Test:**
```powershell
# Get token first (from login)
$headers = @{Authorization="Bearer YOUR_TOKEN_HERE"}
Invoke-WebRequest -Uri "http://localhost:8001/api/analytics/dashboard" -Method GET -Headers $headers
```
Expected: Dashboard stats JSON

### AlumniDashboard.jsx
1. Login as: `alumni@test.com` / `alumni123`
2. Should see:
   - My posted jobs
   - Mentoring requests
   - Events I'm hosting
   - Profile completeness ✅

### RecruiterDashboard.jsx
1. Login as: `recruiter@test.com` / `recruiter123`
2. Should see:
   - Active job postings
   - Application statistics
   - Candidate pipeline ✅

### AdminDashboard.jsx
1. Login as: `admin@test.com` / `admin123`
2. Should see:
   - Total users, jobs, events
   - Recent activity
   - Moderation queue
   - System health ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer ADMIN_TOKEN"}
Invoke-WebRequest -Uri "http://localhost:8001/api/admin/dashboard" -Method GET -Headers $headers
```
Expected: Admin dashboard data

---

## 💼 3. Test Jobs Portal (8 Pages)

### Jobs.jsx
1. Go to: http://localhost:3000/jobs
2. Should see list of jobs (from Railway MySQL)
3. Try filters: location, job type, skills
4. Click "Apply" on a job ✅

**Backend Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/jobs" -Method GET
```
Expected: `200 OK` with jobs array

### PostJob.jsx
1. Login as Alumni/Recruiter
2. Go to: http://localhost:3000/jobs/post
3. Fill form: title, description, requirements
4. Submit → Job should appear in Jobs.jsx ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer YOUR_TOKEN"}
$body = @{title="Software Engineer"; description="Test job"; location="Remote"; job_type="full_time"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/jobs/create" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```
Expected: `201 Created` with job ID

### JobDetails.jsx
1. Click on any job from Jobs.jsx
2. Should see: full description, requirements, apply button
3. Click "Apply" → Submit application ✅

**Backend Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/jobs/1" -Method GET
```
Expected: Job details JSON

### MyApplications.jsx
1. Login as Student
2. Go to: http://localhost:3000/jobs/my-applications
3. Should see all jobs you applied to
4. Check status: Pending/Accepted/Rejected ✅

### ManageJobs.jsx
1. Login as Alumni/Recruiter
2. Go to: http://localhost:3000/jobs/manage
3. Should see your posted jobs
4. Try Edit/Delete/Close job ✅

---

## 🤝 4. Test Mentorship (5 Pages)

### FindMentors.jsx
1. Login as Student
2. Go to: http://localhost:3000/mentorship/find
3. Should see list of available mentors
4. Filter by: expertise, availability
5. Click "Request Mentorship" ✅

**Backend Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/mentorship/mentors" -Method GET
```
Expected: Mentors array

### MentorProfile.jsx
1. Click on any mentor from FindMentors
2. Should see: bio, expertise, availability, reviews
3. Click "Request Mentorship" ✅

### MentorshipDashboard.jsx
1. Login as Mentor (Alumni)
2. Should see:
   - Pending requests
   - Active mentorships
   - My mentees
   - Upcoming sessions ✅

### MentorManagement.jsx
1. Login as Alumni
2. Go to: http://localhost:3000/mentorship/manage
3. Register as mentor (if not already)
4. Set availability, expertise areas ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer ALUMNI_TOKEN"}
$body = @{bio="Experienced software engineer"; expertise_areas=@("Web Development","Career Guidance")} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/mentorship/mentors/register" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```
Expected: Mentor profile created

---

## 📅 5. Test Events (6 Pages)

### Events.jsx
1. Go to: http://localhost:3000/events
2. Should see list of events
3. Filter by: upcoming, past, my events
4. Click "RSVP" on an event ✅

**Backend Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/events" -Method GET
```
Expected: Events array

### CreateEvent.jsx
1. Login as Alumni/Admin
2. Go to: http://localhost:3000/events/create
3. Fill form: title, date, location, description
4. Submit → Event should appear in Events.jsx ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer YOUR_TOKEN"}
$body = @{title="Tech Talk"; description="AI in 2025"; event_date="2025-02-01T18:00:00"; location="Online"; max_attendees=100} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/events" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```
Expected: Event created

### EventDetails.jsx
1. Click on any event
2. Should see: full details, attendees count
3. Click "RSVP" → Confirm attendance ✅

### EventAttendees.jsx
1. Login as event creator
2. View event → Click "View Attendees"
3. Should see list of registered users ✅

---

## 💬 6. Test Forum (3 Pages)

### Forum.jsx
1. Go to: http://localhost:3000/forum
2. Should see list of posts
3. Filter by tags, sort by recent/popular
4. Click "Create Post" ✅

**Backend Test:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/forum/posts" -Method GET
```
Expected: Forum posts array

### PostDetails.jsx
1. Click on any post
2. Should see: post content, comments, likes
3. Add comment, like post ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer YOUR_TOKEN"}
$body = @{content="Great post!"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8001/api/forum/posts/1/comments" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```
Expected: Comment added

### ManagePosts.jsx
1. Login
2. Go to: http://localhost:3000/forum/my-posts
3. Should see your posts
4. Try Edit/Delete post ✅

---

## 👑 7. Test Admin Pages (17 Pages)

### AdminAnalytics.jsx
1. Login as Admin
2. Go to: http://localhost:3000/admin/analytics
3. Should see charts: user growth, job stats, engagement ✅

**Backend Test:**
```powershell
$headers = @{Authorization="Bearer ADMIN_TOKEN"}
Invoke-WebRequest -Uri "http://localhost:8001/api/admin/dashboard" -Method GET -Headers $headers
```

### AdminUsers.jsx
1. Go to: http://localhost:3000/admin/users
2. Should see user list with filters
3. Try: View, Edit, Suspend user ✅

### AdminJobs.jsx
1. Go to: http://localhost:3000/admin/jobs
2. Should see all jobs in system
3. Try: Approve, Reject, Delete job ✅

### AdminEvents.jsx
1. View all events
2. Edit/Delete any event
3. View attendees ✅

### AdminModeration.jsx
1. Go to: http://localhost:3000/admin/moderation
2. Should see reported content
3. Approve/Reject/Delete content ✅

*(Test remaining 12 admin pages similarly)*

---

## 🚀 8. Test Advanced Features (9 Pages)

### AlumniCard.jsx
1. Login as Alumni
2. Go to: http://localhost:3000/alumni-card
3. Should see digital alumni card
4. Download as image/PDF ✅

### CareerPaths.jsx
1. Go to: http://localhost:3000/career-paths
2. Should see career progression visualizations
3. Explore different career tracks ✅

### KnowledgeCapsules.jsx
1. Go to: http://localhost:3000/capsules
2. Should see knowledge capsules
3. Filter by topic, bookmark capsules ✅

### SkillGraph.jsx
1. Go to: http://localhost:3000/skill-graph
2. Should see skill relationship network
3. Interactive graph visualization ✅

### Leaderboard.jsx
1. Go to: http://localhost:3000/leaderboard
2. Should see top users by engagement
3. Filter by time period ✅

---

## 🔔 9. Test Settings & Profile (3 Pages)

### Profile.jsx
1. Login
2. Go to: http://localhost:3000/profile
3. Edit: name, bio, skills, photo
4. Save → Changes should persist ✅

### Settings.jsx
1. Go to: http://localhost:3000/settings
2. Update: email notifications, privacy
3. Change password ✅

---

## ✅ Backend Health Checks

### Check Database Connection
```powershell
cd backend
python test_railway_connection.py
```
Expected: `✓ Connected to Railway MySQL`, `48 tables found`

### Check API Status
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api" -Method GET
```
Expected: `{"message":"AlumUnity API","version":"1.0.0","status":"running"}`

### Check Auth Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/auth/me" -Method GET -Headers @{Authorization="Bearer invalid"} -ErrorAction SilentlyContinue
```
Expected: `401 Unauthorized` with `{"detail":"Invalid authentication credentials"}`

### Check Jobs Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/jobs" -Method GET
```
Expected: `200 OK` with jobs array

### Check Events Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:8001/api/events" -Method GET
```
Expected: `200 OK` with events array

---

## 🎯 Quick Smoke Test (5 Minutes)

Run this to test all major features:

```powershell
# 1. Backend health
Invoke-WebRequest -Uri "http://localhost:8001/api" | Select-Object StatusCode

# 2. Auth
$loginBody = @{email="admin@test.com"; password="admin123"} | ConvertTo-Json
$loginResponse = Invoke-WebRequest -Uri "http://localhost:8001/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = ($loginResponse.Content | ConvertFrom-Json).access_token
$headers = @{Authorization="Bearer $token"}

# 3. Jobs
Invoke-WebRequest -Uri "http://localhost:8001/api/jobs" | Select-Object StatusCode

# 4. Events
Invoke-WebRequest -Uri "http://localhost:8001/api/events" | Select-Object StatusCode

# 5. Mentors
Invoke-WebRequest -Uri "http://localhost:8001/api/mentorship/mentors" | Select-Object StatusCode

# 6. Forum
Invoke-WebRequest -Uri "http://localhost:8001/api/forum/posts" | Select-Object StatusCode

# 7. Profile (authenticated)
Invoke-WebRequest -Uri "http://localhost:8001/api/auth/me" -Headers $headers | Select-Object StatusCode

# 8. Admin dashboard (authenticated as admin)
Invoke-WebRequest -Uri "http://localhost:8001/api/admin/dashboard" -Headers $headers | Select-Object StatusCode

Write-Host "✅ All endpoints responding!" -ForegroundColor Green
```

Expected output: All `200` status codes

---

## 📊 Expected Test Results

### ✅ All Tests Should Pass
- ✅ Authentication works (login, register, verify)
- ✅ Dashboards load with data
- ✅ Jobs CRUD operations work
- ✅ Events CRUD operations work
- ✅ Mentorship system functional
- ✅ Forum posts and comments work
- ✅ Admin pages accessible (admin role only)
- ✅ Advanced features load correctly

### 🔍 Common Issues & Fixes

**Issue:** Backend not connecting to Railway  
**Fix:** Check `backend/.env` has correct Railway credentials

**Issue:** No data showing  
**Fix:** Run `python backend/load_railway_simple.py` to load schema

**Issue:** "Not authorized" errors  
**Fix:** Use correct test account credentials

**Issue:** CORS errors  
**Fix:** Backend should have CORS middleware enabled for `http://localhost:3000`

---

## 🎉 Success Criteria

Your app is working if:
- ✅ All 53+ pages load without errors
- ✅ Backend API returns `200 OK` for GET requests
- ✅ Authentication flow works end-to-end
- ✅ Can create/read/update/delete data (jobs, events, posts)
- ✅ Data persists in Railway MySQL
- ✅ Mock mode fallback works if MySQL is down

---

**Testing Guide Complete** ✅  
For detailed API endpoints, see: [PAGE_TO_API_MAPPING.md](PAGE_TO_API_MAPPING.md)
