import type { Paper, Profile, TopicProgress } from "@/lib/types";

export interface TrackerRepository {
  getStudent(studentId: string): Promise<Profile | null>;
  getStudentPapers(studentId: string): Promise<Paper[]>;
  getPaperProgress(studentId: string, paperId: string): Promise<TopicProgress[]>;
  updateTopicProgress(progressId: string, patch: Partial<TopicProgress>): Promise<void>;
}

// Stage 1 uses in-browser demo state. Stage 2 should implement this same
// contract with Supabase so UI components do not need to be rebuilt.
