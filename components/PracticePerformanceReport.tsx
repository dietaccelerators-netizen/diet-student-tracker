'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './StudyConsistencyReport.module.css';

const FILTERS = ['All attempts', 'Scored', 'Awaiting marking', 'Incomplete'] as const;
const MODES = ['All modes', 'Timed', 'Untimed'] as const;
const ATTEMPTS = [
  { id: '01', status: 'Scored', mode: 'Timed' },
  { id: '02', status: 'Awaiting marking', mode: 'Untimed' },
  { id: '03', status: 'Incomplete', mode: 'Timed' },
];

// Presentation-only fixtures: no questions, scores, persistence or account mutations.
export function PracticePerformanceReport({ empty, periodLabel }: { empty: boolean; periodLabel: string }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All attempts');
  const [mode, setMode] = useState<(typeof MODES)[number]>('All modes');
  const [expanded, setExpanded] = useState<string | null>(null);
  const rows = empty ? [] : ATTEMPTS.filter(row =>
    (filter === 'All attempts' || row.status === filter) && (mode === 'All modes' || row.mode === mode));
  function reset() { setFilter('All attempts'); setMode('All modes'); setExpanded(null); }

  return <section className={styles.page} aria-label="Practice performance report preview">
    <header className={styles.heading}><div><span className={styles.kicker}>PRACTICE PERFORMANCE</span><h3>Your practice results</h3></div><span className={styles.badge}>Layout preview</span></header>
    <p className={styles.note}>Report period: {periodLabel}. Attempt statuses are layout examples; scores and questions remain empty.</p>
    <div className={styles.metrics}>{['Completed attempts', 'Average score', 'Questions attempted', 'Practice time'].map(title => <article key={title}><h4>{title}</h4><strong aria-label={`${title}: unavailable`}>—</strong><span>Awaiting recorded results</span></article>)}</div>
    <div className={styles.grid}>
      <section className={styles.panel} aria-label="Practice attempt history">
        <div className={styles.panelHeading}><h4>Attempt history</h4><button type="button" onClick={reset}>Reset filters</button></div>
        <div className={styles.filters} role="group" aria-label="Filter attempt status">{FILTERS.map(item => <button type="button" key={item} aria-pressed={filter === item} onClick={() => { setFilter(item); setExpanded(null); }}>{item}</button>)}</div>
        <div className={styles.filters} role="group" aria-label="Filter practice mode">{MODES.map(item => <button type="button" key={item} aria-pressed={mode === item} onClick={() => { setMode(item); setExpanded(null); }}>{item}</button>)}</div>
        {!rows.length ? <div className={styles.empty} role="status"><h5>{empty ? 'No practice activity to display' : 'No matching preview attempts'}</h5><p>{empty ? 'Attempts will appear here once connected.' : 'Change or reset the filters to view the layout.'}</p></div> : <div className={styles.sessions}>{rows.map(row => <article key={row.id}>
          <div className={styles.row}><strong>Attempt {row.id} · Placeholder</strong><span className={styles.badge}>{row.status} · Preview</span></div>
          <p className={styles.note}>{row.mode} · Preview</p>
          <dl className={styles.comparison}>{['Subject / topic', 'Attempt date', 'Score'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
          <button type="button" aria-expanded={expanded === row.id} aria-controls={`practice-result-${row.id}`} onClick={() => setExpanded(expanded === row.id ? null : row.id)}>{expanded === row.id ? 'Hide' : 'View'} attempt {row.id} details</button>
          {expanded === row.id && <div className={styles.details} id={`practice-result-${row.id}`}>
            <dl>{['Section', 'Duration', 'Marks earned', 'Available marks', 'Answered questions', 'Unanswered questions'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
            <div className={styles.notice}><h5>Question review</h5><p>Question, response and feedback spaces will be connected later.</p></div>
            <button type="button" disabled aria-describedby={`practice-review-note-${row.id}`}>Review answers</button>
            <p id={`practice-review-note-${row.id}`} className={styles.note}>Unavailable in this layout preview. No questions or answers have been added.</p>
          </div>}
        </article>)}</div>}
      </section>
      <aside className={styles.panel} aria-label="Practice breakdown">
        <span className={styles.kicker}>PERFORMANCE BREAKDOWN</span><h4 className={styles.asideTitle}>Subject and topic results</h4>
        <dl className={styles.summary}>{['Subject', 'Topic', 'Scored attempts', 'Average score'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
        <div className={styles.notice}><h5>Score trend</h5><p>Results will appear here when comparable scored attempts are available.</p></div>
        <details><summary>About these figures</summary><p className={styles.note}>A dash means unavailable, not zero. Incomplete attempts and work awaiting marking will remain separate from scored results. Practice scores do not indicate syllabus completion.</p></details>
        <Link className={styles.link} href="/dashboard?view=practice">Open Practice Room →</Link>
      </aside>
    </div>
  </section>;
}
