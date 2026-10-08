"use client";
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Paper, Topic } from '@/lib/types';
import styles from './LessonPracticePanel.module.css';

export function LessonPracticePanel({papers,topics,previewStage}:{papers:Paper[];topics:Topic[];previewStage?:string}) {
 const params=useSearchParams();
 const [scope,setScope]=useState('section');
 const [mode,setMode]=useState('untimed');
 const [screen,setScreen]=useState(false);
 const paper=papers.find(p=>p.id===params.get('subject'));
 const sample=params.get('topic')==='layout-sample';
 const topic=topics.find(t=>t.id===params.get('topic')&&t.paperId===paper?.id);
 const raw=params.get('section');
 const section=raw!==null&&/^[0-3]$/.test(raw)?Number(raw):null;
 const panel=/^[0-4]$/.test(params.get('content')||'')?params.get('content')!:'0';
 const home=previewStage?`/login?mode=preview&stage=${encodeURIComponent(previewStage)}&view=subjects`:'/dashboard?view=subjects';
 if(!paper||(!sample&&!topic)||section===null)return <section className={styles.empty} aria-label="Unavailable lesson context"><h2>Choose a lesson to practise</h2><p>This link does not match an available subject, topic or sample section. Open a lesson from My Subjects to continue.</p><Link href={home}>Back to My Subjects →</Link></section>;
 const title=sample?'Sample topic layout':topic!.topicName;
 const q=new URLSearchParams(previewStage?{mode:'preview',stage:previewStage,subject:paper.id}:{});
 q.set('subjectView','path');q.set(sample?'lessonLayout':'lesson',sample?'sample':topic!.id);q.set('section',String(section));q.set('content',panel);
 const returnHref=(previewStage?'/login':`/papers/${encodeURIComponent(paper.id)}`)+'?'+q.toString();
 return <section className={styles.page} aria-label="Lesson practice setup">
  <Link className={styles.back} href={returnHref}>← Return to lesson</Link>
  <header><span className={styles.eyebrow}>FROM YOUR LESSON</span><h2>Practise what you’ve just studied</h2><p>Your lesson context is selected below.</p></header>
  <div className={styles.notice}><strong>Setup preview</strong><p>No questions have been linked to this lesson yet. These controls demonstrate the flow; no attempts, scores or learning progress are saved.</p></div>
  <dl className={styles.context}><div><dt>Subject</dt><dd>{paper.name}</dd></div><div><dt>Topic</dt><dd>{title}</dd></div><div><dt>Section</dt><dd>Section title {section+1}</dd></div></dl>
  {!screen?<><div className={styles.settings}><fieldset><legend>What would you like to practise?</legend><label><input type="radio" name="practice-scope" checked={scope==='section'} onChange={()=>setScope('section')}/><span>This section<small>Section title {section+1}</small></span></label><label><input type="radio" name="practice-scope" checked={scope==='topic'} onChange={()=>setScope('topic')}/><span>The whole topic<small>{title}</small></span></label></fieldset><fieldset><legend>Practice mode</legend><label><input type="radio" name="lesson-practice-mode" checked={mode==='untimed'} onChange={()=>setMode('untimed')}/><span>At your own pace<small>Review each question without a timer.</small></span></label><label><input type="radio" name="lesson-practice-mode" checked={mode==='timed'} onChange={()=>setMode('timed')}/><span>Timed practice<small>Timing will be set when questions are added.</small></span></label></fieldset></div><div className={styles.empty}><h3>Questions will appear here</h3><p>{scope==='section'?`Questions linked to Section title ${section+1}`:`Questions across ${title}`} will be shown once the content is ready.</p><button type="button" className={styles.primary} onClick={()=>setScreen(true)}>Preview practice screen →</button></div></>:<section className={styles.question} aria-label="Practice screen preview"><div className={styles.questionHead}><span>QUESTION LAYOUT</span><span>{mode==='timed'?'Timed practice · timer not started':'At your own pace'}</span></div><h3>Question content goes here</h3><p>Approved questions and the appropriate answer controls will be added here.</p><div className={styles.answer}>Answer area · layout placeholder</div><div className={styles.actions}><button type="button" disabled>Submit answer</button><button type="button" onClick={()=>setScreen(false)}>Back to practice setup</button></div><p className={styles.small}>No question or score is being simulated.</p></section>}
  <footer className={styles.footer}><div><strong>Need to revisit the explanation?</strong><p>Return to the same section and content view.</p></div><Link href={returnHref}>Return to lesson →</Link></footer>
 </section>;
}
