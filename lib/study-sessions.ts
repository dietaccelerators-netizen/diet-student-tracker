import { createClient } from './supabase/client';
export interface StudyBlock { date: string; paperId: string; start: string; end: string; duration: number }
export type SessionStatus = 'running' | 'paused' | 'completed' | 'partial';
export interface StudySession {
  id: string; user_id: string; stage: string; block_key: string; plan_date: string;
  paper_id: string; paper_name: string; goal: string; planned_minutes: number;
  status: SessionStatus; elapsed_seconds: number; running_since: string | null;
  started_at: string; finished_at: string | null; notes: string; revision: number;
}
export const blockKey = (s: StudyBlock) => `${s.date}:${s.paperId}:${s.start}`;
export const isOpen = (s: StudySession) => s.status === 'running' || s.status === 'paused';
export function elapsed(s: StudySession, now = Date.now()): number {
  return Math.min(86400, s.elapsed_seconds + (s.status === 'running' && s.running_since ? Math.max(0, Math.floor((now - Date.parse(s.running_since)) / 1000)) : 0));
}
export function timerText(seconds: number) {
  return [Math.floor(seconds/3600), Math.floor(seconds%3600/60), seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
}
export function transition(s: StudySession, action: 'pause' | 'resume' | 'completed' | 'partial', now = Date.now(), minutes?: number, notes = ''): StudySession {
  if(!isOpen(s) || (action==='pause' && s.status!=='running') || (action==='resume' && s.status!=='paused')) throw new Error('This session has changed. Reload its latest state.');
  const finish=action==='completed'||action==='partial';
  if(finish && (!Number.isFinite(minutes) || minutes! < 0 || minutes! > 1440)) throw new Error('Enter study time between 0 and 1,440 minutes.');
  return {...s,status:action==='pause'?'paused':action==='resume'?'running':action,elapsed_seconds:finish?Math.round(minutes!*60):elapsed(s,now),running_since:action==='resume'?new Date(now).toISOString():null,finished_at:finish?new Date(now).toISOString():null,notes:finish?notes.slice(0,2000):s.notes,revision:s.revision+1};
}
const previewKey=(user:string,stage:string)=>`mastrevo:sessions:v1:${user}:${stage}`;
function previewRows(user:string,stage:string): StudySession[] {
  const raw=localStorage.getItem(previewKey(user,stage));
  if(!raw)return [];
  const rows=JSON.parse(raw);
  if(!Array.isArray(rows) || rows.some(s=>!s || typeof s.id!=='string' || !['running','paused','completed','partial'].includes(s.status) || !Number.isFinite(s.elapsed_seconds))) throw new Error('The saved preview sessions could not be read.');
  return rows;
}
export async function loadSessions(user:string,stage:string,week:string,end:string,preview:boolean):Promise<StudySession[]> {
  if(preview)return previewRows(user,stage).filter(s=>isOpen(s)||(s.plan_date>=week&&s.plan_date<=end));
  const {data,error}=await createClient().from('study_session_logs').select('*').eq('user_id',user).eq('stage',stage).or(`and(plan_date.gte.${week},plan_date.lte.${end}),status.in.(running,paused)`).order('started_at',{ascending:false}).limit(1000);
  if(error)throw new Error('Study sessions could not be loaded. Check your connection and retry.');
  return data || [];
}
export async function saveSession(next:StudySession,previous:StudySession|null,preview:boolean):Promise<StudySession> {
  const conflict='This session changed in another tab, or you already have an unfinished session. Reload sessions before trying again.';
  if(preview){
    const rows=previewRows(next.user_id,next.stage), existing=rows.find(s=>s.id===next.id);
    if((previous && existing?.revision!==previous.revision)||(!previous&&rows.some(s=>s.block_key===next.block_key||isOpen(s))))throw new Error(conflict);
    localStorage.setItem(previewKey(next.user_id,next.stage),JSON.stringify([...rows.filter(s=>s.id!==next.id),next]));
    return next;
  }
  const client=createClient();
  const query=previous?client.from('study_session_logs').update(next).eq('id',previous.id).eq('revision',previous.revision):client.from('study_session_logs').insert(next);
  const {data,error}=await query.select('*').maybeSingle();
  if(error?.code==='23505'||(!error&&!data))throw new Error(conflict);
  if(error||!data)throw new Error('Session changes were not saved. Check your connection and retry.');
  return data;
}
