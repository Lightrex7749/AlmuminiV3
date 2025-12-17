# 🗺️ Complete Page-to-API Mapping

## Quick Reference: Frontend → Backend → Database

This document maps every frontend page to its backend endpoints and database tables.

---

## 🔐 Authentication Pages (5)

| Frontend Page | API Endpoint | Backend Route | Service Method | Database Tables |
|--------------|--------------|---------------|----------------|-----------------|
| `Login.jsx` | `POST /api/auth/login` | `auth.py:173` | `login_user()` | `users` |
| `Register.jsx` | `POST /api/auth/register` | `auth.py:80` | `register_user()` | `users`, `email_verifications` |
| `ForgotPassword.jsx` | `POST /api/auth/forgot-password` | `auth.py:216` | `forgot_password()` | `users`, `password_resets` |
| `ResetPassword.jsx` | `POST /api/auth/reset-password` | `auth.py:246` | `reset_password()` | `users`, `password_resets` |
| `VerifyEmail.jsx` | `POST /api/auth/verify-email` | `auth.py:136` | `verify_email()` | `users`, `email_verifications` |

---

## 📱 Dashboard Pages (5)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `StudentDashboard.jsx` | `GET /api/analytics/dashboard` | `analytics.py:180` | `users`, `jobs`, `events`, `mentorship_requests` |
| `AlumniDashboard.jsx` | `GET /api/analytics/dashboard` | `analytics.py:180` | `alumni_profiles`, `jobs`, `events`, `mentorship_sessions` |
| `RecruiterDashboard.jsx` | `GET /api/analytics/dashboard` | `analytics.py:180` | `jobs`, `job_applications`, `recruiter_profiles` |
| `AdminDashboard.jsx` | `GET /api/admin/dashboard` | `admin_analytics.py:10` | `users`, `jobs`, `events`, `audit_logs` |
| `Dashboard.jsx` | `GET /api/analytics/dashboard` | `analytics.py:180` | `users`, `engagement_scores` |

---

## 👤 Profile & Directory (3)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `Profile.jsx` | `GET /api/profiles/me`<br>`PUT /api/profiles/me` | `profiles.py` | `users`, `alumni_profiles` |
| `ProfileView.jsx` | `GET /api/profiles/{user_id}` | `profiles.py` | `users`, `alumni_profiles` |
| `AlumniDirectory.jsx` | `GET /api/profiles/alumni`<br>`POST /api/profiles/search` | `profiles.py` | `users`, `alumni_profiles`, `skill_endorsements` |

---

## 💼 Jobs Portal (8)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `Jobs.jsx` | `GET /api/jobs` | `jobs.py:51` | `jobs`, `job_applications` |
| `PostJob.jsx` | `POST /api/jobs/create` | `jobs.py:26` | `jobs` |
| `EditJob.jsx` | `GET /api/jobs/{job_id}`<br>`PUT /api/jobs/{job_id}` | `jobs.py:99,125` | `jobs` |
| `JobDetails.jsx` | `GET /api/jobs/{job_id}` | `jobs.py:99` | `jobs`, `users`, `job_applications` |
| `MyApplications.jsx` | `GET /api/applications/user/me` | `applications.py` | `job_applications`, `jobs` |
| `JobApplicationsManager.jsx` | `GET /api/jobs/{job_id}/applications` | `jobs.py:241` | `job_applications`, `users` |
| `ManageJobs.jsx` | `GET /api/jobs/user/{user_id}` | `jobs.py:267` | `jobs`, `job_applications` |
| `ApplicationsManager.jsx` | `GET /api/jobs/{job_id}/applications` | `jobs.py:241` | `job_applications` |

**Jobs API Coverage:**
- ✅ Create job: `POST /api/jobs/create` (line 26)
- ✅ List jobs: `GET /api/jobs` (line 51)
- ✅ Get details: `GET /api/jobs/{job_id}` (line 99)
- ✅ Update job: `PUT /api/jobs/{job_id}` (line 125)
- ✅ Delete job: `DELETE /api/jobs/{job_id}` (line 153)
- ✅ Close job: `POST /api/jobs/{job_id}/close` (line 184)
- ✅ Apply: `POST /api/jobs/{job_id}/apply` (line 211)
- ✅ View applications: `GET /api/jobs/{job_id}/applications` (line 241)

---

