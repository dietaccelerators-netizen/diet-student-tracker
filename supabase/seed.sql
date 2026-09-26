-- Master definitions only. Profiles are created only for real auth.users IDs.
insert into public.papers (code, name, display_order) values
('SBR', 'Strategic Business Reporting', 1),
('AAAF', 'Advanced Audit, Assurance and Forensics', 2),
('SFM', 'Strategic Financial Management', 3),
('ATAX', 'Advanced Taxation', 4),
('CASE STUDY', 'Case Study', 5)
on conflict (code) do update set name = excluded.name, display_order = excluded.display_order;

with p as (select id, code from public.papers)
insert into public.topics (paper_id, topic_name, display_order)
select p.id, v.topic_name, v.display_order
from p
join (values
('SBR','Group Accounts',1),('SBR','Revenue',2),('SBR','Financial Instruments',3),('SBR','Leases',4),('SBR','Analysis and Interpretation',5),
('AAAF','Audit Risk',1),('AAAF','Audit Procedures',2),('AAAF','Audit Evidence',3),('AAAF','Group Audits',4),('AAAF','Audit Reporting',5),
('SFM','Investment Appraisal',1),('SFM','Cost of Capital',2),('SFM','Business Valuation',3),('SFM','Foreign Exchange',4),('SFM','Risk Management',5),
('ATAX','Company Tax Computation',1),('ATAX','Personal Income Tax',2),('ATAX','VAT',3),('ATAX','International Tax',4),('ATAX','Tax Planning',5),
('CASE STUDY','Understanding the Business',1),('CASE STUDY','Financial Analysis',2),('CASE STUDY','Non-Financial Analysis',3),('CASE STUDY','Recommendations',4),('CASE STUDY','Report Writing',5)
) as v(code, topic_name, display_order) on v.code = p.code
on conflict (paper_id, topic_name) do update set display_order = excluded.display_order;
