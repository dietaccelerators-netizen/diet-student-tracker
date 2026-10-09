'use client';

import { useState } from 'react';
import styles from './SessionControls.module.css';

export type SessionPreviewState = { status: 'Planned' | 'Completed' | 'Postponed' | 'Rescheduled'; date?: string; time?: string };
export const INITIAL_SESSION: SessionPreviewState = { status: 'Planned' };

export function SessionControls({ value, onChange }: { value: SessionPreviewState; onChange: (next: SessionPreviewState) => void }) {
  const [action, setAction] = useState<'complete' | 'postpone' | 'reschedule' | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [previous, setPrevious] = useState<SessionPreviewState | null>(null);
  const [message, setMessage] = useState('');
  function apply(next: SessionPreviewState) {
    setPrevious(value); onChange(next); setAction(null);
    setMessage(`${next.status} in preview only.`);
  }
  return <section className={styles.controls} aria-label="Session controls preview">
    <div className={styles.heading}><h5>Session controls</h5><span>{value.status} · Preview</span></div>
    <p className={styles.note}>Temporary changes only. Nothing is saved.</p>
    {value.status === 'Rescheduled' && <p className={styles.destination}>Proposed slot: {value.date} · {value.time}</p>}
    <div className={styles.actions}>
      <button type="button" disabled={value.status === 'Completed'} onClick={() => setAction('complete')}>Mark complete</button>
      <button type="button" disabled={value.status === 'Completed' || value.status === 'Postponed'} onClick={() => setAction('postpone')}>Postpone</button>
      <button type="button" disabled={value.status === 'Completed'} onClick={() => { setDate(value.date || ''); setTime(value.time || ''); setAction('reschedule'); }}>Reschedule</button>
    </div>
    {action !== null && <form className={styles.form} aria-label={`${action} session preview`} onSubmit={event => { event.preventDefault(); if(action === 'reschedule') { const fields = new FormData(event.currentTarget); const selectedDate = String(fields.get('date') || ''); const selectedTime = String(fields.get('time') || ''); if(!selectedDate || !selectedTime) return; apply({status:'Rescheduled', date:selectedDate, time:selectedTime}); } else apply({status:action === 'complete'?'Completed':'Postponed'}); }}>
      <h6>{action === 'complete' ? 'Mark this session complete?' : action === 'postpone' ? 'Postpone this session?' : 'Choose a new slot'}</h6>
      {action === 'reschedule' ? <><div className={styles.fields}><label>New date<input type="date" name="date" required value={date} onChange={event => setDate(event.target.value)}/></label><label>Start time<input type="time" name="time" required value={time} onChange={event => setTime(event.target.value)}/></label></div><p className={styles.note}>Slot preview only; timetable movement and availability checks come later.</p></> : <p className={styles.note}>{action === 'complete' ? 'Preview the completed state without recording progress.' : 'Leave the session pending without choosing a new time.'}</p>}
      <div className={styles.formActions}><button type="submit" className={styles.confirm}>{action === 'reschedule'?'Preview new slot':'Confirm preview'}</button><button type="button" onClick={() => setAction(null)}>Cancel</button></div>
    </form>}
    <div role="status" className={styles.message}>{message}</div>
    <div className={styles.resetActions}>{previous && <button type="button" onClick={() => { onChange(previous); setPrevious(null); setAction(null); setMessage('Last preview change undone.'); }}>Undo last change</button>}{value.status !== 'Planned' && <button type="button" onClick={() => { onChange(INITIAL_SESSION); setPrevious(null); setAction(null); setMessage('Preview reset to planned.'); }}>Reset session preview</button>}</div>
  </section>;
}
