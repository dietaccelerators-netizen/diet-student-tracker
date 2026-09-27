"use client";
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentHomepage } from './StudentHomepage';
import { SubjectLearning } from './SubjectLearning';
import { BrandHeader } from './BrandHeader';
import { STAGES, SUBJECTS, stageFor } from '@/lib/stages';
import { topics as sampleTopics, papers as samplePapers } from '@/lib/mock-data';
import type { TrackerState, TopicProgress } from '@/lib/types';
export function HomepagePreview() {
 const params=useSearchParams(),router=useRouter();
 const stage=stageFor(params.get('stage')??'')??'Professional';
 const subject=params.get('subject');
 const [updates,setUpdates]=useState<Record<string,Partial<TopicProgress>>>({});
 const papers=SUBJECTS[stage].map(([code,name],i)=>({id:code,code,name,displayOrder:i}));
 const topics=papers.flatMap(p=>{const source=samplePapers.find(s=>s.code===p.code||(p.code==='CS'&&s.code==='CASE STUDY'));return source?sampleTopics.filter(t=>t.paperId===source.id).map(t=>({...t,id:`preview-${t.id}`,paperId:p.id})):[];});
 const progress:TopicProgress[]=topics.map(t=>({id:t.id,studentId:'preview',topicId:t.id,status:'Not Started',questionPractice:'Not Yet',lastStudied:null,nextStep:'',thisWeek:false,updatedAt:'',...updates[t.id]}));
 const state:TrackerState={papers,topics,progress,profiles:[{id:'preview',fullName:'Student',email:'',role:'student',level:stage,examDiet:'',paperIds:papers.map(p=>p.id)}]};
 const paper=papers.find(p=>p.id===subject);
 return <main className="min-h-screen"><BrandHeader mode="student"/><div className="mx-auto"><div className="home-preview-note"><span><b>Portal preview</b> · Sample topics, temporary activity</span><label>View stage <select value={stage} onChange={e=>router.push(`/login?mode=preview&stage=${encodeURIComponent(e.target.value)}`)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></label><Link href="/login">Sign in to use the portal →</Link></div>{paper?<div className="mx-auto max-w-6xl px-5 sm:px-8"><SubjectLearning key={paper.id} paper={paper} topics={topics.filter(t=>t.paperId===paper.id)} progress={progress} level={stage} backHref={`/login?mode=preview&stage=${encodeURIComponent(stage)}`} onUpdate={(id,patch)=>setUpdates(old=>({...old,[id]:{...old[id],...patch}}))} preview/></div>:<StudentHomepage state={state} studentId="preview" preview/>}</div></main>;
}
