'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Paper, Profile } from '@/lib/types';
import { DAYS, capacity, newDraft, parseDraft, propose, windowErrors, type PlanDraft, type Window } from '@/lib/plan-setup';
import styles from './PlanSetup.module.css';

const STEPS = ['Approach', 'Availability', 'Preferences', 'Review'];
const hours = (n: number) => `${Math.round(n / 6) / 10}h`;
function Windows({ value, onChange, label }: { value: Window[]; onChange: (v: Window[]) => void; label: string }) {
  return <fieldset className={styles.windows}><legend>{label}</legend>{value.map((w, i) => <div className={styles.window} key={i}>
    <label>Day<select value={w.day} onChange={e => onChange(value.map((v,j) => j === i ? {...v,day:Number(e.target.value)} : v))}>{DAYS.map((d,j) => <option key={d} value={j}>{d}</option>)}</select></label>
    <label>From<input type="time" value={w.start} onChange={e => onChange(value.map((v,j) => j === i ? {...v,start:e.target.value} : v))}/></label>
    <label>To<input type="time" value={w.end} onChange={e => onChange(value.map((v,j) => j === i ? {...v,end:e.target.value} : v))}/></label>
    <button type="button" aria-label={`Remove ${label} window ${i+1}`} onClick={() => onChange(value.filter((_,j) => j !== i))}>Remove</button>
  </div>)}<button type="button" onClick={() => onChange([...value,{day:0,start:'18:00',end:'19:00'}])}>+ Add time window</button></fieldset>;
}
export function PlanSetup({ student, papers, preview = false, onReviewed }: { student: Profile; papers: Paper[]; preview?: boolean; onReviewed?: (draft: PlanDraft) => void }) {
  const router = useRouter(), pathname = usePathname(), params = useSearchParams();
  const requested = Number(params.get('setup') || 1);
  const step = Number.isInteger(requested) && requested >= 1 && requested <= 4 ? requested - 1 : 0;
  const [draft,setDraft] = useState<PlanDraft>(newDraft), [loaded,setLoaded] = useState(false), [message,setMessage] = useState(''), [accepted,setAccepted] = useState(false), [errors,setErrors] = useState<string[]>([]);
  const storageKey = `diet:plan-setup:v1:${preview ? 'preview:' : ''}${student.id}:${student.level}`;
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) { const saved = parseDraft(JSON.parse(raw)); if (saved) setDraft(saved); else setMessage('The old draft could not be restored. Please enter your preferences again.'); } }
    catch { setMessage('Browser storage is unavailable. You can try the flow, but drafts cannot be retained.'); }
    setLoaded(true);
  }, [storageKey]);
  function update(patch: Partial<PlanDraft>) { setDraft(d => ({...d,...patch})); setAccepted(false); setMessage(''); setErrors([]); }
  function validate(to: number) {
    const issues: string[] = [];
    if (!papers.length) issues.push('Select your subjects in My Subjects before creating a plan.');
    if (draft.approach === 'custom' && !papers.some(p => (draft.allocations[p.id] || 0) > 0)) issues.push('Give at least one subject a weekly hours target.');
    if (Object.values(draft.allocations).some(n => !Number.isFinite(n) || n < 0 || n > 168)) issues.push('Subject targets must be between 0 and 168 hours.');
    if (to >= 2) { if (!draft.windows.length) issues.push('Add at least one available study window.'); issues.push(...windowErrors(draft.windows)); try { new Intl.DateTimeFormat('en',{timeZone:draft.timezone}); } catch { issues.push('Enter a valid timezone, for example Africa/Lagos.'); } }
    if (to >= 3 && draft.mode !== 'self') issues.push(...windowErrors(draft.lectures));
    return [...new Set(issues)];
  }
  function navigate(next: number) { if (next > step) { const problems = validate(next); setErrors(problems); if (problems.length) return; } const q = new URLSearchParams(params.toString()); q.set('setup',String(next+1)); router.push(`${pathname}?${q}`,{scroll:false}); setMessage(''); }
  function save(reviewed = false) { try { localStorage.setItem(storageKey,JSON.stringify(draft)); if (reviewed && onReviewed) onReviewed(draft); setMessage('Draft saved on this browser. You can return here to continue.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Draft could not be saved. Browser storage may be blocked or full.'); } }
  const sessions = propose(draft,papers.map(p => p.id)), available = capacity(draft), scheduled = sessions.reduce((n,s) => n+s.duration,0);
  const target = draft.approach === 'custom' ? papers.reduce((n,p) => n+(draft.allocations[p.id] || 0)*60,0) : null;
  const shortfall = target === null ? 0 : Math.max(0,target-scheduled);
  if (!loaded) return <p role="status">Loading your setup…</p>;
  return <section className={styles.setup} aria-label="Weekly plan setup">
    <header><span className={styles.eyebrow}>WEEKLY PLAN · WORKING PROTOTYPE</span><h2>Make room for your preparation.</h2><p>Set up a week that works around your life.</p></header>
    <p className={styles.notice}>Save a draft to continue later, or review and save your timetable to open This Week. Both stay on this browser for now.</p>
    <nav aria-label="Plan setup steps" className={styles.steps}>{STEPS.map((name,i) => <button key={name} onClick={() => navigate(i)} aria-current={step === i ? 'step' : undefined}><span>{i+1}</span>{name}</button>)}</nav>
    <div className={styles.card}><span className={styles.eyebrow}>STEP {step+1} OF 4</span><h3>{['Choose your approach','When can you study?','Make the plan work for you','Review your proposed week'][step]}</h3>
    {step === 0 && <><div className={styles.summary}><div><small>Student</small><b>{student.fullName}</b></div><div><small>Stage</small><b>{student.level}</b></div><div><small>Exam diet</small><b>{student.examDiet || 'Not set'}</b></div></div><p>Your subjects: {papers.map(p => p.name).join(', ') || 'No subjects selected'}</p>
      <fieldset><legend>Planning approach</legend><div className={styles.choices}>{(['recommended','custom'] as const).map(v => <label key={v}><input type="radio" name="approach" checked={draft.approach === v} onChange={() => update({approach:v})}/><span><b>{v === 'recommended' ? 'Help me distribute my time' : 'Build my own plan'}</b><small>{v === 'recommended' ? 'A provisional, balanced allocation across your selected subjects.' : 'Set the weekly hours you want for each subject.'}</small></span></label>)}</div></fieldset>
      {draft.approach === 'custom' && <div className={styles.allocations}>{papers.map(p => <label key={p.id}>{p.name}<input aria-label={`${p.name} weekly hours`} type="number" min="0" max="168" step="0.25" value={draft.allocations[p.id] ?? 0} onChange={e => update({allocations:{...draft.allocations,[p.id]:Number(e.target.value)}})}/><small>hours / week</small></label>)}</div>}
      <label className={styles.field}>Exam date (optional)<input type="date" value={draft.examDate} onChange={e => update({examDate:e.target.value})}/></label><p className={styles.hint}>Without verified topic estimates and an exam date, we cannot calculate the workload needed to finish your syllabus. This draft only allocates the time you provide.</p></>}
    {step === 1 && <><label className={styles.field}>Your timezone<input value={draft.timezone} onChange={e => update({timezone:e.target.value})} placeholder="Africa/Lagos"/></label><Windows label="Study availability" value={draft.windows} onChange={windows => update({windows})}/><p className={styles.notice}>Available study time: <b>{windowErrors(draft.windows).length ? 'Check your windows' : hours(available)}</b>. Days without a window remain free.</p></>}
    {step === 2 && <><label className={styles.field}>Preferred session length<select value={draft.duration} onChange={e => update({duration:Number(e.target.value)})}>{[30,45,60,90].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label>
      <label className={styles.check}><input type="checkbox" checked={draft.multiple} onChange={e => update({multiple:e.target.checked})}/>Allow more than one study session per day</label>
      <label className={styles.check}><input type="checkbox" checked={draft.nudges} onChange={e => update({nudges:e.target.checked})}/>Use shorter remaining slots of at least 15 minutes</label><p className={styles.hint}>These are short study blocks, not notification reminders.</p>
      <label className={styles.field}>Study mode<select value={draft.mode} onChange={e => update({mode:e.target.value as PlanDraft['mode']})}><option value="self">Self study</option><option value="lecture">Lecture based</option><option value="hybrid">Hybrid</option></select></label>
      {draft.mode !== 'self' && <><Windows label="Lecture times" value={draft.lectures} onChange={lectures => update({lectures})}/><p className={styles.hint}>Lecture times are reserved so study sessions will not clash. Leave blank if your lecture timetable is not yet available.</p></>}</>}
    {step === 3 && <><div className={styles.summary}><div><small>{target === null ? 'Recommended workload' : 'Your target'}</small><b>{target === null ? 'Not yet calculated' : hours(target)}</b></div><div><small>Available</small><b>{hours(available)}</b></div><div><small>Scheduled</small><b>{hours(scheduled)}</b></div><div><small>Unused time</small><b>{hours(Math.max(0,available-scheduled))}</b></div></div>
      <p className={styles.hint}>Recurring week preview · {draft.timezone}. Subject-level blocks only; topic prioritisation and dated sessions follow in the next stage.</p>
      {shortfall > 0 && <p className={styles.warning}>Your proposed schedule is {hours(shortfall)} below your chosen target. Adjust availability or preferences, or accept this lighter schedule.</p>}
      {!sessions.length ? <p className={styles.warning}>No sessions fit yet. Add availability, shorten your session length or allow short study blocks.</p> : <div className={styles.table}><table><thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Length</th></tr></thead><tbody>{sessions.map((s,i) => <tr key={i}><td>{DAYS[s.day]}</td><td>{s.start}–{s.end}</td><td>{papers.find(p => p.id === s.paperId)?.name}</td><td>{s.duration} min</td></tr>)}</tbody></table></div>}
      <label className={styles.check}><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}/>I have reviewed this proposal{shortfall > 0 ? ' and accept the lower scheduled hours' : ''}.</label></>}
    {errors.length > 0 && <div role="alert" className={styles.warning}><ul>{errors.map(e => <li key={e}>{e}</li>)}</ul></div>}
    <footer><button disabled={step === 0} onClick={() => navigate(step-1)}>Back</button><button onClick={() => save()}>Save draft</button>{step < 3 ? <button className={styles.primary} onClick={() => navigate(step+1)}>Continue →</button> : <button className={styles.primary} disabled={!accepted || !sessions.length} onClick={() => { const problems = validate(3); setErrors(problems); if (!problems.length) save(true); }}>{onReviewed ? 'Save and open This Week' : 'Save reviewed draft'}</button>}</footer><p role="status" aria-live="polite">{message}</p>
    </div>
  </section>;
}
