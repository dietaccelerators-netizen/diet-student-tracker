import type { TrackerState, TopicProgress } from './types';
import type { StudySession } from './study-sessions';
export const DAY=86400000;
export function hasTopicEvidence(p?:TopicProgress){return !!p&&(p.status!=='Not Started'||p.questionPractice!=='Not Yet'||!!p.lastStudied||!!p.nextStep.trim());}
export function reportTopics(state:TrackerState,user:string,paperIds:string[]){
 return state.topics.filter(t=>paperIds.includes(t.paperId)).map(t=>({ ...t,progress:state.progress.find(p=>p.studentId===user&&p.topicId===t.id)}));
}
export function reviewTopics(rows:ReturnType<typeof reportTopics>){
 // Explicit student flags only. Stable syllabus order avoids inventing a weakness score.
 return rows.filter(t=>t.progress?.status==='Needs Practice'||t.progress?.questionPractice==='Reattempt').sort((a,b)=>a.displayOrder-b.displayOrder||a.id.localeCompare(b.id));
}
export function reportSessions(rows:StudySession[],user:string,stage:string,paperIds:string[],days:number,now:number){
 const valid=rows.filter(s=>s.user_id===user&&s.stage===stage&&paperIds.includes(s.paper_id)&&['completed','partial'].includes(s.status)&&s.finished_at&&Number.isFinite(Date.parse(s.finished_at))&&Number.isFinite(s.elapsed_seconds)&&s.elapsed_seconds>=0);
 const unique=Array.from(new Map(valid.map(s=>[s.id,s])).values());
 const current=unique.filter(s=>Date.parse(s.finished_at!)>now-days*DAY&&Date.parse(s.finished_at!)<=now);
 const previous=unique.filter(s=>Date.parse(s.finished_at!)>now-days*DAY*2&&Date.parse(s.finished_at!)<=now-days*DAY);
 const seconds=(items:StudySession[])=>items.reduce((n,s)=>n+s.elapsed_seconds,0);
 return {current,previous,seconds:seconds(current),previousSeconds:seconds(previous),completed:current.filter(s=>s.status==='completed').length};
}
export function studyTime(seconds:number){const minutes=Math.round(seconds/60);return minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}m`:`${minutes} min`;}
