import type { SupabaseClient } from "@supabase/supabase-js";
import type { Paper, Profile, Topic, TopicProgress, TrackerState } from "@/lib/types";

export const emptyTrackerState: TrackerState = {
  profiles: [],
  papers: [],
  topics: [],
  progress: [],
};

function profileFromRow(row: any, paperIds: string[]): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    examDiet: row.exam_diet ?? "",
    level: row.level ?? "",
    paperIds,
  };
}

function paperFromRow(row: any): Paper {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    displayOrder: row.display_order,
  };
}

function topicFromRow(row: any): Topic {
  return {
    id: row.id,
    paperId: row.paper_id,
    topicName: row.topic_name,
    displayOrder: row.display_order,
  };
}

function progressFromRow(row: any): TopicProgress {
  return {
    id: row.id,
    studentId: row.student_id,
    topicId: row.topic_id,
    status: row.status,
    questionPractice: row.question_practice,
    lastStudied: row.last_studied,
    nextStep: row.next_step ?? "",
    thisWeek: row.this_week,
    updatedAt: row.updated_at,
  };
}

export async function loadTrackerState(supabase: SupabaseClient): Promise<TrackerState> {
  const [profilesResult, papersResult, assignmentsResult, topicsResult, progressResult] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role, exam_diet, level, created_at"),
      supabase.from("papers").select("id, code, name, display_order").order("display_order"),
      supabase.from("student_papers").select("student_id, paper_id"),
      supabase.from("topics").select("id, paper_id, topic_name, display_order").order("display_order"),
      supabase
        .from("topic_progress")
        .select("id, student_id, topic_id, status, question_practice, last_studied, next_step, this_week, updated_at"),
    ]);

  const errors = [
    profilesResult.error,
    papersResult.error,
    assignmentsResult.error,
    topicsResult.error,
    progressResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw errors[0];
  }

  const assignments = assignmentsResult.data ?? [];
  const paperIdsByStudent = new Map<string, string[]>();
  for (const row of assignments) {
    const current = paperIdsByStudent.get(row.student_id) ?? [];
    current.push(row.paper_id);
    paperIdsByStudent.set(row.student_id, current);
  }

  return {
    profiles: (profilesResult.data ?? []).map((row) =>
      profileFromRow(row, paperIdsByStudent.get(row.id) ?? []),
    ),
    papers: (papersResult.data ?? []).map(paperFromRow),
    topics: (topicsResult.data ?? []).map(topicFromRow),
    progress: (progressResult.data ?? []).map(progressFromRow),
  };
}

export function progressPatchToRow(patch: Partial<TopicProgress>) {
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.questionPractice !== undefined) row.question_practice = patch.questionPractice;
  if (patch.lastStudied !== undefined) row.last_studied = patch.lastStudied;
  if (patch.nextStep !== undefined) row.next_step = patch.nextStep;
  if (patch.thisWeek !== undefined) row.this_week = patch.thisWeek;
  return row;
}
