"use client";
import { useState } from 'react';
import Link from 'next/link';
import type { Paper, Topic, TopicProgress, TopicStatus, QuestionPractice } from '@/lib/types';
import { resourcesFor } from '@/lib/stages';

type Props = {
 paper: Paper; topics: Topic[]; topic: Topic; progress: TopicProgress[];
 level: string; preview: boolean; subjectHref: string;
 lessonHref: (id: string) => string;
 onUpdate: (id: string, patch: Partial<TopicProgress>) => void;
};

export function LessonWorkspace({paper,topics,topic,progress,level,preview,subjectHref,lessonHref,onUpdate}:Props) {
 const [tab,setTab]=useState<'overview'|'notes'|'resources'>('overview');
 const index=topics.findIndex(t=>t.id===topic.id);
 const record=progress.find(p=>p.topicId===topic.id);
 const previous=topics[index-1],next=topics[index+1];
 return <div className="lesson-workspace">
  <nav className="lesson-breadcrumb" aria-label="Lesson breadcrumb"><Link href={subjectHref}>← {paper.name}</Link><span>{level}</span></nav>
  <div className="lesson-layout"><div className="lesson-main">
   <div className="lesson-video" role="region" aria-label="Lesson video"><span className="lesson-video-label">DIET CLASSROOM · {paper.code}</span><div><span className="lesson-video-icon" aria-hidden="true">▷</span><h2>Video lesson coming soon</h2><p>The recording for this topic has not been uploaded yet.</p></div><span className="lesson-video-footer">{topic.topicName}</span></div>
   <header className="lesson-title"><span className="subject-eyebrow">TOPIC {index+1} OF {topics.length}</span><h1>{topic.topicName}</h1><p>{paper.name}</p></header>
   <nav className="subject-tabs" aria-label="Lesson sections">{(['overview','notes','resources'] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t==='overview'?'Overview':t==='notes'?'Lesson notes':'Resources'}</button>)}</nav>
   <section className="lesson-panel" aria-label={tab==='overview'?'Lesson overview':tab==='notes'?'Lesson notes':'Lesson resources'}>
    {tab==='overview'?<><h2>Prepare for this topic</h2><p>Use your study text to review <strong>{topic.topicName}</strong>, then attempt a relevant question. Record your next step below.</p><div className="lesson-publication"><span>LESSON CONTENT</span><strong>Awaiting publication</strong><p>DIET explanations, worked examples and learning objectives will appear here when this lesson is ready.</p></div></>:tab==='notes'?<><h2>Lesson notes</h2><div className="lesson-publication"><strong>No lesson notes published yet</strong><p>Summary notes and worked examples for {topic.topicName} will be available here. In the meantime, use the official ICAN study materials.</p><a href={resourcesFor(level)} target="_blank" rel="noreferrer">Open official study materials ↗</a></div></>:<><h2>Resources for your study</h2><article className="lesson-resource"><div><span className="subject-eyebrow">OFFICIAL ICAN MATERIALS</span><h3>{paper.name}</h3><p>Choose your subject and check the syllabus and examination diet on the ICAN materials page.</p></div><a href={resourcesFor(level)} target="_blank" rel="noreferrer">Open resources ↗</a></article><p className="subject-note">Topic-specific downloads and practice questions have not been published yet.</p></>}
   </section>
   <section className="lesson-study" aria-label="Study progress"><h2>Your study progress</h2><p>{preview?'Preview changes are temporary.':'Updates are saved to your tracker.'} Confidence is your own assessment of this topic.</p>{record?<><div className="topic-progress-fields"><label>Preparation status<select value={record.status} onChange={e=>onUpdate(record.id,{status:e.target.value as TopicStatus})}>{['Not Started','Learning','Needs Practice','Okay'].map(s=><option key={s} value={s}>{s==='Okay'?'Confident':s}</option>)}</select></label><label>Question practice<select value={record.questionPractice} onChange={e=>onUpdate(record.id,{questionPractice:e.target.value as QuestionPractice})}>{['Not Yet','Attempted','Reattempt'].map(s=><option key={s}>{s}</option>)}</select></label><label>Last studied<input type="date" value={record.lastStudied??''} onChange={e=>onUpdate(record.id,{lastStudied:e.target.value||null})}/></label><label>My next step<input value={record.nextStep} placeholder="What do you need to revisit?" onChange={e=>onUpdate(record.id,{nextStep:e.target.value})}/></label><label className="topic-week"><input type="checkbox" checked={record.thisWeek} onChange={e=>onUpdate(record.id,{thisWeek:e.target.checked})}/> Add to this week’s plan</label></div></>:<p>Your study record is unavailable. Refresh the page to try again.</p>}</section>
   <nav className="lesson-pagination" aria-label="Topic navigation">{previous?<Link href={lessonHref(previous.id)}><small>← Previous topic</small><strong>{previous.topicName}</strong></Link>:<span/>}{next?<Link href={lessonHref(next.id)}><small>Next topic →</small><strong>{next.topicName}</strong></Link>:<Link href={subjectHref}><small>End of topic plan</small><strong>Back to subject →</strong></Link>}</nav>
  </div><aside className="lesson-outline"><div className="lesson-outline-head"><span className="subject-eyebrow">IN THIS SUBJECT</span><h2>Study topics</h2><p>{topics.length} topics · Starter plan</p></div><nav aria-label="Subject topic list">{topics.map((t,i)=>{const status=progress.find(p=>p.topicId===t.id)?.status;return <Link key={t.id} href={lessonHref(t.id)} aria-current={t.id===topic.id?'page':undefined}><span className="lesson-order">{String(i+1).padStart(2,'0')}</span><span><strong>{t.topicName}</strong><small>{status==='Okay'?'Confident':status??'Not Started'}</small></span>{t.id===topic.id&&<span className="lesson-current" aria-hidden="true">←</span>}</Link>})}</nav><p className="lesson-outline-note">Video lessons and notes are being prepared. Your study updates remain available.</p></aside></div>
 </div>;
}
