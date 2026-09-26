# Live Readiness Checklist

Use this before inviting real students.

- [x] Supabase project created.
- [x] Core schema, seed data, RLS and approval functions applied.
- [x] Admin email approved.
- [x] First test-student email approved.
- [ ] Vercel project created from this repository.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured in Vercel.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configured in Vercel.
- [ ] Production Vercel URL added to Supabase Auth Site URL / redirect allow list.
- [ ] Admin magic-link login tested on production.
- [ ] Student magic-link login tested on production.
- [ ] First-time paper selection tested.
- [ ] Adding/removing papers updates the dashboard.
- [ ] Removed paper progress returns when the paper is re-added.
- [ ] Topic status/date/next-step edits persist after sign-out/sign-in.
- [ ] This Week changes persist after sign-out/sign-in.
- [ ] Student cannot open `/admin`.
- [ ] Student cannot read another student's records through the Supabase API.
- [ ] Admin can open the student's tracker.
- [ ] Mobile dashboard and paper-detail editing tested on a real phone.

Do not start the question/checkpoint build until this workflow passes live testing.
