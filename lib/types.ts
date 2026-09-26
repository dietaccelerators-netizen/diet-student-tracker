export type Role = "student" | "admin";
export type TopicStatus = "Not Started" | "Learning" | "Needs Practice" | "Okay";
export type QuestionPractice = "Not Yet" | "Attempted" | "Reattempt";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  examDiet: string;
  level: string;
  paperIds: string[];
}

export interface NewStudentInput {
  fullName: string;
  email: string;
  examDiet: string;
  level: string;
  paperIds: string[];
}

export interface Paper {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

export interface Topic {
  id: string;
  paperId: string;
  topicName: string;
  displayOrder: number;
}

export interface TopicProgress {
  id: string;
  studentId: string;
  topicId: string;
  status: TopicStatus;
  questionPractice: QuestionPractice;
  lastStudied: string | null;
  nextStep: string;
  thisWeek: boolean;
  updatedAt: string;
}

export interface TrackerState {
  profiles: Profile[];
  papers: Paper[];
  topics: Topic[];
  progress: TopicProgress[];
}
