// Illustrative snapshot supplied by the user. Never mixed with account records.
export /* =============================================================================
   TYPES
============================================================================= */
type LearningReportTab = "subjects" | "coverage-mastery" | "practice-performance" | "weak-areas" | "next-steps";
export type LearningStage = "Not Started" | "Studied" | "Reviewed" | "Practised" | "Strong";
export type TrendDirection = "up" | "down" | "stable";
export type RecommendationType = "study" | "review" | "practice" | "simulation" | "lecture-catch-up";
export type RecommendationPriority = "high" | "medium" | "normal";
export type DateRange = "4-weeks" | "8-weeks" | "12-weeks" | "all";
export type SubjectReport = {
    id: string;
    slug: string;
    code: string;
    name: string;
    coverage: number;
    mastery: number;
    practiceAverage: number;
    examReadiness: number;
    weakTopicCount: number;
    trend: TrendDirection;
    currentStage: LearningStage;
    topics: TopicReport[];
};
export type TopicReport = {
    id: string;
    slug: string;
    subjectCode: string;
    subjectSlug: string;
    name: string;
    syllabusWeight: number;
    totalSections: number;
    completedSections: number;
    coverage: number;
    reviewStatus: "Not Reviewed" | "Due" | "Reviewed";
    practiceAttempts: number;
    practiceAverage: number | null;
    mastery: number;
    learningStage: LearningStage;
    lastStudied?: string;
    lastPractised?: string;
    nextReview?: string;
    weak: boolean;
    weaknessReason?: string;
    recommendation?: string;
};
export type PracticeTrendPoint = {
    label: string;
    score: number;
};
export type QuestionTypePerformance = {
    type: string;
    attempts: number;
    average: number;
};
export type PracticeSourcePerformance = {
    source: string;
    attempts: number;
    average: number;
};
export type WeakArea = {
    id: string;
    subjectCode: string;
    subjectSlug: string;
    subjectName: string;
    topicSlug: string;
    topicName: string;
    accuracy: number;
    mastery: number;
    attempts: number;
    syllabusWeight: number;
    reason: string;
    priorityScore: number;
    nextAction: string;
    recommendedMinutes: number;
    recommendationType: "review" | "practice" | "study";
};
export type NextStepRecommendation = {
    id: string;
    subjectCode: string;
    subjectSlug: string;
    subjectName: string;
    topicSlug: string;
    topicName: string;
    title: string;
    description: string;
    type: RecommendationType;
    priority: RecommendationPriority;
    recommendedMinutes: number;
    reason: string;
    sentToWeeklyPlan: boolean;
};
export /* =============================================================================
   MOCK SUBJECT REPORT DATA

   Replace later with Supabase / calculated report data.
============================================================================= */
const subjectReports: SubjectReport[] = [
    {
        id: "atax",
        slug: "advanced-taxation",
        code: "ATAX",
        name: "Advanced Taxation",
        coverage: 58,
        mastery: 49,
        practiceAverage: 61,
        examReadiness: 54,
        weakTopicCount: 2,
        trend: "up",
        currentStage: "Practised",
        topics: [
            {
                id: "pit",
                slug: "personal-income-tax",
                subjectCode: "ATAX",
                subjectSlug: "advanced-taxation",
                name: "Personal Income Tax",
                syllabusWeight: 15,
                totalSections: 8,
                completedSections: 8,
                coverage: 100,
                reviewStatus: "Reviewed",
                practiceAttempts: 8,
                practiceAverage: 78,
                mastery: 76,
                learningStage: "Strong",
                lastStudied: "9 Oct 2026",
                lastPractised: "15 Oct 2026",
                nextReview: "24 Oct 2026",
                weak: false,
            },
            {
                id: "cgt",
                slug: "capital-gains-tax",
                subjectCode: "ATAX",
                subjectSlug: "advanced-taxation",
                name: "Capital Gains Tax",
                syllabusWeight: 10,
                totalSections: 7,
                completedSections: 4,
                coverage: 57,
                reviewStatus: "Due",
                practiceAttempts: 5,
                practiceAverage: 64,
                mastery: 56,
                learningStage: "Practised",
                lastStudied: "19 Oct 2026",
                lastPractised: "19 Oct 2026",
                nextReview: "22 Oct 2026",
                weak: false,
                recommendation: "Complete the remaining CGT sections before moving into heavier exam practice.",
            },
            {
                id: "cit",
                slug: "companies-income-tax",
                subjectCode: "ATAX",
                subjectSlug: "advanced-taxation",
                name: "Companies Income Tax",
                syllabusWeight: 20,
                totalSections: 9,
                completedSections: 3,
                coverage: 33,
                reviewStatus: "Not Reviewed",
                practiceAttempts: 2,
                practiceAverage: 51,
                mastery: 39,
                learningStage: "Studied",
                lastStudied: "12 Oct 2026",
                weak: true,
                weaknessReason: "Low coverage and limited practice in a high-weight syllabus area.",
                recommendation: "Continue structured learning before attempting longer exam questions.",
            },
            {
                id: "vat",
                slug: "value-added-tax",
                subjectCode: "ATAX",
                subjectSlug: "advanced-taxation",
                name: "Value Added Tax",
                syllabusWeight: 15,
                totalSections: 6,
                completedSections: 5,
                coverage: 83,
                reviewStatus: "Due",
                practiceAttempts: 6,
                practiceAverage: 42,
                mastery: 38,
                learningStage: "Practised",
                lastStudied: "10 Oct 2026",
                lastPractised: "18 Oct 2026",
                nextReview: "20 Oct 2026",
                weak: true,
                weaknessReason: "Practice accuracy remains low despite high topic coverage.",
                recommendation: "Prioritise VAT computations and transaction classification.",
            },
            {
                id: "international",
                slug: "international-tax",
                subjectCode: "ATAX",
                subjectSlug: "advanced-taxation",
                name: "International Tax",
                syllabusWeight: 15,
                totalSections: 7,
                completedSections: 0,
                coverage: 0,
                reviewStatus: "Not Reviewed",
                practiceAttempts: 0,
                practiceAverage: null,
                mastery: 0,
                learningStage: "Not Started",
                weak: false,
            },
        ],
    },
    {
        id: "aaaf",
        slug: "advanced-audit-assurance-and-forensics",
        code: "AAAF",
        name: "Advanced Audit, Assurance and Forensics",
        coverage: 63,
        mastery: 57,
        practiceAverage: 68,
        examReadiness: 61,
        weakTopicCount: 1,
        trend: "up",
        currentStage: "Practised",
        topics: [
            {
                id: "audit-evidence",
                slug: "audit-evidence",
                subjectCode: "AAAF",
                subjectSlug: "advanced-audit-assurance-and-forensics",
                name: "Audit Evidence",
                syllabusWeight: 20,
                totalSections: 7,
                completedSections: 6,
                coverage: 86,
                reviewStatus: "Reviewed",
                practiceAttempts: 7,
                practiceAverage: 72,
                mastery: 68,
                learningStage: "Practised",
                lastStudied: "18 Oct 2026",
                lastPractised: "19 Oct 2026",
                nextReview: "26 Oct 2026",
                weak: false,
            },
            {
                id: "ethics",
                slug: "ethics",
                subjectCode: "AAAF",
                subjectSlug: "advanced-audit-assurance-and-forensics",
                name: "Ethics",
                syllabusWeight: 15,
                totalSections: 6,
                completedSections: 5,
                coverage: 83,
                reviewStatus: "Reviewed",
                practiceAttempts: 6,
                practiceAverage: 74,
                mastery: 71,
                learningStage: "Strong",
                weak: false,
            },
            {
                id: "audit-risk",
                slug: "audit-risk",
                subjectCode: "AAAF",
                subjectSlug: "advanced-audit-assurance-and-forensics",
                name: "Audit Risk",
                syllabusWeight: 18,
                totalSections: 6,
                completedSections: 4,
                coverage: 67,
                reviewStatus: "Due",
                practiceAttempts: 5,
                practiceAverage: 49,
                mastery: 43,
                learningStage: "Practised",
                lastPractised: "16 Oct 2026",
                weak: true,
                weaknessReason: "Repeated weakness when applying audit-risk principles to scenarios.",
                recommendation: "Practise identifying risks and linking each risk to the relevant financial statement assertion.",
            },
        ],
    },
    {
        id: "sbr",
        slug: "strategic-business-reporting",
        code: "SBR",
        name: "Strategic Business Reporting",
        coverage: 49,
        mastery: 46,
        practiceAverage: 59,
        examReadiness: 50,
        weakTopicCount: 1,
        trend: "stable",
        currentStage: "Reviewed",
        topics: [
            {
                id: "revenue",
                slug: "revenue-recognition",
                subjectCode: "SBR",
                subjectSlug: "strategic-business-reporting",
                name: "Revenue Recognition",
                syllabusWeight: 12,
                totalSections: 5,
                completedSections: 3,
                coverage: 60,
                reviewStatus: "Due",
                practiceAttempts: 3,
                practiceAverage: 52,
                mastery: 44,
                learningStage: "Practised",
                weak: true,
                weaknessReason: "Incomplete coverage and inconsistent application in written questions.",
                recommendation: "Complete the topic and then attempt one longer IFRS application question.",
            },
        ],
    },
    {
        id: "sfm",
        slug: "strategic-financial-management",
        code: "SFM",
        name: "Strategic Financial Management",
        coverage: 41,
        mastery: 45,
        practiceAverage: 64,
        examReadiness: 48,
        weakTopicCount: 1,
        trend: "up",
        currentStage: "Practised",
        topics: [
            {
                id: "investment-appraisal",
                slug: "investment-appraisal",
                subjectCode: "SFM",
                subjectSlug: "strategic-financial-management",
                name: "Investment Appraisal",
                syllabusWeight: 20,
                totalSections: 7,
                completedSections: 4,
                coverage: 57,
                reviewStatus: "Reviewed",
                practiceAttempts: 5,
                practiceAverage: 65,
                mastery: 58,
                learningStage: "Practised",
                weak: false,
            },
        ],
    },
];
export /* =============================================================================
   PRACTICE PERFORMANCE DATA
============================================================================= */
const overallPracticeTrend: PracticeTrendPoint[] = [
    {
        label: "Week 1",
        score: 48,
    },
    {
        label: "Week 2",
        score: 53,
    },
    {
        label: "Week 3",
        score: 58,
    },
    {
        label: "Week 4",
        score: 62,
    },
    {
        label: "Week 5",
        score: 66,
    },
    {
        label: "Week 6",
        score: 64,
    },
];
export const questionTypePerformance: QuestionTypePerformance[] = [
    {
        type: "Calculations",
        attempts: 18,
        average: 56,
    },
    {
        type: "Theory",
        attempts: 14,
        average: 71,
    },
    {
        type: "Scenarios",
        attempts: 12,
        average: 59,
    },
    {
        type: "Short Recall",
        attempts: 26,
        average: 76,
    },
    {
        type: "Report Writing",
        attempts: 6,
        average: 52,
    },
];
export const practiceSourcePerformance: PracticeSourcePerformance[] = [
    {
        source: "Quick Review",
        attempts: 24,
        average: 76,
    },
    {
        source: "Past Questions",
        attempts: 18,
        average: 58,
    },
    {
        source: "Exam Focus",
        attempts: 16,
        average: 55,
    },
    {
        source: "Simulations",
        attempts: 5,
        average: 61,
    },
];
export /* =============================================================================
   WEAK AREAS
============================================================================= */
const initialWeakAreas: WeakArea[] = [
    {
        id: "weak-vat",
        subjectCode: "ATAX",
        subjectSlug: "advanced-taxation",
        subjectName: "Advanced Taxation",
        topicSlug: "value-added-tax",
        topicName: "VAT Computations",
        accuracy: 42,
        mastery: 38,
        attempts: 6,
        syllabusWeight: 15,
        reason: "Practice accuracy remains low even though most of the topic has already been studied.",
        priorityScore: 92,
        nextAction: "Review transaction classification, then complete a focused VAT computation session.",
        recommendedMinutes: 40,
        recommendationType: "practice",
    },
    {
        id: "weak-cit",
        subjectCode: "ATAX",
        subjectSlug: "advanced-taxation",
        subjectName: "Advanced Taxation",
        topicSlug: "companies-income-tax",
        topicName: "Companies Income Tax",
        accuracy: 51,
        mastery: 39,
        attempts: 2,
        syllabusWeight: 20,
        reason: "This is a high-weight syllabus area, but coverage and practice remain limited.",
        priorityScore: 88,
        nextAction: "Continue structured learning before attempting a longer exam question.",
        recommendedMinutes: 90,
        recommendationType: "study",
    },
    {
        id: "weak-audit-risk",
        subjectCode: "AAAF",
        subjectSlug: "advanced-audit-assurance-and-forensics",
        subjectName: "Advanced Audit, Assurance and Forensics",
        topicSlug: "audit-risk",
        topicName: "Audit Risk",
        accuracy: 49,
        mastery: 43,
        attempts: 5,
        syllabusWeight: 18,
        reason: "Scenario application remains inconsistent across recent practice attempts.",
        priorityScore: 79,
        nextAction: "Practise identifying risks and linking each one to the appropriate assertion.",
        recommendedMinutes: 45,
        recommendationType: "practice",
    },
    {
        id: "weak-revenue",
        subjectCode: "SBR",
        subjectSlug: "strategic-business-reporting",
        subjectName: "Strategic Business Reporting",
        topicSlug: "revenue-recognition",
        topicName: "Revenue Recognition",
        accuracy: 52,
        mastery: 44,
        attempts: 3,
        syllabusWeight: 12,
        reason: "Topic coverage is incomplete and written application remains below target.",
        priorityScore: 67,
        nextAction: "Complete the outstanding study section, then attempt one longer application question.",
        recommendedMinutes: 75,
        recommendationType: "review",
    },
];
export /* =============================================================================
   NEXT STEPS
============================================================================= */
const initialRecommendations: NextStepRecommendation[] = [
    {
        id: "next-vat",
        subjectCode: "ATAX",
        subjectSlug: "advanced-taxation",
        subjectName: "Advanced Taxation",
        topicSlug: "value-added-tax",
        topicName: "VAT Computations",
        title: "Practise VAT computations",
        description: "Complete a focused calculation session covering transaction classification, input VAT and output VAT.",
        type: "practice",
        priority: "high",
        recommendedMinutes: 40,
        reason: "Accuracy is currently 42% across recent VAT attempts.",
        sentToWeeklyPlan: false,
    },
    {
        id: "next-cit",
        subjectCode: "ATAX",
        subjectSlug: "advanced-taxation",
        subjectName: "Advanced Taxation",
        topicSlug: "companies-income-tax",
        topicName: "Companies Income Tax",
        title: "Continue Companies Income Tax",
        description: "Return to My Subjects and complete the next structured learning section before adding heavier practice.",
        type: "study",
        priority: "high",
        recommendedMinutes: 90,
        reason: "Coverage remains low in a high-weight syllabus area.",
        sentToWeeklyPlan: false,
    },
    {
        id: "next-audit",
        subjectCode: "AAAF",
        subjectSlug: "advanced-audit-assurance-and-forensics",
        subjectName: "Advanced Audit, Assurance and Forensics",
        topicSlug: "audit-risk",
        topicName: "Audit Risk",
        title: "Audit Risk scenario practice",
        description: "Complete one scenario-based practice session focusing on risk identification and assertions.",
        type: "practice",
        priority: "medium",
        recommendedMinutes: 45,
        reason: "Recent performance indicates difficulty applying the principles to scenarios.",
        sentToWeeklyPlan: false,
    },
    {
        id: "next-cgt-review",
        subjectCode: "ATAX",
        subjectSlug: "advanced-taxation",
        subjectName: "Advanced Taxation",
        topicSlug: "capital-gains-tax",
        topicName: "Capital Gains Tax",
        title: "Review Capital Gains Tax",
        description: "A short review is due after the recent study and practice work.",
        type: "review",
        priority: "normal",
        recommendedMinutes: 25,
        reason: "The topic is due for recall before the next longer practice attempt.",
        sentToWeeklyPlan: false,
    },
    {
        id: "next-simulation",
        subjectCode: "MIXED",
        subjectSlug: "weekly-simulation",
        subjectName: "Weekly Simulation",
        topicSlug: "mixed-practice",
        topicName: "Mixed Practice",
        title: "Complete your weekly simulation",
        description: "Use a timed simulation to check whether this week's learning can be applied under exam conditions.",
        type: "simulation",
        priority: "normal",
        recommendedMinutes: 120,
        reason: "A weekly simulation helps validate mastery beyond lesson completion.",
        sentToWeeklyPlan: false,
    },
];
