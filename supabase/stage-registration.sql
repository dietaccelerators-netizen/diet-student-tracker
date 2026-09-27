-- DIET stage registration upgrade. Apply after schema.sql, rls.sql and account-approval.sql.
-- Preserves existing profiles, assignments and topic progress. New accounts are students only.
begin;
alter table public.papers add column if not exists exam_stage text;
-- Preserve the IDs of legacy Professional papers while updating current syllabus names.
update public.papers set code='SBR' where code='CR' and not exists(select 1 from public.papers where code='SBR');
update public.papers set code='AAAF' where code='AAA' and not exists(select 1 from public.papers where code='AAAF');
update public.papers set code='CS' where code='CASE STUDY' and not exists(select 1 from public.papers where code='CS');
insert into public.papers(code,name,exam_stage,display_order) values
('ATS1-BA','Basic Accounting','ATS 1',1),
('ATS1-ECO','Economics','ATS 1',2),
('ATS1-BL','Business Law','ATS 1',3),
('ATS1-CS','Communication Skills','ATS 1',4),
('ATS2-FA','Financial Accounting','ATS 2',5),
('ATS2-PSA','Public Sector Accounting','ATS 2',6),
('ATS2-QA','Quantitative Analysis','ATS 2',7),
('ATS2-IT','Information Technology','ATS 2',8),
('ATS3-PAA','Principles of Auditing & Assurance','ATS 3',9),
('ATS3-CA','Cost Accounting','ATS 3',10),
('ATS3-TAX','Taxation','ATS 3',11),
('ATS3-MGT','Management','ATS 3',12),
('BE','Business Environment','Foundation',13),
('FA','Financial Accounting','Foundation',14),
('MA','Management Accounting','Foundation',15),
('CBL','Corporate and Business Law','Foundation',16),
('FR','Financial Reporting','Skills',17),
('AAF','Audit, Assurance and Forensics','Skills',18),
('TAX','Taxation','Skills',19),
('PM','Performance Management','Skills',20),
('FM','Financial Management','Skills',21),
('PSAF','Public Sector Accounting and Finance','Skills',22),
('SBR','Strategic Business Reporting','Professional',23),
('AAAF','Advanced Audit, Assurance and Forensics','Professional',24),
('SFM','Strategic Financial Management','Professional',25),
('ATAX','Advanced Taxation','Professional',26),
('CS','Case Study','Professional',27)
on conflict(code) do update set name=excluded.name,exam_stage=excluded.exam_stage,display_order=excluded.display_order;
update public.profiles set level=regexp_replace(level,' Level$','','i') where level ~* '^(Foundation|Skills|Professional) Level$';

-- Metadata supplies preferences only. Role is always fixed to student unless privately allowlisted.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare
 chosen_stage text := new.raw_user_meta_data->>'exam_stage';
 chosen_name text := trim(coalesce(new.raw_user_meta_data->>'first_name','') || ' ' || coalesce(new.raw_user_meta_data->>'last_name',''));
 invited private.student_allowlist%rowtype;
 is_owner boolean;
begin
 select exists(select 1 from private.admin_allowlist where lower(email)=lower(new.email)) into is_owner;
 select * into invited from private.student_allowlist where lower(email)=lower(new.email) and active limit 1;
 if is_owner then
  insert into public.profiles(id,full_name,email,role) values(new.id,coalesce(nullif(chosen_name,''),'DIET Administrator'),new.email,'admin');
  return new;
 end if;
 if invited.email is not null then
  chosen_stage := regexp_replace(invited.level,' Level$','','i');
  chosen_name := coalesce(nullif(invited.full_name,''),chosen_name);
 end if;
 if chosen_stage is null or chosen_stage not in ('ATS 1','ATS 2','ATS 3','Foundation','Skills','Professional') then
  return new;
 end if;
 if length(chosen_name)<2 or length(chosen_name)>121 then
  raise exception 'Enter your first and last name';
 end if;
 insert into public.profiles(id,full_name,email,role,level,exam_diet)
 values(new.id,chosen_name,new.email,'student',chosen_stage,invited.exam_diet);
 insert into public.student_papers(student_id,paper_id)
 select new.id,id from public.papers where exam_stage=chosen_stage
 and (coalesce(cardinality(invited.paper_ids),0)=0 or id=any(invited.paper_ids));
 insert into public.topic_progress(student_id,topic_id)
 select new.id,t.id from public.topics t join public.student_papers sp on sp.paper_id=t.paper_id and sp.student_id=new.id
 on conflict(student_id,topic_id) do nothing;
 return new;
end;
$$;
revoke all on function private.handle_new_user() from public,anon,authenticated;

create or replace function public.set_student_papers(target_student_id uuid,selected_paper_ids uuid[])
returns void language plpgsql security definer set search_path='' as $$
declare chosen_stage text; valid_count integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if target_student_id<>auth.uid() and not public.is_admin() then raise exception 'Not authorized'; end if;
 select level into chosen_stage from public.profiles where id=target_student_id and role='student';
 if not found then raise exception 'Student not found'; end if;
 chosen_stage:=regexp_replace(chosen_stage,' Level$','','i');
 if coalesce(cardinality(selected_paper_ids),0)<1 then raise exception 'Choose at least one paper'; end if;
 select count(*) into valid_count from public.papers where id=any(selected_paper_ids) and exam_stage=chosen_stage;
 if valid_count<>cardinality(selected_paper_ids) then raise exception 'Choose papers from the student exam stage'; end if;
 delete from public.student_papers where student_id=target_student_id and not(paper_id=any(selected_paper_ids));
 insert into public.student_papers(student_id,paper_id) select target_student_id,id from public.papers where id=any(selected_paper_ids) on conflict do nothing;
 insert into public.topic_progress(student_id,topic_id) select target_student_id,id from public.topics where paper_id=any(selected_paper_ids) on conflict do nothing;
end;
$$;
revoke all on function public.set_student_papers(uuid,uuid[]) from public,anon;
grant execute on function public.set_student_papers(uuid,uuid[]) to authenticated;
create or replace function public.student_registration_ready() returns boolean language sql immutable set search_path='' as $$ select true; $$;
revoke all on function public.student_registration_ready() from public;
grant execute on function public.student_registration_ready() to anon,authenticated;
commit;
-- Read-only verification: six rows, counts 4,4,4,4,6,5 (ordered by stage).
select exam_stage,count(*) as subject_count from public.papers where exam_stage is not null group by exam_stage order by exam_stage;
