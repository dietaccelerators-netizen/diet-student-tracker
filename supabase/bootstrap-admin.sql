-- DIET Student Tracker — bootstrap one admin email in a NEW Supabase project.
-- Replace the placeholder before running. The current live project is already bootstrapped.

insert into private.admin_allowlist (email)
values ('REPLACE_WITH_ADMIN_EMAIL@example.com')
on conflict (email) do nothing;
