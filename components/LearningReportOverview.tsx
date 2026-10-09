'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './LearningReportOverview.module.css';

type Period = 'week' | 'previous' | 'month' | 'custom';
type Range = { start: string; end: string };
function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function shift(date: string, days: number) { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return iso(d); }
function preset(period: Period, today: string): Range {
  const monday = shift(today, -((new Date(`${today}T12:00:00`).getDay()+6)%7));
  if(period === 'previous') return {start:shift(monday,-7),end:shift(monday,-1)};
  return {start:period === 'month' ? shift(today,-29) : monday,end:today};
}
function format(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
const METRICS = ['Study time','Completed lessons','Practice attempts','Average practice score'];

// Layout preview only: deliberately separate from saved activity and confidence.
export function LearningReportOverview() {
  const [today] = useState(() => iso(new Date()));
  const [period,setPeriod] = useState<Period>('week');
  const [range,setRange] = useState<Range>(() => preset('week',today));
  const [empty,setEmpty] = useState(false);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  function choose(value: Period) {
    setPeriod(value);setError('');setMessage('');
    if(value !== 'custom') setRange(preset(value,today));
  }
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = String(data.get('start') || ''), end = String(data.get('end') || '');
    if(!start || !end || start > end || end > today) {setError('Choose a start date on or before the end date, with neither date in the future.');return;}
    setRange({start,end});setError('');setMessage('Preview period updated. Summary figures are not connected yet.');
  }
  return <section className={styles.page} aria-label="Learning report overview preview">
    <header className={styles.header}><div><span className={styles.kicker}>REPORT OVERVIEW</span><h2>Your learning, at a glance</h2><p>Review your study activity and the areas to focus on next.</p></div><span className={styles.badge}>Layout preview · No recorded results</span></header>
    <section className={styles.range} aria-label="Report period"><div><label className={styles.label} htmlFor="report-period">Report period</label><select id="report-period" value={period} onChange={e=>choose(e.target.value as Period)}><option value="week">This week so far</option><option value="previous">Last week</option><option value="month">Last 30 days</option><option value="custom">Custom dates</option></select></div><div><span className={styles.label}>Selected date range</span><strong aria-live="polite">{format(range.start)} – {format(range.end)}</strong></div><label className={styles.toggle}><input type="checkbox" checked={empty} onChange={e=>setEmpty(e.target.checked)}/> Preview no activity</label>
      {period==='custom' && <form className={styles.custom} onSubmit={apply}><label>Start date<input type="date" name="start" required max={today} defaultValue={range.start}/></label><label>End date<input type="date" name="end" required max={today} defaultValue={range.end}/></label><button type="submit">Apply dates</button>{error && <p role="alert">{error}</p>}</form>}
    </section>
    <p className={styles.note}>Figures will appear here once recorded activity is connected. A dash means unavailable, not zero.</p>
    <div className={styles.metrics}>{METRICS.map(label=><article key={label}><h3>{label}</h3><strong aria-label={`${label}: unavailable`}>—</strong><span>{empty?'No activity in this preview':'Awaiting recorded activity'}</span></article>)}</div>
    {empty && <div className={styles.empty} role="status"><h3>No activity to display</h3><p>This is the empty-state preview for the selected period.</p><Link href="/dashboard?view=weekly">Open Weekly Plan →</Link></div>}
    <div className={styles.grid}>
      <section className={styles.panel} aria-label="Subject progress overview"><div className={styles.panelHeading}><h3>Subject progress</h3><span className={styles.badge}>Overview</span></div>{empty?<p className={styles.emptyText}>Subject activity will appear here.</p>:<div className={styles.subjects}>{[1,2,3].map(n=><div key={n}><span>Subject {String(n).padStart(2,'0')} · Placeholder</span><strong>—</strong><i aria-hidden="true"/></div>)}</div>}<details><summary>About this summary</summary><p>Space for each subject’s completed lessons and remaining work. Detailed subject reports will be built in the next stage.</p></details></section>
      <section className={styles.panel} aria-label="Study consistency overview"><div className={styles.panelHeading}><h3>Study consistency</h3><span className={styles.badge}>Overview</span></div><div className={styles.consistency}>{['Planned study time','Recorded study time','Active study days'].map(label=><div key={label}><span>{label}</span><strong>—</strong></div>)}</div><details><summary>About this summary</summary><p>Space to compare planned and recorded activity within the selected dates. Unrecorded sessions will not automatically count as missed.</p></details></section>
      <section className={styles.panel} aria-label="Practice results overview"><div className={styles.panelHeading}><h3>Practice results</h3><span className={styles.badge}>Overview</span></div><div className={styles.consistency}>{['Completed attempts','Average score','Topics practised'].map(label=><div key={label}><span>{label}</span><strong>—</strong></div>)}</div><details><summary>About this summary</summary><p>Space for results from completed, scored practice attempts. Self-reported confidence will remain separate from test scores.</p></details></section>
      <section className={styles.panel} aria-label="Topics to revisit overview"><div className={styles.panelHeading}><h3>Topics to revisit</h3><span className={styles.badge}>Overview</span></div><p className={styles.note}>{empty?'No topics to show in this preview.':'Topic recommendations will appear once the relevant records are connected.'}</p>{!empty&&<div className={styles.topicSlots} aria-label="Topic placeholders">{[1,2].map(n=><div key={n}><span>Topic {String(n).padStart(2,'0')} · Placeholder</span><i aria-hidden="true"/></div>)}</div>}<details><summary>About this summary</summary><p>Space for topics flagged by recorded results or the student, with a clear reason to revisit each one.</p></details></section>
    </div>
    <footer className={styles.footer}><span>Plan your next step</span><div><Link href="/dashboard?view=subjects">Open My Subjects →</Link><Link href="/dashboard?view=weekly&plan=review">Open Weekly Review →</Link></div></footer><p role="status" className={styles.message}>{message}</p>
  </section>;
}
