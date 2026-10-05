'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Paper, Profile } from '@/lib/types';
import { PlanSetup } from './PlanSetup';
import { capacity, DAYS, parseDraft, propose, type PlanDraft, type ProposedSession } from '@/lib/plan-setup';
import styles from './WeeklyPlan.module.css';
import { emptyAccount, loadPlanAccount, savePlanAccount, parseActive, type ActivePlan, type PlanAccount } from '@/lib/weekly-plan-storage';

const TABS = [['this-week','This Week'],['next-week','Next Week'],['calendar','Calendar'],['lectures','Lectures'],['setup','Plan Setup']] as const;
function dateInZone(zone: string) { return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
function addDays(date: string, count: number) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+count); return d.toISOString().slice(0,10); }
function monday(date: string) { return addDays(date,-((new Date(`${date}T12:00:00Z`).getUTCDay()+6)%7)); }
function labelDate(date: string) { return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`)); }
function duration(minutes: number) { return `${Math.floor(minutes/60)}h${minutes%60 ? ` ${minutes%60}m` : ''}`; }
interface DatedSession extends ProposedSession { date: string }
export function WeeklyPlan({ student, papers, preview = false }: { student: Profile; papers: Paper[]; preview?: boolean }) {
  return <WeeklyPlanContent key={`${preview}:${student.id}:${student.level}`} student={student} papers={papers} preview={preview}/>;
}
function WeeklyPlanContent({student,papers,preview}: {student:Profile;papers:Paper[];preview:boolean}) {
  const params = useSearchParams(), pathname = usePathname(), router = useRouter();
  const [plan,setPlan] = useState<ActivePlan|null>(null), [ready,setReady] = useState(false), [error,setError] = useState(''), [filter,setFilter] = useState('all'), [calendarOffset,setCalendarOffset] = useState(0);
  const [opened,setOpened] = useState<DatedSession|null>(null);
  const key = `diet:weekly-plan:v1:${preview?'preview:':''}${student.id}:${student.level}`;
  const [account,setAccount] = useState<PlanAccount>(emptyAccount), [retry,setRetry] = useState(0);
  const [legacy,setLegacy] = useState<PlanAccount|null>(null), [importing,setImporting] = useState(false);
  const saving = useRef(false);
  const draftKey = `diet:plan-setup:v1:${preview?'preview:':''}${student.id}:${student.level}`;
  useEffect(() => {
    let cancelled = false;
    setReady(false); setError('');
    async function load() {
      try {
        let next = emptyAccount();
        if (!preview) next = await loadPlanAccount(student.id,student.level);
        let browserPlan = emptyAccount();
        try {
          const raw = localStorage.getItem(key), rawDraft = localStorage.getItem(draftKey);
          browserPlan.active = raw ? parseActive(JSON.parse(raw)) : null;
          browserPlan.draft = rawDraft ? parseDraft(JSON.parse(rawDraft)) : browserPlan.active?.draft || null;
        } catch { if(preview) throw new Error('Browser storage could not be read. Enable browser storage and retry.'); }
        if (cancelled) return;
        if(preview) next=browserPlan;
        else if(!next.revision && (browserPlan.draft || browserPlan.active)) setLegacy(browserPlan);
        setAccount(next); setPlan(next.active); setReady(true);
      } catch(e) { if(!cancelled) setError(e instanceof Error ? e.message : 'Your plan could not be loaded.'); }
    }
    void load();
    return () => { cancelled=true; };
  },[key,draftKey,preview,student.id,student.level,retry]);
  const rawTab=params.get('plan');
  const tab=TABS.some(([id])=>id===rawTab) ? rawTab! : (plan?'this-week':'setup');
  function href(id: string) { const q=new URLSearchParams(params.toString());q.set('plan',id);q.delete('setup');return `${pathname}?${q}`; }
  async function persist(draft: PlanDraft, active: ActivePlan|null) {
    if(saving.current) throw new Error('A save is already in progress.');
    saving.current=true;
    try {
      if(preview) {
        localStorage.setItem(draftKey,JSON.stringify(draft));
        if(active) localStorage.setItem(key,JSON.stringify(active));
        setAccount({...account,draft,active});
      } else setAccount(await savePlanAccount(student.id,student.level,account,draft,active));
      setPlan(active); setError(''); setLegacy(null);
    } finally { saving.current=false; }
  }
  async function activate(draft: PlanDraft) {
    const next: ActivePlan={version:1,draft,paperIds:papers.map(p=>p.id),savedAt:new Date().toISOString()};
    await persist(draft,next);
    router.push(href('this-week'),{scroll:false});
  }
  async function importLegacy() {
    if(!legacy) return;
    const draft=legacy.draft || legacy.active?.draft;
    if(!draft) return;
    setImporting(true);
    try { await persist(draft,legacy.active); }
    catch(e) { setError(e instanceof Error ? e.message : 'Import failed. Your browser copy is unchanged.'); }
    finally { setImporting(false); }
  }
  const today=dateInZone(plan?.draft.timezone || 'Africa/Lagos'), start=monday(today);
  const removed=plan?.paperIds.filter(id=>!papers.some(p=>p.id===id)) || [];
  const recurring=plan?propose(plan.draft,plan.paperIds).filter(s=>!removed.includes(s.paperId)):[];
  const offset=tab==='next-week'?1:tab==='calendar'?calendarOffset:0;
  const week=addDays(start,offset*7), sessions=recurring.map(s=>({...s,date:addDays(week,s.day)}));
  const visible=sessions.filter(s=>filter==='all'||s.paperId===filter);
  const scheduled=sessions.reduce((n,s)=>n+s.duration,0);
  const name=(id:string)=>papers.find(p=>p.id===id)?.name || 'Subject no longer selected';
  if(!ready)return error ? <div role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry loading plan</button></div> : <p role="status">Loading Weekly Plan…</p>;
  return <section className={styles.page} aria-label="Weekly Plan">
    <header className={styles.header}><div><span className={styles.eyebrow}>YOUR STUDY ROUTINE</span><h2>Weekly Plan</h2><p>A clear place for the preparation ahead.</p></div><span className={styles.badge}>{student.level}</span></header>
    <p className={styles.notice}>{preview ? 'Preview · Plans are saved on this browser only.' : 'Save your draft or reviewed timetable to your account and return on another device.'} Study activity recording is not connected yet.</p>
    <nav className={styles.tabs} aria-label="Weekly Plan sections">{TABS.map(([id,label])=><Link key={id} href={href(id)} aria-current={tab===id?'page':undefined} onClick={()=>{setOpened(null);setFilter('all');}}>{label}</Link>)}</nav>
    {error && <p role="alert" className={styles.notice}>{error}</p>}
    {legacy && <div className={styles.notice}><p>A previous plan was found on this browser. You can copy it to your account. Your browser copy will be kept.</p><button disabled={importing} onClick={importLegacy}>{importing?'Importing…':'Import browser plan'}</button></div>}
    {tab==='setup'?<PlanSetup key={legacy?'legacy':'account'} student={student} papers={papers} preview={preview} initialDraft={account.draft || plan?.draft || undefined} onSaveDraft={draft=>persist(draft,plan)} onReviewed={activate}/>:!plan?<div className={styles.empty}><h3>Start with a week that fits your life.</h3><p>Choose your study windows and review your plan. Your sessions will then appear here.</p><Link className={styles.primary} href={href('setup')}>Set up my plan →</Link></div>:<>
    {removed.length>0 && <p className={styles.notice}>Some subjects have been removed from your profile. Their blocks are hidden; review Plan Setup to redistribute that time.</p>}
    {tab==='lectures'?<><div className={styles.sectionHead}><div><h3>Your lecture timetable</h3><p>Recurring lecture windows · {plan.draft.timezone}</p></div><Link href={href('setup')}>Edit lecture times →</Link></div>{plan.draft.mode==='self'?<div className={styles.empty}><h3>You selected self study</h3><p>If you attend classes, switch to lecture based or hybrid study in Plan Setup.</p></div>:!plan.draft.lectures.length?<div className={styles.empty}><h3>No lecture times added yet</h3><p>Add your class times in Plan Setup so independent study will not overlap them.</p></div>:<div className={styles.days}>{plan.draft.lectures.map((l,i)=><article className={styles.day} key={i}><h4>{DAYS[l.day]}</h4><p>{l.start}–{l.end}</p><span className={styles.badge}>Reserved lecture time</span></article>)}</div>}<div className={styles.pending}><h4>Still to connect</h4><p>Lecture subjects, attendance, post-lecture checks and missed-lecture catch-up will be added in the lecture workflow stage.</p></div></>:<>
    <div className={styles.sectionHead}><div><h3>{tab==='next-week'?'Looking ahead':tab==='calendar'?'Your study calendar':'This week at a glance'}</h3><p>{labelDate(week)} – {labelDate(addDays(week,6))} · {plan.draft.timezone}</p></div><Link href={href('setup')}>Adjust plan →</Link></div>
    <div className={styles.stats}><div><small>Scheduled study</small><strong>{duration(scheduled)}</strong></div><div><small>Study blocks</small><strong>{sessions.length}</strong></div><div><small>Available each week</small><strong>{duration(capacity(plan.draft))}</strong></div><div><small>Recorded activity</small><strong>Not connected</strong></div></div>
    <p className={styles.hint}>{tab==='next-week'?'This is a recurring proposal for next week, not a record of completed work.':'These are planned subject blocks. Past dates do not mean missed or completed sessions.'}</p>
    <div className={styles.controls}><label>Subject<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All subjects</option>{papers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{tab==='calendar' && <div className={styles.calendarControls}><button onClick={()=>setCalendarOffset(n=>n-1)}>← Previous week</button><button onClick={()=>setCalendarOffset(0)}>Current week</button><button onClick={()=>setCalendarOffset(n=>n+1)}>Next week →</button></div>}</div>
    <div className={tab==='calendar'?styles.calendar:styles.days}>{DAYS.map((day,i)=>{const date=addDays(week,i), blocks=visible.filter(s=>s.day===i);return <article key={day} className={`${styles.day} ${date===today?styles.today:''}`}><div className={styles.dayHead}><h4>{day} <small>{labelDate(date)}</small></h4>{date===today&&<span className={styles.badge}>Today</span>}</div>{blocks.length?blocks.map((s,j)=><div className={styles.session} key={`${s.start}-${s.paperId}-${j}`}><div><span className={styles.time}>{s.start}–{s.end} · {s.duration} min</span><h5>{name(s.paperId)}</h5><span className={styles.hint}>Planned study · Topic to be selected</span></div><button onClick={()=>setOpened(s)}>View session</button></div>):<p className={styles.hint}>{filter==='all'?'No study blocks planned.':'No blocks for this subject.'}</p>}</article>})}</div>
    {opened&&<section className={styles.detail} aria-label="Session details"><div className={styles.sectionHead}><h3>{name(opened.paperId)}</h3><button onClick={()=>setOpened(null)}>Close details</button></div><p>{labelDate(opened.date)} · {opened.start}–{opened.end} · {plan.draft.timezone}</p><p>This block reserves {opened.duration} minutes for study. Open the subject to choose a topic.</p><Link className={styles.primary} href={preview?`/login?mode=preview&stage=${encodeURIComponent(student.level)}&subject=${encodeURIComponent(opened.paperId)}`:`/papers/${encodeURIComponent(opened.paperId)}`}>Open subject →</Link><p className={styles.hint}>The timer, session completion and activity recording will be connected in the study-session stage.</p></section>}
    <div className={styles.pending}><h4>Next parts of Weekly Plan</h4><p>Start and finish sessions, record study time, catch up on unfinished work and choose a task for free time. These actions are not active yet.</p></div>
    </>}
    </>}
  </section>;
}
