'use client';
import { PortalIcon } from './PortalIcon';
import { subjectIcon } from './PortalArtwork';
import { useTracker } from './TrackerProvider';

import Link from 'next/link';
import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Paper, Profile } from '@/lib/types';
import { PlanSetup } from './PlanSetup';
import { StudySessions } from './StudySessions';
import { blockKey, loadSessions, loadSessionForBlock, type StudySession } from '@/lib/study-sessions';
import { DAYS, parseDraft, propose, type PlanDraft } from '@/lib/plan-setup';
import styles from './WeeklyPlan.module.css';
import { scheduledRange, moveError, endTime, type DatedSession, type SessionMove } from '@/lib/plan-schedule';
import { emptyAccount, loadPlanAccount, savePlanAccount, parseActive, type ActivePlan, type PlanAccount } from '@/lib/weekly-plan-storage';

const TABS = [['this-week','This Week'],['next-week','Next Week'],['calendar','Calendar'],['lectures','Lectures'],['setup','Plan Setup']] as const;
function dateInZone(zone: string) { return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
function addDays(date: string, count: number) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+count); return d.toISOString().slice(0,10); }
function monday(date: string) { return addDays(date,-((new Date(`${date}T12:00:00Z`).getUTCDay()+6)%7)); }
function labelDate(date: string) { return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`)); }
function duration(minutes: number) { return `${Math.floor(minutes/60)}h${minutes%60 ? ` ${minutes%60}m` : ''}`; }

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
  const [moving,setMoving]=useState<DatedSession|null>(null),[moveDate,setMoveDate]=useState(''),[moveTime,setMoveTime]=useState(''),[moveBusy,setMoveBusy]=useState(false),[moveMessage,setMoveMessage]=useState('');
  const [undo,setUndo]=useState<{key:string;previous?:SessionMove;current:SessionMove}|null>(null),[announcement,setAnnouncement]=useState('');
  const moveDialog=useRef<HTMLDialogElement>(null),listRef=useRef<HTMLDivElement>(null),positions=useRef(new Map<string,DOMRect>());
  useEffect(()=>{if(moving)moveDialog.current?.showModal();else moveDialog.current?.close();},[moving]);
  useLayoutEffect(()=>{
    const nodes=listRef.current?.querySelectorAll<HTMLElement>('[data-session-key]');
    nodes?.forEach(node=>{const key=node.dataset.sessionKey!,rect=node.getBoundingClientRect(),old=positions.current.get(key);if(old&&document.documentElement.dataset.reduceMotion!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(old.top!==rect.top||old.left!==rect.left))node.animate([{transform:`translate(${old.left-rect.left}px,${old.top-rect.top}px)`},{transform:'translate(0,0)'}],{duration:220,easing:'ease-out'});});
    positions.current.clear();
  },[plan,filter,selectedDay]);
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
    const next: ActivePlan={version:1,draft,paperIds:papers.map(p=>p.id),savedAt:new Date().toISOString(),moves:plan?.moves};
    await persist(draft,next);
    setUndo(null);setAnnouncement('');
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
  const offset=tab==='next-week'?1:tab==='calendar'?calendarOffset:0;
  const week=addDays(start,offset*7), sessions=plan?scheduledRange(plan,week,addDays(week,6),papers.map(p=>p.id)):[];
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
  const recorded=activityReady?activity.rows.filter(r=>r.plan_date>=week&&r.plan_date<=addDays(week,6)&&r.status==='completed').reduce((n,r)=>n+r.elapsed_seconds,0):0;
  const nowTime=new Intl.DateTimeFormat('en-GB',{timeZone:plan?.draft.timezone||'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const ongoing=activityReady?activity.rows.find(r=>r.status==='running'||r.status==='paused'):undefined;
  const nextSession=activityReady?sessions.find(s=>s.date===today&&s.end>=nowTime&&!results.has(blockKey(s)))||sessions.find(s=>s.date>today&&!results.has(blockKey(s))):undefined;
  const nextResult=ongoing || (nextSession?results.get(blockKey(nextSession)):undefined);
  const nextPaper=ongoing?.paper_id||nextSession?.paperId;
  function status(s:DatedSession){const r=results.get(blockKey(s));return !activityReady?'Checking activity…':r?.status==='completed'?'Completed':r?.status==='partial'?'Partly completed':r?.status==='running'?'In progress':r?.status==='paused'?'Paused':s.date<today||(s.date===today&&s.end<nowTime)?'Missed':s.movedFrom?'Rescheduled':'Upcoming';}
  function openMove(s:DatedSession){setMoving(s);setMoveDate(s.date<today?today:s.date);setMoveTime(s.start);setMoveMessage('');}
  function rememberPositions(){positions.current.clear();listRef.current?.querySelectorAll<HTMLElement>('[data-session-key]').forEach(node=>positions.current.set(node.dataset.sessionKey!,node.getBoundingClientRect()));}
  async function saveMove(revert=false){
    if(!plan||moveBusy)return;
    const key=revert?undo?.key:moving&&blockKey(moving);
    if(!key)return;
    setMoveBusy(true);setMoveMessage('');
    try{
      const existing=await loadSessionForBlock(student.id,student.level,key,preview);
      if(existing)throw new Error('This session already has recorded activity. Its time cannot be moved.');
      let moves=(plan.moves||[]).filter(m=>blockKey(m.source)!==key);
      if(revert&&undo){
        const current=plan.moves?.find(m=>blockKey(m.source)===key);
        if(JSON.stringify(current)!==JSON.stringify(undo.current))throw new Error('The session has changed since this move. Reload your plan.');
        const source=undo.current.source,target=undo.previous||{source,date:source.date,start:source.start,end:source.end};
        if(scheduledRange({...plan,moves},target.date,target.date).some(s=>blockKey(s)!==key&&s.start<target.end&&s.end>target.start))throw new Error('The original time now overlaps another session. Move the session to a free slot instead.');
        if(undo.previous)moves.push(undo.previous);
      }else if(moving){
        const issue=moveError(plan,moving,moveDate,moveTime,today,nowTime);if(issue)throw new Error(issue);
        if(moves.length>=250)throw new Error('Your plan has reached its saved move limit. Please contact support.');
        moves.push({source:moving.movedFrom||{date:moving.date,paperId:moving.paperId,start:moving.start,end:moving.end,duration:moving.duration},date:moveDate,start:moveTime,end:endTime(moveTime,moving.duration)});
      }
      rememberPositions();
      await persist(account.draft||plan.draft,{...plan,moves});
      if(revert){setAnnouncement('Session returned to its previous time.');setUndo(null);}
      else {setUndo({key,previous:plan.moves?.find(m=>blockKey(m.source)===key),current:moves[moves.length-1]});setAnnouncement(`Session moved to ${labelDate(moveDate)} at ${moveTime}.`);setMoving(null);setSelectedDay(null);setFilter('all');setOpened(null);}
    }catch(e){const message=e instanceof Error?e.message:'The session could not be moved.';if(revert)setAnnouncement(message);else setMoveMessage(message);}
    finally{setMoveBusy(false);}
  }
  const sessionCard=(s:DatedSession)=>{const result=results.get(blockKey(s)),label=status(s);return <div className={styles.session} key={blockKey(s)} data-session-key={blockKey(s)} data-completed={result?.status==='completed'}><div className={styles.time}><b>{s.start}</b><span>{s.end}</span></div><span className={styles.subjectCode}><PortalIcon name={subjectIcon(name(s.paperId))}/>{paperCode(s.paperId)}</span><div className={styles.sessionCopy}><h5>{name(s.paperId)}</h5><p>{result?.goal||'Choose a topic when you start.'}</p><span className={styles.badge} data-state={label}>{label}</span>{s.movedFrom&&<small className={styles.movedNote}>Moved from {labelDate(s.movedFrom.date)}, {s.movedFrom.start}</small>}{label==='Missed'&&<small className={styles.movedNote}>No study activity recorded.</small>}</div><span className={styles.hint}>{s.duration} min</span><div className={styles.sessionActions}><button disabled={!activityReady} onClick={()=>setOpened(s)}>{result?.status==='completed'||result?.status==='partial'?'View result':result?'Return to session':'Start session'}</button>{!result&&<button className={styles.moveAction} disabled={!activityReady||moveBusy} onClick={()=>openMove(s)}>Move session</button>}</div></div>;};
  if(!ready)return error ? <div role="alert"><p>{error}</p><button onClick={()=>setRetry(n=>n+1)}>Retry loading plan</button></div> : <p role="status">Loading Weekly Plan…</p>;
  return <section className={styles.page} aria-label="Weekly Plan">
    <header className={styles.header}><div><h1>Weekly Plan</h1><p>Make time for today’s next step.</p></div><button className={styles.freeAction} onClick={openFreeTime}><PortalIcon name="clock"/>I Have Some Free Time</button></header>
    {tab==='this-week'&&plan&&(sessions.length>0||ongoing)&&<section className={styles.nextSession} aria-label="Next study session"><div className={styles.nextIcon}><PortalIcon name={nextPaper?subjectIcon(name(nextPaper)):'weekly'}/></div><div className={styles.nextCopy}><span className={styles.eyebrow}>{ongoing?'CONTINUE YOUR SESSION':nextSession?.date===today?'TODAY’S NEXT SESSION':nextSession?'NEXT SCHEDULED SESSION':'TODAY’S PLAN'}</span><h2>{!activityReady?'Loading your next session…':nextPaper?name(nextPaper):'You’re clear for today'}</h2><p>{nextResult?.goal||(nextSession?'Choose your topic before starting the timer.':'No more scheduled sessions are waiting. Continue at your own pace.')}</p>{(nextSession||ongoing)&&<small>{ongoing?`${ongoing.planned_minutes} min · ${ongoing.status==='running'?'In progress':'Paused'}`:`${nextSession!.date===today?'Today':labelDate(nextSession!.date)} · ${nextSession!.start}–${nextSession!.end} · ${nextSession!.duration} min`} · {plan.draft.timezone}</small>}</div><div className={styles.nextActions}>{nextPaper?<><button className={styles.primary} onClick={()=>{setOpened(ongoing?null:nextSession||null);document.getElementById('weekly-session-workspace')?.scrollIntoView({block:'start',behavior:'instant'});}}>{ongoing?'Return to session':'Start session'}</button>{!ongoing&&nextSession&&<button onClick={()=>openMove(nextSession)}>Move session</button>}</>:activityReady?<button onClick={openFreeTime}>Use some free time</button>:null}</div></section>}
    {plan&&tab!=='setup'&&tab!=='lectures'&&<div id="weekly-session-workspace"><StudySessions student={student} papers={papers} week={week} end={addDays(week,6)} selected={opened} preview={preview} onActivity={onActivity} onClose={()=>setOpened(null)} compact/></div>}
    {tab==='this-week'&&!ongoing&&(!plan||sessions.length===0)&&<div className={styles.empty}><PortalIcon name="weekly"/><h2>{!plan?'Create your first weekly plan':'Make room for your next session'}</h2><p>{!plan?'Choose your study days and available time. We’ll arrange your selected papers into a manageable week.':'No sessions are scheduled this week. Review your availability and selected papers to build your plan.'}</p><Link className={styles.primary} href={href('setup')}>{!plan?'Create your first weekly plan':'Adjust my plan'} →</Link></div>}
    {announcement&&<div className={styles.undoNotice}><p role="status">{announcement}</p>{undo&&<Link href={href('calendar')} onClick={()=>{setCalendarMode('week');setCalendarOffset(Math.round((Date.parse(monday(undo.current.date))-Date.parse(start))/604800000));setSelectedDay((new Date(undo.current.date+'T12:00:00Z').getUTCDay()+6)%7);}}>View moved session</Link>}{undo&&<button disabled={moveBusy} onClick={()=>saveMove(true)}>{moveBusy?'Saving…':'Undo move'}</button>}</div>}
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
      {plan&&sessions.length>0&&<div className={styles.compactStats} aria-label="Week summary"><span>Planned <strong>{duration(scheduled)}</strong></span><span>Completed time <strong>{activityReady?duration(Math.round(recorded/60)):'—'}</strong></span><span>Remaining sessions <strong>{activityReady?sessions.length-completed:'—'}</strong></span></div>}
      {tab==='next-week'&&<section className={styles.ahead}><h3>Before next week begins</h3><p>Review unfinished work and your available time before starting a new week.</p><div className={styles.recommendations}><article><small>Catch up</small><h4>Review unfinished sessions</h4><p>Check this week’s saved results before allocating more time.</p><Link href={href('this-week')}>Review this week →</Link></article><article><small>Weak areas</small><h4>Use your learning report</h4><p>Identify topics that would benefit from another practice session.</p><Link href={route('report')}>Open Learning Report →</Link></article><article><small>New learning</small><h4>Continue your study path</h4><p>Your recurring availability supplies the proposed sessions below.</p><Link href={href('setup')}>Review availability →</Link></article></div></section>}

      {(plan&&sessions.length>0||tab!=='this-week')&&<div className={styles.sectionHead}><div><h3>{tab==='next-week'?'Next Week':tab==='calendar'?'Calendar':'This Week'}</h3><p>{labelDate(week)} – {labelDate(addDays(week,6))} · {plan?.draft.timezone||'Africa/Lagos'}</p></div>{tab==='calendar'?<div className={styles.segmented} aria-label="Calendar view">{(['week','month'] as const).map(mode=><button key={mode} aria-pressed={calendarMode===mode} onClick={()=>{setCalendarMode(mode);setSelectedDay(null);}}>{mode==='week'?'Week':'Month'}</button>)}</div>:<Link href={href('setup')}>Adjust plan →</Link>}</div>}
      {!plan?(tab==='this-week'?null:<div className={styles.empty}><PortalIcon name="weekly"/><h3>Start with a week that fits your life.</h3><p>Choose your available days and study windows. Your saved schedule will appear in This Week, Next Week and Calendar.</p><Link className={styles.primary} href={href('setup')}>Create your first weekly plan →</Link></div>):<>
        {removed.length>0&&propose(plan.draft,plan.paperIds).some(s=>removed.includes(s.paperId))&&<p className={styles.notice}>Subjects removed from your profile are hidden. Review Plan Setup to redistribute their time.</p>}
        {tab==='next-week'&&<p className={styles.hint}>Your recurring schedule and any sessions you’ve moved here. Use Move session to bring unfinished work forward.</p>}
        {sessions.length>0||tab==='calendar'?<div className={styles.controls}><label>Subject<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All subjects</option>{papers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{tab==='calendar'&&<div className={styles.calendarControls}><button onClick={()=>{moveCalendar(-1);}}>← Previous</button><button onClick={()=>{setOpened(null);setSelectedDay(null);setCalendarOffset(0);setMonthOffset(0);}}>Today</button><button onClick={()=>{moveCalendar(1);}}>Next →</button></div>}</div>:null}

        {sessions.length===0&&tab!=='calendar'?(tab==='next-week'?<div className={styles.empty}><h3>No sessions planned for next week</h3><p>Adjust your availability to make time for your papers.</p><Link className={styles.primary} href={href('setup')}>Adjust my plan →</Link></div>:null):tab==='calendar'&&calendarMode==='month'?<PlanMonth week={monthAnchor} today={today} plan={plan} paperIds={papers.filter(p=>filter==='all'||p.id===filter).map(p=>p.id)} name={paperCode} onDay={date=>{setCalendarOffset(Math.round((new Date(monday(date)+'T12:00:00Z').getTime()-new Date(start+'T12:00:00Z').getTime())/604800000));setSelectedDay((new Date(date+'T12:00:00Z').getUTCDay()+6)%7);setCalendarMode('week');}}/>:<>
          {(tab!=='calendar'||selectedDay!==null)&&<nav className={styles.dayFilters} aria-label="Filter planned sessions by day"><button aria-pressed={selectedDay===null} onClick={()=>setSelectedDay(null)}>All days</button>{DAYS.map((d,i)=><button key={d} aria-pressed={selectedDay===i} onClick={()=>setSelectedDay(i)}>{d.slice(0,3)}</button>)}</nav>}
          {visible.length===0&&selectedDay===null&&tab!=='calendar'&&<p className={styles.notice}>No sessions for this subject this week. Choose another subject or adjust your plan.</p>}<div ref={listRef} className={tab==='calendar'&&selectedDay===null?styles.calendar:styles.days}>{DAYS.map((day,i)=>{if(selectedDay!==null&&selectedDay!==i)return null;const date=addDays(week,i),blocks=visible.filter(s=>s.day===i);if(!blocks.length&&tab!=='calendar'&&selectedDay===null)return null;return <article key={day} className={`${styles.day} ${date===today?styles.today:''}`}><div className={styles.dayHead}><div><h4>{day}</h4><small>{labelDate(date)}</small></div><span>{date===today?'Today · ':''}{blocks.length} session{blocks.length===1?'':'s'}</span></div>{blocks.length?blocks.map(sessionCard):<p className={styles.noSession}>No scheduled session{filter!=='all'?' for this subject':''}.</p>}</article>;})}</div>
        </>}
      </>}
    </>}
    <dialog ref={moveDialog} className={styles.freeDialog} aria-labelledby="move-session-title" onCancel={e=>{if(moveBusy)e.preventDefault();else setMoving(null);}} onClose={()=>{if(!moveBusy)setMoving(null);}}><form onSubmit={e=>{e.preventDefault();void saveMove();}}><div className={styles.dialogHead}><div><h2 id="move-session-title">Move session</h2><p>{moving&&name(moving.paperId)} · {moving?.duration} minutes</p></div><button type="button" disabled={moveBusy} aria-label="Close move session" onClick={()=>setMoving(null)}>×</button></div><p>Move this session only. Your weekly routine stays the same.</p><div className={styles.moveFields}><label>Day<input type="date" required min={today} max={addDays(today,90)} value={moveDate} onChange={e=>setMoveDate(e.target.value)} disabled={moveBusy}/></label><label>Start time<input type="time" required value={moveTime} onChange={e=>setMoveTime(e.target.value)} disabled={moveBusy}/></label></div><p className={styles.hint}>Times are in {plan?.draft.timezone||'Africa/Lagos'}. Choose a time you’re available; overlapping sessions and lectures are checked before saving.</p>{moveMessage&&<p role="alert">{moveMessage}</p>}<div className={styles.sessionActions}><button type="button" disabled={moveBusy} onClick={()=>setMoving(null)}>Cancel</button><button className={styles.primary} disabled={moveBusy} type="submit">{moveBusy?'Moving…':'Save new time'}</button></div></form></dialog>
    <dialog ref={freeDialog} className={styles.freeDialog} onCancel={()=>setFreeOpen(false)} onClose={()=>setFreeOpen(false)} aria-labelledby="free-time-title"><div className={styles.dialogHead}><div><h2 id="free-time-title">I Have Some Free Time</h2><p>Check unfinished work before starting something new.</p></div><button aria-label="Close free time" onClick={()=>setFreeOpen(false)}>×</button></div><fieldset><legend>How much time do you have?</legend><div className={styles.timeChoices}>{[15,30,45,60].map(n=><button key={n} aria-pressed={freeMinutes===n} onClick={()=>setFreeMinutes(n)}>{n} mins</button>)}</div></fieldset>{freeLoading?<p role="status">Checking your recent study activity…</p>:freeError?<div role="alert"><p>{freeError}</p><button onClick={openFreeTime}>Retry</button></div>:<div className={styles.freeSuggestion}><small>RECOMMENDED RIGHT NOW · {freeMinutes} MINUTES</small>{unfinished[0]?<><h3>{unfinished[0].goal}</h3><p>{unfinished[0].paper_name} · Unfinished study</p><p>Use this time to continue part of your goal. This does not change its saved session result.</p><Link className={styles.primary} onClick={()=>setFreeOpen(false)} href={subjectLink(unfinished[0].paper_id)}>Continue learning →</Link></>:weak?<><h3>{weak.topicName}</h3><p>This topic is marked as needing practice.</p><Link className={styles.primary} onClick={()=>setFreeOpen(false)} href={`${route('practice')}&subject=${encodeURIComponent(weak.paperId)}&topic=${encodeURIComponent(weak.id)}`}>Open Practice Room →</Link></>:<><h3>Choose your next small step</h3><p>No unfinished study was found in the last four weeks, and no selected topic is flagged for practice.</p><div className={styles.freeLinks}><Link href={route('subjects')} onClick={()=>setFreeOpen(false)}>Study a concept →</Link><Link href={route('resources')} onClick={()=>setFreeOpen(false)}>Browse resources →</Link><Link href={route('practice')} onClick={()=>setFreeOpen(false)}>Practise a question →</Link></div></>}</div>}</dialog>
  </section>;
}
function PlanMonth({week,today,plan,paperIds,name,onDay}:{week:string;today:string;plan:ActivePlan;paperIds:string[];name:(id:string)=>string;onDay:(date:string)=>void}){
  const first=week.slice(0,7)+'-01',gridStart=monday(first);
  const monthName=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(first+'T12:00:00Z'));
  const next=new Date(first+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);
  const last=addDays(next.toISOString().slice(0,10),-1),count=Math.ceil((Number(last.slice(-2))+(new Date(first+'T12:00:00Z').getUTCDay()+6)%7)/7)*7;
  return <section className={styles.month} aria-label={monthName}><h3>{monthName}</h3><p>Your scheduled sessions, including any moves. Choose a date to open the day.</p><div className={styles.monthGrid}>{DAYS.map(day=><b key={day}>{day.slice(0,3)}</b>)}{Array.from({length:count},(_,i)=>{const date=addDays(gridStart,i),blocks=scheduledRange(plan,date,date,paperIds);return <button key={date} data-outside={date.slice(0,7)!==first.slice(0,7)} aria-current={date===today?'date':undefined} aria-label={`${date}, ${blocks.length} planned sessions`} onClick={()=>onDay(date)}><strong>{Number(date.slice(-2))}</strong>{blocks.slice(0,2).map((s,j)=><span key={j}>{s.start} · {name(s.paperId)}</span>)}{blocks.length>2&&<small>+{blocks.length-2} more</small>}</button>;})}</div></section>;
}
