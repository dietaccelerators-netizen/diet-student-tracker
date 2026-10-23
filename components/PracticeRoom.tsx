'use client';
import { usePortalPreferences } from './PortalPreferences';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Paper, Topic } from '@/lib/types';
import { PortalIcon } from './PortalIcon';
import { PortalArtwork } from './PortalArtwork';
import { StudyView } from './StudyView';
import { AccountingPractice } from './AccountingPractice';
import { practiceSubjects, practiceQuestions, type PracticeQuestion } from './PracticeSamples';
import styles from './PracticeRoom.module.css';

const tabs=[['home','Practice Home'],['quick-review','Quick Review'],['past-questions','Past Questions'],['exam-focus','Exam Focus'],['simulations','Simulations'],['history','Attempt History']] as const;
type Tab=typeof tabs[number][0];
type Attempt={id:string;questionId:string;date:string;subject:string;topic:string;mode:string;method:string;seconds:number;score:number;marks:number;answer:string;reflection:string};
type Draft={questionId:string;answer:string;method:'portal'|'paper';elapsed:number;completed:boolean;score:string;reflection:string;running?:boolean};
const emptyPapers:Paper[]=[];const emptyTopics:Topic[]=[];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const samples=practiceQuestions.filter(q=>!['past-cgt-1','vat-1'].includes(q.id));
const clock=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
const tabFor=(s:string|null):Tab=>s==='weekly-simulation'?'simulations':s==='lecture-check'?'quick-review':tabs.some(t=>t[0]===s)?s as Tab:'home';

