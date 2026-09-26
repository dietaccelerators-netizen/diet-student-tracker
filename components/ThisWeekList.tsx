"use client";

import { useState } from "react";
import { PriorityItem } from "@/components/PriorityItem";
import { useTracker } from "@/components/TrackerProvider";
import { getPaperTopics, getPriorities, getProgressForTopic, getStudentPapers } from "@/lib/selectors";

export function ThisWeekList({ studentId, adminStudentId }: { studentId: string; adminStudentId?: string }) {
  const { state, addPriority } = useTracker();
  const [choosing, setChoosing] = useState(false);
  const priorities = getPriorities(state, studentId);
  const studentPapers = getStudentPapers(state, studentId);
  const choices = studentPapers.flatMap((paper) => getPaperTopics(state, paper.id).map((topic) => ({ paper, topic, progress: getProgressForTopic(state, studentId, topic.id) }))).filter((item) => item.progress && !item.progress.thisWeek).slice(0, 10);

  return (
    <section className="py-8 sm:py-10" aria-labelledby={`this-week-${studentId}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#68716B]">Focus</p>
          <h2 id={`this-week-${studentId}`} className="editorial mt-1 text-3xl font-medium">This Week</h2>
        </div>
        {priorities.length > 0 && <span className="text-xs text-[#7A837D]">Keep this list short.</span>}
      </div>

      {priorities.length === 0 ? (
        <div className="border-y border-[#E4E8E5] py-7">
          <p className="font-medium">Nothing has been added for this week yet.</p>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#68716B]">Choose the few topics that genuinely deserve your attention now.</p>
        </div>
      ) : (
        <div className="focus-route route-motif divide-y divide-[#EDF0EE] border-y border-[#E4E8E5]">
          {priorities.map((progress) => {
            const topic = state.topics.find((item) => item.id === progress.topicId)!;
            const paper = state.papers.find((item) => item.id === topic.paperId)!;
            return <PriorityItem key={progress.id} paper={paper} topic={topic} progress={progress} adminStudentId={adminStudentId} />;
          })}
        </div>
      )}

      <div className="mt-5">
        <button onClick={() => setChoosing((value) => !value)} className="secondary-action focus-ring min-h-11 rounded-md border border-[#C9D2CC] bg-white px-4 text-sm font-semibold text-[#365B46] hover:border-[#365B46]">+ Add another priority</button>
      </div>

      {choosing && (
        <div className="mt-4 max-w-2xl rounded-lg border border-[#DDE3DF] bg-white p-3 shadow-[0_10px_30px_rgba(32,38,43,0.05)]">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#68716B]">Choose one topic</p>
          <div className="max-h-72 overflow-auto">
            {choices.map(({ paper, topic, progress }) => (
              <button key={topic.id} onClick={() => { if (progress) addPriority(progress.id); setChoosing(false); }} className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-3 text-left hover:bg-[#F7F8F7]">
                <span><span className="mr-2 text-xs font-semibold text-[#365B46]">{paper.code}</span><span className="text-sm font-medium">{topic.topicName}</span></span>
                <span className="text-sm text-[#7A837D]">Add</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
