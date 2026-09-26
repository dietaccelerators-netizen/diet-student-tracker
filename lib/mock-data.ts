import type { Paper, Profile, Topic, TopicProgress, TrackerState } from "@/lib/types";

export const papers: Paper[] = [
  { id: "sbr", code: "SBR", name: "Strategic Business Reporting", displayOrder: 1 },
  { id: "aaaf", code: "AAAF", name: "Advanced Audit, Assurance and Forensics", displayOrder: 2 },
  { id: "sfm", code: "SFM", name: "Strategic Financial Management", displayOrder: 3 },
  { id: "atax", code: "ATAX", name: "Advanced Taxation", displayOrder: 4 },
  { id: "case-study", code: "CASE STUDY", name: "Case Study", displayOrder: 5 },
];

const topicMap: Record<string, string[]> = {
  sbr: ["Group Accounts", "Revenue", "Financial Instruments", "Leases", "Analysis and Interpretation"],
  aaaf: ["Audit Risk", "Audit Procedures", "Audit Evidence", "Group Audits", "Audit Reporting"],
  sfm: ["Investment Appraisal", "Cost of Capital", "Business Valuation", "Foreign Exchange", "Risk Management"],
  atax: ["Company Tax Computation", "Personal Income Tax", "VAT", "International Tax", "Tax Planning"],
  "case-study": ["Understanding the Business", "Financial Analysis", "Non-Financial Analysis", "Recommendations", "Report Writing"],
};

export const topics: Topic[] = Object.entries(topicMap).flatMap(([paperId, names]) =>
  names.map((topicName, index) => ({
    id: `${paperId}-${index + 1}`,
    paperId,
    topicName,
    displayOrder: index + 1,
  })),
);

export const profiles: Profile[] = [
  {
    id: "tolulope",
    fullName: "Tolulope Abraham",
    email: "tolulope@demo.diet.local",
    role: "student",
    examDiet: "November 2026",
    level: "Professional Level",
    paperIds: papers.map((paper) => paper.id),
  },
  {
    id: "ada",
    fullName: "Ada Okafor",
    email: "ada@demo.diet.local",
    role: "student",
    examDiet: "November 2026",
    level: "Professional Level",
    paperIds: ["sbr", "aaaf", "sfm", "atax"],
  },
  {
    id: "admin-demo",
    fullName: "DIET Admin",
    email: "admin@demo.diet.local",
    role: "admin",
    examDiet: "",
    level: "",
    paperIds: [],
  },
];

function progressFor(
  studentId: string,
  paperId: string,
  topicName: string,
  overrides: Partial<TopicProgress>,
): TopicProgress {
  const topic = topics.find((item) => item.paperId === paperId && item.topicName === topicName)!;
  return {
    id: `${studentId}-${topic.id}`,
    studentId,
    topicId: topic.id,
    status: "Not Started",
    questionPractice: "Not Yet",
    lastStudied: null,
    nextStep: "",
    thisWeek: false,
    updatedAt: "2026-09-18T20:00:00.000Z",
    ...overrides,
  };
}

function blankProgress(studentId: string, topic: Topic): TopicProgress {
  return {
    id: `${studentId}-${topic.id}`,
    studentId,
    topicId: topic.id,
    status: "Not Started",
    questionPractice: "Not Yet",
    lastStudied: null,
    nextStep: "",
    thisWeek: false,
    updatedAt: "2026-09-18T20:00:00.000Z",
  };
}

const tolulopeBase = topics.map((topic) => blankProgress("tolulope", topic));
const tolulopeOverrides: TopicProgress[] = [
  progressFor("tolulope", "sbr", "Group Accounts", { status: "Needs Practice", questionPractice: "Reattempt", nextStep: "Redo one consolidation question without notes", thisWeek: false, lastStudied: "2026-09-21", updatedAt: "2026-09-21T21:00:00.000Z" }),
  progressFor("tolulope", "sbr", "Financial Instruments", { status: "Learning", questionPractice: "Not Yet", nextStep: "Attempt one past question", thisWeek: true, lastStudied: "2026-09-25", updatedAt: "2026-09-25T20:10:00.000Z" }),
  progressFor("tolulope", "aaaf", "Audit Procedures", { status: "Needs Practice", questionPractice: "Reattempt", nextStep: "Write more specific procedures", thisWeek: true, lastStudied: "2026-09-20", updatedAt: "2026-09-24T19:40:00.000Z" }),
  progressFor("tolulope", "aaaf", "Audit Risk", { status: "Learning", questionPractice: "Attempted", nextStep: "Practise another scenario", thisWeek: false, lastStudied: "2026-09-19", updatedAt: "2026-09-19T20:00:00.000Z" }),
  progressFor("tolulope", "sfm", "Foreign Exchange", { status: "Needs Practice", questionPractice: "Attempted", nextStep: "Review hedge selection, then reattempt", thisWeek: true, lastStudied: "2026-09-23", updatedAt: "2026-09-23T20:25:00.000Z" }),
  progressFor("tolulope", "atax", "Company Tax Computation", { status: "Needs Practice", questionPractice: "Reattempt", nextStep: "Redo capital allowance sequence", thisWeek: true, lastStudied: "2026-09-22", updatedAt: "2026-09-22T18:50:00.000Z" }),
  progressFor("tolulope", "case-study", "Financial Analysis", { status: "Learning", questionPractice: "Attempted", nextStep: "Practise another case", thisWeek: false, lastStudied: "2026-09-18", updatedAt: "2026-09-18T20:00:00.000Z" }),
];

const overrideIds = new Set(tolulopeOverrides.map((item) => item.id));
const mergedTolulope = tolulopeBase.map((item) => tolulopeOverrides.find((override) => override.id === item.id) ?? item).filter((item) => overrideIds.has(item.id) || true);

const adaTopics = topics.filter((topic) => ["sbr", "aaaf", "sfm", "atax"].includes(topic.paperId));
const adaBase = adaTopics.map((topic) => blankProgress("ada", topic));
const adaOverrides = [
  progressFor("ada", "sbr", "Revenue", { status: "Okay", questionPractice: "Attempted", nextStep: "Move to Financial Instruments", lastStudied: "2026-09-24", updatedAt: "2026-09-24T19:00:00.000Z" }),
  progressFor("ada", "aaaf", "Audit Evidence", { status: "Needs Practice", questionPractice: "Reattempt", nextStep: "Redo one evidence question", thisWeek: true, lastStudied: "2026-09-25", updatedAt: "2026-09-25T18:00:00.000Z" }),
  progressFor("ada", "sfm", "Business Valuation", { status: "Learning", questionPractice: "Attempted", nextStep: "Review valuation assumptions", thisWeek: true, lastStudied: "2026-09-25", updatedAt: "2026-09-25T18:30:00.000Z" }),
  progressFor("ada", "atax", "VAT", { status: "Needs Practice", questionPractice: "Attempted", nextStep: "Rework VAT treatment", lastStudied: "2026-09-23", updatedAt: "2026-09-23T18:00:00.000Z" }),
];
const mergedAda = adaBase.map((item) => adaOverrides.find((override) => override.id === item.id) ?? item);

export const initialTrackerState: TrackerState = {
  profiles,
  papers,
  topics,
  progress: [...mergedTolulope, ...mergedAda],
};
