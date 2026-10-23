"use client";
import { useEffect, useState } from 'react';
import { useTracker } from './TrackerProvider';
import Link from 'next/link';
import type { Topic, TopicProgress } from '@/lib/types';
import styles from './SubjectLearning.module.css';
import { sampleLearningTopic } from '@/lib/subjectLessonSample';

// Content is intentionally separate from the interface. Populate after content approval.
export interface SyllabusArea {
 id: string;
 title: string;
 weight: number | null;
 sections: { id: string; title: string; topicId?: string }[];
}
const layoutSample: SyllabusArea[] = [
 {id:'sample-1',title:sampleLearningTopic.name,weight:sampleLearningTopic.syllabusWeight,sections:sampleLearningTopic.sections.map(s=>({id:s.slug,title:s.title}))},
];
export function SubjectSyllabus({view,areas=[],topics,progress,lessonHref,pathHref,syllabusHref,selectedArea,subjectId}:{subjectId:string;view:'path'|'syllabus';areas?:SyllabusArea[];topics:Topic[];progress:TopicProgress[];lessonHref:(id:string)=>string;pathHref:string;syllabusHref:string;selectedArea?:string|null}) {
 const {currentUserId}=useTracker();
 const [readingState,setReadingState]=useState<{completed:string[];section?:string}>({completed:[]});
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(`mastrevo-lesson:v1:${currentUserId||'preview'}:${subjectId}:sample-cgt`)||'{}');setReadingState({completed:Array.isArray(saved.completed)?saved.completed.filter((id:unknown)=>typeof id==='string'):[],section:typeof saved.section==='string'?saved.section:undefined});}catch{}},[currentUserId,subjectId]);
 const recentTopic=[...progress].filter(p=>p.lastStudied||p.status!=='Not Started').sort((a,b)=>(b.lastStudied||b.updatedAt).localeCompare(a.lastStudied||a.updatedAt))[0]?.topicId;
 const currentTopic=recentTopic||topics.find(t=>!progress.some(p=>p.topicId===t.id&&p.status==='Okay'))?.id;
 const hasPublishedAreas=areas.length>0;
 const displayAreas=hasPublishedAreas?areas:topics.map(t=>({id:t.id,title:t.topicName,weight:null,sections:[{id:t.id,title:'Open learning workspace',topicId:t.id}]}));
 const [sample,setSample]=useState(false);
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [expanded,setExpanded]=useState<string[]>(selectedArea?[selectedArea]:[]);
 const lessonPreviewHref=pathHref+'&lessonLayout=sample';
 const showingSample=sample&&areas.length===0;
 const source=showingSample?layoutSample:displayAreas;
 const linkedTopics=(area:SyllabusArea)=>topics.filter(t=>area.sections.some(s=>s.topicId===t.id));
 const activity=(area:SyllabusArea)=>{
  if(showingSample)return 'Sample path';
  const ids=new Set(linkedTopics(area).map(t=>t.id));
  const records=progress.filter(p=>ids.has(p.topicId));
  if(records.length>0&&records.every(p=>p.status==='Okay'))return 'Marked confident';
  if(records.some(p=>p.questionPractice==='Attempted'||p.questionPractice==='Reattempt'))return 'Practising';
  if(records.some(p=>p.lastStudied||p.status!=='Not Started'))return 'Learning';
  return 'Not Started';
 };
 const visible=source.filter(a=>([a.title,...a.sections.map(s=>s.title)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))&&(filter==='all'||activity(a)===filter));
 const unassigned=topics.filter(t=>!displayAreas.some(a=>a.sections.some(s=>s.topicId===t.id)));
 const areaHref=(id:string)=>{const [base,hashless]=pathHref.split('?');const q=new URLSearchParams(hashless);q.set('area',id);return base+'?'+q.toString()+'#study-path';};
 return <section className={styles.syllabusSection} aria-label={view==='path'?'Study Path':'Syllabus'} id="study-path">
  <div className={styles.sectionHead}><div><span className={styles.eyebrow}>SUBJECT STRUCTURE</span><h2>{view==='path'?'Your Study Path':'Subject syllabus'}</h2><p>{view==='path'?'Explore each syllabus area and its learning sections.':'See the subject structure, weightings and learning activity in one place.'}</p></div><Link href={view==='path'?syllabusHref:pathHref}>{view==='path'?'View full syllabus →':'Return to Study Path →'}</Link></div>
  {!areas.length&&!topics.length&&<div className={styles.setupNotice}><div><strong>{showingSample?'Template preview · Advanced Taxation':'Ready for your syllabus content'}</strong><p>{showingSample?'Advanced Taxation example from your attached template. Sample weighting and content are illustrative; they are not your saved progress.':'The workspace is set up. Approved syllabus areas, section titles and weightings can be added later.'}</p></div><button type="button" onClick={()=>{setSample(!sample);setExpanded(!sample?['sample-1']:[]);setQuery('');setFilter('all');}}>{showingSample?'Hide layout sample':'View layout sample'}</button></div>}
  {source.length>0&&<>
   <div className={styles.syllabusTools}><label className={styles.search}>Search areas or sections<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find an area or section"/></label>{!showingSample&&<label className={styles.filter}>Study activity<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All areas</option><option>Not Started</option><option>Learning</option><option>Practising</option><option>Marked confident</option></select></label>}{view==='path'&&<button className={styles.textButton} type="button" onClick={()=>setExpanded(visible.every(a=>expanded.includes(a.id))?[]:visible.map(a=>a.id))}>{visible.every(a=>expanded.includes(a.id))?'Collapse all':'Expand all'}</button>}</div>
   <p className={styles.resultCount} aria-live="polite">{visible.length} of {source.length} areas{showingSample?' · sample layout':''}</p>
   {view==='path'?<div className={styles.topics}>{visible.map((a)=><article className={styles.area} key={a.id}><h3><button type="button" className={styles.areaToggle} aria-expanded={expanded.includes(a.id)} aria-controls={'area-'+a.id} onClick={()=>setExpanded(expanded.includes(a.id)?expanded.filter(id=>id!==a.id):[...expanded,a.id])}><span className={styles.number}>{source.indexOf(a)+1}</span><span className={styles.areaTitle}>{a.title}<small>{a.sections.length} sections · {a.weight===null?'Weighting to be added':`${a.weight}% syllabus weight`}</small></span><span className={styles.status}>{activity(a)}</span><span aria-hidden="true">{expanded.includes(a.id)?'−':'+'}</span></button></h3>{expanded.includes(a.id)&&<div className={styles.areaBody} id={'area-'+a.id}><ol className={styles.sections}>{a.sections.map(s=>{const topic=!showingSample&&topics.find(t=>t.id===s.topicId);const sampleSection=showingSample?sampleLearningTopic.sections.find(item=>item.slug===s.id):undefined;const done=!!sampleSection&&readingState.completed.includes(sampleSection.id);const currentSlug=readingState.section||sampleLearningTopic.sections.find(item=>!readingState.completed.includes(item.id))?.slug;const current=showingSample?s.id===currentSlug:!!topic&&topic.id===currentTopic;const status=done?'Complete':current?'Current':'Upcoming';return <li key={s.id}><span className={styles.pathMarker} data-state={status} aria-hidden="true">{done?'✓':current?'●':'○'}</span><span>{s.title}<small>{showingSample?`${status} · ${sampleSection?.content.paragraphs.length?'Sample lesson':'Content pending'}`:topic?`${status} · Topic workspace`:'Lesson not yet published'}</small></span>{topic?<Link href={lessonHref(topic.id)}>Open lesson →</Link>:showingSample?<Link href={lessonPreviewHref+'&section='+encodeURIComponent(s.id)}>Preview lesson →</Link>:<span className={styles.pending}>Coming later</span>}</li>;})}</ol><p className={styles.areaFootnote}>{showingSample?'Sample reading completion is saved in this browser; it does not measure mastery.':'Topic activity reflects your saved study updates. Section completion will appear when lessons are published.'}</p></div>}</article>)}</div>:<div className={styles.tableScroll} role="region" aria-label="Syllabus table" tabIndex={0}><table className={styles.syllabusTable}><caption>{showingSample?'Sample syllabus layout':'Subject syllabus overview'}</caption><thead><tr><th scope="col">Syllabus area</th><th scope="col">Weight</th><th scope="col">Sections</th><th scope="col">Your progress</th><th scope="col">Activity</th><th scope="col">Action</th></tr></thead><tbody>{visible.map(a=><tr key={a.id}><th scope="row">{a.title}</th><td>{a.weight===null?'To be added':`${a.weight}%`}</td><td>{a.sections.length}</td><td>Not measured</td><td><span className={styles.status}>{activity(a)}</span></td><td>{showingSample?<button className={styles.textButton} type="button" aria-expanded={expanded.includes(a.id)} aria-controls={'sample-detail-'+a.id} onClick={()=>setExpanded(expanded.includes(a.id)?[]:[a.id])}>View sections</button>:<Link href={areaHref(a.id)}>View area →</Link>}</td></tr>)}</tbody></table></div>}
   {view==='syllabus'&&showingSample&&visible.filter(a=>expanded.includes(a.id)).map(a=><div className={styles.sampleDetail} key={a.id} id={'sample-detail-'+a.id}><h3>{a.title} · section preview</h3><ol>{a.sections.map(s=><li key={s.id}>{s.title}</li>)}</ol><p>Sample sections include draft text and unpublished placeholders.</p><Link href={lessonPreviewHref}>Preview lesson layout →</Link></div>)}
   {!visible.length&&<div className={styles.empty}><h3>No matching areas</h3><p>Try another search or clear the filters.</p><button className={styles.textButton} onClick={()=>{setQuery('');setFilter('all');}}>Clear filters</button></div>}
   <p className={styles.notice}>Syllabus weight describes exam emphasis, not your completion. Learning and practice activity do not by themselves establish mastery.</p>
  </>}
  {!source.length&&<div className={styles.empty}><h3>{view==='path'?'Your learning structure starts here':'Syllabus table ready for content'}</h3><p>{view==='path'?'Each area will expand into its sections, with a direct route to published lessons.':'The table will show each area, its weighting, section count, progress and study activity.'}</p><div className={styles.structureLabels}><span>Syllabus area</span><span>Learning sections</span><span>Lesson workspace</span></div></div>}
  {unassigned.length>0&&<section className={styles.existingTopics}><h3>Existing learning topics</h3><p>These remain available while the syllabus structure is prepared.</p><div>{unassigned.map(t=><Link key={t.id} href={lessonHref(t.id)}>{t.topicName}<span aria-hidden="true"> →</span></Link>)}</div></section>}
 </section>;
}
