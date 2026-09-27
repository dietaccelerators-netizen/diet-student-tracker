"use client";
import { useState } from "react";
import { useTracker } from "@/components/TrackerProvider";
export function StudentSetup({ studentId, onDone }: {studentId: string; onDone: () => void}) {
 const {state, updateStudentPapers, syncing} = useTracker();
 const student = state.profiles.find(s => s.id === studentId)!;
 const [step,setStep] = useState(0);
 const [selected,setSelected] = useState(student.paperIds);
 const [error,setError] = useState("");
 async function finish() { const result = await updateStudentPapers(studentId,selected); if(result.ok) setStep(2); else setError(result.error); }
 return <section className="setup-panel" aria-labelledby="setup-title"><ol className="setup-steps" aria-label="Setup progress">{["Your profile","Your papers","Ready to begin"].map((label,i)=><li key={label} aria-current={i === step ? "step" : undefined} className={i <= step ? "reached" : ""}><b>{i < step ? "✓" : i+1}</b>{label}</li>)}</ol>
 <div className="setup-content"><span className="eyebrow">LET’S MAKE THIS YOURS</span><h1 id="setup-title">{["Welcome to DIET, " + student.fullName.split(" ")[0] + ".","What are you preparing for?","Your next chapter starts here."][step]}</h1>
 {step === 0 && <><p>Your DIET team has set up your profile. Check your details, then choose the papers you want to track.</p><dl className="profile-review"><div><dt>Name</dt><dd>{student.fullName}</dd></div><div><dt>Email</dt><dd>{student.email}</dd></div><div><dt>Exam diet</dt><dd>{student.examDiet || "Not assigned yet"}</dd></div><div><dt>Level</dt><dd>{student.level || "Not assigned yet"}</dd></div></dl><p className="setup-help">Need a correction? Ask your DIET coordinator before starting.</p><button className="primary-button" onClick={()=>setStep(1)}>Continue to my papers →</button></>}
 {step === 1 && <><p>Pick at least one paper. You can change these later without losing your progress.</p><fieldset className="setup-paper-grid"><legend className="sr-only">Papers to prepare for</legend>{state.papers.map(paper=><label key={paper.id} className={selected.includes(paper.id) ? "setup-paper selected" : "setup-paper"}><input type="checkbox" checked={selected.includes(paper.id)} onChange={e=>setSelected(ids=>e.target.checked ? [...ids,paper.id] : ids.filter(id=>id !== paper.id))}/><span><b>{paper.code}</b><small>{paper.name}</small></span></label>)}</fieldset>{error && <p role="alert">{error}</p>}<div className="setup-actions"><button className="secondary-button" disabled={syncing} onClick={()=>setStep(0)}>Back</button><button className="primary-button" disabled={!selected.length || syncing} onClick={()=>void finish()}>{syncing ? "Saving your papers…" : "Save and continue →"}</button></div></>}
 {step === 2 && <><div className="setup-success" aria-hidden="true">✓</div><p>Your {selected.length} {selected.length === 1 ? "paper is" : "papers are"} saved. Start with one topic and add it to your weekly focus.</p><button className="primary-button" onClick={onDone}>Open my dashboard →</button></>}
 </div></section>;
}
