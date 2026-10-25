const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
const calls=[];let pages=[],fail=false,preview=false;
require.extensions['.ts']=(m,f)=>{
 if(f.endsWith('/supabase/client.ts')){m.exports={createClient(){return {from(table){calls.push(['from',table]);const q={};for(const name of ['select','eq','in','gt','lte','order'])q[name]=(...args)=>{calls.push([name,...args]);return q;};q.range=async(a,b)=>{calls.push(['range',a,b]);return {data:pages.shift()||[],error:fail?{message:'test'}:null};};return q;}};}};return;}
 if(f.endsWith('/study-sessions.ts')){m.exports={loadSessions:async()=>{preview=true;return [{id:'preview'}];}};return;}
 m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,f);
};
const {loadReportSessions}=require('../lib/report-session-loader.ts');
(async()=>{pages=[Array.from({length:500},(_,i)=>({id:String(i)})),[{id:'500'}]];const now=Date.parse('2026-10-25T12:00:00Z');assert.equal((await loadReportSessions('u','Skills',7,now,false)).length,501);assert(calls.some(c=>c[0]==='eq'&&c[1]==='user_id'&&c[2]==='u'));assert(calls.some(c=>c[0]==='eq'&&c[1]==='stage'&&c[2]==='Skills'));assert.deepEqual(calls.filter(c=>c[0]==='range'),[['range',0,499],['range',500,999]]);assert(calls.some(c=>c[0]==='gt'&&c[2]==='2026-10-11T12:00:00.000Z'));fail=true;await assert.rejects(loadReportSessions('u','Skills',7,now,false),/could not be loaded/);assert.equal((await loadReportSessions('u','Skills',7,now,true))[0].id,'preview');assert(preview);console.log('Session loader checks passed: account and stage scope, complete pagination, bounded comparison window, error propagation and isolated preview.');})();
