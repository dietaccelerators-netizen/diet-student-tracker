"use client";
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
 const papers=getStudentPapers(state,studentId), progress=getStudentProgress(state,studentId);
 const base=`/login?mode=preview&stage=${encodeURIComponent(stage)}`;
 const subjectHref=(id:string,topic?:string)=>preview?`${base}&subject=${encodeURIComponent(id)}${topic?'&lesson='+encodeURIComponent(topic):''}`:`/papers/${encodeURIComponent(id)}${topic?'?lesson='+encodeURIComponent(topic):''}`;
 const recentRecords=[...progress].filter(p=>p.lastStudied).sort((a,b)=>(b.lastStudied||'').localeCompare(a.lastStudied||'')||b.updatedAt.localeCompare(a.updatedAt));
 const cards=papers.map(paper=>{
  const topics=state.topics.filter(t=>t.paperId===paper.id).sort((a,b)=>a.displayOrder-b.displayOrder);
  const record=recentRecords.find(p=>topics.some(t=>t.id===p.topicId));
  const current=topics.find(t=>t.id===record?.topicId)||topics.find(t=>progress.some(p=>p.topicId===t.id&&p.status==='Learning'))||topics[0];
  const next=current?topics[topics.indexOf(current)+1]:undefined;
  return {paper,topics,record,current,next};
 });
 const recent=recentRecords[0],resume=cards.find(c=>c.topics.some(t=>t.id===recent?.topicId));
 const resumeTopic=resume?.topics.find(t=>t.id===recent?.topicId);
 const search=query.trim().toLowerCase();
 const filtered=cards.filter(c=>`${c.paper.name} ${c.paper.code} ${c.topics.map(t=>t.topicName).join(' ')}`.toLowerCase().includes(search));
 const lastDate=recent?.lastStudied?new Date(`${recent.lastStudied}T12:00:00Z`):null;
 return <section className={styles.page} aria-label="My subjects">
  <header className={styles.header}><div><span className={styles.eyebrow}>YOUR SUBJECTS · {stage}</span><h1>Continue your learning</h1><p>Pick up where you left off and keep making progress.</p></div><Link className={styles.avatar} href={preview?'/login':'/dashboard?view=profile'} aria-label="Open my profile">{student.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</Link></header>
  <section className={styles.resume} aria-label="Continue where you stopped"><div><span className={styles.eyebrow}>{resumeTopic?'CONTINUE WHERE YOU STOPPED':'READY WHEN YOU ARE'}</span><h2>{resumeTopic?resume!.paper.name:'Your next study session starts here'}</h2><p>{resumeTopic?.topicName||'Choose one of your registered subjects below.'}</p>{lastDate&&Number.isFinite(lastDate.getTime())&&<small>Last recorded study · {lastDate.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</small>}</div><Link className={styles.primary} href={resumeTopic?subjectHref(resume!.paper.id,resumeTopic.id):'#subject-catalogue'}>{resumeTopic?'Continue':'View my subjects'} <span aria-hidden="true">→</span></Link></section>
  <section id="subject-catalogue" aria-label="Registered subjects"><div className={styles.toolbar}><label className={styles.search}><span>Search your subjects</span><input type="search" placeholder="Subject name, code or topic" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className={styles.manage}><span>{papers.length} registered {papers.length===1?'subject':'subjects'}</span>{managePapers}</div></div>
  {query&&<p className={styles.results} role="status">{filtered.length} {filtered.length===1?'subject':'subjects'} found <button onClick={()=>setQuery('')}>Clear search</button></p>}
  <div className={styles.grid}>{filtered.map(({paper,topics,current,next,record})=><article className={styles.card} key={paper.id}>
   <div className={styles.imageSlot} aria-label={`Image placeholder for ${paper.name}`}><span className={styles.imageMark} aria-hidden="true">{paper.code}</span><small>SUBJECT IMAGE</small></div>
   <div className={styles.cardBody}><span className={styles.code}>{paper.code}</span><h2>{paper.name}</h2><div className={styles.coverage}><span>Syllabus coverage</span><strong>Not yet measured</strong></div><div className={styles.progressPlaceholder} aria-hidden="true"/><p className={styles.hint}>Section completion tracking will appear here.</p>
   <dl><div><dt>{record?'Current topic':current?'Start with':'Current topic'}</dt><dd>{current?.topicName||'Topic list awaiting publication'}</dd></div><div><dt>Next topic</dt><dd>{next?.topicName||(topics.length?'End of the current topic list':'Available when topics are published')}</dd></div></dl>
   <Link className={styles.continue} href={subjectHref(paper.id)} aria-label={`${current?'Continue':'Open'} ${paper.name}`}>{current?'Continue':'Open subject'} <span aria-hidden="true">→</span></Link></div>
  </article>)}</div>
  {!filtered.length&&<div className={styles.empty}><h2>{papers.length?'No matching subjects':'No subjects selected yet'}</h2><p>{papers.length?'Try another subject name, code or topic.':'Choose your registered papers using Manage papers.'}</p>{query&&<button onClick={()=>setQuery('')}>Clear search</button>}</div>}
  <p className={styles.footnote}>Only your selected papers appear here. Study dates come from your saved topic updates; section-by-section completion will be connected in a later stage.</p></section>
 </section>;
}
