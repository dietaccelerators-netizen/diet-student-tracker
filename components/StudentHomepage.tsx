'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PortalIcon } from './PortalIcon';
import { PortalArtwork, subjectIcon } from './PortalArtwork';
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
 {label:'STAY ON TRACK',title:'Build knowledge today for a brighter tomorrow.',text:'Stay consistent, follow your plan, and take one step closer to exam success.',action:'Keep learning',view:'subjects',icon:'subjects'},
 {label:'PRACTISE WITH PURPOSE',title:'Make what you learn easier to recall.',text:'Try the sample questions in your Practice room.',action:'Open Practice room',view:'practice',icon:'practice'},
 {label:'YOUR STUDY LIBRARY',title:'Keep the right resources within reach.',text:'Find official study texts and examination materials for your stage.',action:'Browse resources',view:'resources',icon:'resources'}
];
export function StudentHomepage({state,studentId,preview=false}:{state:TrackerState;studentId:string;preview?:boolean}){
 const student=getStudent(state,studentId);
 const [search,setSearch]=useState(''),[banner,setBanner]=useState(0),[notices,setNotices]=useState(false);
 const [data,setData]=useState<{plan:ActivePlan|null;examDate:string;today:string;rows:StudySession[];ready:boolean;error:string}>({plan:null,examDate:'',today:'',rows:[],ready:false,error:''});
 const [retry,setRetry]=useState(0);
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
  return()=>{cancelled=true;clearInterval(timer);};
 },[studentId,student?.level,preview,retry]);
 if(!student)return <p>Your profile could not be loaded.</p>;
 const papers=getStudentPapers(state,studentId),progress=getStudentProgress(state,studentId);
 const stage=stageFor(student.level)??student.level;
 const href=(url:string)=>{if(!preview)return url;const base=`/login?mode=preview&stage=${encodeURIComponent(stage)}`;if(url.startsWith('/papers/')){const [id,q]=url.slice(8).split('?');return `${base}&subject=${encodeURIComponent(id)}${q?'&'+q:''}`;}return url.replace('/dashboard?',`${base}&`);};
 const weekly=href('/dashboard?view=weekly&plan=this-week');
 const validProgress=progress.filter(p=>state.topics.some(t=>t.id===p.topicId&&papers.some(paper=>paper.id===t.paperId)));
 const recent=[...validProgress].filter(p=>p.lastStudied||p.status!=='Not Started').sort((a,b)=>(b.lastStudied||b.updatedAt).localeCompare(a.lastStudied||a.updatedAt))[0];
 const topic=state.topics.find(t=>t.id===recent?.topicId),paper=papers.find(p=>p.id===topic?.paperId);
 const nextPaper=paper||papers[0];
 const nextTopic=topic||state.topics.filter(t=>t.paperId===nextPaper?.id).sort((a,b)=>a.displayOrder-b.displayOrder)[0];
 const resume=nextPaper&&nextTopic?href(`/papers/${nextPaper.id}?lesson=${encodeURIComponent(nextTopic.id)}`):href('/dashboard?view=subjects');
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
 const current=banners[banner];
 const query=search.trim().toLowerCase();
 const matches=query?[...papers.filter(p=>`${p.name} ${p.code}`.toLowerCase().includes(query)).map(p=>({id:p.id,title:p.name,url:`/papers/${p.id}`})),...state.topics.filter(t=>papers.some(p=>p.id===t.paperId)&&t.topicName.toLowerCase().includes(query)).map(t=>({id:t.id,title:t.topicName,url:`/papers/${t.paperId}?lesson=${encodeURIComponent(t.id)}`}))].slice(0,6):[];
 return <div className={`da-home ${styles.home}`}>
  <div className={styles.topbar}><div className={styles.search}><label><PortalIcon name="search"/><input aria-label="Search subjects and topics" placeholder="Search subjects and topics…" value={search} onChange={e=>setSearch(e.target.value)}/></label>{query&&<div className={styles.results}>{matches.length?matches.map(m=><Link key={m.id} href={href(m.url)}>{m.title}<span>→</span></Link>):<p>No matching subjects or topics.</p>}</div>}</div><div className={styles.notifications}><button aria-label="Notifications" aria-expanded={notices} onClick={()=>setNotices(!notices)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 6-3 6-3 9h18c0-3-3-3-3-9M10 21h4"/></svg></button>{notices&&<div className={styles.notice}><strong>Notifications</strong><p>Personal notifications are not available yet. Study reminders appear below.</p></div>}</div><Link className={styles.profile} href={href('/dashboard?view=profile')}><span>{student.fullName.charAt(0)}</span><b>{student.fullName.split(' ')[0]}</b></Link></div>
  <div className={styles.layout}>
   <header className={styles.welcome}><small>WELCOME BACK</small><h1>{student.fullName.split(' ')[0]}</h1><p>Stay consistent, keep learning and make progress towards your exam goals.</p><span>{stage} · Your study workspace</span></header>

   <section className={styles.banner} aria-label="Study reminders" aria-roledescription="carousel"><div className={styles.bannerCopy} role="group" aria-label={`${banner+1} of 3`}><small>{current.label}</small><h2>{current.title}</h2><p>{current.text}</p><Link className={styles.primary} href={banner===0?resume:href(`/dashboard?view=${current.view}`)}>{current.action} <span>→</span></Link></div><Image src="/brand/home-study-books.png" alt="" fill sizes="(max-width: 900px) 100vw, 850px" className={styles.bannerPhoto} priority/><div className={styles.controls}><button aria-label="Previous reminder" onClick={()=>setBanner((banner+2)%3)}>←</button><div>{banners.map((b,i)=><button key={b.view} aria-label={`Show reminder ${i+1}`} aria-pressed={banner===i} onClick={()=>setBanner(i)}><span/></button>)}</div><button aria-label="Next reminder" onClick={()=>setBanner((banner+1)%3)}>→</button></div></section>
   <div className={styles.studyCards}><section className={styles.card}><h2>Continue Learning</h2><p>{topic?'Pick up where you left off and keep making progress.':'Your next step is ready whenever you are.'}</p><div className={styles.continueContent}><PortalArtwork kind={nextPaper?subjectIcon(nextPaper.name):'subjects'} compact/><div><small>{nextPaper?.name||'Your learning journey'}</small><h3>{nextTopic?.topicName||'Choose your first subject'}</h3><p>{recent?.nextStep||(topic?'Continue from your latest study record.':'Start with the first topic in your syllabus.')}</p>{recent?.lastStudied&&<small>Last studied {recent.lastStudied}</small>}</div></div><Link className={styles.primary} href={resume}>{topic?'Continue learning':nextTopic?'Start learning':'Choose a subject'} <span>→</span></Link></section>
   <section className={styles.card}><h2><PortalIcon name="weekly"/> Today’s Plan</h2><p>{!data.ready?'Loading your plan…':data.error?'Your schedule is temporarily unavailable.':todayBlocks.length?`${todayBlocks.filter(s=>!completed(s)).length} sessions remaining today`:'Make room for a little progress.'}</p>{!data.error&&data.ready&&<>{todayBlocks.length?<ul className={styles.sessions}>{todayBlocks.map(s=><li key={blockKey(s)}><div><b>{s.start}</b><small>{s.duration} min</small></div><div><strong>{papers.find(p=>p.id===s.paperId)?.name}</strong><small>Scheduled study</small></div>{completed(s)?<span aria-label="Completed"><PortalIcon name="check"/></span>:<Link href={weekly}>Open →</Link>}</li>)}</ul>:<div className={styles.empty}><div className={styles.dayLabel}><PortalIcon name="weekly"/><span>TODAY</span></div><h3>{data.plan?'No sessions planned today':'Build your study routine'}</h3><p>{data.plan?'A little extra revision is always an option.':'Set your available days in Weekly plan. Your sessions for today will appear here.'}</p></div>}<Link className={styles.secondary} href={data.plan?weekly:href('/dashboard?view=weekly&plan=setup')}>{data.plan?'Open weekly plan':'Set up my plan'} →</Link></>}{data.error&&<button className={styles.secondary} onClick={()=>setRetry(n=>n+1)}>Try again</button>}</section></div>
   <aside className={styles.side}><div className={styles.currentDate}>{data.today?new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${data.today}T12:00:00Z`)):'Your study day'}</div>   <section className={`${styles.card} ${styles.exam}`} aria-label="Exam countdown"><span className={styles.examRing}><PortalIcon name="weekly"/></span><div><strong className={days===null?styles.unset:undefined}>{!data.ready?'…':days===null?'Not set':days<0?'Date passed':days===0?'Today':days}</strong><h2>{days!==null&&days>0?'days to exam':'Exam countdown'}</h2><p>{student.examDiet||'Exam diet not set'}</p>{data.examDate?<small>{data.examDate} · Your saved plan date</small>:<Link href={href('/dashboard?view=weekly&plan=setup')}>Set your exam date →</Link>}</div></section><section className={`${styles.card} ${styles.statusCard}`}><div className={styles.statusHeading}><span className={styles.roundIcon}><PortalIcon name="target"/></span><h2>{data.error?'Status unavailable':!data.ready?'Loading your week…':!blocks.length?'A fresh start':behind?'A little adjustment needed':'You’re on track'}</h2></div><p>{data.error?data.error:blocks.length?`You’ve completed ${done} of ${blocks.length} planned sessions this week.`:'Give your week a clear direction. Choose the days and times that work for you.'}</p><div className={styles.weekBars} aria-label={blocks.length?`${done} of ${blocks.length} sessions completed`:'No sessions scheduled'}>{Array.from({length:6},(_,i)=><span key={i} data-filled={blocks.length>0&&i<Math.round(done/blocks.length*6)}/>)}</div>{!blocks.length&&!data.error&&<Link className={styles.textLink} href={href('/dashboard?view=weekly&plan=setup')}>Plan my week →</Link>}{behind&&!data.error&&<Link className={styles.textLink} href={weekly}>Review your week →</Link>}</section><section className={`${styles.card} ${styles.weakCard}`}><div className={styles.attention}><PortalIcon name="target"/><small>NEEDS ATTENTION</small></div><h2>{weakTopic?.topicName||'No topic flagged yet'}</h2><p>{weakTopic?(weak?.questionPractice==='Reattempt'?'You marked this topic for another practice attempt.':'You marked this topic as needing more practice.'):'As you learn, mark topics that need more practice. Your next review priority will appear here.'}</p>{weakTopic?<Link className={styles.primary} href={href(`/papers/${weakTopic.paperId}?lesson=${encodeURIComponent(weakTopic.id)}`)}>Review topic →</Link>:<Link className={styles.secondary} href={href('/dashboard?view=subjects')}>Review my subjects →</Link>}</section></aside>
  </div>
 </div>;
}
