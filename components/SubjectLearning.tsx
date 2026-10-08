"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { TopicLessonLayout } from './TopicLessonLayout';
import { SubjectSyllabus } from './SubjectSyllabus';
import { LessonWorkspace } from './LessonWorkspace';
import type { Paper, Topic, TopicProgress } from '@/lib/types';
import styles from './SubjectLearning.module.css';

export function SubjectLearning({paper,topics,progress,level,backHref,onUpdate,preview=false}:{paper:Paper;topics:Topic[];progress:TopicProgress[];level:string;backHref:string;onUpdate:(id:string,patch:Partial<TopicProgress>)=>void;preview?:boolean}) {
 const pathname=usePathname(),params=useSearchParams();
 const subjectParams=new URLSearchParams(params.toString());subjectParams.delete('lesson');subjectParams.delete('lessonLayout');subjectParams.delete('section');subjectParams.delete('content');
 const subjectHref=pathname+(subjectParams.size?'?'+subjectParams.toString():'');
 const tab=params.get('subjectView')==='syllabus'?'syllabus':'path';
 const tabHref=(view:string)=>{const q=new URLSearchParams(subjectParams);q.set('subjectView',view);return pathname+'?'+q.toString();};
 const lessonHref=(id:string)=>{const q=new URLSearchParams(subjectParams);q.set('lesson',id);return pathname+'?'+q.toString();};
 const selected=topics.find(t=>t.id===params.get('lesson'));
 if(params.get('lessonLayout')==='sample')return <TopicLessonLayout subjectId={paper.id} subject={paper.name} topic="Sample topic layout" backHref={subjectHref}/>;
 if(selected)return <LessonWorkspace key={selected.id} paper={paper} topics={topics} topic={selected} progress={progress} level={level} preview={preview} subjectHref={subjectHref} lessonHref={lessonHref} onUpdate={onUpdate}/>;
 if(params.has('lesson'))return <section className="subject-empty"><h1>Topic not found in this subject</h1><Link href={subjectHref}>Back to subject</Link></section>;
 const ordered=[...topics].sort((a,b)=>a.displayOrder-b.displayOrder);
 const records=progress.filter(p=>ordered.some(t=>t.id===p.topicId));
 const recent=[...records].filter(p=>p.lastStudied).sort((a,b)=>(b.lastStudied||'').localeCompare(a.lastStudied||'')||b.updatedAt.localeCompare(a.updatedAt))[0];
 const current=ordered.find(t=>t.id===recent?.topicId)||ordered.find(t=>records.some(p=>p.topicId===t.id&&p.status==='Learning'))||ordered[0];
 const next=current?ordered[ordered.indexOf(current)+1]:undefined;
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
  <SubjectSyllabus key={paper.id+'-'+tab+'-'+(params.get('area')||'')} view={tab} topics={ordered} progress={records} lessonHref={lessonHref} pathHref={tabHref('path')} syllabusHref={tabHref('syllabus')} selectedArea={params.get('area')}/>
  {preview&&<p className={styles.notice}>Preview · Sample topic records. Changes are temporary.</p>}
 </section>;
}
