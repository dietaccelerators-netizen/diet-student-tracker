"use client";

import { useTracker } from "@/components/TrackerProvider";
import { StudentGreeting } from "@/components/StudentGreeting";
import { ThisWeekList } from "@/components/ThisWeekList";
import { PaperProgressRow } from "@/components/PaperProgressRow";
import { ManagePapers } from "@/components/ManagePapers";
import { getStudent, getStudentPapers, getStudentProgress } from "@/lib/selectors";

export function StudentOverview({ studentId, adminMode = false }: { studentId: string; adminMode?: boolean }) {
  const { state } = useTracker();
  const student = getStudent(state, studentId);
  if (!student) return <p className="py-12">Student not found.</p>;
  const papers = getStudentPapers(state, studentId);
  const progress = getStudentProgress(state, studentId);
  const total = state.topics.filter(topic => student.paperIds.includes(topic.paperId)).length;
  const comfortable = progress.filter(item => item.status === "Okay").length;
  const learning = progress.filter(item => item.status === "Learning").length;
  const needs = progress.filter(item => item.status === "Needs Practice").length;

  return (
    <>
      <StudentGreeting name={student.fullName} examDiet={student.examDiet} level={student.level} />
      <section className="pulse-grid" aria-label="Your preparation at a glance">
        <div className="pulse-card pulse-green"><span className="pulse-label">Feeling confident</span><strong>{comfortable}<small> / {total}</small></strong><span>topics marked okay</span></div>
        <div className="pulse-card pulse-blue"><span className="pulse-label">In the making</span><strong>{learning}</strong><span>topics you’re learning</span></div>
        <div className="pulse-card pulse-peach"><span className="pulse-label">Your next opportunity</span><strong>{needs}</strong><span>topics needing practice</span></div>
      </section>
      <ThisWeekList studentId={studentId} adminStudentId={adminMode ? studentId : undefined} />
      <section className="border-t border-[#E4E8E5] py-8 sm:py-10" aria-labelledby={`papers-${studentId}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#68716B]">Progress</p>
            <h2 id={`papers-${studentId}`} className="editorial mt-1 text-3xl font-medium">My Papers</h2>
            <p className="mt-2 text-sm text-[#68716B]">Your tracker currently follows {papers.length} {papers.length === 1 ? "paper" : "papers"}.</p>
          </div>
          <ManagePapers studentId={studentId} adminMode={adminMode} />
        </div>

        {papers.length > 0 ? (
          <div className="paper-list-enhanced mt-5 border-y border-[#E4E8E5]">
            {papers.map((paper) => <PaperProgressRow key={paper.id} state={state} studentId={studentId} paper={paper} adminStudentId={adminMode ? studentId : undefined} />)}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-[#DDE4DF] bg-white p-6">
            <p className="font-semibold">No papers have been added yet.</p>
            <p className="mt-2 text-sm leading-6 text-[#68716B]">Choose the papers you are preparing for and the tracker will build itself around them.</p>
          </div>
        )}
      </section>
    </>
  );
}
