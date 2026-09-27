-- Transaction-only verification. Every test identity and change is rolled back.
begin;
do $$
declare stage text; uid uuid; expected integer; actual integer; n integer:=0;
begin
 foreach stage in array array['ATS 1','ATS 2','ATS 3','Foundation','Skills','Professional'] loop
  n:=n+1; uid:=('00000000-27d1-4e7a-8e50-'||lpad(n::text,12,'0'))::uuid;
  insert into auth.users(id,email,raw_user_meta_data)
  values(uid,'diet-stage-check-'||n||'@example.invalid',jsonb_build_object('first_name','Stage','last_name','Check','exam_stage',stage,'role','admin'));
  if not exists(select 1 from public.profiles where id=uid and role='student' and level=stage) then raise exception 'Profile provisioning failed for %',stage; end if;
  expected:=case stage when 'Skills' then 6 when 'Professional' then 5 else 4 end;
  select count(*) into actual from public.student_papers where student_id=uid;
  if actual<>expected then raise exception 'Assignment count failed for %: %',stage,actual; end if;
 end loop;
 if not public.student_registration_ready() then raise exception 'Readiness flag false'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-27d1-4e7a-8e50-000000000001',true);
do $$
declare c integer; other_paper uuid;
begin
 select count(*) into c from public.profiles;
 if c<>1 then raise exception 'Profile isolation failed: % visible',c; end if;
 if public.is_admin() then raise exception 'Metadata role escalation'; end if;
 select count(*) into c from public.student_papers where student_id<>'00000000-27d1-4e7a-8e50-000000000001';
 if c<>0 then raise exception 'Assignment isolation failed'; end if;
 select count(*) into c from public.topic_progress where student_id<>'00000000-27d1-4e7a-8e50-000000000001';
 if c<>0 then raise exception 'Progress isolation failed'; end if;
 select id into other_paper from public.papers where exam_stage='Skills' limit 1;
 begin
  perform public.set_student_papers('00000000-27d1-4e7a-8e50-000000000001',array[other_paper]);
  raise exception 'Cross-stage selection was accepted';
 exception when others then
  if sqlerrm<>'Choose papers from the student exam stage' then raise; end if;
 end;
 begin
  perform public.set_student_papers('00000000-27d1-4e7a-8e50-000000000002',array[other_paper]);
  raise exception 'Cross-student write was accepted';
 exception when others then
  if sqlerrm<>'Not authorized' then raise; end if;
 end;
 update public.profiles set role='admin' where id='00000000-27d1-4e7a-8e50-000000000001';
 get diagnostics c=row_count;
 if c<>0 then raise exception 'Profile role update permitted'; end if;
end $$;
rollback;
select 'PASS: six-stage provisioning, fixed student role, record isolation, stage validation; test data rolled back' as result;