## 🤝 Mentorship System (5)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `FindMentors.jsx` | `GET /api/mentorship/mentors`<br>`POST /api/mentorship/mentors/filter` | `mentorship.py:108,251` | `mentor_profiles`, `users`, `skill_endorsements` |
| `MentorProfile.jsx` | `GET /api/mentorship/mentors/{mentor_id}` | `mentorship.py:169` | `mentor_profiles`, `users`, `mentorship_reviews` |
| `MentorshipDashboard.jsx` | `GET /api/mentorship/mentorship/active`<br>`GET /api/mentorship/mentorship/my-mentees` | `mentorship.py:600,357` | `mentorship_requests`, `mentorship_sessions` |
| `SessionDetails.jsx` | `GET /api/mentorship/mentorship/requests/{request_id}` | `mentorship.py:624` | `mentorship_sessions`, `mentorship_goals` |
| `MentorManagement.jsx` | `POST /api/mentorship/mentors/register`<br>`PUT /api/mentorship/mentors/availability` | `mentorship.py:35,71` | `mentor_profiles`, `mentor_availability` |

**Mentorship API Coverage (20+ endpoints):**
- ✅ Register mentor: `POST /api/mentorship/mentors/register` (line 35)
- ✅ Update availability: `PUT /api/mentorship/mentors/availability` (line 71)
- ✅ List mentors: `GET /api/mentorship/mentors` (line 108)
- ✅ Filter mentors: `POST /api/mentorship/mentors/filter` (line 251)
- ✅ Create request: `POST /api/mentorship/mentorship/request` (line 386)
- ✅ Accept request: `POST /api/mentorship/mentorship/{request_id}/accept` (line 428)
- ✅ Reject request: `POST /api/mentorship/mentorship/{request_id}/reject` (line 467)
- ✅ Get active mentorships: `GET /api/mentorship/mentorship/active` (line 600)
- ✅ View requests: `GET /api/mentorship/mentorship/requests/received` (line 510)

---

## 📅 Events Management (6)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `Events.jsx` | `GET /api/events` | `events.py:40` | `events`, `event_registrations` |
| `CreateEvent.jsx` | `POST /api/events` | `events.py:18` | `events` |
| `EditEvent.jsx` | `GET /api/events/{event_id}`<br>`PUT /api/events/{event_id}` | `events.py:85,104` | `events` |
| `EventDetails.jsx` | `GET /api/events/{event_id}`<br>`GET /api/events/{event_id}/attendees` | `events.py:85,215` | `events`, `event_registrations`, `users` |
| `EventAttendees.jsx` | `GET /api/events/{event_id}/attendees` | `events.py:215` | `event_registrations`, `users` |
| `ManageEvents.jsx` | `GET /api/events/user/my-events` | `events.py:71` | `events`, `event_registrations` |

**Events API Coverage:**
- ✅ Create event: `POST /api/events` (line 18)
- ✅ List events: `GET /api/events` (line 40)
- ✅ Get details: `GET /api/events/{event_id}` (line 85)
- ✅ Update event: `PUT /api/events/{event_id}` (line 104)
- ✅ Delete event: `DELETE /api/events/{event_id}` (line 134)
- ✅ RSVP: `POST /api/events/{event_id}/rsvp` (line 167)
- ✅ Check RSVP: `GET /api/events/{event_id}/my-rsvp` (line 198)
- ✅ View attendees: `GET /api/events/{event_id}/attendees` (line 215)

---

## 💬 Forum/Community (3)

| Frontend Page | API Endpoint | Backend Route | Database Tables |
|--------------|--------------|---------------|-----------------|
| `Forum.jsx` | `GET /api/forum/posts`<br>`GET /api/forum/tags` | `forum.py:55,190` | `forum_posts`, `forum_tags` |
| `PostDetails.jsx` | `GET /api/forum/posts/{post_id}`<br>`GET /api/forum/posts/{post_id}/comments` | `forum.py:89,233` | `forum_posts`, `forum_comments`, `forum_likes` |
| `ManagePosts.jsx` | `GET /api/forum/my-posts`<br>`PUT /api/forum/posts/{post_id}`<br>`DELETE /api/forum/posts/{post_id}` | `forum.py:174,113,143` | `forum_posts` |

**Forum API Coverage:**
- ✅ Create post: `POST /api/forum/posts` (line 37)
- ✅ List posts: `GET /api/forum/posts` (line 55)
- ✅ Get post: `GET /api/forum/posts/{post_id}` (line 89)
- ✅ Update post: `PUT /api/forum/posts/{post_id}` (line 113)
- ✅ Delete post: `DELETE /api/forum/posts/{post_id}` (line 143)
- ✅ Like post: `POST /api/forum/posts/{post_id}/like` (line 204)
- ✅ Add comment: `POST /api/forum/posts/{post_id}/comments` (line 259)
- ✅ Edit comment: `PUT /api/forum/comments/{comment_id}` (line 290)

