-- DIET Student Tracker — private account approval and profile provisioning
-- Run after schema.sql and rls.sql when recreating the backend in a new project.

create schema if not exists private;

create table if not exists private.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists private.student_allowlist (
  email text primary key,
  full_name text,
  exam_diet text,
  level text,
  active boolean not null default true,
  paper_ids uuid[] not null default array[]::uuid[],
  created_at timestamptz not null default now()
);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role text;
  invited_name text;
  invited_diet text;
  invited_level text;
  invited_papers uuid[];
  display_name text;
begin
  if exists (
    select 1
    from private.admin_allowlist a
    where lower(a.email) = lower(new.email)
  ) then
    assigned_role := 'admin';
    invited_papers := array[]::uuid[];
  else
    select s.full_name, s.exam_diet, s.level, s.paper_ids
      into invited_name, invited_diet, invited_level, invited_papers
    from private.student_allowlist s
    where lower(s.email) = lower(new.email)
      and s.active = true
    limit 1;

    if not found then
      return new;
    end if;

    assigned_role := 'student';
  end if;

  display_name := coalesce(
    nullif(invited_name, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'DIET Student'
  );

  insert into public.profiles (
    id, full_name, email, role, exam_diet, level
  )
  values (
    new.id,
    display_name,
    new.email,
    assigned_role,
    case when assigned_role = 'student' then invited_diet else null end,
    case when assigned_role = 'student' then invited_level else null end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        role = case
          when public.profiles.role = 'admin' then 'admin'
          else excluded.role
        end,
        exam_diet = coalesce(public.profiles.exam_diet, excluded.exam_diet),
        level = coalesce(public.profiles.level, excluded.level);

  if assigned_role = 'student'
     and cardinality(coalesce(invited_papers, array[]::uuid[])) > 0 then
    insert into public.student_papers (student_id, paper_id)
    select new.id, p.id
    from public.papers p
    where p.id = any(invited_papers)
    on conflict (student_id, paper_id) do nothing;

    insert into public.topic_progress (student_id, topic_id)
    select new.id, t.id
    from public.topics t
    where t.paper_id = any(invited_papers)
    on conflict (student_id, topic_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function public.admin_register_student(
  p_full_name text,
  p_email text,
  p_exam_diet text,
  p_level text,
  p_paper_ids uuid[] default array[]::uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(p_email));
  selected_papers uuid[] := coalesce(p_paper_ids, array[]::uuid[]);
  requested_count integer := cardinality(coalesce(p_paper_ids, array[]::uuid[]));
  valid_count integer;
  existing_user_id uuid;
begin
  if (select auth.uid()) is null or not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if nullif(trim(p_full_name), '') is null
     or nullif(normalized_email, '') is null
     or position('@' in normalized_email) = 0
     or nullif(trim(p_exam_diet), '') is null
     or nullif(trim(p_level), '') is null then
    raise exception 'Complete the student name, email, exam diet and level';
  end if;

  if requested_count > 0 then
    select count(*) into valid_count
    from public.papers
    where id = any(selected_papers);

    if valid_count <> requested_count then
      raise exception 'One or more selected papers are invalid';
    end if;
  end if;

  insert into private.student_allowlist (
    email, full_name, exam_diet, level, active, paper_ids
  )
  values (
    normalized_email,
    trim(p_full_name),
    trim(p_exam_diet),
    trim(p_level),
    true,
    selected_papers
  )
  on conflict (email) do update
    set full_name = excluded.full_name,
        exam_diet = excluded.exam_diet,
        level = excluded.level,
        active = true,
        paper_ids = excluded.paper_ids;

  select u.id into existing_user_id
  from auth.users u
  where lower(u.email) = normalized_email
  limit 1;

  if existing_user_id is not null then
    insert into public.profiles (
      id, full_name, email, role, exam_diet, level
    )
    values (
      existing_user_id,
      trim(p_full_name),
      normalized_email,
      'student',
      trim(p_exam_diet),
      trim(p_level)
    )
    on conflict (id) do update
      set full_name = excluded.full_name,
          email = excluded.email,
          exam_diet = excluded.exam_diet,
          level = excluded.level,
          role = case
            when public.profiles.role = 'admin' then 'admin'
            else 'student'
          end;

    if requested_count > 0 then
      delete from public.student_papers
      where student_id = existing_user_id
        and not (paper_id = any(selected_papers));

      insert into public.student_papers (student_id, paper_id)
      select existing_user_id, p.id
      from public.papers p
      where p.id = any(selected_papers)
      on conflict (student_id, paper_id) do nothing;

      insert into public.topic_progress (student_id, topic_id)
      select existing_user_id, t.id
      from public.topics t
      where t.paper_id = any(selected_papers)
      on conflict (student_id, topic_id) do nothing;
    end if;
  end if;

  return jsonb_build_object(
    'email', normalized_email,
    'profile_created', existing_user_id is not null
  );
end;
$$;

revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.admin_register_student(text, text, text, text, uuid[]) from public, anon;
grant execute on function public.admin_register_student(text, text, text, text, uuid[]) to authenticated;
