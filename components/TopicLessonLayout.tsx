"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './TopicLessonLayout.module.css';
const sections=['Section title 1','Section title 2','Section title 3','Section title 4'];
const panels=[
 {title:'Concept Explanation',heading:'Understand the concept',description:'The approved explanation will appear here, arranged into short, readable sections.',slots:['Learning objectives','Concept explanation','Key terms and principles']},
 {title:'Worked Example',heading:'Work through an example',description:'A relevant example and its solution will be added here.',slots:['Question or scenario','Step-by-step workings','Answer and explanation']},
 {title:'Exam Focus',heading:'Prepare for the examination',description:'Approved exam guidance will be organised here for this section.',slots:['What the question requires','Answer structure','Common errors to avoid']},
 {title:'Related Past Questions',heading:'Connect learning to practice',description:'Verified past questions will appear here once they have been added and linked to this section.',slots:['Question reference and exam diet','Question preview','Practice action']},
 {title:'Quick Review',heading:'Review the key ideas',description:'Review prompts and a concise recap will be added here.',slots:['Key points to remember','Recall prompts','Section recap']},
];
export function TopicLessonLayout({subject,topic,backHref,subjectId,topicId,children}:{subject:string;topic:string;backHref:string;subjectId:string;topicId?:string;children?:ReactNode}) {
 const params=useSearchParams(),pathname=usePathname();
 const [section,setSection]=useState(()=>/^[0-3]$/.test(params.get('section')||'')?Number(params.get('section')):0),[panel,setPanel]=useState(()=>/^[0-4]$/.test(params.get('content')||'')?Number(params.get('content')):0);
 const practiceParams=new URLSearchParams({view:'practice',fromLesson:'1',subject:subjectId,topic:topicId||'layout-sample',section:String(section),content:String(panel)});
 if(pathname==='/login'){practiceParams.set('mode','preview');practiceParams.set('stage',params.get('stage')||'Professional');}
 const practiceHref=(pathname==='/login'?'/login':'/dashboard')+'?'+practiceParams.toString();
 const [completed,setCompleted]=useState<number[]>([]);
 const [notice,setNotice]=useState('');
 const chooseSection=(index:number)=>{setSection(index);setPanel(0);setNotice('');};
 const content=panels[panel];
 return <section className={styles.page} aria-label="Topic learning workspace">
  <Link className={styles.back} href={backHref}>← Back to {subject}</Link>
  <header className={styles.header}><div><span className={styles.eyebrow}>{subject} · LESSON WORKSPACE</span><h1>{topic}</h1><p>Read, work through examples and review each section.</p></div><span className={styles.badge}>Layout preview</span></header>
  <div className={styles.preview}><strong>Structure preview only</strong><p>Section titles and content areas are placeholders. Completion changes below are temporary and do not update your learning report or saved study record.</p></div>
  <div className={styles.layout}>
   <aside className={styles.outline}><h2>In this topic</h2><p>{completed.length} of {sections.length} sample sections marked complete</p><progress aria-label="Temporary sample completion" value={completed.length} max={sections.length}/><nav aria-label="Topic section navigation">{sections.map((name,i)=><button type="button" key={name} aria-current={section===i?'step':undefined} onClick={()=>chooseSection(i)}><span className={styles.step}>{completed.includes(i)?'✓':String(i+1).padStart(2,'0')}</span><span>{name}<small>{completed.includes(i)?'Complete in preview':section===i?'Current section':'Not started in preview'}</small></span></button>)}</nav><button className={styles.reset} type="button" onClick={()=>{setCompleted([]);chooseSection(0);setNotice('The layout preview has been reset.');}}>Reset preview</button></aside>
   <div className={styles.main}>
    <div className={styles.sectionHeader}><span className={styles.eyebrow}>SECTION {section+1} OF {sections.length}</span><h2>{sections[section]}</h2><p>Study time will appear when the lesson content is added.</p></div>
    <nav className={styles.tabs} aria-label="Learning content">{panels.map((item,i)=><button type="button" key={item.title} aria-pressed={panel===i} onClick={()=>setPanel(i)}>{item.title}</button>)}</nav>
    <section className={styles.reading} aria-label={content.title}><span className={styles.label}>CONTENT PLACEHOLDER</span><h3>{content.heading}</h3><p>{content.description}</p><div className={styles.slots}>{content.slots.map((title,i)=><div key={title}><span>{String(i+1).padStart(2,'0')}</span><div><h4>{title}</h4><p>Reserved for approved lesson content.</p></div></div>)}</div></section>
    <div className={styles.controls}><button type="button" disabled={section===0} onClick={()=>chooseSection(section-1)}>← Previous section</button><button type="button" className={styles.primary} onClick={()=>{const done=completed.includes(section);setCompleted(done?completed.filter(n=>n!==section):[...completed,section]);setNotice(done?'Section unmarked in this preview.':'Section marked complete in this preview only.');}}>{completed.includes(section)?'Undo completion':'Mark complete'} <span>(preview)</span></button><button type="button" disabled={section===sections.length-1} onClick={()=>chooseSection(section+1)}>Next section →</button></div>
    <p className={styles.notice} role="status">{notice||'Completion here demonstrates the interaction only.'}</p>
    <section className={styles.practice}><div><h3>Test my understanding</h3><p>Open Practice Room with this subject, topic and section selected.</p></div><Link className={styles.practiceLink} href={practiceHref}>Open Practice Room →</Link></section>
    {children}
   </div>
  </div>
 </section>;
}
