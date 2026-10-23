'use client';
import { useEffect, useState } from 'react';
import { useTracker } from './TrackerProvider';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import styles from './Settings.module.css';
export type Preferences={landing:string;answer:'paper'|'portal';size:number;lesson:'standard'|'simplified';focus:boolean;motion:boolean;theme:'light'|'dark'|'system'};
export const defaults:Preferences={landing:'home',answer:'paper',size:20,lesson:'standard',focus:true,motion:false,theme:'light'};
export function usePortalPreferences(){
 const {currentUserId}=useTracker();const key=`mastrevo-preferences:v1:${currentUserId||'preview'}`;
 const [prefs,setPrefs]=useState<Preferences>(defaults),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{function load(){try{const raw=JSON.parse(localStorage.getItem(key)||'{}');setPrefs({landing:['home','subjects','weekly','practice','report','resources'].includes(raw.landing)?raw.landing:defaults.landing,answer:raw.answer==='portal'?'portal':'paper',size:[18,20,22,24].includes(raw.size)?raw.size:20,lesson:raw.lesson==='simplified'?'simplified':'standard',focus:typeof raw.focus==='boolean'?raw.focus:true,motion:raw.motion===true,theme:['light','dark','system'].includes(raw.theme)?raw.theme:'light'});}catch{setError('Preferences could not be loaded from this browser.');}setReady(true);}load();window.addEventListener('mastrevo-preferences',load);return()=>window.removeEventListener('mastrevo-preferences',load);},[key]);
 function update(patch:Partial<Preferences>){const next={...prefs,...patch};setPrefs(next);try{localStorage.setItem(key,JSON.stringify(next));if(patch.size!==undefined)localStorage.setItem('mastrevo-reading-size',String(patch.size));window.dispatchEvent(new Event('mastrevo-preferences'));setError('');return true;}catch{setError('Saved for this visit only; browser storage is unavailable.');return false;}}
 return {prefs,update,ready,error};
}
export function PreferenceEffects(){const {prefs,ready}=usePortalPreferences();const pathname=usePathname(),params=useSearchParams(),router=useRouter();
 useEffect(()=>{document.documentElement.dataset.reduceMotion=String(prefs.motion);document.documentElement.dataset.readingTheme=prefs.theme;return()=>{delete document.documentElement.dataset.reduceMotion;delete document.documentElement.dataset.readingTheme;};},[prefs.motion,prefs.theme]);
 useEffect(()=>{if(!ready||pathname!=='/dashboard'||params.has('view'))return;try{if(sessionStorage.getItem('mastrevo-landing-used'))return;sessionStorage.setItem('mastrevo-landing-used','1');if(prefs.landing!=='home')router.replace(`/dashboard?view=${prefs.landing}`);}catch{}},[ready,pathname,params,prefs.landing,router]);return <span hidden className={styles.effects}/>;
}
