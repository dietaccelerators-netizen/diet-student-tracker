"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { StudySession } from '@/lib/study-sessions';

const duration = (seconds:number) => `${Math.round(seconds / 60)} min`;
export function summariseSessions(rows:StudySession[],subject='all') {
 const visible=rows.filter(s=>(s.status==='completed'||s.status==='partial')&&(subject==='all'||s.paper_id===subject));
 return {visible,total:visible.reduce((n,s)=>n+s.elapsed_seconds,0),completed:visible.filter(s=>s.status==='completed').length};
}
export function StudyActivityReport({userId,stage}:{userId:string;stage:string}) {
 const [days,setDays]=useState('30');
 const [subject,setSubject]=useState('all');
 const [rows,setRows]=useState<StudySession[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
  let cancelled=false;
  setLoading(true);setError('');setRows([]);
  async function load(){
   const until=new Date().toISOString();
   const since=new Date();since.setHours(0,0,0,0);since.setDate(since.getDate()-Number(days)+1);
   const result:StudySession[]=[];
   for(let offset=0;;offset+=500){
    const {data,error}=await createClient().from('study_session_logs').select('*').eq('user_id',userId).eq('stage',stage).in('status',['completed','partial']).gte('finished_at',since.toISOString()).lte('finished_at',until).order('finished_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+499);
    if(error)throw new Error('Your study activity could not be loaded. Please retry.');
    if(cancelled)return;
    result.push(...(data||[]));
    if(!data||data.length<500)break;
   }
   if(!cancelled){setRows(result);setLoading(false);}
  }
  load().catch(e=>{if(!cancelled){setError(e.message);setLoading(false);}});
  return ()=>{cancelled=true;};
 },[userId,stage,days,refresh]);
 const subjects=Array.from(new Map(rows.map(s=>[s.paper_id,s.paper_name])).entries());
 const {visible,total,completed}=summariseSessions(rows,subject);
 return <section className="report-panel" aria-label="Recorded study activity" aria-busy={loading}>
  <span className="eyebrow">SAVED STUDY SESSIONS</span><h2>Study activity</h2>
  <p className="section-description">Time and results from sessions you finished in Weekly Plan. Dates use the day you finished, rather than the planned study date. Running and paused sessions are excluded.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:16,alignItems:'center',margin:'20px 0'}}>
   <label>Period <select value={days} onChange={e=>{setDays(e.target.value);setSubject('all');}}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label>
   <label>Subject <select value={subject} onChange={e=>setSubject(e.target.value)}><option value="all">All subjects</option>{subjects.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
   <button type="button" className="text-action" disabled={loading} onClick={()=>setRefresh(n=>n+1)}>Refresh activity</button>
  </div>
  {loading?<p role="status">Loading saved study activity…</p>:error?<p role="alert">{error}</p>:<>
   <div className="report-stats"><div><strong>{duration(total)}</strong><span>Recorded study time</span></div><div><strong>{visible.length}</strong><span>Finished sessions</span></div><div><strong>{completed}</strong><span>Completed</span></div><div><strong>{visible.length-completed}</strong><span>Partly completed</span></div></div>
   {!visible.length?<div className="empty-panel"><h3>No finished sessions in this period</h3><p>Finish and save a session in Weekly Plan to see your activity here.</p><Link className="text-action" href="/dashboard?view=weekly">Open Weekly Plan →</Link></div>:<>
    <h3>Study time by subject</h3>
    {subjects.filter(([id])=>subject==='all'||id===subject).map(([id,name])=>{const items=visible.filter(s=>s.paper_id===id);return <div className="report-row" key={id}><div><b>{name}</b><small>{items.length} finished sessions</small></div><strong>{duration(items.reduce((n,s)=>n+s.elapsed_seconds,0))}</strong></div>;})}
    <h3 style={{marginTop:24}}>Session history</h3>
    <p className="field-hint">Time is reviewed by the student before saving. It is not an exam score or proof of topic mastery.</p>
    {visible.map(s=><details key={s.id} style={{borderTop:'1px solid #dce5f0',padding:'16px 0'}}><summary style={{cursor:'pointer'}}><b>{s.paper_name}</b> · {duration(s.elapsed_seconds)} · {s.status==='completed'?'Completed':'Partly completed'}<br/><small>{s.finished_at?new Date(s.finished_at).toLocaleString():''}</small></summary><p style={{marginTop:12,overflowWrap:'anywhere'}}><b>Study goal:</b> {s.goal}</p><p>Planned date: {s.plan_date} · Planned time: {s.planned_minutes} min</p>{s.notes&&<p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{s.notes}</p>}</details>)}
   </>}
  </>}
 </section>;
}
