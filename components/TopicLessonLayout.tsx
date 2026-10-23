"use client";
import { useTracker } from './TrackerProvider';
import { usePortalPreferences } from './PortalPreferences';
import { StudyView } from "./StudyView";
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { sampleLearningTopic, type AccountingBlock, type StudySection } from '@/lib/subjectLessonSample';
import styles from './TopicLessonLayout.module.css';

const tabs=['Overview','Study Content','Key Points','Worked Examples'];
export function TopicLessonLayout({subject,topic,backHref,subjectId,topicId,children}:{subject:string;topic:string;backHref:string;subjectId:string;topicId?:string;children?:ReactNode}) {
 const {prefs,ready}=usePortalPreferences();
 const {currentUserId}=useTracker();
 const storageKey=`mastrevo-lesson:v1:${currentUserId||'preview'}:${subjectId}:${topicId||'sample-cgt'}`;
 const params=useSearchParams(),pathname=usePathname();
 const isSample=!topicId;
 const sections:StudySection[]=isSample?sampleLearningTopic.sections:[];
 const requested=sections.findIndex(s=>s.slug===params.get('section'));
 const [section,setSection]=useState(requested>=0?requested:0);
 const [panel,setPanel]=useState(()=>{const n=Number(params.get('content'));return Number.isInteger(n)&&n>=0&&n<4?n:0;});
 const [readingMode,setReadingMode]=useState<'standard'|'simplified'>('standard');
 useEffect(()=>{if(ready)setReadingMode(prefs.lesson);},[ready,prefs.lesson]);
 const [completed,setCompleted]=useState<string[]>([]);
 const [loaded,setLoaded]=useState(false),[saveError,setSaveError]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');setCompleted(Array.isArray(saved.completed)?saved.completed.filter((id:unknown)=>typeof id==='string'&&sections.some(s=>s.id===id)):[]);if(!params.has('section')&&typeof saved.section==='string'){const index=sections.findIndex(s=>s.slug===saved.section);if(index>=0){setSection(index);setPanel(saved.panel===1?1:0);}}}catch{setSaveError(true);}setLoaded(true);},[storageKey]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(storageKey,JSON.stringify({completed,section:sections[section]?.slug,panel}));}catch{setSaveError(true);}},[storageKey,loaded,completed,section,panel]);
 const current=sections[section];
 const chooseSection=(index:number)=>{setSection(index);setPanel(0);};
 const title=isSample?sampleLearningTopic.name:topic;
 const practiceParams=new URLSearchParams({view:'practice',fromLesson:'1',subject:subjectId,topic:topicId||'layout-sample',section:current?.slug||'',content:String(panel)});
 if(pathname==='/login'){practiceParams.set('mode','preview');practiceParams.set('stage',params.get('stage')||'Professional');}
 const practiceHref=(pathname==='/login'?'/login':'/dashboard')+'?'+practiceParams.toString();
 const hasSimplified=!!current?.simplifiedContent?.paragraphs.length;
 const effectiveMode=hasSimplified?readingMode:'standard';
 const activeContent=effectiveMode==='standard'?current?.content:current?.simplifiedContent;
 const hasContent=!!current?.content.paragraphs.length;
 const modeControls=<div className={styles.readingModes} role="group" aria-label="Reading mode"><button aria-pressed={effectiveMode==='standard'} onClick={()=>setReadingMode('standard')}>Standard</button><button disabled={!hasSimplified} title={!hasSimplified?'Simplified content is not available for this section':undefined} aria-pressed={effectiveMode==='simplified'} onClick={()=>setReadingMode('simplified')}>Simplified</button></div>;
 const done=!!current&&completed.includes(current.id);
 return <section className={styles.page} aria-label="Topic learning workspace">
  <Link className={styles.back} href={backHref}>← Back to Study Path</Link>
  <header className={styles.header}><div><span className={styles.eyebrow}>{subject} › {title}</span><h1>{current?.title||title}</h1><p>{current?`Section ${section+1} of ${sections.length} · Estimated time: ${current.estimatedMinutes} minutes`:'Learning content awaiting publication'}</p></div>{isSample&&<span className={styles.badge}>Sample lesson</span>}</header>
  {isSample&&<div className={styles.preview}><strong>Example from your supplied template · Advanced Taxation</strong><p>This content demonstrates the reading experience. It is not a published lesson for {subject}. Sample completion and reading position are saved in this browser only. This draft has not been verified for the current exam syllabus.</p></div>}
  {current?<div className={styles.layout}>
   <aside className={styles.outline}><h2>In this topic</h2><p>{completed.length} of {sections.length} sample sections completed</p><progress aria-label="Sample section completion" value={completed.length} max={sections.length}/><nav aria-label="Topic section navigation">{sections.map((item,i)=><button type="button" key={item.id} aria-current={section===i?'step':undefined} onClick={()=>chooseSection(i)}><span className={styles.step} data-complete={completed.includes(item.id)||undefined}>{completed.includes(item.id)?'✓':String(i+1).padStart(2,'0')}</span><span>{item.title}<small>{item.estimatedMinutes} min · {completed.includes(item.id)?'Complete':section===i?'Current section':'Upcoming'}</small></span></button>)}</nav></aside>
   <div className={styles.main}>
    <nav className={styles.tabs} aria-label="Learning content">{tabs.map((label,i)=><button type="button" key={label} aria-pressed={panel===i} onClick={()=>setPanel(i)}>{label}</button>)}</nav>
    <StudyView readingOnly enabled={panel===1} positionKey={`${subjectId}:${topicId||'sample-cgt'}:${current.id}`} contentVersion={effectiveMode} controls={modeControls}><article data-reading-content className={styles.reading} aria-label={tabs[panel]}>
     {panel===0&&<><span className={styles.label}>LESSON OVERVIEW</span><h3>{current.title}</h3><p>{current.overview}</p><h4>What you’ll learn</h4>{current.learningObjectives.length?<ul className={styles.lessonList}>{current.learningObjectives.map(item=><li key={item}>{item}</li>)}</ul>:<p>Learning objectives have not been added yet.</p>}<button className="mv-button" onClick={()=>setPanel(1)}>Read Study Content →</button></>}
     {panel===1&&<>
      <span className={styles.label}>SECTION {section+1} OF {sections.length} · {isSample?'ILLUSTRATIVE LESSON':'STUDY CONTENT'}</span>
      <h3 data-reading-anchor="title">{activeContent?.heading||current.title}</h3>
      {!hasSimplified&&<p className={styles.modeNote}>Standard content is shown. Simplified is not yet available for this section.</p>}
      {activeContent?.paragraphs.length?<>{activeContent.paragraphs.map((p,i)=><p data-reading-anchor={'paragraph-'+i} key={i}>{p}</p>)}{!!activeContent.numberedPoints?.length&&<><h4 data-reading-anchor="key-ideas">{activeContent.pointsHeading||'Key ideas'}</h4><ol className={styles.lessonList}>{activeContent.numberedPoints.map((item,i)=><li data-reading-anchor={'point-'+i} key={item.title}><strong>{item.title}</strong><p>{item.description}</p></li>)}</ol></>}</>:<p>Study content has not been added for this section yet.</p>}
      {current.accountingBlocks?.map(block=><AccountingContent key={block.id} block={block}/>)}
      {current.keyPoints.length>0&&<section className={styles.keyTakeaways} data-reading-anchor="takeaways"><h4>Points to retain in either mode</h4><ul className={styles.lessonList}>{current.keyPoints.map(point=><li key={point}>{point}</li>)}</ul></section>}
      {current.workedExamples.map(example=><section className={styles.example} data-reading-anchor={'example-'+example.id} key={example.id}><span className={styles.label}>WORKED EXAMPLE</span><h4>{example.title}</h4><p>{example.scenario}</p><details className={styles.solution}><summary>Show suggested approach</summary><ol className={styles.lessonList}>{example.solution.map(step=><li key={step}>{step}</li>)}</ol></details></section>)}
      <footer className={styles.lessonEnd} data-reading-anchor="lesson-end" aria-label="Section actions">
       <div role="status"><h4>{done?'Section marked complete':'End of section'}</h4><p>{done?'Completion records that you have read this section, not mastery.':'Mark complete when you have finished reading and reviewed the key points.'}</p></div>
       <div className={styles.endActions}>
        <button className={done?'mv-button mv-button-outline':'mv-button'} disabled={!hasContent||!loaded} onClick={()=>setCompleted(ids=>done?ids.filter(id=>id!==current.id):[...ids,current.id])}>{done?'Undo completion':'Mark section complete'}</button>
        {section<sections.length-1?<button className={done?'mv-button':'mv-button mv-button-outline'} onClick={()=>chooseSection(section+1)}>Next section →</button>:<Link className="mv-button mv-button-outline" href={backHref}>Return to Study Path</Link>}
        {!isSample&&<Link className={styles.practiceText} href={practiceHref}>Practise this topic →</Link>}
       </div>
       {isSample&&<p className={styles.localNote}>Sample practice questions are not available. {saveError?'Completion is available for this visit only.':'Sample completion is saved in this browser.'}</p>}
      </footer>
     </>}
     {panel===2&&<><h3>Key Points</h3>{current.keyPoints.length?<ol className={styles.lessonList}>{current.keyPoints.map(item=><li key={item}>{item}</li>)}</ol>:<p>Key points have not been added for this section yet.</p>}</>}
     {panel===3&&<><h3>Worked Examples</h3>{current.workedExamples.length?current.workedExamples.map(example=><section className={styles.example} key={example.id}><h4>{example.title}</h4><p>{example.scenario}</p><h4>Step-by-step solution</h4><ol className={styles.lessonList}>{example.solution.map(step=><li key={step}>{step}</li>)}</ol></section>):<p>No worked examples have been added for this section yet.</p>}</>}
    </article></StudyView>
    <div className={styles.controls}><button disabled={section===0} onClick={()=>chooseSection(section-1)}>← Previous section</button><button disabled={section===sections.length-1} onClick={()=>chooseSection(section+1)}>Next section →</button></div>

   </div>
  </div>:<section className={styles.handoff}><h3>Lesson sections are not published yet</h3><p>Your saved topic updates remain available below. Standard and Simplified will be two reading modes for the same lesson once content is published.</p><Link className="mv-button mv-button-outline" href={backHref+(backHref.includes('?')?'&':'?')+'lessonLayout=sample'}>Preview the learning experience →</Link></section>}
  {children}
 </section>;
}

