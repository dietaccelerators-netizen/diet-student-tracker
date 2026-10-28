'use client';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePortalPreferences } from './PortalPreferences';
import { useTracker } from './TrackerProvider';
import styles from './StudyView.module.css';

const sizes=[18,20,22,24];
type Position={anchor:string|null;fraction:number;ratio:number};
export function StudyView({children,readingOnly=false,enabled=true,positionKey,contentVersion,controls}:{children:ReactNode;readingOnly?:boolean;enabled?:boolean;positionKey?:string;contentVersion?:string;controls?:ReactNode}) {
 const {prefs,ready,update}=usePortalPreferences();
 const {currentUserId}=useTracker();
 const root=useRef<HTMLDivElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const positions=useRef(new Map<string,Position>());
 const [full,setFull]=useState(false),[showControls,setShowControls]=useState(false);
 const [storageError,setStorageError]=useState(false);
 const controlsId=useId();
 const size=prefs.size;
 const storageKey=positionKey?`mastrevo-reading:v1:${currentUserId||'preview'}:${positionKey}`:undefined;
 useEffect(()=>{const sync=()=>{if(!document.fullscreenElement)setFull(false);};document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);
 useEffect(()=>{if(!enabled){setShowControls(false);if(document.fullscreenElement===root.current)void document.exitFullscreen().catch(()=>{});}if(ready&&readingOnly)setFull(enabled&&prefs.focus);},[ready,prefs.focus,readingOnly,enabled]);
 useEffect(()=>{
  if(!full)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const siblings:HTMLElement[]=[];let node:HTMLElement|null=root.current;
  while(node?.parentElement){for(const sibling of Array.from(node.parentElement.children)){if(sibling!==node&&sibling instanceof HTMLElement&&!sibling.inert){sibling.inert=true;siblings.push(sibling);}}node=node.parentElement;if(node===document.body)break;}
  root.current?.focus({preventScroll:true});
  return()=>{document.body.style.overflow=previous;siblings.forEach(e=>e.inert=false);if(previousFocus?.isConnected&&!previousFocus.closest('[inert]'))previousFocus.focus({preventScroll:true});};
 },[full]);
 useEffect(()=>{
  if(!full)return;
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(showControls){e.preventDefault();setShowControls(false);toggle.current?.focus({preventScroll:true});}else if(!document.fullscreenElement)setFull(false);}};
  document.addEventListener('keydown',escape);
  return()=>document.removeEventListener('keydown',escape);
 },[full,showControls]);
 // Save semantic block + fractional offset. Standard/Simplified share block anchors;
 // proportional scroll is only a fallback when a block no longer exists.
 useLayoutEffect(()=>{
  const el=root.current;if(!el||!storageKey||!enabled||!ready)return;
  let initial=positions.current.get(storageKey);
  if(!initial)try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value&&Number.isFinite(value.ratio)&&Number.isFinite(value.fraction))initial=value;}catch{setStorageError(true);}
  let restoring=true,timer:ReturnType<typeof setTimeout>|undefined,frame=0;
  const top=()=>full?el.scrollTop:window.scrollY;
  const viewportTop=()=>full?el.getBoundingClientRect().top:0;
  const extent=()=>full?el.scrollHeight-el.clientHeight:document.documentElement.scrollHeight-window.innerHeight;
  const capture=()=>{
   if(restoring)return;
   const anchors=Array.from(el.querySelectorAll<HTMLElement>('[data-reading-anchor]'));
   const anchor=anchors.find(a=>a.getBoundingClientRect().bottom>viewportTop()+64);
   const rect=anchor?.getBoundingClientRect();
   const value:Position={anchor:anchor?.dataset.readingAnchor||null,fraction:rect?Math.max(0,Math.min(1,(viewportTop()+64-rect.top)/Math.max(1,rect.height))):0,ratio:Math.max(0,Math.min(1,top()/Math.max(1,extent())))};
   positions.current.set(storageKey,value);
   try{localStorage.setItem(storageKey,JSON.stringify(value));}catch{setStorageError(true);}
  };
  frame=requestAnimationFrame(()=>{
   if(initial){const anchor=Array.from(el.querySelectorAll<HTMLElement>('[data-reading-anchor]')).find(a=>a.dataset.readingAnchor===initial.anchor);const rect=anchor?.getBoundingClientRect();const y=rect?top()+rect.top-viewportTop()-64+rect.height*initial.fraction:extent()*initial.ratio;if(full)el.scrollTo({top:y,behavior:'instant'});else window.scrollTo({top:y,behavior:'instant'});}
   frame=requestAnimationFrame(()=>{restoring=false;capture();});
  });
  const onScroll=()=>{clearTimeout(timer);timer=setTimeout(capture,120);};
  const target=full?el:window;target.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pagehide',capture);
  return()=>{clearTimeout(timer);cancelAnimationFrame(frame);target.removeEventListener('scroll',onScroll);window.removeEventListener('pagehide',capture);};
 },[storageKey,enabled,ready,full,size,contentVersion]);
 const expand=async()=>{if(full){if(document.fullscreenElement===root.current)await document.exitFullscreen().catch(()=>{});setFull(false);setShowControls(false);return;}setFull(true);try{await root.current?.requestFullscreen?.();}catch{}};
 return <div ref={root} tabIndex={-1} role={full?'dialog':undefined} aria-modal={full||undefined} aria-label={full?'Focused study workspace':undefined} onKeyDown={e=>{
   if(!full||e.key!=='Tab')return;
   const items=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')).filter(el=>!el.closest('[hidden],[inert]')&&el.getClientRects().length>0);
   const first=items[0],last=items[items.length-1];
   if(!first){e.preventDefault();return;}
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===root.current)){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }} className={styles.view} data-study-full={full||undefined} data-reading-only={readingOnly||undefined} style={{'--study-size':`${size}px`} as CSSProperties}>
  {full&&readingOnly&&<button ref={toggle} className={styles.reveal} aria-expanded={showControls} aria-controls={controlsId} aria-label="Reading controls" onClick={()=>setShowControls(v=>!v)}>Aa ···</button>}
  {enabled&&<div id={controlsId} hidden={full&&readingOnly&&!showControls} className={styles.toolbar} role="group" aria-label="Study display settings">
   {controls}
   <label>Text size <select aria-label="Study text size" value={size} onChange={e=>update({size:Number(e.target.value)})}>{sizes.map((n,i)=><option key={n} value={n}>{['Small','Default','Large','Extra large'][i]} · {n}px</option>)}</select></label>
   <button type="button" aria-pressed={full} onClick={expand}>{full?'Exit full screen':'Full screen'}</button>
   {full&&readingOnly&&showControls&&<button type="button" onClick={()=>{setShowControls(false);toggle.current?.focus({preventScroll:true});}}>Close controls</button>}
   {full&&<span>Escape closes controls first, then exits focused reading.</span>}
   {storageKey&&<small role="status">{storageError?'Position available for this visit only.':'Reading position saved in this browser.'}</small>}
  </div>}
  {children}
 </div>;
}