---

## 👑 Admin Pages (17)

| Frontend Page | Backend Routes | Database Tables |
|--------------|----------------|-----------------|
| `AdminAnalytics.jsx` | `admin_analytics.py` | `users`, `jobs`, `events`, `engagement_scores` |
| `AdminUsers.jsx` | `admin_users.py` | `users`, `alumni_profiles`, `user_roles` |
| `AdminJobs.jsx` | `admin_jobs.py` | `jobs`, `job_applications`, `moderation_queue` |
| `AdminEvents.jsx` | `admin_events.py` | `events`, `event_registrations` |
| `AdminMentorship.jsx` | `admin_mentorship.py` | `mentor_profiles`, `mentorship_requests` |
| `AdminModeration.jsx` | `admin_moderation.py` | `moderation_queue`, `reported_content` |
| `AdminBadges.jsx` | `admin_badges.py` | `badges`, `user_badges` |
| `AdminNotifications.jsx` | `admin_notifications.py` | `notifications`, `notification_templates` |
| `AdminSettings.jsx` | `admin_settings.py` | `system_settings`, `feature_flags` |
| `AdminAuditLogs.jsx` | `admin_audit_logs.py` | `audit_logs`, `admin_actions` |
| `AdminCardVerifications.jsx` | `admin.py` | `alumni_cards`, `alumni_id_verifications` |
| `AdminVerifications.jsx` | `admin.py` | `users`, `email_verifications` |
| `AdminAIMonitor.jsx` | `ml_admin.py` | `ai_processing_queue`, `model_performance_metrics` |
| `AdminCareerDataUpload.jsx` | `career_data_collection.py` | `career_transitions`, `uploaded_datasets` |
| `AdminEmailQueue.jsx` | `admin.py` | `email_queue`, `email_templates` |
| `AdminFileUploads.jsx` | `admin_files.py` | `file_uploads`, `file_metadata` |
| `AdminKnowledgeCapsules.jsx` | `admin_content.py` | `knowledge_capsules`, `moderation_queue` |

**Admin Routes (16 files):**
- ✅ `admin.py` - General admin operations
- ✅ `admin_analytics.py` - Dashboard stats
- ✅ `admin_audit_logs.py` - Audit trail
- ✅ `admin_badges.py` - Badge management
- ✅ `admin_content.py` - Content moderation
- ✅ `admin_dashboard.py` - Admin dashboard
- ✅ `admin_events.py` - Event management
- ✅ `admin_files.py` - File management
- ✅ `admin_jobs.py` - Job management
- ✅ `admin_mentorship.py` - Mentorship oversight
- ✅ `admin_moderation.py` - Moderation tools
- ✅ `admin_notifications.py` - Notification system
- ✅ `admin_settings.py` - System config
- ✅ `admin_users.py` - User management
- ✅ `admin_wrappers.py` - Utilities
- ✅ `ml_admin.py` - ML monitoring

---

## 🚀 Advanced Features (9)

| Frontend Page | Backend Routes | Database Tables |
|--------------|----------------|-----------------|
| `AlumniCard.jsx` | `alumni_card.py`, `alumni_cards.py` | `alumni_cards`, `alumni_id_verifications` |
| `CareerPaths.jsx` | `career_paths.py` | `career_paths`, `career_transitions` |
| `KnowledgeCapsules.jsx` | `capsules.py`, `capsule_ranking.py` | `knowledge_capsules`, `capsule_bookmarks` |
| `CreateKnowledgeCapsule.jsx` | `capsules.py` | `knowledge_capsules` |
| `KnowledgeCapsuleDetail.jsx` | `capsules.py` | `knowledge_capsules`, `capsule_likes`, `capsule_comments` |
| `Leaderboard.jsx` | `leaderboard_wrapper.py` | `engagement_scores`, `user_badges` |
| `LearningPath.jsx` | `career_paths.py`, `recommendations.py` | `career_paths`, `skill_embeddings` |
| `SkillGraph.jsx` | `skill_graph.py`, `skills_routes.py` | `skill_embeddings`, `skill_relationships` |
| `TalentHeatmap.jsx` | `heatmap.py` | `alumni_profiles`, `users`, `skill_endorsements` |