// Structured accounting layouts keep labels, units and workings together in both modes.
export function AccountingContent({block}:{block:AccountingBlock}) {
 if(block.kind==='table'||block.kind==='workings')return <section className={styles.accounting} data-reading-anchor={block.id}><div className={styles.tableScroll} role="region" aria-label={block.title} tabIndex={0}><table><caption>{block.title}</caption><thead><tr>{block.columns.map((label,i)=><th key={i} scope="col" data-numeric={block.numericColumns?.includes(i)||undefined}>{label}</th>)}</tr></thead><tbody>{block.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j} data-numeric={block.numericColumns?.includes(j)||undefined}>{cell}</td>)}</tr>)}</tbody></table></div>{block.note&&<p>{block.note}</p>}</section>;
 if(block.kind==='equation')return <figure className={styles.equation} data-reading-anchor={block.id}><figcaption>{block.title}</figcaption><p>{block.expression}</p>{block.explanation&&<p>{block.explanation}</p>}</figure>;
 if(block.kind==='example'||block.kind==='model-answer')return <section className={styles.example} data-reading-anchor={block.id}><span className={styles.label}>{block.kind==='model-answer'?'MODEL ANSWER':'EXAMPLE'}</span><h4>{block.title}</h4>{block.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>;
 return null;
}
