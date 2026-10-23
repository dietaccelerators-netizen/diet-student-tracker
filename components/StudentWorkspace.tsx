"use client";
import { Settings } from './Settings';
import { HelpSupport } from './HelpSupport';
import { StudyResources } from './StudyResources';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LearningReportOverview } from './LearningReportOverview';
import { useTracker } from './TrackerProvider';
import { PracticeRoom } from './PracticeRoom';
import { StudentSubjects } from './StudentSubjects';
import { StudentOverview } from './StudentOverview';
import { WeeklyPlan } from './WeeklyPlan';
import { ManagePapers } from './ManagePapers';
import { getStudent, getStudentPapers, getStudentProgress } from '@/lib/selectors';
import { stageFor } from '@/lib/stages';
export function StudentWorkspace({studentId,view='home'}:{studentId:string;view?:string}) {
 const params=useSearchParams();
 const {state}=useTracker();
 const student=getStudent(state,studentId); if(!student) return <p>Unable to load your profile. Please sign in again.</p>;
 const papers=getStudentPapers(state,studentId), progress=getStudentProgress(state,studentId);
 const stage=stageFor(student.level), stageLabel=stage??student.level;
 const names:Record<string,string>={home:'My learning space',subjects:'My subjects',weekly:'Weekly plan',practice:'Practice room',report:'Learning report',profile:'My profile',resources:'Study resources',support:'Help & Support',settings:'Settings'};
 const selected=names[view]?view:'home';
 if(selected==='settings')return <Settings student={student} state={state}/>;
 if(selected==='resources')return <StudyResources key={studentId} papers={papers} studentId={studentId}/>;
 if(selected==='support')return <HelpSupport key={studentId} studentId={studentId}/>;
 if(selected==='report')return <LearningReportOverview key={studentId} state={state} studentId={studentId}/>;
 if(selected==='weekly')return <WeeklyPlan key={studentId} student={student} papers={papers}/>;
 if(selected==='subjects')return <StudentSubjects state={state} studentId={studentId} managePapers={<ManagePapers studentId={studentId}/>}/>;
 if(selected==='practice')return <PracticeRoom key={studentId+params.toString()} studentId={studentId} papers={papers} topics={state.topics}/>;
 return <div className="student-workspace"><div className={`workspace-toolbar ${selected==='home'?'home-toolbar-hidden':''}`}><div><span className="eyebrow">{stage?.startsWith('ATS')?'ATSWA':'ICAN'} / {stageLabel || 'Student'}</span><h1>{names[selected]}</h1></div><Link href="/dashboard?view=profile" className="student-avatar" aria-label="Open my profile">{student.fullName.split(' ').map(n=>n[0]).slice(0,2).join('')}</Link></div>
 {selected==='home' && <StudentOverview studentId={studentId}/>}
 {selected==='profile' && <section className="profile-panel"><span className="eyebrow">YOUR STUDENT ACCOUNT</span><h2>{student.fullName}</h2><dl className="profile-review"><div><dt>First name</dt><dd>{student.fullName.split(' ')[0]}</dd></div><div><dt>Last name</dt><dd>{student.fullName.split(' ').slice(1).join(' ')||'—'}</dd></div><div><dt>Email</dt><dd>{student.email}</dd></div><div><dt>Exam stage</dt><dd>{stageLabel||'Not set'}</dd></div><div><dt>Exam diet</dt><dd>{student.examDiet||'Not set yet'}</dd></div><div><dt>Active subjects</dt><dd>{papers.length}</dd></div></dl><p>Need to correct your name or move to another stage? Contact your Mastrevo coordinator so your saved progress stays connected to your account.</p><ManagePapers studentId={studentId}/></section>}
 </div>;
}
