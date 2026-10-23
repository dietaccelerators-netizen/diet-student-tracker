import { minutes, propose } from './plan-setup';
import type { ActivePlan } from './weekly-plan-storage';
import { blockKey, type StudyBlock } from './study-sessions';

export interface SessionMove { source: StudyBlock; date: string; start: string; end: string }
export interface DatedSession extends StudyBlock { day: number; sourceKey: string; movedFrom?: StudyBlock }
export function addPlanDays(date: string, count: number) { const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+count);return d.toISOString().slice(0,10); }
export function validDate(value: unknown): value is string { return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value; }
export function validMove(value: unknown): value is SessionMove {
 const m=value as SessionMove,s=m?.source;
 return !!s&&validDate(s.date)&&validDate(m.date)&&typeof s.paperId==='string'&&s.paperId.length>0&&Number.isFinite(s.duration)&&s.duration>0&&s.duration<=1440&&minutes(s.end)-minutes(s.start)===s.duration&&minutes(m.end)-minutes(m.start)===s.duration;
}
export function scheduledRange(plan: ActivePlan, from: string, to: string, paperIds=plan.paperIds): DatedSession[] {
 const recurring=propose(plan.draft,plan.paperIds).filter(s=>paperIds.includes(s.paperId));
 const moves=(plan.moves||[]).filter(m=>recurring.some(s=>s.paperId===m.source.paperId&&s.start===m.source.start&&s.end===m.source.end&&s.day===(new Date(m.source.date+'T12:00:00Z').getUTCDay()+6)%7));
 const moved=new Set(moves.map(m=>blockKey(m.source)));
 const rows:DatedSession[]=[];
 for(let date=from;date<=to;date=addPlanDays(date,1)){
  const day=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
  for(const s of recurring.filter(s=>s.day===day)){const block={...s,date};if(!moved.has(blockKey(block)))rows.push({...block,sourceKey:blockKey(block)});}
 }
 for(const m of moves)if(m.date>=from&&m.date<=to)rows.push({...m.source,date:m.date,start:m.start,end:m.end,day:(new Date(m.date+'T12:00:00Z').getUTCDay()+6)%7,sourceKey:blockKey(m.source),movedFrom:m.source});
 return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
}
export function moveError(plan:ActivePlan,session:DatedSession,date:string,start:string,today:string,nowTime:string):string {
 if(!validDate(date)||date<today||date>addPlanDays(today,90))return 'Choose a day within the next 90 days.';
 const begin=minutes(start),end=begin+session.duration;
 if(!Number.isFinite(begin)||end>=1440)return 'Choose a start time that keeps this session within one day.';
 if(date===today&&start<nowTime)return 'Choose a time later today or another day.';
 if(session.date===date&&session.start===start)return 'Choose a different day or start time.';
 if(scheduledRange(plan,date,date).some(s=>blockKey(s)!==blockKey(session)&&begin<minutes(s.end)&&end>minutes(s.start)))return 'Another study session is scheduled at that time. Choose a free slot.';
 const day=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7;
 if(plan.draft.mode!=='self'&&plan.draft.lectures.some(l=>l.day===day&&begin<minutes(l.end)&&end>minutes(l.start)))return 'This time overlaps a lecture. Choose another time.';
 return '';
}
export function endTime(start:string,duration:number){const end=minutes(start)+duration;return `${String(Math.floor(end/60)).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`;}
