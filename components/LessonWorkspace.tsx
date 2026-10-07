"use client";
import Link from 'next/link';
import type { Paper, Topic, TopicProgress, TopicStatus, QuestionPractice } from '@/lib/types';
import { TopicLessonLayout } from './TopicLessonLayout';

type Props = {
 paper: Paper; topics: Topic[]; topic: Topic; progress: TopicProgress[];
 level: string; preview: boolean; subjectHref: string;
 lessonHref: (id: string) => string;
 onUpdate: (id: string, patch: Partial<TopicProgress>) => void;
};

export function LessonWorkspace({paper,topics,topic,progress,level,preview,subjectHref,lessonHref,onUpdate}:Props) {
 const record=progress.find(p=>p.topicId===topic.id);
 const ordered=[...topics].sort((a,b)=>a.displayOrder-b.displayOrder);
 const index=ordered.findIndex(t=>t.id===topic.id);
 const previous=ordered[index-1],next=ordered[index+1];
 return <TopicLessonLayout subject={paper.name} topic={topic.topicName} backHref={subjectHref}>
 <details style={{marginTop:28}}><summary style={{cursor:'pointer',fontSize:13,color:'#42648b'}}>Existing saved study updates</summary>
   <section className="lesson-study" aria-label="Study progress"><h2>Your study progress</h2><p>{preview?'Preview changes are temporary.':'Updates are saved to your tracker.'} Confidence is your own assessment of this topic.</p>{record?<><div className="topic-progress-fields"><label>Preparation status<select value={record.status} onChange={e=>onUpdate(record.id,{status:e.target.value as TopicStatus})}>{['Not Started','Learning','Needs Practice','Okay'].map(s=><option key={s} value={s}>{s==='Okay'?'Confident':s}</option>)}</select></label><label>Question practice<select value={record.questionPractice} onChange={e=>onUpdate(record.id,{questionPractice:e.target.value as QuestionPractice})}>{['Not Yet','Attempted','Reattempt'].map(s=><option key={s}>{s}</option>)}</select></label><label>Last studied<input type="date" value={record.lastStudied??''} onChange={e=>onUpdate(record.id,{lastStudied:e.target.value||null})}/></label><label>My next step<input value={record.nextStep} placeholder="What do you need to revisit?" onChange={e=>onUpdate(record.id,{nextStep:e.target.value})}/></label><label className="topic-week"><input type="checkbox" checked={record.thisWeek} onChange={e=>onUpdate(record.id,{thisWeek:e.target.checked})}/> Add to this week’s plan</label></div></>:<p>Your study record is unavailable. Refresh the page to try again.</p>}</section>
</details>
 <nav className="lesson-pagination" aria-label="Topic navigation">{previous?<Link href={lessonHref(previous.id)}>← {previous.topicName}</Link>:<span/>}{next?<Link href={lessonHref(next.id)}>{next.topicName} →</Link>:<Link href={subjectHref}>Back to subject →</Link>}</nav>
 </TopicLessonLayout>;
}
