"use client";
import Link from 'next/link';
import { SubjectLearning } from './SubjectLearning';
import { useTracker } from './TrackerProvider';
import { getPaperTopics, getStudent } from '@/lib/selectors';
export function PaperDetailClient({studentId,paperId,adminStudentId}:{studentId:string;paperId:string;adminStudentId?:string}) {
 const {state,updateProgress}=useTracker();
 const paper=state.papers.find(p=>p.id===paperId),student=getStudent(state,studentId);
 const backHref=adminStudentId?`/admin/students/${adminStudentId}`:'/dashboard?view=subjects';
 if(!paper||!student)return <p className="py-12">Subject not found.</p>;
 if(!student.paperIds.includes(paperId))return <section className="empty-panel"><h1>This subject is not active in your tracker.</h1><Link href={backHref}>← Back to my subjects</Link></section>;
 return <SubjectLearning key={paperId} paper={paper} topics={getPaperTopics(state,paperId)} progress={state.progress.filter(p=>p.studentId===studentId)} level={student.level} backHref={backHref} onUpdate={updateProgress}/>;
}