export function PracticeRoom({studentId='preview',papers=emptyPapers,topics=emptyTopics}:{studentId?:string;papers?:Paper[];topics?:Topic[]}){
 const params=useSearchParams();
 const incoming=params.get('subject');
 const [tab,setTab]=useState<Tab>(()=>tabFor(params.get('practiceMode')||params.get('mode')));
 const [sample,setSample]=useState(!papers.length);
 const [subject,setSubject]=useState(()=>papers.find(p=>p.id===incoming||slug(p.name)===incoming)?.id||papers[0]?.id||'');
 const [sampleSubject,setSampleSubject]=useState(()=>practiceSubjects.find(p=>p.slug===incoming)?.slug||'advanced-taxation');
 const [topic,setTopic]=useState(params.get('topic')||'');
 const [section,setSection]=useState(params.get('section')||'');
 const [search,setSearch]=useState('');
 const [question,setQuestion]=useState<PracticeQuestion|null>(null);
 const [objective,setObjective]=useState(false);
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [draft,setDraft]=useState<Draft|null>(null);
 const [notice,setNotice]=useState('');
 const [savedMessage,setSavedMessage]=useState('');
 const [pendingQuestion,setPendingQuestion]=useState<PracticeQuestion|null>(null);
 const replaceDialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(pendingQuestion)replaceDialog.current?.showModal();},[pendingQuestion]);
 const storeKey=`mastrevo-practice-samples-v1:${studentId}`;
 useEffect(()=>{try{const stored=JSON.parse(localStorage.getItem(storeKey)||'{}');if(Array.isArray(stored.attempts))setAttempts(stored.attempts.filter((a:Attempt)=>a&&typeof a.id==='string'&&samples.some(q=>q.id===a.questionId)&&typeof a.answer==='string'&&typeof a.reflection==='string'&&typeof a.subject==='string'&&typeof a.topic==='string'&&typeof a.mode==='string'&&['paper','portal'].includes(a.method)&&Number.isFinite(Date.parse(a.date))&&Number.isFinite(a.score)&&Number.isFinite(a.marks)&&a.score>=0&&a.score<=a.marks&&Number.isFinite(a.seconds)&&a.seconds>=0).slice(0,100));if(stored.draft&&samples.some(q=>q.id===stored.draft.questionId)&&Number.isFinite(stored.draft.elapsed)&&stored.draft.elapsed>=0&&typeof stored.draft.answer==='string'&&typeof stored.draft.reflection==='string'&&typeof stored.draft.score==='string'&&typeof stored.draft.completed==='boolean'&&['paper','portal'].includes(stored.draft.method))setDraft(stored.draft);}catch{setNotice('Saved sample practice could not be loaded in this browser.');}},[storeKey]);
 function persist(next:Attempt[],pending:Draft|null){try{localStorage.setItem(storeKey,JSON.stringify({attempts:next,draft:pending}));setNotice('');return true;}catch{setNotice('Browser storage is unavailable. Keep this page open to retain your sample work.');return false;}}
 function saveDraft(value:Draft){setDraft(value);persist(attempts,value);}
 function saveAttempt(a:Attempt){const next=[a,...attempts].slice(0,100);setAttempts(next);setDraft(null);const saved=persist(next,null);setSavedMessage(saved?'Sample attempt saved in this browser.':'Attempt kept for this visit only. Browser storage is unavailable.');setQuestion(null);setTab('history');}
 const current=sample?practiceSubjects.find(p=>p.slug===sampleSubject):null;
 const realPaper=papers.find(p=>p.id===subject);
 const availableTopics=sample?current?.topics||[]:topics.filter(t=>t.paperId===subject).map(t=>({slug:t.id,name:t.topicName,sections:undefined}));
 const selectedTopic=availableTopics.find(t=>t.slug===topic||slug(t.name)===topic);
 const sections=selectedTopic?.sections||[];
 const filtered=sample?samples.filter(q=>q.subjectSlug===sampleSubject&&(!topic||q.topicSlug===topic)&&(!section||q.sectionSlug===section)&&(!search||`${q.question} ${q.topicName} ${q.questionType}`.toLowerCase().includes(search.toLowerCase()))):[];
 const shown=filtered.filter(q=>tab==='quick-review'?q.mode==='quick-review'||q.mode==='lecture-check':tab==='exam-focus'?q.mode==='exam-focus':false);
 const reportHref=params.get('mode')==='preview'?`/login?mode=preview&stage=${encodeURIComponent(params.get('stage')||'Professional')}&view=report`:'/dashboard?view=report';
 function switchSample(value:boolean){setSample(value);setTopic('');setSection('');setSearch('');}
 function startNew(q:PracticeQuestion){setQuestion(q);setDraft(null);setSavedMessage('');persist(attempts,null);}
 function open(q:PracticeQuestion){if(draft){if(draft.questionId===q.id){setQuestion(q);return;}setPendingQuestion(q);return;}startNew(q);}
 if(question)return <div className={styles.page}><WrittenWorkspace key={question.id} question={question} initial={draft?.questionId===question.id?draft:null} onDraft={saveDraft} onSave={saveAttempt} onClose={()=>setQuestion(null)} notice={notice}/></div>;
 if(objective)return <div className={styles.page}><button className={styles.secondary} onClick={()=>setObjective(false)}>← Back to Practice Room</button><AccountingPractice/></div>;
 return <section className={styles.page} aria-label="Practice Room">
  <header className={styles.heading}><div><span className={styles.eyebrow}>TEST · APPLY · BUILD CONFIDENCE</span><h1>Practice Room</h1><p>Put your learning into practice, one focused attempt at a time.</p></div><span className={styles.headerIcon}><PortalIcon name="practice"/></span></header>
  {tab!=='history'&&<div className={styles.context}>
   <div className={styles.contextTitle}><strong>Your practice focus</strong><div className={styles.pills}><button aria-pressed={!sample} disabled={!papers.length} onClick={()=>switchSample(false)}>My subjects</button><button aria-pressed={sample} onClick={()=>switchSample(true)}>Sample library</button></div></div>
   <div className={styles.filters}><label>Subject<select value={sample?sampleSubject:subject} onChange={e=>{sample?setSampleSubject(e.target.value):setSubject(e.target.value);setTopic('');setSection('');}}>{sample?practiceSubjects.map(p=><option value={p.slug} key={p.id}>{p.code} — {p.name}</option>):papers.map(p=><option value={p.id} key={p.id}>{p.code} — {p.name}</option>)}</select></label><label>Topic<select value={selectedTopic?.slug||''} onChange={e=>{setTopic(e.target.value);setSection('');}}><option value="">All topics</option>{availableTopics.map(t=><option key={t.slug} value={t.slug}>{t.name}</option>)}</select></label><label>Section<select value={sections.some(s=>s.slug===section)?section:''} disabled={!sections.length} onChange={e=>setSection(e.target.value)}><option value="">All sections</option>{sections.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label></div>
   {params.get('fromLesson')==='1'&&<p className={styles.small}>Opened from your lesson. Questions will appear when approved content is linked to this topic and section.</p>}
  </div>}
  <nav className={styles.tabs} aria-label="Practice sections">{tabs.map(([id,title])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>{setTab(id);setSearch('');}}>{title}</button>)}</nav>
  {notice&&<p className={styles.notice} role="status">{notice}</p>}
  {tab==='history'&&savedMessage&&<p className={styles.success} role="status"><PortalIcon name="check"/>{savedMessage}</p>}
  {sample&&tab!=='history'&&<p className={styles.sampleNote}><PortalIcon name="notes"/> Sample library · Demonstration content, not an ICAN past paper. Saved only in this browser; excluded from your Learning Report.</p>}
  {draft&&<div className={styles.draftBar}><PortalIcon name="notes"/><span><strong>Unfinished sample</strong> · {samples.find(q=>q.id===draft.questionId)?.topicName}</span><button className={styles.textButton} onClick={()=>setQuestion(samples.find(q=>q.id===draft.questionId)!)}>{draft.completed?'Continue self-marking':'Resume attempt'} →</button></div>}
  {tab==='home'?<>
   <section className={styles.hero}><div><span className={styles.eyebrow}>MAKE YOUR NEXT ATTEMPT COUNT</span><h2>A little practice. A clearer understanding.</h2><p>Recall the essentials, apply your knowledge and learn from each attempt.</p></div><div className={styles.art}><PortalArtwork kind="practice"/></div></section>
   <div className={styles.sectionHeading}><div><h2>Choose your practice</h2><p>Find the right format for what you want to work on.</p></div></div>
   <div className={styles.cards}>{[
    {id:'quick-review',icon:'practice',title:'Quick Review',text:'Recall the essentials with short, focused questions.',meta:'Usually 5–10 minutes',action:'Review a topic'},
    {id:'past-questions',icon:'subjects',title:'Past Questions',text:'Work through approved historical questions by topic.',meta:'Awaiting published questions',action:'Browse questions'},
    {id:'exam-focus',icon:'target',title:'Exam Focus',text:'Apply your knowledge through written answers and scenarios.',meta:'Type or answer on paper',action:'Explore exam practice'},
   ].map(c=><article key={c.id} className={`${styles.card} ${c.id==='quick-review'?styles.featured:''}`}><span className={styles.icon}><PortalIcon name={c.icon}/></span><h3>{c.title}</h3><p>{c.text}</p><span className={styles.small}>{c.meta}</span><button className={c.id==='quick-review'?styles.primary:styles.secondary} onClick={()=>setTab(c.id as Tab)}>{c.action} →</button></article>)}</div>
   <div className={styles.bottomRow}><div><PortalIcon name="clock"/><div><h3>Ready for an exam rehearsal?</h3><p>Weekly, topic and full mock simulations are coming next.</p></div><button className={styles.secondary} onClick={()=>setTab('simulations')}>View simulations →</button></div></div>
   {!sample&&<p className={styles.small}>Explore the experience while your question bank is being prepared. <button className={styles.textButton} onClick={()=>{switchSample(true);setTab('quick-review');}}>Try the sample library →</button></p>}
  </>:tab==='history'?<><div className={styles.sectionHeading}><div><h2>Attempt History</h2><p>Your written sample attempts, saved on this device.</p></div><Link className={styles.secondary} href={reportHref}>Learning Report →</Link></div>{attempts.length?<div className={styles.tableWrap}><table><caption className={styles.small}>Sample results only · Self-marked, not verified exam scores</caption><thead><tr>{['Date','Subject / topic','Practice','Method','Time','Score'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{attempts.map(a=><tr key={a.id}><td>{new Date(a.date).toLocaleDateString('en-GB')}</td><td><strong>{a.subject}</strong><small>{a.topic}</small>{(a.answer||a.reflection)&&<details><summary>Review saved work</summary>{a.answer&&<p>{a.answer}</p>}{a.reflection&&<p>Reflection: {a.reflection}</p>}</details>}</td><td>{a.mode}</td><td>{a.method==='paper'?'Paper':'Typed'}</td><td>{clock(a.seconds)}</td><td>{a.score}/{a.marks}</td></tr>)}</tbody></table></div>:<Empty title="Your practice story starts here" text="Finish a written sample question and record your self-marked score to see it here."/>}</>:tab==='simulations'?<><h2>Simulations</h2><p>Build exam stamina with structured, timed practice.</p><div className={styles.cards}>{[['weekly','Weekly Simulation','A rehearsal based on topics studied during the week.'],['target','Topic Simulation','A focused session covering one syllabus area.'],['clock','Full Mock','A complete paper with the right question mix and timing.']].map(([icon,title,text])=><article className={styles.card} key={title}><span className={styles.icon}><PortalIcon name={icon}/></span><span className={styles.badge}>Coming soon</span><h3>{title}</h3><p>{text}</p><span className={styles.small}>Available when approved papers are published.</span></article>)}</div></>:<>
   <div className={styles.sectionHeading}><div><h2>{tabs.find(t=>t[0]===tab)?.[1]}</h2><p>{tab==='quick-review'?'Short recall to reinforce what you have just studied.':tab==='past-questions'?'Approved historical questions, organised by subject and topic.':'Work through scenarios and explain your reasoning in writing.'}</p></div>{tab!=='past-questions'&&sample&&<label className={styles.search}>Find a question<input type="search" placeholder="Search this selection…" value={search} onChange={e=>setSearch(e.target.value)}/></label>}</div>
   {shown.length>0&&<p className={styles.small} aria-live="polite">{shown.length} {shown.length===1?'question':'questions'} in this selection</p>}
   {shown.length?<div className={styles.questionGrid}>{shown.map(q=><article className={styles.card} key={q.id}><div className={styles.meta}><span className={styles.badge}>{q.questionType.replace('-',' ')}</span><span>{q.marks} marks · {q.estimatedMinutes} min</span></div><h3>{q.sectionName||q.topicName}</h3><p>{q.question}</p><div className={styles.cardFoot}><span className={styles.small}>{q.subjectCode} · Sample</span><button className={styles.primary} onClick={()=>open(q)}>Start question →</button></div></article>)}</div>:<Empty title={tab==='past-questions'?'Past questions are being prepared':search?'No matching questions':'Questions are on their way'} text={tab==='past-questions'?'Only approved, correctly sourced historical papers will appear here. The demonstration library is not labelled as ICAN past questions.':`No questions are available for ${sample?current?.name:realPaper?.name||'this subject'}${selectedTopic?` · ${selectedTopic.name}`:''}${search?' with that search':''}. Try another selection or explore the sample library.`}/>}
   {!shown.length&&tab!=='past-questions'&&<div className={styles.emptyActions}>{sample?<button className={styles.secondary} onClick={()=>{setSearch('');setTopic('');setSection('');setSampleSubject('advanced-taxation');}}>Show available samples →</button>:<button className={styles.primary} onClick={()=>switchSample(true)}>Explore sample questions →</button>}</div>}
   {tab==='quick-review'&&<div className={styles.resume}><div><strong>Accounting fundamentals · Objective sample</strong><p>Five introductory questions, at your own pace or with a timer. Temporary results.</p></div><button className={styles.secondary} onClick={()=>setObjective(true)}>Try accounting sample →</button></div>}
  </>}
  <dialog ref={replaceDialog} className={styles.dialog} aria-labelledby="replace-draft-title" onCancel={()=>setPendingQuestion(null)} onClose={()=>setPendingQuestion(null)}><span className={styles.icon}><PortalIcon name="notes"/></span><h2 id="replace-draft-title">You have an unfinished attempt</h2><p>Resume your saved work, or replace it with this new question. Replacing it removes the current draft from this browser.</p><div className={styles.dialogActions}><button className={styles.primary} onClick={()=>{replaceDialog.current?.close();setPendingQuestion(null);if(draft)setQuestion(samples.find(q=>q.id===draft.questionId)!);}}>Resume saved work</button><button className={styles.secondary} onClick={()=>{const next=pendingQuestion;replaceDialog.current?.close();setPendingQuestion(null);if(next)startNew(next);}}>Replace draft</button><button className={styles.textButton} onClick={()=>replaceDialog.current?.close()}>Cancel</button></div></dialog>
 </section>;
}
function Empty({title,text}:{title:string;text:string}){return <div className={styles.empty}><span className={styles.icon}><PortalIcon name="subjects"/></span><h3>{title}</h3><p>{text}</p></div>;}

function WrittenWorkspace({question:q,initial,onDraft,onSave,onClose,notice}:{question:PracticeQuestion;initial:Draft|null;onDraft:(d:Draft)=>void;onSave:(a:Attempt)=>void;onClose:()=>void;notice:string}){
 const {prefs,ready}=usePortalPreferences();
 useEffect(()=>{if(ready&&!initial)setMethod(prefs.answer);},[ready,prefs.answer]);
 const [answer,setAnswer]=useState(initial?.answer||'');const [method,setMethod]=useState<'portal'|'paper'>(initial?.method||'portal');
 const [elapsed,setElapsed]=useState(initial?.elapsed||0);const [running,setRunning]=useState(initial?false:true);const [completed,setCompleted]=useState(initial?.completed||false);
 const [score,setScore]=useState(initial?.score||'');const [reflection,setReflection]=useState(initial?.reflection||'');const [confirm,setConfirm]=useState(false);
 const workTitle=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{workTitle.current?.focus();},[]);
 const base=useRef({time:0,seconds:elapsed});const saveRef=useRef(onDraft);saveRef.current=onDraft;
 useEffect(()=>{if(!running||completed)return;base.current={time:Date.now(),seconds:elapsed};const tick=()=>setElapsed(base.current.seconds+Math.floor((Date.now()-base.current.time)/1000));const id=setInterval(tick,500);return()=>clearInterval(id);},[running,completed]); // elapsed is captured only when starting/resuming
 useEffect(()=>{saveRef.current({questionId:q.id,answer,method,elapsed,completed,score,reflection,running});},[q.id,answer,method,elapsed,completed,score,reflection,running]);
 const marks=q.marks||0;const valid=score.trim()!==''&&Number.isFinite(Number(score))&&Number(score)>=0&&Number(score)<=marks&&Number(score)*2%1===0;
 return <StudyView><section className={styles.workspace} aria-label="Written practice workspace">
  <div className={styles.workHeader}><button className={styles.secondary} onClick={onClose}>← Return to practice</button><span>{q.subjectCode} · {q.topicName}</span><div className={styles.timer}><span className={styles.timerDisplay}><small>{completed?'Time practised':running?'Time elapsed':'Paused'}</small><span role="timer" aria-label="Elapsed practice time">{clock(elapsed)}</span></span>{!completed&&<button className={styles.secondary} onClick={()=>setRunning(v=>!v)}>{running?'Pause':'Resume'}</button>}</div></div>
  <p className={styles.sampleNote}>Sample question · Suggested time {q.estimatedMinutes} minutes · {notice?'Not saved to this browser':'Draft saved in this browser'}</p>{notice&&<p role="status">{notice}</p>}
  <article data-reading-content className={styles.question}><span className={styles.eyebrow}>{q.questionType.replace('-',' ')} · {marks} marks</span><h1 ref={workTitle} tabIndex={-1}>{q.sectionName||q.topicName}</h1><p>{q.question}</p></article>
  {!completed?<section className={styles.answer}><div className={styles.sectionHeading}><h2>Your answer</h2><div className={styles.pills}><button aria-pressed={method==='portal'} onClick={()=>setMethod('portal')}>Type answer</button><button aria-pressed={method==='paper'} onClick={()=>setMethod('paper')}>Answer on paper</button></div></div>{method==='portal'?<label className={styles.answerLabel}>Show your reasoning<textarea aria-label="Your written answer" value={answer} onChange={e=>setAnswer(e.target.value)} rows={8} placeholder="Write your answer and workings here…"/></label>:<div className={styles.empty}><PortalIcon name="practice"/><h3>Make room for your workings.</h3><p>Write your answer on paper. Return here when you are ready to compare it with the suggested solution.</p></div>}
   {confirm?<div className={styles.resume}><div><strong>Ready to reveal the solution?</strong><p>{method==='portal'&&!answer.trim()?'Your typed answer is empty. ':''}You will self-mark your attempt on the next screen.</p></div><button className={styles.secondary} onClick={()=>setConfirm(false)}>Keep working</button><button className={styles.primary} onClick={()=>{setCompleted(true);setRunning(false);}}>Reveal solution</button></div>:<div className={styles.cardFoot}><span className={styles.small}>{notice?'Keep this page open to retain your draft.':'Your draft is saved automatically in this browser.'}</span><button className={styles.primary} onClick={()=>setConfirm(true)}>Finish & review →</button></div>}
  </section>:<><section data-reading-content className={styles.question}><h2>Suggested solution</h2><ol>{q.suggestedSolution.map(s=><li key={s}>{s}</li>)}</ol><h3>Marking guide</h3>{q.markingGuide?.map((g,i)=><div className={styles.markRow} key={i}><span>{g.item}</span><strong>{g.marks} {g.marks===1?'mark':'marks'}</strong></div>)}{method==='portal'&&<details><summary>Your answer</summary><p className={styles.preserve}>{answer||'No answer entered.'}</p></details>}</section><form className={styles.answer} onSubmit={e=>{e.preventDefault();if(valid)onSave({id:crypto.randomUUID(),questionId:q.id,date:new Date().toISOString(),subject:q.subjectCode,topic:q.topicName,mode:q.mode==='exam-focus'?'Exam Focus':q.mode==='lecture-check'?'Lecture Check':'Quick Review',method,seconds:elapsed,score:Number(score),marks,answer,reflection});}}><h2>Mark your attempt</h2><p>Compare your work with the guide. This is a self-assessment.</p><label>Marks achieved (out of {marks})<input type="number" min="0" max={marks} step="0.5" required value={score} onChange={e=>setScore(e.target.value)}/></label><label>Reflection (optional)<textarea rows={3} value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="What will you do differently next time?"/></label><button type="submit" disabled={!valid} className={styles.primary}>Save sample attempt →</button></form></>}
 </section></StudyView>;
}
