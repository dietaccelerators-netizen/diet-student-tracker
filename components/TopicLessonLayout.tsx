"use client";
import { StudyView } from "./StudyView";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { sampleLearningTopic, type StudySection } from '@/lib/subjectLessonSample';
import styles from './TopicLessonLayout.module.css';

const tabs=['Overview','Study Content','Key Points','Worked Examples'];
export function TopicLessonLayout({subject,topic,backHref,subjectId,topicId,children}:{subject:string;topic:string;backHref:string;subjectId:string;topicId?:string;children?:ReactNode}) {
 const params=useSearchParams(),pathname=usePathname();
 const isSample=!topicId;
 const sections:StudySection[]=isSample?sampleLearningTopic.sections:[];
 const requested=sections.findIndex(s=>s.slug===params.get('section'));
 const [section,setSection]=useState(requested>=0?requested:0);
 const [panel,setPanel]=useState(()=>{const n=Number(params.get('content'));return Number.isInteger(n)&&n>=0&&n<4?n:0;});
 const [readingMode,setReadingMode]=useState<'standard'|'simplified'>('standard');
 const [completed,setCompleted]=useState<string[]>(()=>sections.filter(s=>s.completed).map(s=>s.id));
 const current=sections[section];
 const chooseSection=(index:number)=>{setSection(index);setPanel(0);};
 const title=isSample?sampleLearningTopic.name:topic;
 const practiceParams=new URLSearchParams({view:'practice',fromLesson:'1',subject:subjectId,topic:topicId||'layout-sample',section:current?.slug||'',content:String(panel)});
 if(pathname==='/login'){practiceParams.set('mode','preview');practiceParams.set('stage',params.get('stage')||'Professional');}
 const practiceHref=(pathname==='/login'?'/login':'/dashboard')+'?'+practiceParams.toString();
 const activeContent=readingMode==='standard'?current?.content:current?.simplifiedContent;
 const done=!!current&&completed.includes(current.id);
 return <section className={styles.page} aria-label="Topic learning workspace">
  <Link className={styles.back} href={backHref}>← Back to Study Path</Link>
  <header className={styles.header}><div><span className={styles.eyebrow}>{subject} › {title}</span><h1>{current?.title||title}</h1><p>{current?`Section ${section+1} of ${sections.length} · Estimated time: ${current.estimatedMinutes} minutes`:'Learning content awaiting publication'}</p></div>{isSample&&<span className={styles.badge}>Sample lesson</span>}</header>
  {isSample&&<div className={styles.preview}><strong>Example from your supplied template · Advanced Taxation</strong><p>This content demonstrates the reading experience. It is not a published lesson for {subject}. Sample completion stays on this page and does not update your saved progress.</p></div>}
  {current?<div className={styles.layout}>
   <aside className={styles.outline}><h2>In this topic</h2><p>{completed.length} of {sections.length} sample sections completed</p><progress aria-label="Sample section completion" value={completed.length} max={sections.length}/><nav aria-label="Topic section navigation">{sections.map((item,i)=><button type="button" key={item.id} aria-current={section===i?'step':undefined} onClick={()=>chooseSection(i)}><span className={styles.step}>{completed.includes(item.id)?'✓':String(i+1).padStart(2,'0')}</span><span>{item.title}<small>{item.estimatedMinutes} min · {completed.includes(item.id)?'Complete':section===i?'Current section':'Not started'}</small></span></button>)}</nav></aside>
   <div className={styles.main}>
    <nav className={styles.tabs} aria-label="Learning content">{tabs.map((label,i)=><button type="button" key={label} aria-pressed={panel===i} onClick={()=>setPanel(i)}>{label}</button>)}</nav>
    <StudyView readingOnly enabled={panel===1}><article data-reading-content className={styles.reading} aria-label={tabs[panel]}>
     {panel===0&&<><span className={styles.label}>LESSON OVERVIEW</span><h3>{current.title}</h3><p>{current.overview}</p><h4>What you’ll learn</h4>{current.learningObjectives.length?<ul className={styles.lessonList}>{current.learningObjectives.map(item=><li key={item}>{item}</li>)}</ul>:<p>Learning objectives have not been added yet.</p>}<button className="mv-button" onClick={()=>setPanel(1)}>Read Study Content →</button></>}
     {panel===1&&<><div className={styles.readingToolbar}><div><span className={styles.label}>STUDY CONTENT</span><p>Choose your reading mode</p></div><div className={styles.readingModes} role="group" aria-label="Reading mode"><button aria-pressed={readingMode==='standard'} onClick={()=>setReadingMode('standard')}>Standard</button><button aria-pressed={readingMode==='simplified'} onClick={()=>setReadingMode('simplified')}>Simplified</button></div></div>{readingMode==='simplified'&&<p className={styles.modeNote}>The same lesson in clearer language. Your completion stays the same.</p>}<h3>{activeContent?.heading||current.title}</h3>{activeContent?.paragraphs.length?<>{activeContent.paragraphs.map((p,i)=><p key={i}>{p}</p>)}{!!activeContent.numberedPoints?.length&&<><h4>{activeContent.pointsHeading||'Key ideas'}</h4><ol className={styles.lessonList}>{activeContent.numberedPoints!.map(item=><li key={item.title}><strong>{item.title}</strong><p>{item.description}</p></li>)}</ol></>}</>:<p>{readingMode==='simplified'?'The simplified explanation has not been added for this section yet. You can switch back to Standard.':'Study content has not been added for this section yet.'}</p>}</>}
     {panel===2&&<><h3>Key Points</h3>{current.keyPoints.length?<ol className={styles.lessonList}>{current.keyPoints.map(item=><li key={item}>{item}</li>)}</ol>:<p>Key points have not been added for this section yet.</p>}</>}
     {panel===3&&<><h3>Worked Examples</h3>{current.workedExamples.length?current.workedExamples.map(example=><section className={styles.example} key={example.id}><h4>{example.title}</h4><p>{example.scenario}</p><h4>Step-by-step solution</h4><ol className={styles.lessonList}>{example.solution.map(step=><li key={step}>{step}</li>)}</ol></section>):<p>No worked examples have been added for this section yet.</p>}</>}
    </article></StudyView>
    <div className={styles.controls}><button disabled={section===0} onClick={()=>chooseSection(section-1)}>← Previous section</button><button disabled={section===sections.length-1} onClick={()=>chooseSection(section+1)}>Next section →</button></div>
    <section className={styles.completion} aria-live="polite"><div><h3>{done?'You’ve completed this section!':'You’ve reached the end of this section'}</h3><p>{done?'Move to Practice Room to review this section.':'Mark it complete when you’re done studying.'}</p><small>Sample completion only</small></div>{!done?<button className="mv-button" onClick={()=>setCompleted(ids=>ids.includes(current.id)?ids:[...ids,current.id])}>Mark as complete</button>:<button className="mv-button mv-button-outline" onClick={()=>setCompleted(ids=>ids.filter(id=>id!==current.id))}>Undo completion</button>}</section>
    {done&&<section className={styles.practice}><div><h3>Ready to test what you’ve learned?</h3><p>{title} → {current.title}</p><p>Quick Review, Related Past Questions and Exam Focus belong in Practice Room. Questions for this sample are not yet available.</p></div><Link className={styles.practiceLink} href={practiceHref}>Go to Practice Room →</Link></section>}
   </div>
  </div>:<section className={styles.handoff}><h3>Lesson sections are not published yet</h3><p>Your saved topic updates remain available below. Standard and Simplified will be two reading modes for the same lesson once content is published.</p><Link className="mv-button mv-button-outline" href={backHref+(backHref.includes('?')?'&':'?')+'lessonLayout=sample'}>Preview the learning experience →</Link></section>}
  {children}
 </section>;
}
