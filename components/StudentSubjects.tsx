"use client";
import { PortalArtwork, subjectIcon } from './PortalArtwork';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { TrackerState } from '@/lib/types';
import { getStudent, getStudentPapers, getStudentProgress } from '@/lib/selectors';
import { stageFor } from '@/lib/stages';
import styles from './StudentSubjects.module.css';

export function StudentSubjects({state,studentId,preview=false,managePapers}:{state:TrackerState;studentId:string;preview?:boolean;managePapers?:ReactNode}) {
 const [query,setQuery]=useState('');
 const student=getStudent(state,studentId);
 if(!student)return <p>Your profile could not be loaded. Please sign in again.</p>;
 const stage=stageFor(student.level)??student.level;
 const papers=getStudentPapers(state,studentId),progress=getStudentProgress(state,studentId);
 const base=`/login?mode=preview&stage=${encodeURIComponent(stage)}`;
 const subjectHref=(id:string,topic?:string)=>preview?`${base}&subject=${encodeURIComponent(id)}${topic?'&lesson='+encodeURIComponent(topic):''}`:`/papers/${encodeURIComponent(id)}${topic?'?lesson='+encodeURIComponent(topic):''}`;
 const recentRecords=progress.filter(p=>(p.lastStudied||p.status!=='Not Started'||p.questionPractice!=='Not Yet')&&state.topics.some(t=>t.id===p.topicId&&papers.some(paper=>paper.id===t.paperId))).sort((a,b)=>(b.lastStudied||b.updatedAt).localeCompare(a.lastStudied||a.updatedAt)||b.updatedAt.localeCompare(a.updatedAt));
 const cards=papers.map(paper=>{
  const topics=state.topics.filter(t=>t.paperId===paper.id).sort((a,b)=>a.displayOrder-b.displayOrder);
  const record=recentRecords.find(p=>topics.some(t=>t.id===p.topicId));
  const current=topics.find(t=>t.id===record?.topicId)||topics[0];
  const confident=topics.filter(t=>progress.some(p=>p.topicId===t.id&&p.status==='Okay')).length;
  return {paper,topics,record,current,confident};
 });
 const recent=recentRecords[0],resume=cards.find(c=>c.current?.id===recent?.topicId);
 const search=query.trim().toLowerCase();
 const filtered=cards.filter(c=>`${c.paper.name} ${c.paper.code} ${c.topics.map(t=>t.topicName).join(' ')}`.toLowerCase().includes(search));
 const lastDate=recent?.lastStudied?new Date(`${recent.lastStudied.slice(0,10)}T12:00:00Z`):null;
 return <section className={styles.page} data-portal-page aria-label="My subjects">
  <header className={styles.header}><h1>My subjects</h1><div className={styles.manage}>{managePapers||<Link data-ui="secondary" className={styles.manageLink} href={preview?'/login':'/dashboard?view=profile'}>{preview?'Sign in to manage papers':'Manage papers'} <span aria-hidden="true">→</span></Link>}</div></header>
  {resume?.current&&<section className={styles.resume} aria-label="Continue where you stopped"><div><span className={styles.eyebrow}>CONTINUE WHERE YOU STOPPED</span><h2>{resume.paper.name}</h2><p>{resume.current.topicName}</p>{lastDate&&Number.isFinite(lastDate.getTime())&&<small>Last recorded study · {lastDate.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}</small>}</div><Link data-ui="primary" className={styles.primary} href={subjectHref(resume.paper.id,resume.current.id)}>Resume topic <span aria-hidden="true">→</span></Link></section>}
  <section aria-label="Registered subjects"><div className={styles.toolbar}><label className={styles.search}><span>Find a subject or topic</span><input type="search" placeholder="Search by name, code or topic" value={query} onChange={e=>setQuery(e.target.value)}/></label><span className={styles.count}>{papers.length} registered {papers.length===1?'subject':'subjects'}</span></div>
  {query&&<p className={styles.results} role="status">{filtered.length} {filtered.length===1?'subject':'subjects'} found <button onClick={()=>setQuery('')}>Clear search</button></p>}
  <div className={styles.grid}>{filtered.map(({paper,topics,current,record,confident})=><article data-ui="card-shell" className={styles.card} key={paper.id}>
   <div className={styles.identity}><div className={styles.art}><PortalArtwork kind={subjectIcon(paper.name)} compact/></div><div className={styles.title}><span className={styles.code}>{paper.code}</span><h2>{paper.name}</h2></div></div>
   <div data-ui="card-body" className={styles.cardBody}>
    {current?<><div className={styles.topic}><span>{record?'Current topic':'Start with'}</span><h3>{current.topicName}</h3></div>{record?<div className={styles.progress}><div><span>Marked confident</span><strong>{confident} / {topics.length} topics</strong></div><meter min={0} max={topics.length} value={confident} aria-label={`${confident} of ${topics.length} topics marked confident by you`}/><small>Your own assessment, not a test score.</small></div>:<p className={styles.available}>{topics.length} {topics.length===1?'topic':'topics'} to explore</p>}</>:<p className={styles.availability}>Topics are being prepared. They’ll appear here once published.</p>}
    <Link data-ui="secondary" className={styles.continue} href={subjectHref(paper.id,current?.id)} aria-label={`${record?'Resume':current?'Start':'Open'} ${paper.name}${current?` — ${current.topicName}`:''}`}>{record?'Resume topic':current?'Start topic':'Open subject'} <span aria-hidden="true">→</span></Link>
   </div>
  </article>)}</div>
  {!filtered.length&&<div className={styles.empty}><h2>{papers.length?'No matching subjects':'Your bookshelf starts here'}</h2><p>{papers.length?'Try another subject name, code or topic.':preview?'Sign in to choose your papers.':'Use Manage papers above to select the subjects you’re preparing for.'}</p>{query&&<button onClick={()=>setQuery('')}>Clear search</button>}</div>}
  </section>
 </section>;
}
