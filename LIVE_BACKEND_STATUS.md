# DIET Student Tracker — Live backend status

Supabase project: **DIET Student Tracker**

- Core tables created: `profiles`, `papers`, `student_papers`, `topics`, `topic_progress`
- RLS enabled on all exposed tables
- Five Professional-level papers seeded
- 25 prototype topics seeded
- Admin bootstrap email approved in the live project
- First test-student email approved in the live project
- Magic-link login implemented in the application
- Adaptive paper selection uses `set_student_papers`
- Admin student approval uses `admin_register_student`
- No service-role key is required by the deployed application
- Question/checkpoint features remain intentionally out of scope

## Remaining live step

Deploy this repository to Vercel with the two public Supabase environment variables, then add the final Vercel URL to Supabase Auth URL configuration and test both approved accounts end-to-end.
