begin;
select set_config('request.jwt.claim.sub',(select id::text from auth.users limit 1),true);
select set_config('test.paper',(select id::text from public.papers limit 1),true);
set local role authenticated;
do $$
declare n integer; first_id uuid:=gen_random_uuid();
begin
 insert into public.study_session_logs(id,user_id,stage,block_key,plan_date,paper_id,paper_name,goal,planned_minutes,status,running_since)
 values(first_id,auth.uid(),'__test__','first',current_date,current_setting('test.paper')::uuid,'Test','Test timer',45,'running',now());
 select count(*) into n from public.study_session_logs where id=first_id;
 if n<>1 then raise exception 'Own-row read failed';end if;
 begin
 insert into public.study_session_logs(id,user_id,stage,block_key,plan_date,paper_id,paper_name,goal,planned_minutes,status,running_since)
 values(gen_random_uuid(),auth.uid(),'__test__','second',current_date,current_setting('test.paper')::uuid,'Test','Second timer',45,'running',now());
 raise exception 'Duplicate unfinished session allowed';
 exception when unique_violation then null;end;
 update public.study_session_logs set status='paused',running_since=null,elapsed_seconds=60,revision=2 where id=first_id and revision=1;
 get diagnostics n=row_count;if n<>1 then raise exception 'Pause failed';end if;
 update public.study_session_logs set revision=3 where id=first_id and revision=1;
 get diagnostics n=row_count;if n<>0 then raise exception 'Stale update allowed';end if;
 update public.study_session_logs set status='partial',finished_at=now(),revision=3 where id=first_id;
 begin
 update public.study_session_logs set user_id='00000000-0000-4000-8000-000000000099' where id=first_id;
 raise exception 'Ownership reassignment allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
 select count(*) into n from public.study_session_logs where id=first_id;
 if n<>0 then raise exception 'Cross-account read allowed';end if;
 update public.study_session_logs set notes='other user' where id=first_id;
 get diagnostics n=row_count;if n<>0 then raise exception 'Cross-account write allowed';end if;
 if has_table_privilege('anon','public.study_session_logs','SELECT') or has_table_privilege('anon','public.study_session_logs','INSERT') or has_table_privilege('anon','public.study_session_logs','UPDATE') or has_table_privilege('authenticated','public.study_session_logs','DELETE') then raise exception 'Unexpected grants';end if;
end $$;
reset role;
rollback;
select 'PASS: own-account save, pause, finish, duplicate prevention, stale revision, account isolation; fixtures rolled back' as verification;
