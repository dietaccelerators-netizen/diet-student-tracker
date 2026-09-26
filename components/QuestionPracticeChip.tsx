import type { QuestionPractice } from "@/lib/types";

export function QuestionPracticeChip({ value }: { value: QuestionPractice }) {
  return <span className="inline-flex rounded-full border border-[#E1E5E2] bg-white px-2.5 py-1 text-xs font-medium text-[#4D5650]">{value}</span>;
}
