"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Paper, Topic } from '@/lib/types';
import { journeyPortal } from '@/lib/learning-journey';
import styles from './LessonPracticePanel.module.css';
import { sampleLearningTopic } from '@/lib/subjectLessonSample';

export function LessonPracticePanel({papers,topics,previewStage}:{papers:Paper[];topics:Topic[];previewStage?:string}) {
 const params=useSearchParams();
 const paper=papers.find(p=>p.id===params.get('subject'));
 const sample=params.get('topic')==='layout-sample';
 const topic=topics.find(t=>t.id===params.get('topic')&&t.paperId===paper?.id);
 const sampleSection=sampleLearningTopic.sections.find(s=>s.slug===params.get('section'));
 const q=new URLSearchParams(previewStage?{mode:'preview',stage:previewStage}:{});
 q.set('view','subjects');
 const home=(previewStage?'/login':'/dashboard')+'?'+q;
 if(!paper||(!sample&&!topic))return <section className={styles.empty} aria-label="Unavailable lesson context"><h2>Choose a topic to practise</h2><p>This link does not match a topic in your selected subjects.</p><Link href={home}>Back to My Subjects →</Link></section>;
 q.delete('view');
 if(previewStage)q.set('subject',paper.id);
 q.set('subjectView','path');q.set(sample?'lessonLayout':'lesson',sample?'sample':topic!.id);
 if(sampleSection)q.set('section',sampleSection.slug);
 if(/^[0-3]$/.test(params.get('content')||''))q.set('content',params.get('content')!);
 if(params.get('fromSession')==='1')q.set('fromSession','1');
 const returnHref=(previewStage?'/login':`/papers/${encodeURIComponent(paper.id)}`)+'?'+q;
 return <section className={styles.page} aria-label="Practice for your lesson">
  <header><span className={styles.eyebrow}>FROM YOUR LESSON</span><h2>{sample?sampleLearningTopic.name:topic!.topicName}</h2><p>{paper.name}{sampleSection?' · '+sampleSection.title:''}</p></header>
  <div className={styles.notice}><strong>Practice for this topic is not available yet</strong><p>No approved questions are connected to this lesson. No attempt or score has been recorded. The optional guided demo uses separate sample questions and does not update your Learning Report.</p></div>
  <div className={styles.actions}><Link data-ui="primary" className={styles.primary} href={returnHref}>Return to this lesson →</Link>{params.get('fromSession')==='1'&&<Link data-ui="secondary" href={journeyPortal('weekly',previewStage)+'#weekly-session-workspace'}>Return to session and save result →</Link>}</div>
 </section>;
}
