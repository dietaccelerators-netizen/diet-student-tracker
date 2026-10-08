'use client';

import { useRef, useState } from 'react';
import { SessionControls, INITIAL_SESSION, type SessionPreviewState } from './SessionControls';
import styles from './DailySchedule.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Layout-only interactions; no saved plan, lesson or activity is changed.
export function DailySchedule() {
  const [sessionStates, setSessionStates] = useState<Record<string, SessionPreviewState>>({});
  const [day, setDay] = useState(0);
  const [empty, setEmpty] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const panel = useRef<HTMLHeadingElement>(null);
  const cards = useRef<Array<HTMLButtonElement | null>>([]);
  function close() {
    const previous = selected;
    setSelected(null);
    if (previous !== null) cards.current[previous]?.focus();
  }
  return <section className={styles.schedule} aria-label="Daily schedule layout">
    <header className={styles.header}><div><span className={styles.kicker}>DAILY SCHEDULE</span><h3>Your study day</h3></div><span className={styles.preview}>Layout preview · No plan changes</span></header>
    <nav className={styles.days} aria-label="Choose a study day">{DAYS.map((name, i) => <button type="button" key={name} aria-pressed={day === i} onClick={() => { setDay(i); setSelected(null); }}><span>{name.slice(0,3)}</span><span className={styles.fullDay}>{name}</span></button>)}</nav>
    <div className={styles.dayHeading}><h4>{DAYS[day]}</h4><label><input type="checkbox" checked={empty} onChange={event => { setEmpty(event.target.checked); setSelected(null); }}/> Preview empty day</label></div>
    <div className={styles.layout}>
      <div className={styles.sessions}>
        {empty ? <div className={styles.empty}><span className={styles.emptyMark} aria-hidden="true">—</span><h4>No sessions planned</h4></div> : [0,1].map(index => <button type="button" className={styles.card} key={index} ref={node => { cards.current[index] = node; }} aria-expanded={selected === index} aria-controls="daily-session-details" aria-label={`Preview session ${index + 1} details for ${DAYS[day]}`} onClick={() => { setSelected(index); requestAnimationFrame(() => panel.current?.focus()); }}><div className={styles.cardTop}><span>SESSION {String(index + 1).padStart(2,'0')}</span><span>{sessionStates[`${day}:${index}`]?.status || 'Planned'} · Preview</span></div><div className={styles.fields}><div><small>Subject</small><i aria-hidden="true"/></div><div><small>Topic</small><i aria-hidden="true"/></div></div><div className={styles.cardBottom}><span>Start time <b>—</b></span><span>Duration <b>—</b></span><span className={styles.open}>View details →</span></div></button>)}
      </div>
      <section id="daily-session-details" className={styles.details} aria-label="Session details" onKeyDown={event => { if(event.key === 'Escape') close(); }}>
        <div className={styles.detailHeading}><h4 ref={panel} tabIndex={-1}>Session details</h4>{selected !== null && <button type="button" onClick={close} aria-label="Close session details">×</button>}</div>
        {selected === null ? <div className={styles.prompt}>Select a session to preview its layout.</div> : <><span className={styles.sessionTag}>{DAYS[day]} · Session {String(selected + 1).padStart(2,'0')}</span><dl className={styles.detailFields}>{['Subject','Topic','Start time','Duration'].map(label => <div key={label}><dt>{label}</dt><dd aria-label="Not set">—</dd></div>)}</dl><div className={styles.goal}><h5>Session goal</h5><i aria-hidden="true"/><i aria-hidden="true"/></div><button type="button" className={styles.start} disabled aria-describedby="daily-lesson-placeholder">Start studying →</button><p id="daily-lesson-placeholder" className={styles.note}>Lesson connection pending.</p><SessionControls key={`${day}:${selected}`} value={sessionStates[`${day}:${selected}`] || INITIAL_SESSION} onChange={next => setSessionStates(current => ({...current, [`${day}:${selected}`]:next}))}/></>}
      </section>
    </div>
  </section>;
}
