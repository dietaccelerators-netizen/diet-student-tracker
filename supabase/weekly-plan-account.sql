-- Account-wide recurring plans. Run once in the project's SQL Editor.
begin;
create table public.weekly_plan_accounts (
  user_id uuid not null references auth.users(id) on delete cascade,
  stage text not null check (length(stage) between 1 and 80),
  draft jsonb not null check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 65536),
  active_plan jsonb check (active_plan is null or (jsonb_typeof(active_plan) = 'object' and octet_length(active_plan::text) < 131072)),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, stage)
);
alter table public.weekly_plan_accounts enable row level security;
revoke all on public.weekly_plan_accounts from public, anon, authenticated;
grant select, insert, update on public.weekly_plan_accounts to authenticated;
create policy weekly_plan_read_own on public.weekly_plan_accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy weekly_plan_insert_own on public.weekly_plan_accounts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy weekly_plan_update_own on public.weekly_plan_accounts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
