'use client';
import { PortalIcon } from './PortalIcon';
import { subjectIcon } from './PortalArtwork';
import { useTracker } from './TrackerProvider';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Paper, Profile } from '@/lib/types';
import { PlanSetup } from './PlanSetup';
import { StudySessions } from './StudySessions';
import { blockKey, loadSessions, type StudySession } from '@/lib/study-sessions';
import { DAYS, parseDraft, propose, type PlanDraft, type ProposedSession } from '@/lib/plan-setup';
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
  const {state}=useTracker();
  const [freeOpen,setFreeOpen]=useState(false),[freeMinutes,setFreeMinutes]=useState(30),[freeRows,setFreeRows]=useState<StudySession[]>([]),[freeLoading,setFreeLoading]=useState(false),[freeError,setFreeError]=useState('');
  const [calendarMode,setCalendarMode]=useState<'week'|'month'>('week');
  const [monthOffset,setMonthOffset]=useState(0);
  const freeDialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{if(freeOpen)freeDialog.current?.showModal();else freeDialog.current?.close();},[freeOpen]);
  const params = useSearchParams(), pathname = usePathname(), router = useRouter();
  const [plan,setPlan] = useState<ActivePlan|null>(null), [ready,setReady] = useState(false), [error,setError] = useState(''), [filter,setFilter] = useState('all'), [calendarOffset,setCalendarOffset] = useState(0);
  const [selectedDay,setSelectedDay]=useState<number|null>(null);
  const [opened,setOpened] = useState<DatedSession|null>(null);
  const [activity,setActivity]=useState<{week:string;rows:StudySession[];ready:boolean}>({week:'',rows:[],ready:false});
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
  const tab=TABS.some(([id])=>id===rawTab) ? rawTab! : 'this-week';
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
  const onActivity=useCallback((rows:StudySession[],ready:boolean)=>setActivity({week,rows,ready}),[week]);
  const activityReady=activity.week===week&&activity.ready;
  const results=new Map(activityReady?activity.rows.map(s=>[s.block_key,s]):[]);
  const name=(id:string)=>papers.find(p=>p.id===id)?.name || 'Subject no longer selected';
  function moveCalendar(direction:number){
    setOpened(null);setSelectedDay(null);
    if(calendarMode==='week'){setCalendarOffset(n=>n+direction);return;}
    setMonthOffset(n=>n+direction);
  }
  const monthDate=new Date(today.slice(0,7)+'-15T12:00:00Z');monthDate.setUTCMonth(monthDate.getUTCMonth()+monthOffset);
  const monthAnchor=monthDate.toISOString().slice(0,10);
  const paperCode=(id:string)=>papers.find(p=>p.id===id)?.code || 'Study';
  const route=(view:string)=>{const q=new URLSearchParams(params.toString());q.set('view',view);q.delete('plan');q.delete('setup');return `${pathname}?${q}`;};
  const subjectLink=(paperId:string)=>preview?`/login?mode=preview&stage=${encodeURIComponent(student.level)}&subject=${encodeURIComponent(paperId)}`:`/papers/${encodeURIComponent(paperId)}`;
  async function openFreeTime(){
    setFreeOpen(true);setFreeLoading(true);setFreeError('');
    try{setFreeRows(await loadSessions(student.id,student.level,addDays(start,-28),addDays(start,6),preview));}
    catch(e){setFreeError(e instanceof Error?e.message:'Study activity could not be loaded.');}
    finally{setFreeLoading(false);}
  }
  const unfinished=freeRows.filter(r=>papers.some(p=>p.id===r.paper_id)&&['partial','paused','running'].includes(r.status)).sort((a,b)=>a.plan_date.localeCompare(b.plan_date));
  const weak=state.progress.filter(p=>p.studentId===student.id&&p.status==='Needs Practice').map(p=>state.topics.find(t=>t.id===p.topicId)).find(t=>t&&papers.some(p=>p.id===t.paperId));
  const completed=activityReady?sessions.filter(s=>results.get(blockKey(s))?.status==='completed').length:0;
  const recorded=activityReady?activity.rows.filter(r=>r.plan_date>=week&&r.plan_date<=addDays(week,6)&&['completed','partial'].includes(r.status)).reduce((n,r)=>n+r.elapsed_seconds,0):0;
  const needsReview=activityReady?visible.filter(s=>{const r=results.get(blockKey(s));return r?.status==='partial'||(!r&&s.date<today);}):[];
  const sessionCard=(s:DatedSession)=>{const result=results.get(blockKey(s));return <div className={styles.session} key={blockKey(s)} data-completed={result?.status==='completed'}><div className={styles.time}><b>{s.start}</b><span>{s.end}</span></div><span className={styles.subjectCode}><PortalIcon name={subjectIcon(name(s.paperId))}/>{paperCode(s.paperId)}</span><div className={styles.sessionCopy}><h5>{result?.goal||name(s.paperId)}</h5><p>{result?.goal?name(s.paperId):'Choose your topic when you begin.'}</p><span className={styles.badge}>{!activityReady?'Checking activity…':result?.status==='completed'?'Completed':result?.status==='partial'?'Partly completed':result?.status==='running'?'In progress':result?.status==='paused'?'Paused':s.date<today?'Not recorded':'Planned study'}</span></div><span className={styles.hint}>{s.duration} min</span><button onClick={()=>setOpened(s)}>{result?'Review session':'View session'}</button><Link className={styles.studyLink} href={subjectLink(s.paperId)}>Open subject →</Link></div>;};
  if(!ready)return error ? <div role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry loading plan</button></div> : <p role="status">Loading Weekly Plan…</p>;
  return <section className={styles.page} aria-label="Weekly Plan">
    <header className={styles.header}><div><h1>Weekly Plan</h1><p>Your study schedule, recall sessions, lectures and catch-up plan in one place.</p></div><button className={styles.freeAction} onClick={openFreeTime}><PortalIcon name="clock"/>I Have Some Free Time</button></header>
    <nav className={styles.tabs} aria-label="Weekly Plan sections">{TABS.map(([id,label])=><Link key={id} href={href(id)} aria-current={tab===id?'page':undefined} onClick={()=>{setOpened(null);setFilter('all');setSelectedDay(null);}}>{label}</Link>)}</nav>
    {preview&&<p className={styles.notice}>Preview · Plans and study activity are saved on this browser only.</p>}
    {error&&<p role="alert" className={styles.notice}>{error}</p>}
    {legacy&&<div className={styles.notice}><p>A previous plan was found on this browser. Copy it to your account to continue.</p><button disabled={importing} onClick={importLegacy}>{importing?'Importing…':'Import browser plan'}</button></div>}
    {tab==='setup'?<PlanSetup key={legacy?'legacy':'account'} student={student} papers={papers} preview={preview} initialDraft={account.draft||plan?.draft||undefined} onSaveDraft={draft=>persist(draft,plan)} onReviewed={activate}/>:tab==='lectures'?<>
      <div className={styles.sectionHead}><div><h3>Lectures</h3><p>Your tuition timetable and personal follow-up, in one place.</p></div><Link href={href('setup')}>Edit lecture times →</Link></div>
      <div className={styles.lectureGrid}>
      <section className={styles.lectureCard}><h3>Upcoming Lectures</h3><p>Reserved class times in your weekly plan.</p>{plan&&plan.draft.mode!=='self'&&plan.draft.lectures.length?plan.draft.lectures.map((l,i)=><article className={styles.lectureItem} key={i}><span className={styles.badge}>{DAYS[l.day]}</span><h4>{l.start}–{l.end}</h4><p>{plan.draft.timezone} · Reserved lecture time</p><Link href={href('setup')}>View or edit lecture →</Link></article>):<div className={styles.blank}><PortalIcon name="weekly"/><p>No lecture times added yet.</p><Link href={href('setup')}>Add lecture times →</Link></div>}</section>
      <section className={styles.lectureCard}><h3>Needs to be Logged</h3><p>Attendance, topics covered and clarity after each lecture.</p><div className={styles.blank}><PortalIcon name="notes"/><p>Lecture logging is not connected yet. Your scheduled lecture windows are preserved.</p></div></section>
      <section className={styles.lectureCard}><h3>Post-Lecture Checks</h3><p>Review your understanding after a class.</p><div className={styles.blank}><p>No lecture checks available yet.</p><Link href={route('practice')}>Open Practice Room →</Link></div></section>
      <section className={styles.lectureCard}><h3>Missed / Catch-Up</h3><p>Make room to revisit a class when you need it.</p><div className={styles.blank}><p>Attendance has not been recorded. No lectures are marked as missed.</p><Link href={href('setup')}>Adjust my availability →</Link></div></section>
      </div>
    </>:<>
      <div className={styles.stats}><div><small>Weekly target</small><strong>{plan?duration(scheduled):'Not set'}</strong><p>Planned study time</p></div><div><small>Completed study</small><strong>{activityReady?duration(Math.round(recorded/60)):'—'}</strong><p>Recorded time for this week</p></div><div><small>Sessions</small><strong>{activityReady?`${completed}/${sessions.length}`:'—'}</strong><p>Completed study blocks</p></div><div><small>Questions attempted</small><strong>—</strong><p>Practice results are in Learning Report</p></div></div>
      {tab==='next-week'&&<section className={styles.ahead}><h3>Before next week begins</h3><p>Review unfinished work and your available time before starting a new week.</p><div className={styles.recommendations}><article><small>Catch up</small><h4>Review unfinished sessions</h4><p>Check this week’s saved results before allocating more time.</p><Link href={href('this-week')}>Review this week →</Link></article><article><small>Weak areas</small><h4>Use your learning report</h4><p>Identify topics that would benefit from another practice session.</p><Link href={route('report')}>Open Learning Report →</Link></article><article><small>New learning</small><h4>Continue your study path</h4><p>Your recurring availability supplies the proposed sessions below.</p><Link href={href('setup')}>Review availability →</Link></article></div></section>}
      {needsReview.length>0&&tab==='this-week'&&<section className={styles.recovery}><div><h3>Your plan needs a small review</h3><p>{needsReview.length} session{needsReview.length===1?'':'s'} {needsReview.length===1?'has':'have'} unfinished or unrecorded work. Review the result before deciding what needs moving.</p></div><button onClick={()=>setOpened(needsReview[0])}>Review unfinished work</button></section>}
      <div className={styles.sectionHead}><div><h3>{tab==='next-week'?'Next Week':tab==='calendar'?'Calendar':'This Week'}</h3><p>{labelDate(week)} – {labelDate(addDays(week,6))} · {plan?.draft.timezone||'Africa/Lagos'}</p></div>{tab==='calendar'?<div className={styles.segmented} aria-label="Calendar view">{(['week','month'] as const).map(mode=><button key={mode} aria-pressed={calendarMode===mode} onClick={()=>{setCalendarMode(mode);setSelectedDay(null);}}>{mode==='week'?'Week':'Month'}</button>)}</div>:<Link href={href('setup')}>Adjust plan →</Link>}</div>
      {!plan?<div className={styles.empty}><PortalIcon name="weekly"/><h3>Start with a week that fits your life.</h3><p>Choose your available days and study windows. Your saved schedule will appear in This Week, Next Week and Calendar.</p><Link className={styles.primary} href={href('setup')}>Set up my plan →</Link></div>:<>
        {removed.length>0&&<p className={styles.notice}>Subjects removed from your profile are hidden. Review Plan Setup to redistribute their time.</p>}
        {tab==='next-week'&&<p className={styles.hint}>Proposed recurring schedule. Catch-up work is not automatically moved into these sessions.</p>}
        <div className={styles.controls}><label>Subject<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All subjects</option>{papers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{tab==='calendar'&&<div className={styles.calendarControls}><button onClick={()=>{moveCalendar(-1);}}>← Previous</button><button onClick={()=>{setOpened(null);setSelectedDay(null);setCalendarOffset(0);setMonthOffset(0);}}>Today</button><button onClick={()=>{moveCalendar(1);}}>Next →</button></div>}</div>
        <StudySessions student={student} papers={papers} week={week} end={addDays(week,6)} selected={opened} preview={preview} onActivity={onActivity} onClose={()=>setOpened(null)} compact/>
        {tab==='calendar'&&calendarMode==='month'?<PlanMonth week={monthAnchor} today={today} recurring={recurring.filter(s=>filter==='all'||s.paperId===filter)} name={paperCode} onDay={date=>{setCalendarOffset(Math.round((new Date(monday(date)+'T12:00:00Z').getTime()-new Date(start+'T12:00:00Z').getTime())/604800000));setSelectedDay((new Date(date+'T12:00:00Z').getUTCDay()+6)%7);setCalendarMode('week');}}/>:<>
          {tab!=='calendar'&&<nav className={styles.dayFilters} aria-label="Filter planned sessions by day"><button aria-pressed={selectedDay===null} onClick={()=>setSelectedDay(null)}>All days</button>{DAYS.map((d,i)=><button key={d} aria-pressed={selectedDay===i} onClick={()=>setSelectedDay(i)}>{d.slice(0,3)}</button>)}</nav>}
          <div className={tab==='calendar'?styles.calendar:styles.days}>{DAYS.map((day,i)=>{if(selectedDay!==null&&selectedDay!==i)return null;const date=addDays(week,i),blocks=visible.filter(s=>s.day===i);return <article key={day} className={`${styles.day} ${date===today?styles.today:''}`}><div className={styles.dayHead}><div><h4>{day}</h4><small>{labelDate(date)}</small></div><span>{date===today?'Today · ':''}{blocks.length} session{blocks.length===1?'':'s'}</span></div>{blocks.length?blocks.map(sessionCard):<p className={styles.noSession}>No compulsory session{filter!=='all'?' for this subject':''}.</p>}</article>;})}</div>
        </>}
      </>}
    </>}
    <dialog ref={freeDialog} className={styles.freeDialog} onCancel={()=>setFreeOpen(false)} onClose={()=>setFreeOpen(false)} aria-labelledby="free-time-title"><div className={styles.dialogHead}><div><h2 id="free-time-title">I Have Some Free Time</h2><p>Check unfinished work before starting something new.</p></div><button aria-label="Close free time" onClick={()=>setFreeOpen(false)}>×</button></div><fieldset><legend>How much time do you have?</legend><div className={styles.timeChoices}>{[15,30,45,60].map(n=><button key={n} aria-pressed={freeMinutes===n} onClick={()=>setFreeMinutes(n)}>{n} mins</button>)}</div></fieldset>{freeLoading?<p role="status">Checking your recent study activity…</p>:freeError?<div role="alert"><p>{freeError}</p><button onClick={openFreeTime}>Retry</button></div>:<div className={styles.freeSuggestion}><small>RECOMMENDED RIGHT NOW · {freeMinutes} MINUTES</small>{unfinished[0]?<><h3>{unfinished[0].goal}</h3><p>{unfinished[0].paper_name} · Unfinished study</p><p>Use this time to continue part of your goal. This does not change its saved session result.</p><Link className={styles.primary} onClick={()=>setFreeOpen(false)} href={subjectLink(unfinished[0].paper_id)}>Continue learning →</Link></>:weak?<><h3>{weak.topicName}</h3><p>This topic is marked as needing practice.</p><Link className={styles.primary} onClick={()=>setFreeOpen(false)} href={`${route('practice')}&subject=${encodeURIComponent(weak.paperId)}&topic=${encodeURIComponent(weak.id)}`}>Open Practice Room →</Link></>:<><h3>Choose your next small step</h3><p>No unfinished study was found in the last four weeks, and no selected topic is flagged for practice.</p><div className={styles.freeLinks}><Link href={route('subjects')} onClick={()=>setFreeOpen(false)}>Study a concept →</Link><Link href={route('resources')} onClick={()=>setFreeOpen(false)}>Browse resources →</Link><Link href={route('practice')} onClick={()=>setFreeOpen(false)}>Practise a question →</Link></div></>}</div>}</dialog>
  </section>;
}
function PlanMonth({week,today,recurring,name,onDay}:{week:string;today:string;recurring:ProposedSession[];name:(id:string)=>string;onDay:(date:string)=>void}){
  const first=week.slice(0,7)+'-01',gridStart=monday(first);
  const monthName=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(first+'T12:00:00Z'));
  const next=new Date(first+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);
  const last=addDays(next.toISOString().slice(0,10),-1),count=Math.ceil((Number(last.slice(-2))+(new Date(first+'T12:00:00Z').getUTCDay()+6)%7)/7)*7;
  return <section className={styles.month} aria-label={monthName}><h3>{monthName}</h3><p>Recurring plan · choose a date to see its sessions.</p><div className={styles.monthGrid}>{DAYS.map(day=><b key={day}>{day.slice(0,3)}</b>)}{Array.from({length:count},(_,i)=>{const date=addDays(gridStart,i),blocks=recurring.filter(s=>s.day===i%7);return <button key={date} data-outside={date.slice(0,7)!==first.slice(0,7)} aria-current={date===today?'date':undefined} aria-label={`${date}, ${blocks.length} planned sessions`} onClick={()=>onDay(date)}><strong>{Number(date.slice(-2))}</strong>{blocks.slice(0,2).map((s,j)=><span key={j}>{s.start} · {name(s.paperId)}</span>)}{blocks.length>2&&<small>+{blocks.length-2} more</small>}</button>;})}</div></section>;
}
