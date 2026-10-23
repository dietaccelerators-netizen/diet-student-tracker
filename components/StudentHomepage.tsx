'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { PortalIcon } from './PortalIcon';
import type { TrackerState } from '@/lib/types';
import { getStudent, getStudentPapers, getStudentProgress } from '@/lib/selectors';
import { stageFor } from '@/lib/stages';
import { loadPlanAccount, parseActive, type ActivePlan } from '@/lib/weekly-plan-storage';
import { propose } from '@/lib/plan-setup';
import { loadSessions, blockKey, type StudySession } from '@/lib/study-sessions';
import styles from './StudentHomepage.module.css';

const addDays=(date:string,n:number)=>{const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
const dateInZone=(zone:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const banners=[
 {label:'READING TOOLS',title:'Make room for focused reading.',text:'Choose your text size and distraction-free reading preferences.',action:'Reading preferences',url:'/dashboard?view=settings'},
 {label:'PRACTICE PREVIEW',title:'Explore the practice formats.',text:'Sample questions let you try the experience while your question bank is prepared.',action:'Explore Practice Room',url:'/dashboard?view=practice'},
 {label:'HELP WHEN YOU NEED IT',title:'Find your way around Mastrevo.',text:'Browse practical guides to lessons, planning and your account.',action:'Browse help',url:'/dashboard?view=support'}
];
export function StudentHomepage({state,studentId,preview=false}:{state:TrackerState;studentId:string;preview?:boolean}){
 const student=getStudent(state,studentId);
 const [search,setSearch]=useState(''),[banner,setBanner]=useState(0),[notices,setNotices]=useState(false);
 const [data,setData]=useState<{plan:ActivePlan|null;examDate:string;today:string;rows:StudySession[];ready:boolean;error:string}>({plan:null,examDate:'',today:'',rows:[],ready:false,error:''});
 const [retry,setRetry]=useState(0);
 const seenCompletions=useRef<Set<string>|null>(null);
 const [completion,setCompletion]=useState('');
 useEffect(()=>{
  if(!data.ready||data.error)return;
  const ids=new Set(data.rows.filter(r=>r.status==='completed').map(r=>r.id));
  if(seenCompletions.current&&[...ids].some(id=>!seenCompletions.current!.has(id)))setCompletion('Session complete. Your study plan is up to date.');
  seenCompletions.current=ids;
 },[data.rows,data.ready,data.error]);
 useEffect(()=>{if(!completion)return;const timer=setTimeout(()=>setCompletion(''),5000);return()=>clearTimeout(timer);},[completion]);
 useEffect(()=>{
  if(!student)return;
  let cancelled=false;
  async function load(){try{
   const account=preview?null:await loadPlanAccount(studentId,student!.level);
   const raw=preview?localStorage.getItem(`diet:weekly-plan:v1:preview:${studentId}:${student!.level}`):null;
   const plan=preview?(raw?parseActive(JSON.parse(raw)):null):account?.active??null;
   const today=dateInZone(plan?.draft.timezone||'Africa/Lagos');
   const week=addDays(today,-((new Date(`${today}T12:00:00Z`).getUTCDay()+6)%7));
   const rows=await loadSessions(studentId,student!.level,week,addDays(week,6),preview);
   if(!cancelled)setData({plan,examDate:plan?.draft.examDate||account?.draft?.examDate||'',today,rows,ready:true,error:''});
  }catch{if(!cancelled)setData(d=>({...d,ready:true,error:'Your plan could not be loaded. Please try again.'}));}}
  void load();const timer=setInterval(()=>void load(),60000);
  const refresh=()=>{if(document.visibilityState==='visible')void load();};
  window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{cancelled=true;clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[studentId,student?.level,preview,retry]);
 if(!student)return <p>Your profile could not be loaded.</p>;
 const papers=getStudentPapers(state,studentId),progress=getStudentProgress(state,studentId);
 const stage=stageFor(student.level)??student.level;
 const href=(url:string)=>{if(!preview)return url;const base=`/login?mode=preview&stage=${encodeURIComponent(stage)}`;if(url.startsWith('/papers/')){const [id,q]=url.slice(8).split('?');return `${base}&subject=${encodeURIComponent(id)}${q?'&'+q:''}`;}return url.replace('/dashboard?',`${base}&`);};
 const weekly=href('/dashboard?view=weekly&plan=this-week');
 const validProgress=progress.filter(p=>state.topics.some(t=>t.id===p.topicId&&papers.some(paper=>paper.id===t.paperId)));
 const recent=[...validProgress].filter(p=>p.lastStudied||p.status!=='Not Started').sort((a,b)=>(b.lastStudied||b.updatedAt).localeCompare(a.lastStudied||a.updatedAt))[0];
 const topic=state.topics.find(t=>t.id===recent?.topicId),paper=papers.find(p=>p.id===topic?.paperId);
 const nextPaper=paper||papers.find(p=>state.topics.some(t=>t.paperId===p.id))||papers[0];
 const nextTopic=topic||state.topics.filter(t=>t.paperId===nextPaper?.id).sort((a,b)=>a.displayOrder-b.displayOrder)[0];
 const resume=nextPaper?href(`/papers/${nextPaper.id}${nextTopic?'?lesson='+encodeURIComponent(nextTopic.id):''}`):href('/dashboard?view=subjects');
 const weak=[...validProgress].filter(p=>p.status==='Needs Practice'||p.questionPractice==='Reattempt').sort((a,b)=>Number(b.questionPractice==='Reattempt')-Number(a.questionPractice==='Reattempt')||a.updatedAt.localeCompare(b.updatedAt))[0];
 const weakTopic=state.topics.find(t=>t.id===weak?.topicId);
 const day=data.today?(new Date(`${data.today}T12:00:00Z`).getUTCDay()+6)%7:0;
 const week=data.today?addDays(data.today,-day):'';
 const blocks=data.plan?propose(data.plan.draft,data.plan.paperIds).filter(s=>papers.some(p=>p.id===s.paperId)).map(s=>({...s,date:addDays(week,s.day)})):[];
 const completed=(s:typeof blocks[number])=>data.rows.some(r=>r.block_key===blockKey(s)&&r.status==='completed');
 const todayBlocks=blocks.filter(s=>s.date===data.today);
 const done=blocks.filter(completed).length;
 const behind=blocks.some(s=>s.date<data.today&&!completed(s));
 const days=data.examDate&&data.today?Math.ceil((Date.parse(`${data.examDate}T00:00:00Z`)-Date.parse(`${data.today}T00:00:00Z`))/86400000):null;
 const nextSession=todayBlocks.filter(s=>!completed(s)).sort((a,b)=>a.start.localeCompare(b.start))[0];
 const openSession=data.rows.find(r=>(r.status==='running'||r.status==='paused')&&papers.some(p=>p.id===r.paper_id));
 const setup=href('/dashboard?view=weekly&plan=setup');
 const hasPlan=blocks.length>0;
 const needsSetup=!papers.length||!data.examDate||!hasPlan;
 const checklist=[
  {label:'Select your papers',detail:`${papers.length} registered`,done:papers.length>0,url:href('/dashboard?view=profile')},
  {label:'Set your exam date',detail:data.examDate,done:!!data.examDate,url:setup},
  {label:'Plan your first session',detail:'Weekly plan ready',done:hasPlan,url:setup}
 ];
 const setupCount=checklist.filter(item=>item.done).length;
 const sessionPaper=papers.find(p=>p.id===(openSession?.paper_id||nextSession?.paperId));
 const action=!data.ready?{key:'loading',label:'YOUR NEXT STEP',title:'Finding your next study action…',detail:'Loading your saved plan.',button:'',url:'',icon:'clock'}:
  openSession&&!data.error?{key:openSession.id,label:openSession.status==='running'?'SESSION IN PROGRESS':'PAUSED SESSION',title:sessionPaper!.name,detail:openSession.goal||'Return to your unfinished study session.',button:'Return to session',url:weekly,icon:'clock'}:
  nextSession&&!data.error?{key:blockKey(nextSession),label:'NEXT ON TODAY’S PLAN',title:sessionPaper!.name,detail:`${nextSession.start} · ${nextSession.duration} minutes · ${data.plan?.draft.timezone||'Africa/Lagos'}`,button:'Open scheduled session',url:weekly,icon:'weekly'}:
  nextTopic?{key:nextTopic.id,label:topic?'CONTINUE LEARNING':'START LEARNING',title:`${nextPaper!.name} — ${nextTopic.topicName}`,detail:recent?.nextStep||'Open this topic and continue at your own pace.',button:topic?'Continue topic':'Start topic',url:resume,icon:'subjects'}:
  !papers.length?{key:'papers',label:'LET’S GET YOU STARTED',title:'Choose the papers you’re preparing for.',detail:'Your subjects and study plan will be built around your selection.',button:'Choose my papers',url:href('/dashboard?view=profile'),icon:'subjects'}:
  !hasPlan&&!data.error?{key:'plan',label:'YOUR NEXT STEP',title:'Make time for your first study session.',detail:'Your papers are selected. Choose your available days to build a weekly routine.',button:'Create my study plan',url:setup,icon:'weekly'}:
  {key:'subjects',label:'YOUR LEARNING SPACE',title:'Your subjects are ready to explore.',detail:'Lesson topics are awaiting publication. Check your registered subjects for availability.',button:'View my subjects',url:href('/dashboard?view=subjects'),icon:'subjects'};
 const current=banners[banner];

 const query=search.trim().toLowerCase();
 const matches=query?[...papers.filter(p=>`${p.name} ${p.code}`.toLowerCase().includes(query)).map(p=>({id:p.id,title:p.name,url:`/papers/${p.id}`})),...state.topics.filter(t=>papers.some(p=>p.id===t.paperId)&&t.topicName.toLowerCase().includes(query)).map(t=>({id:t.id,title:t.topicName,url:`/papers/${t.paperId}?lesson=${encodeURIComponent(t.id)}`}))].slice(0,6):[];
 return <div className={`da-home ${styles.home}`}>
  <div className={styles.topbar}><div className={styles.search}><label><PortalIcon name="search"/><input aria-label="Search subjects and topics" placeholder="Search subjects and topics…" value={search} onChange={e=>setSearch(e.target.value)}/></label>{query&&<div className={styles.results}>{matches.length?matches.map(m=><Link key={m.id} href={href(m.url)}>{m.title}<span>→</span></Link>):<p>No matching subjects or topics.</p>}</div>}</div><div className={styles.notifications}><button aria-label="Notifications" aria-expanded={notices} onClick={()=>setNotices(!notices)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 6-3 6-3 9h18c0-3-3-3-3-9M10 21h4"/></svg></button>{notices&&<div className={styles.notice}><strong>Notifications</strong><p>Notifications are not connected yet. Your schedule is available in Today’s plan.</p></div>}</div><Link className={styles.profile} href={href('/dashboard?view=profile')}><span>{student.fullName.charAt(0)}</span><b>{student.fullName.split(' ')[0]}</b></Link></div>
  <header className={styles.welcome}><div><small>{stage} · YOUR STUDY WORKSPACE</small><h1>Welcome back, {student.fullName.split(' ')[0]}.</h1></div><span>{data.today?new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${data.today}T12:00:00Z`)):''}</span></header>
  <div className={styles.layout}>
   <div className={styles.mainColumn}>
    <section className={`${styles.card} ${styles.nextAction}`} aria-label="Your next study action" aria-busy={!data.ready}>
     <div className={styles.actionHeading}><span className={styles.icon}><PortalIcon name={action.icon}/></span><small>{action.label}</small></div>
     <div key={action.key} className={styles.actionContent}><h2>{action.title}</h2><p>{action.detail}</p>{action.button&&<Link className={styles.primary} href={action.url}>{action.button}<span aria-hidden="true">→</span></Link>}</div>
     {!data.ready&&<div className={styles.loadingLine}/>}
    </section>
    <div role="status" aria-live="polite" className={completion?styles.completion:styles.srOnly}>{completion&&<><PortalIcon name="check"/>{completion}</>}</div>
    <section className={`${styles.card} ${styles.today}`} aria-label="Today’s plan">
     <div className={styles.sectionHeading}><h2>Today’s plan</h2>{data.ready&&!data.error&&hasPlan&&<Link className={styles.textLink} href={weekly}>Full week <span aria-hidden="true">→</span></Link>}</div>
     {!data.ready?<p>Loading today’s sessions…</p>:data.error?<div className={styles.error}><p>{data.error}</p><button className={styles.secondary} onClick={()=>setRetry(n=>n+1)}>Try again</button></div>:todayBlocks.length?<>
      <p className={styles.caption}>{todayBlocks.filter(completed).length} of {todayBlocks.length} sessions complete · {data.plan?.draft.timezone}</p>
      <ul className={styles.sessions}>{todayBlocks.map(s=><li key={blockKey(s)} data-complete={completed(s)}><div className={styles.sessionTime}><b>{s.start}</b><span>{s.duration} min</span></div><div className={styles.sessionName}><strong>{papers.find(p=>p.id===s.paperId)?.name}</strong><span>{completed(s)?'Completed':'Scheduled study'}</span></div>{completed(s)?<span className={styles.check} aria-label="Completed"><PortalIcon name="check"/></span>:<Link className={styles.sessionLink} href={weekly} aria-label={`Open ${papers.find(p=>p.id===s.paperId)?.name} session at ${s.start}`}>Open <span aria-hidden="true">→</span></Link>}</li>)}</ul>
      {todayBlocks.every(completed)&&<p className={styles.allDone}><PortalIcon name="check"/> You’ve finished today’s planned sessions.</p>}
     </>:<div className={styles.empty}><span className={styles.icon}><PortalIcon name="weekly"/></span><div><h3>{hasPlan?'A clear day in your schedule':'Your sessions will appear here'}</h3><p>{hasPlan?'No sessions are planned for today. Your next scheduled day is in Weekly Plan.':'Once your weekly plan is ready, this space will show what to study and when.'}</p></div></div>}
    </section>
    <section className={styles.banner} aria-label="Discover Mastrevo" aria-roledescription="carousel">
     <Image src="/brand/home-study-books.png" alt="" fill sizes="(max-width: 900px) 100vw, 700px" className={styles.bannerPhoto}/>
     <div className={styles.bannerCopy} role="group" aria-label={`${banner+1} of ${banners.length}`} aria-live="polite"><small>{current.label}</small><h2>{current.title}</h2><p>{current.text}</p><Link className={styles.textLink} href={href(current.url)}>{current.action} <span aria-hidden="true">→</span></Link></div>
     <div className={styles.controls}><button aria-label="Previous feature" onClick={()=>setBanner((banner+banners.length-1)%banners.length)}>←</button><span>{banner+1} / {banners.length}</span><button aria-label="Next feature" onClick={()=>setBanner((banner+1)%banners.length)}>→</button></div>
    </section>
   </div>
   <aside className={styles.side} aria-label="Your study overview">
    {!data.ready?<section className={styles.card} aria-busy="true"><h2>Your study overview</h2><p>Loading your saved preferences…</p></section>:data.error?<section className={styles.card}><h2>Study overview unavailable</h2><p>Your saved plan could not be checked. Retry in Today’s plan.</p></section>:<>
     {needsSetup?<section className={`${styles.card} ${styles.setup}`}><div className={styles.sectionHeading}><h2>Set up your study space</h2><span className={styles.count}>{setupCount}/3</span></div><p>A few details to shape your next steps.</p><ol className={styles.checklist}>{checklist.map((item,i)=><li key={item.label} data-done={item.done}><span className={styles.step}>{item.done?<PortalIcon name="check"/>:i+1}</span><div>{item.done?<><strong>{item.label}</strong><small>{item.detail}</small></>:<Link href={item.url}>{item.label}<span aria-hidden="true"> →</span></Link>}</div></li>)}</ol></section>:<>
      <section className={`${styles.card} ${styles.exam}`} aria-label="Exam countdown"><span className={styles.eyebrow}><PortalIcon name="weekly"/> YOUR EXAM</span><div className={styles.countdown}><strong>{days!==null&&days>0?days:days===0?'Today':'Date passed'}</strong>{days!==null&&days>0&&<span>days to go</span>}</div><p>{student.examDiet||'Your saved exam date'}</p><small>{data.examDate}</small>{days!==null&&days<0&&<Link className={styles.textLink} href={setup}>Update exam date →</Link>}</section>
      <section className={styles.card}><div className={styles.sectionHeading}><h2>This week</h2><PortalIcon name="report"/></div><p><strong>{done} of {blocks.length}</strong> sessions completed</p><progress className={styles.progress} value={done} max={blocks.length} aria-label={`${done} of ${blocks.length} weekly sessions completed`}/><p className={styles.caption}>{behind?'Some earlier sessions are unfinished. Adjust your week when you’re ready.':done===blocks.length?'Your planned sessions are complete.':'Keep building your study routine, one session at a time.'}</p>{behind&&<Link className={styles.textLink} href={weekly}>Adjust my week →</Link>}</section>
     </>}
     {weakTopic&&<section className={`${styles.card} ${styles.review}`}><span className={styles.eyebrow}><PortalIcon name="target"/> YOUR REVIEW PRIORITY</span><h2>{weakTopic.topicName}</h2><p>{weak?.questionPractice==='Reattempt'?'You marked this topic for another practice attempt.':'You marked this topic as needing more practice.'}</p><Link className={styles.secondary} href={href(`/papers/${weakTopic.paperId}?lesson=${encodeURIComponent(weakTopic.id)}`)}>Review topic →</Link></section>}
    </>}
   </aside>
  </div>
 </div>;
}
