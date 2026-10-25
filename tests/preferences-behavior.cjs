const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const ts=require('typescript');
async function scenario({backend='supabase',remote={size:24,answer:'portal'},saveFails=false,loadFails=false,storageFails=false}={}){
 let slots=[],index=0,effects=[],writes=[],metadata=[];
 const react={createContext:()=>({Provider:'provider'}),useContext:()=>null,
  useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
  useRef(initial){const i=index++;if(!(i in slots))slots[i]={current:initial};return slots[i];},
  useEffect(fn,deps){const i=index++;if(!slots[i]||deps.some((d,j)=>d!==slots[i][j])){slots[i]=deps;effects.push(fn);}}};
 const client={auth:{getUser:async()=>({data:{user:loadFails?null:{id:'student-a',user_metadata:{mastrevo_preferences:remote}}},error:loadFails?new Error('offline'):null}),updateUser:async body=>{metadata.push(body);return {data:{user:{id:'student-a'}},error:saveFails?new Error('offline'):null};}}};
 const file=require('node:path').resolve('components/PortalPreferences.tsx');
 const m=new Module(file,module);m.filename=file;m.paths=module.paths;
 m.require=id=>id==='react'?react:id==='react/jsx-runtime'?{jsx:(type,props)=>({type,props})}:id==='@/lib/supabase/client'?{createClient:()=>client}:id==='next/navigation'?{}:id.endsWith('.css')?{}:require(id);
 m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
 global.localStorage={getItem:()=>JSON.stringify({size:18,answer:'paper',theme:'dark'}),setItem:(...args)=>{if(storageFails)throw Error('blocked');writes.push(args);}};
 const render=()=>{index=0;const tree=m.exports.PreferencesProvider({children:null,userId:'student-a',backend});const pending=effects.splice(0);pending.forEach(e=>e());return tree.props.value;};
 const settle=async()=>{await new Promise(resolve=>setImmediate(resolve));return render();};
 render();let value=await settle();
 return {get:()=>value,render:()=>value=render(),settle:async()=>value=await settle(),metadata,writes};
}
(async()=>{
 let s=await scenario();assert.equal(s.get().prefs.size,24);assert.equal(s.get().prefs.theme,'dark');assert.equal(s.metadata.length,0,'loading must never overwrite account preferences');
 s.get().update({size:22});assert.equal(s.render().ready,false);assert.equal(s.get().update({size:18}),false,'prevent overlapping account saves');await s.settle();assert.equal(s.get().prefs.size,22);assert.equal(s.metadata[0].data.mastrevo_preferences.answer,'portal');assert.match(s.get().status,/account/);
 s=await scenario({saveFails:true});s.get().update({size:22});await s.settle();assert.equal(s.get().prefs.size,24);assert.match(s.get().error,/not saved/);assert.equal(s.writes.length,0,'failed remote save must not persist locally');
 s=await scenario({loadFails:true});assert.equal(s.get().ready,false);assert.equal(s.get().update({size:22}),false);assert.equal(s.metadata.length,0);
 s=await scenario({storageFails:true});s.get().update({size:22});await s.settle();assert.equal(s.get().prefs.size,22);assert.match(s.get().error,/Account saved/);
 s=await scenario({backend:'demo'});assert.equal(s.get().prefs.size,18);s.get().update({size:22});s.render();assert.equal(s.metadata.length,0);assert.equal(s.writes.length,1);assert.match(s.get().status,/browser/);
 console.log('Preference persistence: account load, save, concurrent input, rollback, unavailable storage and preview passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
