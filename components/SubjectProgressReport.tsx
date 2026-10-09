'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './SubjectProgressReport.module.css';

const FILTERS = ['All topics', 'Completed', 'In progress', 'Not started'] as const;
const TOPICS = [{id:'01',status:'Completed'},{id:'02',status:'In progress'},{id:'03',status:'Not started'}];

// All rows are labelled examples. This component never reads or writes study records.
export function SubjectProgressReport({empty,periodLabel}:{empty:boolean;periodLabel:string}) {
  const [subject,setSubject] = useState('01');
  const [filter,setFilter] = useState<(typeof FILTERS)[number]>('All topics');
  const [opened,setOpened] = useState<string|null>(null);
  const rows = TOPICS.filter(topic=>filter==='All topics'||topic.status===filter);
  const active = !empty ? TOPICS.find(topic=>topic.id===opened) : undefined;
  function changeSubject(value:string) {setSubject(value);setFilter('All topics');setOpened(null);}
  return <section className={styles.page} aria-label="Subject progress report preview">
    <div className={styles.heading}><div><span className={styles.kicker}>SUBJECT PROGRESS</span><h3>A closer look at each subject</h3></div><span className={styles.badge}>Layout preview</span></div>
    <p className={styles.note}>Report period: {periodLabel}. All subjects, topics and statuses below are placeholders.</p>
    <div className={styles.subjects} role="group" aria-label="Choose a report subject">{['01','02','03'].map(id=><button type="button" key={id} aria-pressed={subject===id} onClick={()=>changeSubject(id)}><span>Subject {id}</span><small>Placeholder</small></button>)}</div>
    <div className={styles.title}><h4>Subject {subject} · Placeholder</h4><Link href="/dashboard?view=subjects">Open My Subjects →</Link></div>
    <div className={styles.metrics}>{['Lesson completion','Completed lessons','Outstanding lessons','Recorded study time'].map(label=><article key={label}><h5>{label}</h5><strong aria-label={`${label}: unavailable`}>—</strong><span>Activity connection pending</span></article>)}</div>
    <div className={styles.grid}><section className={styles.panel} aria-label="Topic breakdown"><h4>Topic breakdown</h4><div className={styles.filters} role="group" aria-label="Filter topic progress">{FILTERS.map(item=><button type="button" key={item} aria-pressed={filter===item} onClick={()=>{setFilter(item);setOpened(null);}}>{item}</button>)}</div>
      {empty?<div className={styles.empty}><h5>No subject activity to display</h5><p>This demonstrates the empty view for the selected period.</p></div>:<div className={styles.topics}>{rows.map(topic=><article key={topic.id}><div className={styles.row}><strong>Topic {topic.id} · Placeholder</strong><span className={styles.badge}>{topic.status} · Preview</span></div><div className={styles.skeleton} aria-hidden="true"/><div className={styles.row}><span className={styles.note}>Completed lessons — / —</span><button type="button" aria-expanded={opened===topic.id} aria-controls={`report-topic-${topic.id}`} onClick={()=>setOpened(opened===topic.id?null:topic.id)}>{opened===topic.id?'Hide':'View'} topic {topic.id} details</button></div>{opened===topic.id&&<div id={`report-topic-${topic.id}`} className={styles.lessonDetails}><h5>Lesson breakdown · Preview</h5>{['01','02'].map(id=><div className={styles.row} key={id}><span>Lesson {id} · Placeholder</span><span>Status —</span></div>)}<p className={styles.note}>Lesson records will be connected later.</p></div>}</article>)}</div>}
    </section><aside className={styles.panel} aria-label="Outstanding work"><h4>Outstanding work</h4><p className={styles.note}>A place for unfinished lessons and the next study action.</p><dl className={styles.remaining}>{['Lessons to continue','Lessons not started','Last recorded activity'].map(label=><div key={label}><dt>{label}</dt><dd>—</dd></div>)}</dl>{active&&<div className={styles.context}><span className={styles.kicker}>SELECTED TOPIC</span><h5>Topic {active.id} · Placeholder</h5><p className={styles.note}>{active.status} · Preview</p></div>}<p className={styles.note}>These examples do not indicate actual completion, confidence or exam readiness.</p><Link className={styles.link} href="/dashboard?view=weekly">Open Weekly Plan →</Link></aside></div>
  </section>;
}
