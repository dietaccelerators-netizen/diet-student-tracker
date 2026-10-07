'use client';
import { useEffect, useRef, useState } from 'react';
import { blockKey, elapsed, isOpen, loadSessions, saveSession, timerText, transition, type StudyBlock, type StudySession } from '@/lib/study-sessions';
import type { Paper, Profile } from '@/lib/types';
import styles from './StudySessions.module.css';

export function StudySessions({student,papers,week,end,selected,preview,onClose,onActivity}: {student:Profile;papers:Paper[];week:string;end:string;selected:StudyBlock|null;preview:boolean;onClose:()=>void;onActivity?:(rows:StudySession[],ready:boolean)=>void}) {
  const [rows,setRows]=useState<StudySession[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[reload,setReload]=useState(0);
  const target=useRef<HTMLElement>(null);
  useEffect(()=>{
    let cancelled=false;
    setLoading(true);setError('');
    loadSessions(student.id,student.level,week,end,preview).then(data=>{if(!cancelled){setRows(data);setLoading(false);}}).catch(e=>{if(!cancelled){setError(e.message);setLoading(false);}});
    return()=>{cancelled=true;};
  },[student.id,student.level,week,end,preview,reload]);
  useEffect(()=>{if(selected)target.current?.scrollIntoView({behavior:'smooth',block:'start'});},[selected]);
  useEffect(()=>{onActivity?.(rows,!loading&&!error);},[rows,loading,error,onActivity]);
  const active=rows.find(isOpen);
  const current=selected?rows.find(s=>s.block_key===blockKey(selected)):active;
  const history=rows.filter(s=>!isOpen(s)&&s.plan_date>=week&&s.plan_date<=end);
  async function save(next:StudySession,previous:StudySession|null){
    const saved=await saveSession(next,previous,preview);
    setRows(old=>[saved,...old.filter(s=>s.id!==saved.id)]);
  }
  return <section ref={target} className={styles.workspace} aria-label="Study sessions">
    <div className={styles.summary}><div><span>RECORDED STUDY</span><h3>{loading||error?'—':`${Math.round(history.reduce((n,s)=>n+s.elapsed_seconds,0)/60)} min`}</h3><p>{history.length} finished session{history.length===1?'':'s'} assigned to this week</p></div><div><b>{history.filter(s=>s.status==='completed').length} completed</b><p>{history.filter(s=>s.status==='partial').length} partly completed</p></div></div>
    {loading?<p role="status">Loading study sessions…</p>:error?<div role="alert"><p>{error}</p><button onClick={()=>setReload(n=>n+1)}>Retry loading sessions</button></div>:<>
      {active && selected && current?.id!==active.id?<div className={styles.notice}><p>You have an unfinished session: <b>{active.paper_name}</b>. Finish it before starting another.</p><button onClick={onClose}>Return to unfinished session</button></div>:(selected||current)?<SessionPanel key={current?.id||blockKey(selected!)} row={current} block={selected} student={student} paperName={papers.find(p=>p.id===selected?.paperId)?.name||current?.paper_name||'Subject'} preview={preview} save={save} onClose={onClose} onReload={()=>setReload(n=>n+1)}/>:<p>Choose <b>View session</b> on a study block to set a goal and start your timer.</p>}
      {history.length>0&&<details className={styles.history}><summary>Saved session history for this week</summary>{history.map(s=><article key={s.id}><div><b>{s.paper_name}</b><p>{s.goal}</p><small>Planned for {s.plan_date} · Finished {s.finished_at?new Date(s.finished_at).toLocaleString():''}</small>{s.notes&&<p>{s.notes}</p>}</div><span>{s.status==='completed'?'Completed':'Partly completed'} · {timerText(s.elapsed_seconds)}</span></article>)}</details>}
    </>}
  </section>;
}
function SessionPanel({row,block,student,paperName,preview,save,onClose,onReload}:{row?:StudySession;block:StudyBlock|null;student:Profile;paperName:string;preview:boolean;save:(next:StudySession,previous:StudySession|null)=>Promise<void>;onClose:()=>void;onReload:()=>void}){
  const [goal,setGoal]=useState(row?.goal||''),[now,setNow]=useState(Date.now),[busy,setBusy]=useState(false),[error,setError]=useState(''),[review,setReview]=useState(false),[minutes,setMinutes]=useState(''),[outcome,setOutcome]=useState<'completed'|'partial'>('completed'),[notes,setNotes]=useState('');
  const pending=useRef(false);
  useEffect(()=>{if(row?.status!=='running')return;const tick=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(tick);},[row?.status]);
  async function perform(action:'start'|'pause'|'resume'|'review'|'finish'){
    if(pending.current)return;
    pending.current=true;setBusy(true);setError('');
    try{
      const time=Date.now();
      if(action==='start'){
        if(!block||!goal.trim())throw new Error('Enter the topic or goal you want to work on.');
        await save({id:crypto.randomUUID(),user_id:student.id,stage:student.level,block_key:blockKey(block),plan_date:block.date,paper_id:block.paperId,paper_name:paperName,goal:goal.trim(),planned_minutes:block.duration,status:'running',elapsed_seconds:0,running_since:new Date(time).toISOString(),started_at:new Date(time).toISOString(),finished_at:null,notes:'',revision:1},null);
      }else if(row){
        if(action==='review'){
          const stopped=row.status==='running'?transition(row,'pause',time):row;
          if(stopped!==row)await save(stopped,row);
          setMinutes(String(Math.round(stopped.elapsed_seconds/60*10)/10));setReview(true);
        }else{
          if(action==='finish'&&minutes.trim()==='')throw new Error('Enter your actual study time.');
          await save(transition(row,action==='finish'?outcome:action,time,Number(minutes),notes),row);
          if(action==='finish')setReview(false);
        }
      }
    }catch(e){setError(e instanceof Error?e.message:'Your session could not be saved.');}
    finally{pending.current=false;setBusy(false);}
  }
  const seconds=row?elapsed(row,now):0,finished=row&&!isOpen(row);
  return <div className={styles.panel} aria-label="Study session controls">
    <div className={styles.heading}><div><span>{finished?'SESSION SAVED':row?.status==='running'?'SESSION IN PROGRESS':row?'SESSION PAUSED':'YOUR NEXT STUDY SESSION'}</span><h3>{paperName}</h3></div>{!row&&<button onClick={onClose}>Close session</button>}</div>
    {row?<p>{row.goal}</p>:<label>Topic or study goal<input maxLength={300} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="For example, practise bank reconciliation questions" disabled={busy}/></label>}
    <p className={styles.timer} role="timer" aria-label="Elapsed study time">{timerText(seconds)}</p>
    <p className={styles.muted}>{preview?'Preview activity stays on this browser.':'Session changes are saved to your account.'} The timer continues until paused, including while you leave this page. Review the time before saving your result. Timers are capped at 24 hours.</p>
    {finished?<div className={styles.notice}><b>{row.status==='completed'?'Completed':'Partly completed'}</b><p>{row.notes||'Your study time and result have been saved.'}</p><p>Completing a session does not automatically mark a syllabus topic as mastered.</p></div>:review?<fieldset disabled={busy}><legend>Finish this session</legend><label>Actual study time (minutes)<input type="number" min="0" max="1440" step="0.1" value={minutes} onChange={e=>setMinutes(e.target.value)}/></label><label>Session result<select value={outcome} onChange={e=>setOutcome(e.target.value as 'completed'|'partial')}><option value="completed">Completed my goal</option><option value="partial">Partly completed</option></select></label><label>Notes or what to revisit (optional)<textarea maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><div className={styles.actions}><button onClick={()=>setReview(false)}>Back to paused session</button><button className={styles.primary} onClick={()=>perform('finish')}>Save session result</button></div></fieldset>:<div className={styles.actions}>{!row?<button className={styles.primary} disabled={busy||!goal.trim()} onClick={()=>perform('start')}>Start study session</button>:<><button disabled={busy} className={styles.primary} onClick={()=>perform(row.status==='running'?'pause':'resume')}>{row.status==='running'?'Pause session':'Resume session'}</button><button disabled={busy} onClick={()=>perform('review')}>Finish session</button></>}</div>}
    {busy&&<p role="status">Saving session…</p>}{error&&<div role="alert"><p>{error}</p><button disabled={busy} onClick={onReload}>Reload sessions</button></div>}
  </div>;
}
