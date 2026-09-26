import Link from "next/link";
import { countStatuses, getPaperTopics, getProgressForTopic } from "@/lib/selectors";
import type { Paper, TrackerState } from "@/lib/types";

export function PaperProgressRow({ state, studentId, paper, adminStudentId }: { state: TrackerState; studentId: string; paper: Paper; adminStudentId?: string }) {
  const progress = getPaperTopics(state, paper.id)
    .map((topic) => getProgressForTopic(state, studentId, topic.id))
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const counts = countStatuses(progress);
  const total = getPaperTopics(state, paper.id).length;
  const percent = total ? Math.round(((counts["Okay"] ?? 0) / total) * 100) : 0;
  const summary = ["Okay", "Learning", "Needs Practice", "Not Started"].filter((status) => counts[status]).map((status) => `${counts[status]} ${status === "Needs Practice" ? "Need Practice" : status}`).join(" · ");
  const href = adminStudentId ? `/admin/students/${adminStudentId}?paper=${paper.id}` : `/papers/${paper.id}`;

  return (
    <Link href={href} className="paper-row-enhanced focus-ring group grid min-h-20 grid-cols-[1fr_auto] items-center gap-4 border-b border-[#E7EBE8] py-5 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-[0.08em] text-[#365B46]">{paper.code}</span>
          <span className="hidden truncate text-sm text-[#68716B] sm:inline">{paper.name}</span>
        </div>
        <div className="paper-meter" role="progressbar" aria-label={`${paper.code} topics marked okay`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
        <p className="mt-2 text-xs leading-5 text-[#68716B]">{summary || "No updates yet"}</p>
      </div>
      <span aria-hidden="true" className="text-lg text-[#96A099] transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
