 'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import styles from './Settings.module.css';
export type Preferences={landing:string;answer:'paper'|'portal';size:number;lesson:'standard'|'simplified';focus:boolean;motion:boolean;theme:'light'|'dark'|'system'};
export const defaults:Preferences={landing:'home',answer:'paper',size:20,lesson:'standard',focus:true,motion:false,theme:'light'};
function normalize(value: unknown): Preferences {
 const r=(value && typeof value==='object'?value:{}) as Partial<Preferences>;
 return {landing:['home','subjects','weekly','practice','report','resources'].includes(r.landing||'')?r.landing!:defaults.landing,answer:r.answer==='portal'?'portal':'paper',size:[18,20,22,24].includes(r.size||0)?r.size!:20,lesson:r.lesson==='simplified'?'simplified':'standard',focus:typeof r.focus==='boolean'?r.focus:true,motion:r.motion===true,theme:['light','dark','system'].includes(r.theme||'')?r.theme!:'light'};
}
type Context={prefs:Preferences;ready:boolean;error:string;status:string;account:boolean;update:(patch:Partial<Preferences>)=>boolean;retry:()=>void};
const PreferenceContext=createContext<Context|null>(null);
export function PreferencesProvider({children,userId,backend}:{children:ReactNode;userId:string|null;backend:'demo'|'supabase'}){
 const account=backend==='supabase'&&!!userId;
 const key=`mastrevo-preferences:v1:${userId||'preview'}`;
 const [prefs,setPrefs]=useState(defaults),[ready,setReady]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
 const current=useRef(defaults),busy=useRef(false),loaded=useRef(false);
 const [loadingAttempt,setLoadingAttempt]=useState(0);
 useEffect(()=>{
  let alive=true; loaded.current=false;setReady(false);setError('');setStatus('');
  async function load(){
   let local=defaults;
   try{local=normalize(JSON.parse(localStorage.getItem(key)||'{}'));}catch{if(alive)setError('Browser preferences could not be loaded.');}
   if(alive){current.current=local;setPrefs(local);}
   if(account){try{
    const {data,error:failure}=await createClient().auth.getUser();
    if(failure||data.user?.id!==userId)throw new Error('Account unavailable');
    const raw=data.user.user_metadata?.mastrevo_preferences;
    if(raw && typeof raw==='object'){
     const remote=normalize(raw);local={...local,size:remote.size,answer:remote.answer};
    }
   }catch{if(alive){setError('Account preferences could not be loaded. Retry before changing settings.');setReady(false);}return;}}
   if(alive){current.current=local;setPrefs(local);loaded.current=true;setReady(true);}
  }
  void load();return()=>{alive=false;loaded.current=false;};
 },[key,account,userId,loadingAttempt]);
 function cache(next:Preferences){try{localStorage.setItem(key,JSON.stringify(next));return true;}catch{return false;}}
 function update(patch:Partial<Preferences>){
  if(!loaded.current||busy.current)return false;
  const before=current.current,next=normalize({...before,...patch});
  const remote=account&&(patch.size!==undefined||patch.answer!==undefined);
  current.current=next;setPrefs(next);setError('');
  if(!remote){const saved=cache(next);setStatus(saved?'Saved in this browser.':'');if(!saved)setError('Applied for this visit only. Browser storage is unavailable.');return saved;}
  busy.current=true;setReady(false);setStatus('Saving to your account…');
  void (async()=>{try{
   const client=createClient();
   const {data:identity,error:identityError}=await client.auth.getUser();
   if(identityError||identity.user?.id!==userId)throw new Error('Session changed');
   const {data,error:failure}=await client.auth.updateUser({data:{mastrevo_preferences:{size:next.size,answer:next.answer}}});
   if(failure||data.user?.id!==userId)throw new Error('Save failed');
   const saved=cache(next);setStatus('Saved to your account.');if(!saved)setError('Account saved; browser caching is unavailable.');
  }catch{current.current=before;setPrefs(before);setStatus('');setError('Your change was not saved. Previous preference restored; please try again.');}
  finally{busy.current=false;setReady(true);}})();
  return true;
 }
 return <PreferenceContext.Provider value={{prefs,update,ready,error,status,account,retry:()=>setLoadingAttempt(v=>v+1)}}>{children}</PreferenceContext.Provider>;
}
export function usePortalPreferences(){const context=useContext(PreferenceContext);if(!context)throw new Error('PreferencesProvider is required');return context;}
export function PreferenceEffects(){const {prefs,ready}=usePortalPreferences();const pathname=usePathname(),params=useSearchParams(),router=useRouter();
 useEffect(()=>{document.documentElement.dataset.reduceMotion=String(prefs.motion);document.documentElement.dataset.readingTheme=prefs.theme;return()=>{delete document.documentElement.dataset.reduceMotion;delete document.documentElement.dataset.readingTheme;};},[prefs.motion,prefs.theme]);
 useEffect(()=>{if(!ready||pathname!=='/dashboard'||params.has('view'))return;try{if(sessionStorage.getItem('mastrevo-landing-used'))return;sessionStorage.setItem('mastrevo-landing-used','1');if(prefs.landing!=='home')router.replace(`/dashboard?view=${prefs.landing}`);}catch{}},[ready,pathname,params,prefs.landing,router]);return <span hidden className={styles.effects}/>;
}
