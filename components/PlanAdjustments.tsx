'use client';

import { useState } from 'react';
import styles from './PlanAdjustments.module.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
type Draft = { source: 'sessions' | 'availability'; selected: number[]; unavailable: number[]; handling: string };
const fresh = (): Draft => ({source:'sessions',selected:[],unavailable:[],handling:'Keep pending'});

// Architecture preview only. No saved timetable or study records are changed.
export function PlanAdjustments() {
  const [draft,setDraft] = useState<Draft>(fresh);
  const [step,setStep] = useState<'edit'|'review'|'done'>('edit');
  const [empty,setEmpty] = useState(false);
  const [message,setMessage] = useState('');
  const valid = draft.source === 'sessions' ? draft.selected.length > 0 && !empty : draft.unavailable.length > 0;
  function toggle(field:'selected'|'unavailable', value:number) { setDraft(current=>({...current,[field]:current[field].includes(value)?current[field].filter(n=>n!==value):[...current[field],value]})); }
  function reset() { setDraft(fresh());setStep('edit');setEmpty(false);setMessage('Preview reset.'); }
  return <section className={styles.page} aria-label="Plan adjustments preview">
    <header className={styles.header}><div><span className={styles.kicker}>PLAN ADJUSTMENTS</span><h3>Make room for changes</h3></div><span className={styles.badge}>Layout preview · Nothing saved</span></header>
    <ol className={styles.steps} aria-label="Adjustment steps">{['Choose changes','Review','Preview result'].map((label,i)=><li key={label} aria-current={(['edit','review','done'][i]===step)?'step':undefined}><span>{i+1}</span>{label}</li>)}</ol>
    {step==='edit' ? <>
      <div className={styles.choices} role="group" aria-label="Adjustment type"><button type="button" aria-pressed={draft.source==='sessions'} onClick={()=>setDraft(current=>({...current,source:'sessions'}))}>Missed or postponed sessions</button><button type="button" aria-pressed={draft.source==='availability'} onClick={()=>setDraft(current=>({...current,source:'availability'}))}>Changed availability</button></div>
      <div className={styles.grid}>
        <section className={styles.panel}><div className={styles.panelHeading}><h4>{draft.source==='sessions'?'Sessions to review':'Unavailable days'}</h4>{draft.source==='sessions'&&<label className={styles.small}><input type="checkbox" checked={empty} onChange={e=>{setEmpty(e.target.checked);setDraft(current=>({...current,selected:[]}));}}/> Preview empty list</label>}</div>
          {draft.source==='sessions' ? empty ? <p className={styles.empty}>No sessions to review.</p> : <div className={styles.sessions}>{[0,1].map(i=><label className={styles.session} key={i}><input type="checkbox" checked={draft.selected.includes(i)} onChange={()=>toggle('selected',i)}/><div><strong>Session {String(i+1).padStart(2,'0')} · Placeholder</strong><span>{i===0?'Missed':'Postponed'} · Preview</span><i aria-hidden="true"/><i aria-hidden="true"/></div></label>)}</div> : <div className={styles.days}>{DAYS.map((day,i)=><label key={day}><input type="checkbox" checked={draft.unavailable.includes(i)} onChange={()=>toggle('unavailable',i)}/>{day}</label>)}</div>}
        </section>
        <section className={styles.panel}><h4>Adjustment preference</h4><fieldset className={styles.preferences}><legend>Handle affected sessions</legend>{['Keep pending','Find another slot this week','Carry forward to next week'].map(option=><label key={option}><input type="radio" name="adjustment-handling" checked={draft.handling===option} onChange={()=>setDraft(current=>({...current,handling:option}))}/>{option}</label>)}</fieldset><div className={styles.reserved}><h5>Available slots</h5><span>—</span><p>Timetable connection pending.</p></div></section>
      </div>
      <div className={styles.footer}><p>Placeholder sessions are examples, not recorded missed work.</p><button type="button" className={styles.primary} disabled={!valid} onClick={()=>{setMessage('');setStep('review');}}>Review changes →</button></div>
    </> : <section className={styles.panel}>
      <h4>{step==='review'?'Review your adjustment':'Adjustment preview ready'}</h4>
      <dl className={styles.review}><div><dt>Change type</dt><dd>{draft.source==='sessions'?'Missed or postponed sessions':'Changed availability'}</dd></div><div><dt>{draft.source==='sessions'?'Selected placeholders':'Unavailable days'}</dt><dd>{draft.source==='sessions'?draft.selected.map(i=>`Session ${String(i+1).padStart(2,'0')}`).join(', '):draft.unavailable.slice().sort().map(i=>DAYS[i]).join(', ')}</dd></div><div><dt>Preference</dt><dd>{draft.handling}</dd></div><div><dt>Proposed times</dt><dd>—</dd></div></dl>
      <p className={styles.notice}>This demonstrates the review flow. No slots are calculated and no sessions are moved.</p>
      <div className={styles.footer}>{step==='review'?<><button type="button" onClick={()=>setStep('edit')}>← Edit choices</button><button type="button" className={styles.primary} onClick={()=>{setStep('done');setMessage('Preview applied. Your saved plan is unchanged.');}}>Apply preview</button><button type="button" onClick={reset}>Cancel</button></>:<><button type="button" onClick={()=>{setStep('edit');setMessage('Preview undone. You can edit your choices.');}}>Undo preview</button><button type="button" onClick={reset}>Reset preview</button></>}</div>
    </section>}
    <p className={styles.status} role="status">{message}</p>
  </section>;
}
