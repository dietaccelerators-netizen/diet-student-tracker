"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import type { TrackerState } from '@/lib/types';
import { getStudent, getStudentPapers, getStudentProgress } from '@/lib/selectors';
import { stageFor, resourcesFor } from '@/lib/stages';

const artwork=(name:string)=>/audit|assurance/i.test(name)?'magnifier':/tax/i.test(name)?'calculator':/case|business law/i.test(name)?'briefcase':/financial management|finance|economics/i.test(name)?'bars':'report';
function Art({name,hero=false}:{name:string;hero?:boolean}) { return <Image src={`/brand/${name}.webp`} alt="" width={640} height={640} sizes={hero?'(max-width:760px) 120px, 200px':'110px'} loading={hero?'eager':'lazy'} className="da-art"/>; }
export function StudentSubjects({state,studentId,preview=false,managePapers}:{state:TrackerState;studentId:string;preview?:boolean;managePapers?:ReactNode}) {
 const [query,setQuery]=useState('');
 const student=getStudent(state,studentId);
 if(!student)return <p>Your profile could not be loaded. Please sign in again.</p>;
 const stage=stageFor(student.level)??student.level;
 const papers=getStudentPapers(state,studentId), progress=getStudentProgress(state,studentId);
 const base=`/login?mode=preview&stage=${encodeURIComponent(stage)}`;
 const subjectHref=(id:string,topic?:string)=>preview?`${base}&subject=${encodeURIComponent(id)}${topic?'&lesson='+encodeURIComponent(topic):''}`:`/papers/${encodeURIComponent(id)}${topic?'?lesson='+encodeURIComponent(topic):''}`;
 const cards=papers.map((paper,index)=>{
  const topics=state.topics.filter(t=>t.paperId===paper.id).sort((a,b)=>a.displayOrder-b.displayOrder);
  const confident=new Set(progress.filter(p=>p.status==='Okay').map(p=>p.topicId));
  return {paper,index,topics,percent:topics.length?Math.round(topics.filter(t=>confident.has(t.id)).length/topics.length*100):0,next:topics.find(t=>!confident.has(t.id))};
 });
 const recent=[...progress].filter(p=>p.status!=='Not Started'||p.lastStudied).sort((a,b)=>(b.lastStudied??b.updatedAt).localeCompare(a.lastStudied??a.updatedAt)).map(p=>state.topics.find(t=>t.id===p.topicId)).find(t=>t&&papers.some(p=>p.id===t.paperId));
 const current=cards.find(c=>c.paper.id===recent?.paperId);
 const search=query.trim().toLowerCase();
 const filtered=cards.filter(c=>`${c.paper.name} ${c.paper.code} ${c.topics.map(t=>t.topicName).join(' ')}`.toLowerCase().includes(search));
 return <div className="da-home da-subject-page">
  <header className="da-welcome"><div><h1>My subjects</h1><p><strong>{stage}</strong><span/>{stage.startsWith('ATS')?'ATSWA':'ICAN'}</p></div><div className="da-header-actions"><p className="ds-count">{papers.length} subjects · Your learning, organised</p><Link className="da-account" href={preview?'/login':'/dashboard?view=profile'} aria-label="Open my profile"><span>{student.fullName.charAt(0)}</span><b>{student.fullName.split(' ')[0]}</b></Link></div></header>
  <div className="da-top-grid ds-feature-grid"><section className="da-resume"><div className="da-resume-copy"><p className="da-eyebrow">{recent?'Continue learning':'Your next step'}</p><h2>{recent?.topicName??'Make space for progress.'}</h2><p className="da-description">{current?`${stage} · ${current.paper.name}`:'Choose a subject below and start with one topic.'}</p>{current&&<div className="da-progress-line"><progress max={100} value={current.percent} aria-label={`${current.paper.name}: topics confident`}/><span>{current.percent}% confident</span></div>}<Link className="da-primary" href={current&&recent?subjectHref(current.paper.id,recent.id):'#subject-catalogue'}><span aria-hidden="true">▷</span>{recent?'Continue learning':'Explore my subjects'}<span aria-hidden="true">→</span></Link></div><div className="da-hero-art"><Art name="open-books" hero/></div></section>
  <section className="ds-resources"><div><h2>Explore all subjects</h2><p>Find study texts and examination resources for your {stage} preparation.</p>{preview?<a href={resourcesFor(student.level)} target="_blank" rel="noreferrer" className="da-outline">View study resources <span aria-hidden="true">↗</span></a>:<Link href="/dashboard?view=resources" className="da-outline">View study resources <span aria-hidden="true">→</span></Link>}</div><div className="ds-resource-art"><Art name="books" hero/></div></section></div>
  <section id="subject-catalogue" className="ds-catalogue" aria-label="Your subjects"><div className="ds-filters"><label className="da-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search subjects or topics…" aria-label="Search subjects or topics" value={query} onChange={e=>setQuery(e.target.value)}/></label><span className="ds-stage">{stage}</span></div>
  {managePapers&&<div className="ds-manage">{managePapers}</div>}
  {query&&<p className="ds-results" role="status">{filtered.length} {filtered.length===1?'subject':'subjects'} found <button type="button" onClick={()=>setQuery('')}>Clear search</button></p>}
  <div className="ds-grid">{filtered.map(({paper,index,topics,percent,next})=><Link className={`da-subject ds-card da-tone-${index%4}`} key={paper.id} href={subjectHref(paper.id)}><div className="ds-card-top"><div className="da-subject-art"><Art name={artwork(paper.name)}/></div><div className="ds-card-heading"><h3>{paper.name}</h3><p>{stage}</p><div className="da-progress-line"><progress max={100} value={percent} aria-label={`${paper.name}: topics confident`}/><span>{percent}%</span></div></div></div><div className="ds-next"><span>{next?'Next topic':topics.length?'Ready to review':'Topic plan'}</span><p>{next?.topicName??(topics.length?'Revisit a topic to keep it fresh.':'Your DIET team is preparing the topic list.')}</p></div><span className="da-subject-open">Open subject <span aria-hidden="true">→</span></span></Link>)}</div>
  {!filtered.length&&<div className="da-empty"><h2>{papers.length?'No matching subjects':'Choose your papers'}</h2><p>{papers.length?'Try a subject name, code or topic.':'Use Manage papers to add the subjects you are preparing for.'}</p>{query&&<button className="da-outline" onClick={()=>setQuery('')}>Clear search</button>}</div>}
  <p className="da-footnote">Progress reflects topics marked confident, not an exam score.</p></section>
 </div>;
}
