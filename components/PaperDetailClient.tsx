"use client";

import Link from "next/link";
import { resourcesFor } from "@/lib/stages";
import { useTracker } from "@/components/TrackerProvider";
import { getPaperTopics, getProgressForTopic, getStudent } from "@/lib/selectors";
import type { QuestionPractice, TopicStatus } from "@/lib/types";

const statuses: TopicStatus[] = ["Not Started", "Learning", "Needs Practice", "Okay"];
const practices: QuestionPractice[] = ["Not Yet", "Attempted", "Reattempt"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7A837D]">{children}</span>;
}

export function PaperDetailClient({ studentId, paperId, adminStudentId }: { studentId: string; paperId: string; adminStudentId?: string }) {
  const { state, updateProgress } = useTracker();
  const paper = state.papers.find((item) => item.id === paperId);
  const student = getStudent(state, studentId);
  if (!paper || !student) return <p className="py-12">Paper not found.</p>;
  const backHref = adminStudentId ? `/admin/students/${adminStudentId}` : "/dashboard";
  if (!student.paperIds.includes(paperId)) {
    return <div className="py-12"><p className="font-semibold">This paper is not active in this tracker.</p><p className="mt-2 text-sm text-[#68716B]">Add it again from Manage Papers to restore its previous progress.</p><Link href={backHref} className="mt-5 inline-block font-semibold text-[#365B46]">← Back to tracker</Link></div>;
  }
  const topics = getPaperTopics(state, paperId);
  if (!topics.length) return <section className="empty-panel"><Link href={backHref}>← Back to my subjects</Link><h1 className="editorial mt-6 text-3xl">{paper.name}</h1><p className="mt-4">Your subject is ready. The DIET team will add its topic plan and lesson materials here.</p><a className="primary-button inline-block" href={resourcesFor(student.level)} target="_blank" rel="noreferrer">Open official ICAN resources ↗</a></section>;

  return (
    <>
      <div className="detail-hero border-b border-[#E4E8E5] pb-7 pt-8 sm:pb-9 sm:pt-12">
        <Link href={backHref} className="focus-ring text-sm font-medium text-[#68716B] hover:text-[#365B46]">← {adminStudentId ? "Back to student" : "Back to my papers"}</Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-[#365B46]">{paper.code}</p>
        <h1 className="editorial mt-2 max-w-3xl text-4xl font-medium leading-[1.05] sm:text-5xl">{paper.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#68716B]">Update only what changed. The tracker should take less than a minute to maintain.</p>
      </div>

      <section className="py-7 sm:py-9">
        <div className="tracker-table hidden overflow-hidden rounded-lg border border-[#DDE3DF] bg-white lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#F7F8F7] text-xs uppercase tracking-[0.08em] text-[#69736D]">
              <tr>
                <th className="px-4 py-3 font-semibold">Topic</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Question Practice</th>
                <th className="px-3 py-3 font-semibold">Last Studied</th>
                <th className="px-3 py-3 font-semibold">Next Step</th>
                <th className="px-3 py-3 text-center font-semibold">This Week</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => {
                const progress = getProgressForTopic(state, studentId, topic.id);
                if (!progress) return null;
                return (
                  <tr key={topic.id} className="border-t border-[#E9ECEA] align-top">
                    <td className="px-4 py-4 font-semibold text-[#303832]">{topic.topicName}</td>
                    <td className="px-3 py-3"><select aria-label={`${topic.topicName} status`} value={progress.status} onChange={(e) => updateProgress(progress.id, { status: e.target.value as TopicStatus })} className="focus-ring min-h-10 w-36 rounded-md border border-[#D5DBD7] bg-white px-2 text-sm">{statuses.map((value) => <option key={value}>{value}</option>)}</select></td>
                    <td className="px-3 py-3"><select aria-label={`${topic.topicName} question practice`} value={progress.questionPractice} onChange={(e) => updateProgress(progress.id, { questionPractice: e.target.value as QuestionPractice })} className="focus-ring min-h-10 w-32 rounded-md border border-[#D5DBD7] bg-white px-2 text-sm">{practices.map((value) => <option key={value}>{value}</option>)}</select></td>
                    <td className="px-3 py-3"><input aria-label={`${topic.topicName} last studied`} type="date" value={progress.lastStudied ?? ""} onChange={(e) => updateProgress(progress.id, { lastStudied: e.target.value || null })} className="focus-ring min-h-10 w-[140px] rounded-md border border-[#D5DBD7] bg-white px-2 text-sm" /></td>
                    <td className="px-3 py-3"><input aria-label={`${topic.topicName} next step`} value={progress.nextStep} placeholder="What should happen next?" onChange={(e) => updateProgress(progress.id, { nextStep: e.target.value })} className="focus-ring min-h-10 min-w-[220px] rounded-md border border-[#D5DBD7] bg-white px-3 text-sm" /></td>
                    <td className="px-3 py-4 text-center"><input aria-label={`Add ${topic.topicName} to this week`} type="checkbox" checked={progress.thisWeek} onChange={(e) => updateProgress(progress.id, { thisWeek: e.target.checked })} className="h-5 w-5 accent-[#365B46]" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 lg:hidden">
          {topics.map((topic) => {
            const progress = getProgressForTopic(state, studentId, topic.id);
            if (!progress) return null;
            return (
              <article key={topic.id} className="topic-card-enhanced rounded-lg border border-[#DDE3DF] bg-white p-4">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-base font-semibold">{topic.topicName}</h2>
                  <label className="flex min-h-11 items-center gap-2 text-xs font-semibold text-[#5C655F]"><input type="checkbox" checked={progress.thisWeek} onChange={(e) => updateProgress(progress.id, { thisWeek: e.target.checked })} className="h-5 w-5 accent-[#365B46]" /> This Week</label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label><FieldLabel>Status</FieldLabel><select value={progress.status} onChange={(e) => updateProgress(progress.id, { status: e.target.value as TopicStatus })} className="focus-ring min-h-11 w-full rounded-md border border-[#D5DBD7] bg-white px-3 text-sm">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label><FieldLabel>Question Practice</FieldLabel><select value={progress.questionPractice} onChange={(e) => updateProgress(progress.id, { questionPractice: e.target.value as QuestionPractice })} className="focus-ring min-h-11 w-full rounded-md border border-[#D5DBD7] bg-white px-3 text-sm">{practices.map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label><FieldLabel>Last Studied</FieldLabel><input type="date" value={progress.lastStudied ?? ""} onChange={(e) => updateProgress(progress.id, { lastStudied: e.target.value || null })} className="focus-ring min-h-11 w-full rounded-md border border-[#D5DBD7] bg-white px-3 text-sm" /></label>
                  <label className="sm:col-span-2"><FieldLabel>Next Step</FieldLabel><input value={progress.nextStep} placeholder="What should happen next?" onChange={(e) => updateProgress(progress.id, { nextStep: e.target.value })} className="focus-ring min-h-11 w-full rounded-md border border-[#D5DBD7] bg-white px-3 text-sm" /></label>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
