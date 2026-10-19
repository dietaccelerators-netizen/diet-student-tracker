'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './StudyView.module.css';

const key='mastrevo-reading-size';
const sizes=[18,20,22,24];
export function StudyView({children}:{children:ReactNode}) {
 const root=useRef<HTMLDivElement>(null);
 const toggle=useRef<HTMLButtonElement>(null);
 const [full,setFull]=useState(false);
 const [size,setSize]=useState<number|null>(null);
 useEffect(()=>{try{const saved=Number(localStorage.getItem(key));if(sizes.includes(saved))setSize(saved);}catch{}},[]);
 useEffect(()=>{
  const sync=()=>{if(!document.fullscreenElement)setFull(false);};
  document.addEventListener('fullscreenchange',sync);
  return()=>document.removeEventListener('fullscreenchange',sync);
 },[]);
 useEffect(()=>{
  if(!full)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const siblings:HTMLElement[]=[];
  let node:HTMLElement|null=root.current;
  while(node?.parentElement){for(const sibling of Array.from(node.parentElement.children)){if(sibling!==node&&sibling instanceof HTMLElement&&!sibling.inert){sibling.inert=true;siblings.push(sibling);}}node=node.parentElement;if(node===document.body)break;}
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.fullscreenElement)setFull(false);};
  document.addEventListener('keydown',escape);
  return()=>{document.body.style.overflow=previous;siblings.forEach(e=>e.inert=false);document.removeEventListener('keydown',escape);toggle.current?.focus();};
 },[full]);
 const change=(value:string)=>{const next=Number(value);setSize(sizes.includes(next)?next:null);try{if(sizes.includes(next))localStorage.setItem(key,String(next));else localStorage.removeItem(key);}catch{}};
 const expand=async()=>{
  if(full){if(document.fullscreenElement===root.current)await document.exitFullscreen().catch(()=>{});setFull(false);return;}
  setFull(true);
  // A full-window focus view remains available when browser fullscreen is unsupported.
  try{await root.current?.requestFullscreen?.();}catch{}
 };
 return <div ref={root} className={styles.view} data-study-full={full||undefined} style={size?{'--study-size':`${size}px`} as CSSProperties:undefined}>
  <div className={styles.toolbar} role="group" aria-label="Study display settings">
   <label>Text size <select aria-label="Study text size" value={size??'default'} onChange={e=>change(e.target.value)}><option value="default">Default</option>{sizes.map(n=><option key={n} value={n}>{n} px</option>)}</select></label>
   <button ref={toggle} type="button" aria-pressed={full} onClick={expand}>{full?'Exit full screen':'Full screen'}</button>
   {full&&<span>Press Esc to exit</span>}
  </div>
  {children}
 </div>;
}
