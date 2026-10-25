import {createClient} from './supabase/client';
import {loadSessions,type StudySession} from './study-sessions';
import {DAY} from './report-evidence';
export async function loadReportSessions(user:string,stage:string,days:number,now:number,preview:boolean):Promise<StudySession[]>{
 if(preview)return loadSessions(user,stage,'0001-01-01','9999-12-31',true);
 const result:StudySession[]=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await createClient().from('study_session_logs').select('*').eq('user_id',user).eq('stage',stage).in('status',['completed','partial']).gt('finished_at',new Date(now-days*2*DAY).toISOString()).lte('finished_at',new Date(now).toISOString()).order('finished_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+499);
  if(error)throw new Error('Study activity could not be loaded. Your saved topic updates are still available.');
  result.push(...(data||[]));if(!data||data.length<500)return result;
 }
}
