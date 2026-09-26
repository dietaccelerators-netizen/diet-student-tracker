import type { TopicProgress, TrackerState } from "@/lib/types";

export function getStudent(state: TrackerState, studentId: string) {
  return state.profiles.find((profile) => profile.id === studentId) ?? null;
}

export function getStudentPapers(state: TrackerState, studentId: string) {
  const student = getStudent(state, studentId);
  if (!student) return [];
  return state.papers.filter((paper) => student.paperIds.includes(paper.id)).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getPaperTopics(state: TrackerState, paperId: string) {
  return state.topics.filter((topic) => topic.paperId === paperId).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getProgressForTopic(state: TrackerState, studentId: string, topicId: string) {
  return state.progress.find((item) => item.studentId === studentId && item.topicId === topicId) ?? null;
}

export function getStudentProgress(state: TrackerState, studentId: string) {
  const student = getStudent(state, studentId);
  if (!student) return [];
  const activeTopicIds = new Set(
    state.topics.filter((topic) => student.paperIds.includes(topic.paperId)).map((topic) => topic.id),
  );
  return state.progress.filter((item) => item.studentId === studentId && activeTopicIds.has(item.topicId));
}

export function getPriorities(state: TrackerState, studentId: string) {
  return getStudentProgress(state, studentId).filter((item) => item.thisWeek);
}

export function countStatuses(items: TopicProgress[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

export function formatShortDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}
