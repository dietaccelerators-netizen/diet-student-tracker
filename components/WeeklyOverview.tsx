'use client';

import { useState } from 'react';
import styles from './WeeklyOverview.module.css';

// Architecture preview: deliberately independent of saved plans and activity.
export function WeeklyOverview() {
  const [offset, setOffset] = useState(0);
  const [anchor] = useState(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    return date;
  });
  const start = new Date(anchor);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const format = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return <section className={styles.overview} aria-label="Weekly overview layout">
    <div className={styles.heading}>
      <div><span className={styles.kicker}>WEEKLY OVERVIEW</span><h3>Your week, at a glance</h3></div>
      <span className={styles.preview}>Layout preview · No plan changes</span>
    </div>
    <div className={styles.datebar}>
      <div><span className={styles.label}>Date range</span><strong aria-live="polite">{format(start)} – {format(end)}</strong></div>
      <div className={styles.navigation}><button aria-label="Previous overview week" onClick={() => setOffset(n => n - 1)}>←</button><button onClick={() => setOffset(0)} disabled={offset === 0}>This week</button><button aria-label="Next overview week" onClick={() => setOffset(n => n + 1)}>→</button></div>
    </div>
    <div className={styles.metrics}>
      {['Study targets', 'Available hours', 'Planned sessions'].map(label => <article className={styles.metric} key={label}><h4>{label}</h4><span className={styles.value} aria-label={`${label}: not connected`}>—</span><div className={styles.line} aria-hidden="true"/></article>)}
    </div>
    <div className={styles.details}>
      <section className={styles.panel} aria-label="Study targets placeholder"><h4>Study targets</h4><div className={styles.targetSlots} aria-hidden="true">{[0, 1, 2].map(i => <div className={styles.target} key={i}><span/><div><i/><i/></div></div>)}</div></section>
      <section className={styles.panel} aria-label="Available hours placeholder"><h4>Available hours</h4><div className={styles.hours}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <div key={day}><span>{day}</span><b aria-label={`${day}: not set`}>—</b></div>)}</div></section>
    </div>
    <section className={styles.panel} aria-label="Planned sessions placeholder"><h4>Planned sessions</h4><div className={styles.table} role="table" aria-label="Planned sessions layout"><div className={styles.row} role="row">{['Day / time','Subject / topic','Duration','Status'].map(label => <span role="columnheader" key={label}>{label}</span>)}</div>{[0,1,2].map(i => <div className={styles.row} role="row" key={i}>{[0,1,2,3].map(j => <span role="cell" aria-label="Not set" key={j}><i className={styles.slot} aria-hidden="true"/></span>)}</div>)}</div></section>
  </section>;
}
