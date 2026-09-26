# DIET Student Tracker

Private, mobile-first study tracking portal for DIET Accelerator.

## Current milestone

This repository contains the adaptive tracker only: passwordless Supabase authentication, student/admin roles, paper selection, topic progress, This Week priorities and admin student visibility. The future two-questions-per-topic layer is intentionally not included yet.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres + Row Level Security
- Vercel-ready deployment

## Live backend status

The DIET Supabase project already exists and already contains the core schema, RLS policies, five Professional-level papers, prototype topics, the admin approval flow and the first test-student approval. **Do not rerun the SQL files against the current live project just to deploy this app.** They are included so the backend can be reproduced later if needed.

## Required Vercel environment variables

Add these two variables to the Vercel project before the first production deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pulqglawxasijkjlowgs.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_QwBC9Mz08HwALgk0oAHhNQ_8v7UY97o
```

No service-role key is required by this build.

## Local verification

Requires Node.js 20.9 or newer.

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

If the two Supabase environment variables are absent, the app falls back to demo mode for UI testing.

## Production flow

1. Import this repository into Vercel.
2. Add the two environment variables above.
3. Deploy.
4. Copy the production Vercel URL.
5. In Supabase Auth URL configuration, set the Site URL to that production URL and add the production callback URL to the redirect allow list.
6. Test admin magic-link login.
7. Test the approved student magic-link login.
8. Confirm paper selection, progress edits, sign-out/sign-in persistence, paper removal/re-addition and admin visibility.

## Important implementation details

- Students only receive a DIET profile if their email has been approved in the private allowlist.
- The login flow uses `shouldCreateUser: true` because the approved student may not yet have an Auth identity. Unapproved Auth identities do not receive a DIET profile and are rejected by the callback route.
- `student_papers` stores the currently active papers.
- Removing a paper does not delete `topic_progress`; re-adding it restores prior work.
- `set_student_papers(...)` handles adaptive paper changes atomically.
- `admin_register_student(...)` lets an authenticated admin approve a student without exposing a service-role key.
- RLS remains the privacy boundary; client-side route hiding is not treated as security.
- `proxy.ts` refreshes and validates the cookie-backed Supabase session for Next.js 16.

## Backend reference files

The `supabase/` directory mirrors the live structure for future recreation:

1. `schema.sql`
2. `seed.sql`
3. `rls.sql`
4. `account-approval.sql`
5. `bootstrap-admin.sql` — for a new project only; replace the placeholder email first

## Deferred until after live testing

Do not add the question/checkpoint system yet. Also keep AI tutoring, mock-exam engines, gamification, readiness percentages, course hosting and advanced analytics out of this milestone.
