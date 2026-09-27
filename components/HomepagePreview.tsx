"use client";
import { useState } from 'react';
import Link from 'next/link';
import { StudentHomepage } from './StudentHomepage';
import { BrandHeader } from './BrandHeader';
import { STAGES, SUBJECTS, type ExamStage } from '@/lib/stages';
import type { TrackerState } from '@/lib/types';
export function HomepagePreview() {
 const [stage,setStage]=useState<ExamStage>('Professional');
 const papers=SUBJECTS[stage].map(([code,name],i)=>({id:code,code,name,displayOrder:i}));
 const state:TrackerState={papers,topics:[],progress:[],profiles:[{id:'preview',fullName:'Student',email:'',role:'student',level:stage,examDiet:'',paperIds:papers.map(p=>p.id)}]};
 return <main className="min-h-screen"><BrandHeader mode="student"/><div className="mx-auto"><div className="home-preview-note"><span><b>Homepage preview</b> · Sample account, no saved activity</span><label>View stage <select value={stage} onChange={e=>setStage(e.target.value as ExamStage)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></label><Link href="/login">Sign in to use the portal →</Link></div><StudentHomepage state={state} studentId="preview" preview/></div></main>;
}
