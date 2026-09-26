"use client";

import Link from "next/link";
import { PaperDetailClient } from "@/components/PaperDetailClient";
import { StudentOverview } from "@/components/StudentOverview";
import { useTracker } from "@/components/TrackerProvider";
import { getStudent, getStudentProgress } from "@/lib/selectors";

export function AdminStudentPageClient({ studentId, paperId }: { studentId: string; paperId?: string }) {
  const { state } = useTracker();
  const student = getStudent(state, studentId);
  if (!student) {
    return <div className="py-12"><p>Student not found.</p><Link href="/admin" className="mt-4 inline-block font-semibold text-[#365B46]">← Back to students</Link></div>;
  }
  if (paperId) return <PaperDetailClient studentId={studentId} paperId={paperId} adminStudentId={studentId} />;

  const needs = getStudentProgress(state, studentId).filter((item) => item.status === "Needs Practice");
  return (
    <>
      <div className="pt-7"><Link href="/admin" className="focus-ring text-sm font-medium text-[#68716B] hover:text-[#365B46]">← Back to students</Link></div>
      <StudentOverview studentId={studentId} adminMode />
      <section className="border-t border-[#E4E8E5] py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#8C4E3E]">Needs Practice</p>
        {needs.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {needs.map((progress) => {
              const topic = state.topics.find((item) => item.id === progress.topicId)!;
              const paper = state.papers.find((item) => item.id === topic.paperId)!;
              return <Link key={progress.id} href={`/admin/students/${studentId}?paper=${paper.id}`} className="needs-card-enhanced focus-ring rounded-lg border border-[#E5D6D1] bg-[#FCF6F4] p-4"><span className="text-xs font-semibold tracking-[0.1em] text-[#8C4E3E]">{paper.code}</span><p className="mt-1 font-semibold">{topic.topicName}</p><p className="mt-2 text-sm text-[#68716B]">Next: {progress.nextStep || "Add a next step"}</p></Link>;
            })}
          </div>
        ) : <p className="mt-2 text-sm text-[#68716B]">No topics are currently marked Needs Practice.</p>}
      </section>
    </>
  );
}
