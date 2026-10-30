const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
require.extensions['.ts']=(m,f)=>{
 if(f.endsWith('/supabase/client.ts')){m.exports={createClient(){throw new Error('Preview must not contact the account backend');}};return;}
 m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
};
const memory=new Map();let unavailable=false;
global.localStorage={getItem:k=>memory.get(k)??null,setItem(k,v){if(unavailable)throw new Error('Storage unavailable');memory.set(k,v);}};
const {journeyPortal,journeySubject}=require('../lib/learning-journey.ts');
const {blockKey,saveSession,loadSessions,transition}=require('../lib/study-sessions.ts');
const {loadReportSessions}=require('../lib/report-session-loader.ts');
const {reportSessions}=require('../lib/report-evidence.ts');
(async()=>{
 const time=Date.parse('2026-10-30T09:00:00Z');
 const block={date:'2026-10-30',paperId:'AT',start:'10:00',end:'10:30',duration:30};
 const session={id:'journey-1',user_id:'preview',stage:'Professional',block_key:blockKey(block),plan_date:block.date,paper_id:block.paperId,paper_name:'Advanced Taxation',goal:'Review my study notes',planned_minutes:30,status:'running',elapsed_seconds:0,running_since:new Date(time).toISOString(),started_at:new Date(time).toISOString(),finished_at:null,notes:'',revision:1};
 await saveSession(session,null,true);
 let rows=await loadSessions('preview','Professional','2026-10-26','2026-11-01',true);
 assert.equal(rows[0].status,'running');
 assert.equal((await loadSessions('another-user','Professional','2026-10-26','2026-11-01',true)).length,0);
 assert.equal((await loadSessions('preview','Skills','2026-10-26','2026-11-01',true)).length,0);
 await assert.rejects(saveSession({...session,id:'duplicate'},null,true),/unfinished session/);
 const paused=transition(rows[0],'pause',time+600000);
 await saveSession(paused,rows[0],true);
 assert.equal(paused.elapsed_seconds,600);
 await assert.rejects(saveSession(transition(session,'pause',time+700000),session,true),/changed/);
 const finished=transition(paused,'completed',time+601000,10,'Revisit the treatment of disposals');
 unavailable=true;
 await assert.rejects(saveSession(finished,paused,true),/Storage unavailable/);
 unavailable=false;
 assert.equal((await loadSessions('preview','Professional','2026-10-26','2026-11-01',true))[0].status,'paused');
 await saveSession(finished,paused,true);
 rows=await loadReportSessions('preview','Professional',7,time+602000,true);
 const report=reportSessions(rows,'preview','Professional',['AT'],7,time+602000);
 assert.equal(report.completed,1);assert.equal(report.seconds,600);
 assert.equal(report.current[0].notes,'Revisit the treatment of disposals');
 assert.throws(()=>transition(finished,'completed',time+700000,10),/changed/);
 const next={...session,id:'journey-2',block_key:'2026-10-30:AT:11:00'};
 await saveSession(next,null,true);
 assert.equal(reportSessions(await loadReportSessions('preview','Professional',7,time+702000,true),'preview','Professional',['AT'],7,time+702000).completed,1);
 for(const stage of [undefined,'Professional']){
  const subject=new URL(journeySubject('AT / &',stage),'https://portal.test');
  assert.equal(subject.searchParams.get('fromSession'),'1');
  if(stage){assert.equal(subject.pathname,'/login');assert.equal(subject.searchParams.get('subject'),'AT / &');assert.equal(subject.searchParams.get('mode'),'preview');}
  else assert.equal(subject.pathname,'/papers/AT%20%2F%20%26');
  const reportLink=new URL(journeyPortal('report',stage)+'&reportTab=activity','https://portal.test');
  assert.equal(reportLink.searchParams.get('view'),'report');assert.equal(reportLink.searchParams.get('reportTab'),'activity');
  assert.equal(new URL(journeyPortal('weekly',stage),'https://portal.test').searchParams.get('view'),'weekly');
 }
 console.log('Journey checks passed: preview start/reload/pause/save/report/next-session; storage failure; conflicts; user/stage isolation; encoded preview/account handoffs. Published lessons and account practice remain outside this test.');
})().catch(e=>{console.error(e);process.exitCode=1;});
