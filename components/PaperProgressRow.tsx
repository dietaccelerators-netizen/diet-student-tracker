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
    <Link href={href} className="paper-row-enhanced course-card focus-ring group">
      <div className="image-slot course-image" aria-label={`Reserved cover image for ${paper.code}`}><span>{paper.code}</span><small>PAPER COVER</small></div>
      <div className="course-card-body min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-[0.08em] text-[#365B46]">{paper.code}</span>
          <span className="course-name">{paper.name}</span>
        </div>
        <div className="paper-meter" role="progressbar" aria-label={`${paper.code} topics marked okay`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
        <p className="mt-2 text-xs leading-5 text-[#68716B]">{summary || "No updates yet"}</p>
      </div>
      <div className="course-card-footer"><span>Open paper</span><span aria-hidden="true">→</span></div>
    </Link>
  );
}
