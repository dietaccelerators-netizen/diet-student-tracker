begin;
-- Uses one existing account inside a rollback-only transaction; no account details returned.
select set_config('request.jwt.claim.sub', (select id::text from auth.users limit 1), true);
set local role authenticated;
do $$
declare n integer;
begin
 if auth.uid() is null then raise exception 'A test user is required'; end if;
 insert into public.weekly_plan_accounts(user_id,stage,draft) values(auth.uid(),'__verification__','{"version":1}');
 select count(*) into n from public.weekly_plan_accounts where stage='__verification__';
 if n<>1 then raise exception 'Own-row read failed'; end if;
 update public.weekly_plan_accounts set revision=2 where user_id=auth.uid() and stage='__verification__' and revision=1;
 get diagnostics n=row_count;
 if n<>1 then raise exception 'Own-row update failed'; end if;
 update public.weekly_plan_accounts set revision=3 where user_id=auth.uid() and stage='__verification__' and revision=1;
 get diagnostics n=row_count;
 if n<>0 then raise exception 'Stale revision overwritten'; end if;
 begin
  update public.weekly_plan_accounts set user_id='00000000-0000-4000-8000-000000000099' where stage='__verification__';
  raise exception 'Ownership reassignment allowed';
 exception when insufficient_privilege then null;
 end;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
 select count(*) into n from public.weekly_plan_accounts where stage='__verification__';
 if n<>0 then raise exception 'Another account can read the plan'; end if;
 update public.weekly_plan_accounts set revision=9 where stage='__verification__';
 get diagnostics n=row_count;
 if n<>0 then raise exception 'Another account can update the plan'; end if;
 if has_table_privilege('anon','public.weekly_plan_accounts','SELECT') or has_table_privilege('anon','public.weekly_plan_accounts','INSERT') or has_table_privilege('anon','public.weekly_plan_accounts','UPDATE') or has_table_privilege('authenticated','public.weekly_plan_accounts','DELETE') then raise exception 'Unexpected grants'; end if;
end $$;
reset role;
rollback;
select 'PASS: own-account read/write, stale revision rejected, other-account isolation, anonymous blocked; test data rolled back' as verification;
