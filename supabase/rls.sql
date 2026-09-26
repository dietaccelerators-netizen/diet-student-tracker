-- DIET Student Tracker — Row Level Security + adaptive paper assignment
-- Mirrors the policies currently applied to the live Supabase project.

alter table public.profiles enable row level security;
alter table public.papers enable row level security;
alter table public.student_papers enable row level security;
alter table public.topics enable row level security;
alter table public.topic_progress enable row level security;

create index if not exists student_papers_paper_id_idx on public.student_papers (paper_id);
create index if not exists topic_progress_topic_id_idx on public.topic_progress (topic_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Recreate policies safely when this file is rerun.
drop policy if exists "students read own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "authenticated read papers" on public.papers;
drop policy if exists "admins manage papers" on public.papers;
drop policy if exists "authenticated read topics" on public.topics;
drop policy if exists "admins manage topics" on public.topics;
drop policy if exists "students read own assigned papers" on public.student_papers;
drop policy if exists "admins manage student papers" on public.student_papers;
drop policy if exists "students read own progress" on public.topic_progress;
drop policy if exists "students insert own progress" on public.topic_progress;
drop policy if exists "students update own progress" on public.topic_progress;
drop policy if exists "admins manage all topic progress" on public.topic_progress;

create policy "students read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()));

create policy "admins read all profiles"
on public.profiles for select to authenticated
using ((select public.is_admin()));

create policy "admins manage profiles"
on public.profiles for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "authenticated read papers"
on public.papers for select to authenticated
using (true);

create policy "admins manage papers"
on public.papers for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "authenticated read topics"
on public.topics for select to authenticated
using (true);

create policy "admins manage topics"
on public.topics for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "students read own assigned papers"
on public.student_papers for select to authenticated
using ((select auth.uid()) is not null and student_id = (select auth.uid()));

create policy "admins manage student papers"
on public.student_papers for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "students read own progress"
on public.topic_progress for select to authenticated
using ((select auth.uid()) is not null and student_id = (select auth.uid()));

create policy "students insert own progress"
on public.topic_progress for insert to authenticated
with check ((select auth.uid()) is not null and student_id = (select auth.uid()));

create policy "students update own progress"
on public.topic_progress for update to authenticated
using ((select auth.uid()) is not null and student_id = (select auth.uid()))
with check ((select auth.uid()) is not null and student_id = (select auth.uid()));

create policy "admins manage all topic progress"
on public.topic_progress for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create or replace function public.set_student_papers(
  target_student_id uuid,
  selected_paper_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_count integer;
  valid_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if target_student_id <> (select auth.uid()) and not public.is_admin() then
    raise exception 'Not authorized to change this student';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = target_student_id and role = 'student'
  ) then
    raise exception 'Student not found';
  end if;

  selected_paper_ids := coalesce(selected_paper_ids, array[]::uuid[]);
  requested_count := cardinality(selected_paper_ids);

  if requested_count < 1 then
    raise exception 'Choose at least one paper';
  end if;

  select count(*) into valid_count
  from public.papers
  where id = any(selected_paper_ids);

  if valid_count <> requested_count then
    raise exception 'One or more selected papers are invalid';
  end if;

  delete from public.student_papers
  where student_id = target_student_id
    and not (paper_id = any(selected_paper_ids));

  insert into public.student_papers (student_id, paper_id)
  select target_student_id, p.id
  from public.papers p
  where p.id = any(selected_paper_ids)
  on conflict (student_id, paper_id) do nothing;

  insert into public.topic_progress (student_id, topic_id)
  select target_student_id, t.id
  from public.topics t
  join public.student_papers sp
    on sp.paper_id = t.paper_id
   and sp.student_id = target_student_id
  on conflict (student_id, topic_id) do nothing;
end;
$$;

revoke all on function public.set_student_papers(uuid, uuid[]) from public, anon;
grant execute on function public.set_student_papers(uuid, uuid[]) to authenticated;
