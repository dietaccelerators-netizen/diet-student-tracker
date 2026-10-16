'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './StudyConsistencyReport.module.css';

const SOURCES = ['All sources', 'Practice results', 'Self-reported'] as const;
const TOPICS = [
  { id: '01', subject: '01', source: 'Practice results' },
  { id: '02', subject: '02', source: 'Self-reported' },
  { id: '03', subject: '01', source: 'Self-reported' },
];
const ACTIONS = ['Revisit lesson', 'Practise topic', 'Add to Weekly Plan'] as const;
type Action = (typeof ACTIONS)[number];

// Layout fixtures only. No weakness calculation, lesson navigation or saved writes.
export function TopicWeaknessReport({ empty, periodLabel }: { empty: boolean; periodLabel: string }) {
  const [source, setSource] = useState<(typeof SOURCES)[number]>('All sources');
  const [subject, setSubject] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [nextSteps, setNextSteps] = useState<Record<string, Action>>({});
  const [pending, setPending] = useState<{ id: string; action: Action } | null>(null);
  const [message, setMessage] = useState('');
  const rows = empty ? [] : TOPICS.filter(topic => (source === 'All sources' || source === topic.source) && (subject === 'all' || subject === topic.subject));
  function resetFilters() { setSource('All sources'); setSubject('all'); setExpanded(null); setPending(null); }
  function confirm() {
    if (!pending) return;
    setNextSteps(previous => ({ ...previous, [pending.id]: pending.action }));
    setMessage(`Topic ${pending.id}: ${pending.action} selected in this preview only.`);
    setPending(null);
  }
  function undo(id: string) {
    setNextSteps(previous => { const next = { ...previous }; delete next[id]; return next; });
    setMessage(`Topic ${id}: preview next step cleared.`);
  }

  return <section className={styles.page} aria-label="Topic weakness report preview">
    <header className={styles.heading}><div><span className={styles.kicker}>TOPIC WEAKNESS</span><h3>Topics to revisit</h3></div><span className={styles.badge}>Layout preview</span></header>
    <p className={styles.note}>Report period: {periodLabel}. Sources below are layout examples. No topic has been assessed.</p>
    <div className={styles.metrics}>{['Topics to revisit', 'From practice results', 'Self-reported topics', 'Topics with a next step'].map(title => <article key={title}><h4>{title}</h4><strong aria-label={`${title}: unavailable`}>—</strong><span>Awaiting connected activity</span></article>)}</div>
    <div className={styles.grid}>
      <section className={styles.panel} aria-label="Topics requiring review">
        <div className={styles.panelHeading}><h4>Review list</h4><button type="button" onClick={resetFilters}>Reset filters</button></div>
        <div className={styles.filters} role="group" aria-label="Filter review source">{SOURCES.map(item => <button key={item} type="button" aria-pressed={source === item} onClick={() => { setSource(item); setExpanded(null); setPending(null); }}>{item}</button>)}</div>
        <div className={styles.filters} role="group" aria-label="Filter placeholder subject">{['all', '01', '02'].map(id => <button key={id} type="button" aria-pressed={subject === id} onClick={() => { setSubject(id); setExpanded(null); setPending(null); }}>{id === 'all' ? 'All subjects' : `Subject ${id} · Placeholder`}</button>)}</div>
        {!rows.length ? <div className={styles.empty} role="status"><h5>{empty ? 'No topic activity to display' : 'No matching preview topics'}</h5><p>{empty ? 'No activity does not mean there are no areas to revisit.' : 'Change or reset the filters to view the layout.'}</p></div> : <div className={styles.sessions}>{rows.map(topic => <article key={topic.id}>
          <div className={styles.row}><strong>Topic {topic.id} · Placeholder</strong><span className={styles.badge}>{topic.source} · Preview</span></div>
          <p className={styles.note}>Subject {topic.subject} · Placeholder</p>
          <dl className={styles.comparison}>{['Reason to revisit', 'Latest evidence', 'Last reviewed'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
          <button type="button" aria-expanded={expanded === topic.id} aria-controls={`topic-review-${topic.id}`} onClick={() => { setExpanded(expanded === topic.id ? null : topic.id); setPending(null); }}>{expanded === topic.id ? 'Hide' : 'View'} topic {topic.id} details</button>
          {expanded === topic.id && <div className={styles.details} id={`topic-review-${topic.id}`}>
            <dl>{['Section', 'Evidence date', 'Scored attempts', 'Recorded result'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl>
            <p className={styles.note}>{topic.source === 'Self-reported' ? 'A student’s own flag will be shown separately from scored practice evidence.' : 'Practice evidence and its reason will appear here once results are connected.'}</p>
            <h5>Choose a next step · Preview</h5>
            <div className={styles.filters}>{ACTIONS.map(action => <button key={action} type="button" onClick={() => { setPending({ id: topic.id, action }); setMessage(''); }}>{action}</button>)}</div>
            {pending?.id === topic.id && <div className={styles.notice} role="group" aria-label={`Confirm next step for topic ${topic.id}`}><h5>{pending.action}</h5><p>This only previews a next step. It will not open a lesson, start practice or change your plan.</p><div className={styles.filters}><button type="button" onClick={confirm}>Confirm preview</button><button type="button" onClick={() => setPending(null)}>Cancel</button></div></div>}
          </div>}
          {nextSteps[topic.id] && <div className={styles.notice}><h5>Preview next step: {nextSteps[topic.id]}</h5><div className={styles.filters}><button type="button" onClick={() => undo(topic.id)}>Undo topic {topic.id} next step</button></div></div>}
        </article>)}</div>}
        <p className={styles.note}>Preview selections reset when you leave this tab, change the report period or reload.</p>
        <p role="status" className={styles.note}>{message}</p>
      </section>
      <aside className={styles.panel} aria-label="Review guidance"><span className={styles.kicker}>YOUR NEXT STEP</span><h4 className={styles.asideTitle}>Review, practise, plan</h4><dl className={styles.summary}>{['Selected topic', 'Reason', 'Suggested action', 'Next review'].map(title => <div key={title}><dt>{title}</dt><dd>—</dd></div>)}</dl><div className={styles.notice}><h5>Evidence before recommendations</h5><p>Missing activity will not automatically label a topic weak. Scores, personal flags and lesson completion will remain separate.</p></div><details><summary>How topics will be identified</summary><p className={styles.note}>Agreed fixed rules will use connected records. No rules, thresholds or priorities are applied in this preview.</p></details><Link className={styles.link} href="/dashboard?view=subjects">Open My Subjects →</Link><Link className={styles.link} href="/dashboard?view=weekly">Open Weekly Plan →</Link></aside>
    </div>
  </section>;
}
