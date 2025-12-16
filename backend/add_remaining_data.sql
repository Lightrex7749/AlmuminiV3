-- Add 7 more jobs to the database
INSERT INTO jobs (id, title, description, company, job_type, location, status, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655441111', 'Senior Software Engineer', 'We are looking for experienced engineers', 'Tech Company Inc', 'Full-time', 'San Francisco, CA', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441112', 'Product Manager', 'Lead our product vision and strategy', 'Innovation Labs', 'Full-time', 'New York, NY', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441113', 'Data Science Lead', 'Build and maintain ML models', 'Analytics Corp', 'Full-time', 'Boston, MA', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441114', 'DevOps Engineer', 'Manage cloud infrastructure', 'Cloud Systems Ltd', 'Full-time', 'Seattle, WA', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441115', 'Frontend Developer', 'Create beautiful user interfaces', 'Web Solutions', 'Full-time', 'Remote', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441116', 'Marketing Manager', 'Drive growth and engagement', 'Digital Agency', 'Full-time', 'Los Angeles, CA', 'active', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441117', 'Business Analyst', 'Analyze business requirements', 'Consulting Group', 'Full-time', 'Chicago, IL', 'active', NOW(), NOW());

-- Add 5 more events
INSERT INTO events (id, title, description, event_date, location, status, created_at, updated_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655441111', 'Career Fair 2025', 'Meet with top companies', '2025-03-15 10:00:00', 'Virtual', 'upcoming', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655441112', 'Tech Talk: AI Future', 'Discussion on AI trends', '2025-02-28 14:00:00', 'Auditorium A', 'upcoming', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655441113', 'Networking Breakfast', 'Alumni networking event', '2025-02-20 08:00:00', 'Cafe', 'upcoming', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655441114', 'Resume Workshop', 'Learn resume tips', '2025-02-10 15:00:00', 'Room 101', 'upcoming', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655441115', 'Interview Prep Seminar', 'Practice interview skills', '2025-02-05 16:00:00', 'Online', 'upcoming', NOW(), NOW());
