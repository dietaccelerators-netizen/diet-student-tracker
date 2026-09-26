"use client";

import Link from "next/link";
import { useState } from "react";
import { useTracker } from "@/components/TrackerProvider";
import { StatusChip } from "@/components/StatusChip";
import type { Paper, Topic, TopicProgress } from "@/lib/types";

export function PriorityItem({ paper, topic, progress, adminStudentId }: { paper: Paper; topic: Topic; progress: TopicProgress; adminStudentId?: string }) {
  const { updateProgress, removePriority } = useTracker();
  const [editing, setEditing] = useState(false);
  const href = adminStudentId ? `/admin/students/${adminStudentId}?paper=${paper.id}` : `/papers/${paper.id}`;

  return (
    <div className="grid grid-cols-[20px_1fr] gap-3 py-5 first:pt-1">
      <div className="pt-2"><div className="route-dot" /></div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.13em] text-[#365B46]">{paper.code}</p>
            <Link href={href} className="focus-ring mt-1 inline-block rounded-sm text-base font-semibold text-[#20262B] hover:text-[#365B46]">{topic.topicName}</Link>
          </div>
          <StatusChip status={progress.status} />
        </div>
        {editing ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor={`next-${progress.id}`}>Next step</label>
            <input id={`next-${progress.id}`} value={progress.nextStep} onChange={(event) => updateProgress(progress.id, { nextStep: event.target.value })} className="focus-ring min-h-11 flex-1 rounded-md border border-[#CBD3CE] bg-white px-3 text-sm" />
            <button onClick={() => setEditing(false)} className="focus-ring min-h-11 rounded-md bg-[#365B46] px-4 text-sm font-semibold text-white">Done</button>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-[#5B645E]"><span className="font-medium text-[#303832]">Next:</span> {progress.nextStep || "Add a clear next step"}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-[#68716B]">
          <button onClick={() => setEditing((value) => !value)} className="focus-ring rounded-sm hover:text-[#20262B]">Edit next step</button>
          <button onClick={() => removePriority(progress.id)} className="focus-ring rounded-sm hover:text-[#8C4E3E]">Remove from this week</button>
        </div>
      </div>
    </div>
  );
}