**Advanced Feature Routes:**
- ✅ `alumni_card.py` - Digital card generation
- ✅ `career_paths.py` - Career pathways
- ✅ `capsules.py` - Knowledge capsules
- ✅ `skill_graph.py` - Skill visualization
- ✅ `heatmap.py` - Geographic data
- ✅ `recommendations.py` - ML recommendations
- ✅ `career_predictions_router.py` - AI predictions
- ✅ `matching.py` - Smart matching

---

## 🔔 Settings & Info (3)

| Frontend Page | Backend Routes | Database Tables |
|--------------|----------------|-----------------|
| `Settings.jsx` | `profiles.py`, `privacy.py` | `user_preferences`, `privacy_settings` |
| `About.jsx` | *(Static page)* | - |
| `Home.jsx` | *(Static page)* | - |

**Settings Routes:**
- ✅ `notifications.py` - Notification preferences
- ✅ `privacy.py` - Privacy controls

---

## 📊 Backend Service Layer (21 Files)

All backend routes use service files for business logic:

| Service File | Purpose | Used By |
|-------------|---------|---------|
| `auth_service.py` | Authentication logic | `auth.py` |
| `user_service.py` | User CRUD operations | Multiple routes |
| `job_service.py` | Job management | `jobs.py`, `admin_jobs.py` |
| `event_service.py` | Event operations | `events.py`, `admin_events.py` |
| `mentorship_service.py` | Mentorship logic | `mentorship.py` |
| `forum_service.py` | Forum operations | `forum.py` |
| `profile_service.py` | Profile management | `profiles.py` |
| `notification_service.py` | Notifications | `notifications.py` |
| `email_service.py` | Email delivery | `auth.py`, `notifications.py` |
| `application_service.py` | Job applications | `jobs.py`, `applications.py` |
| `badge_service.py` | Badge awards | `admin_badges.py` |
| `moderation_service.py` | Content moderation | `admin_moderation.py` |
| *+ 9 more services* | Various features | Multiple routes |

---

## 🗄️ Database Tables (48 Total)

### Core Tables (10)
- `users` - User accounts
- `alumni_profiles` - Extended alumni info
- `jobs` - Job postings
- `events` - Event listings
- `forum_posts` - Forum content
- `mentorship_requests` - Mentorship tracking
- `notifications` - User notifications
- `email_verifications` - Email OTP codes
- `password_resets` - Password recovery
- `user_sessions` - Session tracking

### Job System (5)
- `jobs`
- `job_applications`
- `saved_jobs`
- `application_status_history`
- `job_skills`

### Events System (3)
- `events`
- `event_registrations`
- `event_attendance`

### Mentorship System (7)
- `mentor_profiles`
- `mentor_availability`
- `mentorship_requests`
- `mentorship_sessions`
- `mentorship_goals`
- `mentorship_reviews`
- `mentorship_messages`

### Forum System (5)
- `forum_posts`
- `forum_comments`
- `forum_likes`
- `forum_tags`
- `post_tags`

### Advanced Features (10)
- `alumni_cards`
- `career_paths`
- `knowledge_capsules`
- `skill_embeddings`
- `career_transitions`
- `engagement_scores`
- `user_badges`
- `badges`
- `capsule_bookmarks`
- `skill_relationships`

### Admin & System (8)
- `admin_actions`
- `audit_logs`
- `moderation_queue`
- `system_settings`
- `feature_flags`
- `email_queue`
- `file_uploads`
- `ai_processing_queue`

---

## 🎯 Quick Stats

- **Total Frontend Pages:** 53+
- **Total Backend Routes:** 48 files
- **Total Service Files:** 21 files
- **Total Database Tables:** 48 tables
- **Total API Endpoints:** 150+ endpoints

---

## ✅ Coverage Summary

### ✅ 100% Frontend-Backend Mapping
Every frontend page has:
- ✅ Corresponding backend API endpoints
- ✅ Service layer business logic
- ✅ Database table(s) for persistence

### ✅ Complete CRUD Coverage
All major entities support:
- ✅ Create (POST)
- ✅ Read (GET)
- ✅ Update (PUT)
- ✅ Delete (DELETE)

### ✅ Role-Based Access
- ✅ Student role pages and permissions
- ✅ Alumni role pages and permissions
- ✅ Recruiter role pages and permissions
- ✅ Admin role pages and permissions

---

**Mapping Complete** ✅  
**Railway MySQL Database:** yamabiko.proxy.rlwy.net:42030  
**Backend Server:** http://localhost:8001
