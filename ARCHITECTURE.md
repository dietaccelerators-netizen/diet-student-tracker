# DIET Student Tracker — Architecture

## Product boundary

The live milestone is intentionally narrow: passwordless authentication, private student data, adaptive paper selection, topic tracking and admin visibility. The question layer is not part of this build.

## Authentication and approval

Supabase Auth supplies each user UUID. The login form requests a magic link with `shouldCreateUser: true`. A database trigger creates a DIET profile only when the email is present in either the admin or student allowlist. An unapproved Auth identity therefore cannot enter the portal.

The callback exchanges the code for a cookie-backed session and then requires a matching `profiles` row. Users without a profile are signed out and returned to the login page.

## Route protection

- `/dashboard` and `/papers/[paperId]` call `requireStudent()`.
- `/admin` and `/admin/students/[studentId]` call `requireAdmin()`.
- `proxy.ts` refreshes and verifies the Supabase session before protected Server Components run.
- Database RLS is the actual privacy boundary.

## State and persistence

`TrackerProvider` supports two modes:

- `demo`: local browser state for UI-only testing.
- `supabase`: server-loaded RLS-scoped state with persistent edits.

Topic edits are optimistic and debounced before being written to `topic_progress`.

## Adaptive papers

`student_papers` is the active paper set. `set_student_papers(target_student_id, selected_paper_ids)` removes inactive assignments, adds new assignments and creates missing progress rows. It never deletes previous progress, so re-adding a paper restores earlier work.

## Admin student approval

`POST /api/admin/students` verifies the signed-in user is an admin and calls `admin_register_student(...)`. That database function updates the private student allowlist and, if the Auth identity already exists, creates/updates the public profile and starting paper assignments. No service-role key is present in the browser or required in Vercel.

## Future question layer

When the tracker workflow is proven in live use, question records can reference `paper_id` and `topic_id` without replacing the current core model. No question tables or question UI are included now.
