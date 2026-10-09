'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './WeeklyReview.module.css';

type ReviewDraft = { wentWell: string; improve: string; priorities: string; complete: boolean };
const blank = (): ReviewDraft => ({ wentWell: '', improve: '', priorities: '', complete: false });
const FILTERS = ['All sessions', 'Completed', 'Unfinished'] as const;
const FIELDS = [['wentWell', 'What went well?'], ['improve', 'What would you change?'], ['priorities', 'Priorities for next week']] as const;

// Temporary architecture preview; does not read or modify recorded activity.
export function WeeklyReview() {
  const [offset, setOffset] = useState(0);
  const [anchor] = useState(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    return date;
  });
  const [drafts, setDrafts] = useState<Record<number, ReviewDraft>>({});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All sessions');
  const [empty, setEmpty] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const draft = drafts[offset] ?? blank();
  const start = new Date(anchor);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const dateLabel = (date: Date) => date.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  function update(change: Partial<ReviewDraft>) {
    setDrafts(current => ({...current, [offset]: {...(current[offset] ?? blank()), ...change}}));
    setMessage('');
  }
  function changeWeek(next: number) { setOffset(next); setConfirm(false); setMessage(''); }
  const rows = [{id:'01', status:'Completed'}, {id:'02', status:'Unfinished'}].filter(row => filter === 'All sessions' || row.status === filter);

  return <section className={styles.page} aria-label="Weekly review preview">
    <header className={styles.header}><div><span className={styles.kicker}>WEEKLY REVIEW</span><h3>Reflect on your week</h3></div><span className={styles.badge}>Layout preview · Nothing saved</span></header>
    <div className={styles.datebar}><div><span className={styles.label}>Review period</span><strong aria-live="polite">{dateLabel(start)} – {dateLabel(end)}</strong></div><div className={styles.actions}><button type="button" aria-label="Previous review week" onClick={() => changeWeek(offset - 1)}>←</button><button type="button" disabled={offset === 0} onClick={() => changeWeek(0)}>This week</button><button type="button" aria-label="Next review week" disabled={offset === 0} onClick={() => changeWeek(offset + 1)}>→</button></div></div>
    <div className={styles.metrics}>{['Planned sessions','Completed sessions','Study time','Targets achieved'].map(label => <article key={label}><h4>{label}</h4><strong aria-label={`${label}: not connected`}>—</strong><span>Activity connection pending</span></article>)}</div>
    <section className={styles.panel} aria-label="Session review"><div className={styles.panelHeading}><h4>Session review</h4><label className={styles.emptyToggle}><input type="checkbox" checked={empty} onChange={e => setEmpty(e.target.checked)}/> Preview empty week</label></div>
      <div className={styles.filters} role="group" aria-label="Filter review sessions">{FILTERS.map(item => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {empty ? <p className={styles.empty}>No study activity to review for this week.</p> : <div className={styles.sessions}>{rows.map(row => <article key={row.id} className={styles.session}><div><strong>Session {row.id} · Placeholder</strong><div className={styles.skeleton} aria-hidden="true"/><div className={styles.shortSkeleton} aria-hidden="true"/></div><span className={styles.sessionStatus}>{row.status} · Preview</span></article>)}</div>}
      <p className={styles.hint}>These placeholders demonstrate the layout; they are not recorded results.</p>
    </section>
    <div className={styles.lower}><section className={styles.panel} aria-label="Weekly reflections"><div className={styles.panelHeading}><h4>Weekly reflections</h4><span className={styles.badge}>{draft.complete ? 'Reviewed · Preview' : 'Not reviewed · Preview'}</span></div><p className={styles.hint}>Optional fields. Preview entries last only while this section stays open.</p>
      {FIELDS.map(([key,label]) => <label className={styles.field} key={key}>{label}<textarea rows={3} maxLength={1500} value={draft[key]} disabled={draft.complete} onChange={e => update({[key]:e.target.value})} placeholder="Add a preview note (optional)"/></label>)}
      {confirm ? <div className={styles.confirm} role="group" aria-label="Confirm review preview"><p>Mark this week as reviewed in the preview?</p><p className={styles.hint}>Your saved plan and learning report will not change.</p><div className={styles.actions}><button type="button" className={styles.primary} onClick={() => {update({complete:true});setConfirm(false);setMessage('Week marked reviewed in this preview only.');}}>Confirm preview</button><button type="button" onClick={() => setConfirm(false)}>Keep editing</button></div></div> : <div className={styles.actions}>{draft.complete ? <button type="button" onClick={() => {update({complete:false});setMessage('Review reopened for editing.');}}>Reopen review</button> : <button type="button" className={styles.primary} onClick={() => setConfirm(true)}>Finish review preview</button>}<button type="button" onClick={() => {setDrafts(current => ({...current,[offset]:blank()}));setConfirm(false);setMessage('This week’s preview has been reset.');}}>Reset this preview</button></div>}
    </section><aside className={styles.panel}><span className={styles.kicker}>LOOKING AHEAD</span><h4 className={styles.aheadTitle}>Prepare for next week</h4><p className={styles.hint}>A place to review unfinished sessions and adjust the plan ahead.</p><div className={styles.carry}><span>Sessions to carry forward</span><strong>—</strong><p className={styles.hint}>Plan connection pending.</p></div><Link className={styles.link} href="/dashboard?view=weekly&plan=adjustments">Open Plan Adjustments →</Link><Link className={styles.link} href="/dashboard?view=weekly&plan=overview">Return to Weekly Overview →</Link></aside></div>
    <p role="status" className={styles.message}>{message}</p>
  </section>;
}
