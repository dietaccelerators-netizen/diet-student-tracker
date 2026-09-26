-- DIET Student Tracker — live-ready schema
-- Question/checkpoint tables are intentionally NOT included in this milestone.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  exam_diet text,
  level text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  display_order integer not null default 0
);

create table if not exists public.student_papers (
  student_id uuid not null references public.profiles(id) on delete cascade,
  paper_id uuid not null references public.papers(id) on delete cascade,
  primary key (student_id, paper_id)
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.papers(id) on delete cascade,
  topic_name text not null,
  display_order integer not null default 0,
  unique (paper_id, topic_name)
);

create index if not exists topics_paper_id_idx on public.topics (paper_id, display_order);

create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  status text not null default 'Not Started' check (status in ('Not Started', 'Learning', 'Needs Practice', 'Okay')),
  question_practice text not null default 'Not Yet' check (question_practice in ('Not Yet', 'Attempted', 'Reattempt')),
  last_studied date,
  next_step text not null default '',
  this_week boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);

create index if not exists topic_progress_student_id_idx on public.topic_progress (student_id, updated_at desc);
create index if not exists topic_progress_this_week_idx on public.topic_progress (student_id, this_week) where this_week = true;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists topic_progress_touch_updated_at on public.topic_progress;
create trigger topic_progress_touch_updated_at
before update on public.topic_progress
for each row execute function public.touch_updated_at();
