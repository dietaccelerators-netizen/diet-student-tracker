import type { TopicStatus } from "@/lib/types";

const styles: Record<TopicStatus, string> = {
  "Not Started": "border-[#DFE3E0] bg-[#F5F6F5] text-[#5C655F]",
  Learning: "border-[#E7DCC8] bg-[#F4F0E8] text-[#6C5E46]",
  "Needs Practice": "border-[#E8C5BA] bg-[#F7E7E2] text-[#8C4E3E]",
  Okay: "border-[#CFE2D0] bg-[#EDF6ED] text-[#365B46]",
};

export function StatusChip({ status }: { status: TopicStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>;
}
