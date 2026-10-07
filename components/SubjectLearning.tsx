"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LessonWorkspace } from './LessonWorkspace';
import type { Paper, Topic, TopicProgress } from '@/lib/types';
import styles from './SubjectLearning.module.css';

export function SubjectLearning({paper,topics,progress,level,backHref,onUpdate,preview=false}:{paper:Paper;topics:Topic[];progress:TopicProgress[];level:string;backHref:string;onUpdate:(id:string,patch:Partial<TopicProgress>)=>void;preview?:boolean}) {
 const [query,setQuery]=useState('');
 const pathname=usePathname(),params=useSearchParams();
 const subjectParams=new URLSearchParams(params.toString());subjectParams.delete('lesson');
 const subjectHref=pathname+(subjectParams.size?'?'+subjectParams.toString():'');
 const tab=params.get('subjectView')==='syllabus'?'syllabus':'path';
 const tabHref=(view:string)=>{const q=new URLSearchParams(subjectParams);q.set('subjectView',view);return pathname+'?'+q.toString();};
 const lessonHref=(id:string)=>{const q=new URLSearchParams(subjectParams);q.set('lesson',id);return pathname+'?'+q.toString();};
 const selected=topics.find(t=>t.id===params.get('lesson'));
 if(selected)return <LessonWorkspace key={selected.id} paper={paper} topics={topics} topic={selected} progress={progress} level={level} preview={preview} subjectHref={subjectHref} lessonHref={lessonHref} onUpdate={onUpdate}/>;
 if(params.has('lesson'))return <section className="subject-empty"><h1>Topic not found in this subject</h1><Link href={subjectHref}>Back to subject</Link></section>;
 const ordered=[...topics].sort((a,b)=>a.displayOrder-b.displayOrder);
 const records=progress.filter(p=>ordered.some(t=>t.id===p.topicId));
 const recent=[...records].filter(p=>p.lastStudied).sort((a,b)=>(b.lastStudied||'').localeCompare(a.lastStudied||'')||b.updatedAt.localeCompare(a.updatedAt))[0];
 const current=ordered.find(t=>t.id===recent?.topicId)||ordered.find(t=>records.some(p=>p.topicId===t.id&&p.status==='Learning'))||ordered[0];
 const next=current?ordered[ordered.indexOf(current)+1]:undefined;
 const visible=ordered.filter(t=>t.topicName.toLowerCase().includes(query.trim().toLowerCase()));
 const status=(id:string)=>{const p=records.find(r=>r.topicId===id);return p?.status==='Okay'?'Confident (self-reported)':p?.status||'Not Started';};
 const weeklyHref=preview?`/login?mode=preview&stage=${encodeURIComponent(level)}&view=weekly`:'/dashboard?view=weekly';
 return <section className={styles.page} aria-label="Subject workspace">
  <Link className={styles.back} href={backHref}>← My subjects</Link>
  <header className={styles.hero}>
   {tab==='path'&&<div className={styles.image} aria-hidden="true"><b>{paper.code}</b><span>SUBJECT IMAGE</span></div>}
   <div className={styles.heroContent}><span className={styles.eyebrow}>{level} · {paper.code}</span><h1>{paper.name}</h1>
   <div className={styles.metrics}><div><small>Syllabus coverage</small><strong>Not yet measured</strong></div><div><small>Current phase</small><strong>{records.some(r=>r.lastStudied||r.status!=='Not Started')?'Learning':'Not Started'}</strong></div><div><small>Current topic</small><strong>{current?.topicName||'Awaiting publication'}</strong></div><div><small>Next study session</small><Link href={weeklyHref}>View Weekly Plan →</Link></div></div>
   <div className={styles.resume}><div><small>{recent?'CONTINUE LEARNING':'START LEARNING'}</small><h2>{current?.topicName||'Your topics will appear here'}</h2><p>{next?`Next topic: ${next.topicName}`:current?'Last topic in the current list.':'The topic list for this subject has not been published yet.'}</p></div>{current&&<Link className={styles.primary} href={lessonHref(current.id)}>{recent?'Continue':'Open topic'} →</Link>}</div>
   </div>
  </header>
  <nav className={styles.tabs} aria-label="Subject sections"><Link aria-current={tab==='path'?'page':undefined} href={tabHref('path')}>Study Path</Link><Link aria-current={tab==='syllabus'?'page':undefined} href={tabHref('syllabus')}>Syllabus</Link>{!preview&&<Link className={styles.resources} href={`/dashboard?view=resources&subject=${encodeURIComponent(paper.id)}`}>Additional resources →</Link>}</nav>
  {tab==='path'?<section aria-label="Study Path"><div className={styles.sectionHead}><div><h2>Your Study Path</h2><p>{ordered.length?'Your current topic list, in study order.':'A place for your subject’s topics and learning sections.'}</p></div><Link href={tabHref('syllabus')}>View full syllabus →</Link></div>
  {ordered.length>0?<><p className={styles.notice}>Starter topic list. Verified syllabus areas, weightings and section completion will be connected in the next stage. Confidence below reflects your own study updates.</p><label className={styles.search}>Find a topic<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search this subject"/></label><div className={styles.topics}>{visible.map(t=><details key={t.id} open={t.id===current?.id}><summary><span className={styles.number}>{ordered.indexOf(t)+1}</span><b>{t.topicName}</b><span className={styles.status}>{status(t.id)}</span></summary><div className={styles.topicBody}><p>{records.find(p=>p.topicId===t.id)?.nextStep||'Open this topic to view the current lesson workspace and your saved study updates.'}</p><Link className={styles.primary} href={lessonHref(t.id)}>Open topic →</Link></div></details>)}</div>{!visible.length&&<p className={styles.empty}>No topics match your search.</p>}</>:<div className={styles.empty}><h3>Topic list awaiting publication</h3><p>Your Study Path will appear here once this subject’s topics are added.</p></div>}</section>:<section className={styles.empty} aria-label="Syllabus"><h2>Syllabus</h2><p>The verified syllabus structure and ICAN weightings will be added in Stage 3. Your existing topics remain available in Study Path.</p><Link href={tabHref('path')}>Return to Study Path →</Link></section>}
  {preview&&<p className={styles.notice}>Preview · Sample topic records. Changes are temporary.</p>}
 </section>;
}
