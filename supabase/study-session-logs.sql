-- Apply once. Session history is independent of recurring plan settings.
begin;
create table public.study_session_logs (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 stage text not null check(length(stage) between 1 and 80),
 block_key text not null check(length(block_key) between 1 and 180),
 plan_date date not null,
 paper_id uuid not null references public.papers(id),
 paper_name text not null check(length(paper_name) between 1 and 300),
 goal text not null check(length(trim(goal)) between 1 and 300),
 planned_minutes integer not null check(planned_minutes between 1 and 1440),
 status text not null check(status in ('running','paused','completed','partial')),
 elapsed_seconds integer not null default 0 check(elapsed_seconds between 0 and 86400),
 running_since timestamptz,
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 notes text not null default '' check(length(notes)<=2000),
 revision integer not null default 1 check(revision>0),
 unique(user_id,stage,block_key),
 check((status='running')=(running_since is not null)),
 check((status in ('completed','partial'))=(finished_at is not null))
);
create unique index study_session_one_open on public.study_session_logs(user_id,stage) where status in ('running','paused');
create index study_session_week on public.study_session_logs(user_id,stage,plan_date);
alter table public.study_session_logs enable row level security;
revoke all on public.study_session_logs from public,anon,authenticated;
grant select,insert,update on public.study_session_logs to authenticated;
create policy study_session_read_own on public.study_session_logs for select to authenticated using((select auth.uid())=user_id);
create policy study_session_insert_own on public.study_session_logs for insert to authenticated with check((select auth.uid())=user_id);
create policy study_session_update_own on public.study_session_logs for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
commit;
