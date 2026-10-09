'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './StudyConsistencyReport.module.css';

const DAY_MS = 86400000;
function dateValue(value: string) { return Date.parse(`${value}T12:00:00Z`); }
function label(value: number, weekday = false) { return new Intl.DateTimeFormat('en-GB', {timeZone:'UTC',day:'numeric',month:'short',...(weekday?{weekday:'short' as const}:{year:'numeric' as const})}).format(new Date(value)); }
const FILTERS = ['All sessions','Completed','Partly completed','No record'] as const;
const SESSIONS = [{id:'01',status:'Completed'},{id:'02',status:'Partly completed'},{id:'03',status:'No record'}];

// Independent layout preview. Dates are real; activity rows and statuses are examples.
export function StudyConsistencyReport({start,end,empty}:{start:string;end:string;empty:boolean}) {
  const [page,setPage] = useState(0);
  const [selected,setSelected] = useState(0);
  const [filter,setFilter] = useState<(typeof FILTERS)[number]>('All sessions');
  const [expanded,setExpanded] = useState<string|null>(null);
  const count = Math.round((dateValue(end)-dateValue(start))/DAY_MS)+1;
  const pageCount = Math.ceil(count/7);
  const days = Array.from({length:Math.min(7,count-page*7)},(_,i)=>page*7+i);
  const selectedDate = dateValue(start)+selected*DAY_MS;
  const rows = SESSIONS.filter(row=>filter==='All sessions'||row.status===filter);
  function changeDay(day:number) {setSelected(day);setExpanded(null);}
  function changePage(next:number) {setPage(next);changeDay(next*7);}

  return <section className={styles.page} aria-label="Study consistency report preview">
    <header className={styles.heading}><div><span className={styles.kicker}>STUDY CONSISTENCY</span><h3>How your study routine is taking shape</h3></div><span className={styles.badge}>Layout preview</span></header>
    <p className={styles.note}>Report period: {label(dateValue(start))} – {label(dateValue(end))}. Figures are unavailable until activity is connected.</p>
    <div className={styles.metrics}>{['Planned study time','Recorded study time','Active study days','Session follow-through'].map(title=><article key={title}><h4>{title}</h4><strong aria-label={`${title}: unavailable`}>—</strong><span>Activity connection pending</span></article>)}</div>
    <div className={styles.grid}><section className={styles.panel} aria-label="Daily study activity"><div className={styles.panelHeading}><h4>Daily activity</h4><div className={styles.controls}><button type="button" aria-label="Previous activity days" disabled={page===0} onClick={()=>changePage(page-1)}>←</button><span>{page+1} / {pageCount}</span><button type="button" aria-label="Next activity days" disabled={page===pageCount-1} onClick={()=>changePage(page+1)}>→</button></div></div>
      <div className={styles.days} role="group" aria-label="Choose an activity day">{days.map(day=><button type="button" key={day} aria-pressed={selected===day} onClick={()=>changeDay(day)}>{label(dateValue(start)+day*DAY_MS,true)}</button>)}</div>
      <div className={styles.dayTitle}><span className={styles.kicker}>SELECTED DAY</span><h5 aria-live="polite">{label(selectedDate,true)}</h5></div>
      <dl className={styles.comparison}>{['Planned time','Recorded time','Difference'].map(title=><div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
      <p className={styles.note}>No comparison is calculated in this preview. Unrecorded time is not treated as zero.</p>
      <div className={styles.filters} role="group" aria-label="Filter session follow-through">{FILTERS.map(item=><button type="button" key={item} aria-pressed={filter===item} onClick={()=>{setFilter(item);setExpanded(null);}}>{item}</button>)}</div>
      {empty?<div className={styles.empty}><h5>No activity to display</h5><p>This is the empty-day preview.</p></div>:<div className={styles.sessions}>{rows.map(row=><article key={row.id}><div className={styles.row}><strong>Session {row.id} · Placeholder</strong><span className={styles.badge}>{row.status} · Preview</span></div><div className={styles.skeleton} aria-hidden="true"/><button className={styles.detailButton} type="button" aria-expanded={expanded===row.id} aria-controls={`consistency-session-${row.id}`} onClick={()=>setExpanded(expanded===row.id?null:row.id)}>{expanded===row.id?'Hide':'View'} session {row.id} details</button>{expanded===row.id&&<div className={styles.details} id={`consistency-session-${row.id}`}><dl>{['Subject / topic','Planned start','Recorded start','Recorded duration'].map(title=><div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl><p className={styles.note}>{row.status==='No record'?'No record does not mean missed. A session needs recorded activity before it can be evaluated.':'This status illustrates the layout; no session has been completed or changed.'}</p></div>}</article>)}</div>}
      <p className={styles.note}>The same example rows are used for each day to demonstrate the controls.</p>
    </section><aside className={styles.panel} aria-label="Routine summary"><span className={styles.kicker}>ROUTINE SUMMARY</span><h4 className={styles.asideTitle}>Review your follow-through</h4><dl className={styles.summary}>{['Planned sessions','Completed sessions','Partly completed sessions','Sessions without a record'].map(title=><div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl><div className={styles.notice}><h5>Reading this report</h5><p>A day without a record is not automatically a missed study day. Completion and study time will be shown separately.</p></div><details><summary>How comparisons will work</summary><p className={styles.note}>The selected period will compare the planned schedule with saved session activity. The report will identify the date basis before calculating totals; it will not infer performance from missing records.</p></details><Link className={styles.link} href="/dashboard?view=weekly&plan=adjustments">Open Plan Adjustments →</Link><Link className={styles.link} href="/dashboard?view=weekly&plan=review">Open Weekly Review →</Link></aside></div>
  </section>;
}
