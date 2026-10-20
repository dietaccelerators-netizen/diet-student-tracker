// Demonstration content supplied in the Practice Room reference. Not approved exam material.
export type PracticeMode = "quick-review" | "past-question" | "exam-focus" | "simulation" | "lecture-check";
export type ExamStage = "ATS" | "Foundation" | "Skills" | "Professional";
export type QuestionType = "objective" | "short-answer" | "theory" | "calculation" | "scenario" | "report-writing";
export type Difficulty = "Foundation" | "Standard" | "Advanced";
export type PracticeQuestion = {
    id: string;
    subjectSlug: string;
    subjectCode: string;
    subjectName: string;
    topicSlug: string;
    topicName: string;
    sectionSlug?: string;
    sectionName?: string;
    mode: PracticeMode;
    questionType: QuestionType;
    difficulty: Difficulty;
    estimatedMinutes: number;
    marks?: number;
    source: "Practice Bank" | "ICAN Past Question" | "Lecture Check" | "Simulation";
    examDiet?: string;
    examYear?: number;
    questionNumber?: string;
    question: string;
    options?: string[];
    suggestedSolution: string[];
    markingGuide?: {
        item: string;
        marks: number;
    }[];
    tags: string[];
};
export type PracticeSubject = {
    id: string;
    slug: string;
    code: string;
    name: string;
    stage: ExamStage;
    topics: {
        slug: string;
        name: string;
        sections?: {
            slug: string;
            name: string;
        }[];
    }[];
};
export /* =============================================================================
   SUBJECT DATA

   Replace later with Supabase.

   The student's selected subjects should come from onboarding / registration.
============================================================================= */
const practiceSubjects: PracticeSubject[] = [
    {
        id: "atax",
        slug: "advanced-taxation",
        code: "ATAX",
        name: "Advanced Taxation",
        stage: "Professional",
        topics: [
            {
                slug: "capital-gains-tax",
                name: "Capital Gains Tax",
                sections: [
                    {
                        slug: "overview",
                        name: "Overview of CGT",
                    },
                    {
                        slug: "chargeable-assets",
                        name: "Chargeable Assets",
                    },
                    {
                        slug: "chargeable-gains",
                        name: "Chargeable Gains",
                    },
                    {
                        slug: "allowable-deductions",
                        name: "Allowable Deductions",
                    },
                    {
                        slug: "reliefs-and-exemptions",
                        name: "Reliefs and Exemptions",
                    },
                    {
                        slug: "computation",
                        name: "Computation",
                    },
                ],
            },
            {
                slug: "companies-income-tax",
                name: "Companies Income Tax",
            },
            {
                slug: "value-added-tax",
                name: "Value Added Tax",
            },
            {
                slug: "international-tax",
                name: "International Tax",
            },
        ],
    },
    {
        id: "aaaf",
        slug: "advanced-audit-assurance-and-forensics",
        code: "AAAF",
        name: "Advanced Audit, Assurance and Forensics",
        stage: "Professional",
        topics: [
            {
                slug: "audit-evidence",
                name: "Audit Evidence",
            },
            {
                slug: "ethics",
                name: "Ethics",
            },
            {
                slug: "audit-risk",
                name: "Audit Risk",
            },
        ],
    },
    {
        id: "sbr",
        slug: "strategic-business-reporting",
        code: "SBR",
        name: "Strategic Business Reporting",
        stage: "Professional",
        topics: [
            {
                slug: "revenue-recognition",
                name: "Revenue Recognition",
            },
            {
                slug: "financial-instruments",
                name: "Financial Instruments",
            },
        ],
    },
    {
        id: "sfm",
        slug: "strategic-financial-management",
        code: "SFM",
        name: "Strategic Financial Management",
        stage: "Professional",
        topics: [
            {
                slug: "investment-appraisal",
                name: "Investment Appraisal",
            },
            {
                slug: "business-valuation",
                name: "Business Valuation",
            },
        ],
    },
    {
        id: "law",
        slug: "business-law",
        code: "LAW",
        name: "Business Law",
        stage: "Foundation",
        topics: [
            {
                slug: "contract-law",
                name: "Contract Law",
            },
            {
                slug: "legal-system",
                name: "The Legal System",
            },
        ],
    },
    {
        id: "case",
        slug: "case-study",
        code: "CASE",
        name: "Case Study",
        stage: "Professional",
        topics: [
            {
                slug: "pre-seen-analysis",
                name: "Pre-seen Analysis",
            },
            {
                slug: "report-writing",
                name: "Report Writing",
            },
        ],
    },
];
export /* =============================================================================
   MOCK PRACTICE QUESTIONS

   These are demonstration questions only.

   In production:
   - tag all questions by subject/topic/section
   - attach historical ICAN source where applicable
   - attach suggested solutions
   - attach marking guides where available

   Do not fabricate an ICAN source.

   If a question is labelled "ICAN Past Question", it must genuinely come from
   the licensed / approved historical question bank.
============================================================================= */
const practiceQuestions: PracticeQuestion[] = [
    {
        id: "qr-cgt-1",
        subjectSlug: "advanced-taxation",
        subjectCode: "ATAX",
        subjectName: "Advanced Taxation",
        topicSlug: "capital-gains-tax",
        topicName: "Capital Gains Tax",
        sectionSlug: "allowable-deductions",
        sectionName: "Allowable Deductions",
        mode: "quick-review",
        questionType: "short-answer",
        difficulty: "Standard",
        estimatedMinutes: 3,
        marks: 2,
        source: "Practice Bank",
        question: "In your own words, explain why every expenditure connected with an asset is not automatically deductible when determining a chargeable gain.",
        suggestedSolution: [
            "The expenditure must satisfy the relevant conditions for deductibility.",
            "Its nature and relationship to the acquisition, enhancement or disposal of the asset should be considered.",
            "Routine or non-qualifying expenditure should not automatically reduce the chargeable gain.",
        ],
        markingGuide: [
            {
                item: "Recognises that deductibility depends on qualifying conditions",
                marks: 1,
            },
            {
                item: "Distinguishes qualifying expenditure from routine/non-qualifying expenditure",
                marks: 1,
            },
        ],
        tags: [
            "capital gains tax",
            "allowable deductions",
            "recall",
        ],
    },
    {
        id: "qr-cgt-2",
        subjectSlug: "advanced-taxation",
        subjectCode: "ATAX",
        subjectName: "Advanced Taxation",
        topicSlug: "capital-gains-tax",
        topicName: "Capital Gains Tax",
        sectionSlug: "allowable-deductions",
        sectionName: "Allowable Deductions",
        mode: "quick-review",
        questionType: "short-answer",
        difficulty: "Standard",
        estimatedMinutes: 3,
        marks: 3,
        source: "Practice Bank",
        question: "State three broad categories of expenditure that should be reviewed when determining allowable deductions for a capital gains computation.",
        suggestedSolution: [
            "Acquisition expenditure.",
            "Qualifying enhancement expenditure.",
            "Incidental acquisition or disposal costs, where applicable.",
        ],
        markingGuide: [
            {
                item: "One valid category",
                marks: 1,
            },
            {
                item: "Second valid category",
                marks: 1,
            },
            {
                item: "Third valid category",
                marks: 1,
            },
        ],
        tags: [
            "capital gains tax",
            "allowable deductions",
        ],
    },
    {
        id: "past-cgt-1",
        subjectSlug: "advanced-taxation",
        subjectCode: "ATAX",
        subjectName: "Advanced Taxation",
        topicSlug: "capital-gains-tax",
        topicName: "Capital Gains Tax",
        sectionSlug: "allowable-deductions",
        sectionName: "Allowable Deductions",
        mode: "past-question",
        questionType: "calculation",
        difficulty: "Advanced",
        estimatedMinutes: 22,
        marks: 12,
        source: "Practice Bank",
        question: "A company disposed of an investment property during the year. The information provided includes original acquisition cost, legal fees on acquisition, routine maintenance expenditure, qualifying improvement expenditure and professional fees on disposal. Prepare the relevant capital gains computation, showing clearly the treatment of each expenditure item.",
        suggestedSolution: [
            "Identify the disposal proceeds.",
            "Identify qualifying acquisition expenditure.",
            "Review legal and professional acquisition costs.",
            "Review whether the improvement expenditure qualifies as enhancement expenditure.",
            "Exclude routine expenditure where it does not satisfy the applicable conditions.",
            "Review qualifying disposal costs.",
            "Deduct qualifying expenditure from disposal proceeds to arrive at the relevant gain before other applicable adjustments.",
        ],
        markingGuide: [
            {
                item: "Correct treatment of disposal proceeds",
                marks: 2,
            },
            {
                item: "Correct acquisition cost",
                marks: 2,
            },
            {
                item: "Correct treatment of professional costs",
                marks: 2,
            },
            {
                item: "Correct treatment of enhancement expenditure",
                marks: 2,
            },
            {
                item: "Correct exclusion of non-qualifying expenditure",
                marks: 2,
            },
            {
                item: "Clear computation / conclusion",
                marks: 2,
            },
        ],
        tags: [
            "capital gains tax",
            "allowable deductions",
            "calculation",
        ],
    },
    {
        id: "exam-cgt-1",
        subjectSlug: "advanced-taxation",
        subjectCode: "ATAX",
        subjectName: "Advanced Taxation",
        topicSlug: "capital-gains-tax",
        topicName: "Capital Gains Tax",
        sectionSlug: "allowable-deductions",
        sectionName: "Allowable Deductions",
        mode: "exam-focus",
        questionType: "scenario",
        difficulty: "Advanced",
        estimatedMinutes: 18,
        marks: 10,
        source: "Practice Bank",
        question: "A client has supplied a schedule of expenditure relating to an asset that was recently disposed of. Some items relate to the original acquisition, some to routine maintenance, some to capital improvements and others to the disposal itself. Explain how you would analyse the expenditure before preparing the capital gains computation.",
        suggestedSolution: [
            "Classify each item before including it in the computation.",
            "Separate acquisition expenditure from subsequent expenditure.",
            "Determine whether subsequent expenditure represents qualifying enhancement or routine expenditure.",
            "Identify incidental costs directly connected with acquisition or disposal.",
            "Exclude expenditure that does not satisfy the relevant conditions.",
            "Show material treatments clearly in the final computation.",
        ],
        markingGuide: [
            {
                item: "Logical classification approach",
                marks: 2,
            },
            {
                item: "Acquisition expenditure analysis",
                marks: 2,
            },
            {
                item: "Enhancement versus routine expenditure",
                marks: 2,
            },
            {
                item: "Incidental costs",
                marks: 2,
            },
            {
                item: "Clear application/conclusion",
                marks: 2,
            },
        ],
        tags: [
            "capital gains tax",
            "allowable deductions",
            "exam technique",
        ],
    },
    {
        id: "lecture-audit-1",
        subjectSlug: "advanced-audit-assurance-and-forensics",
        subjectCode: "AAAF",
        subjectName: "Advanced Audit, Assurance and Forensics",
        topicSlug: "audit-evidence",
        topicName: "Audit Evidence",
        mode: "lecture-check",
        questionType: "short-answer",
        difficulty: "Standard",
        estimatedMinutes: 5,
        marks: 4,
        source: "Lecture Check",
        question: "Briefly explain four factors that may affect the reliability of audit evidence.",
        suggestedSolution: [
            "Source of the evidence.",
            "Whether the evidence is obtained directly by the auditor.",
            "Whether the evidence is documentary rather than purely oral.",
            "Effectiveness of controls over preparation and maintenance of the evidence.",
        ],
        markingGuide: [
            {
                item: "Four valid factors (1 mark each)",
                marks: 4,
            },
        ],
        tags: [
            "audit evidence",
            "lecture check",
        ],
    },
    {
        id: "vat-1",
        subjectSlug: "advanced-taxation",
        subjectCode: "ATAX",
        subjectName: "Advanced Taxation",
        topicSlug: "value-added-tax",
        topicName: "Value Added Tax",
        mode: "exam-focus",
        questionType: "calculation",
        difficulty: "Advanced",
        estimatedMinutes: 20,
        marks: 10,
        source: "Practice Bank",
        question: "Using the transaction information provided in the question, determine the relevant VAT position and clearly show your treatment of taxable, exempt and non-qualifying items.",
        suggestedSolution: [
            "Classify each transaction first.",
            "Identify taxable supplies.",
            "Separate exempt or otherwise excluded items.",
            "Determine relevant output VAT.",
            "Determine qualifying input VAT.",
            "Compute the resulting VAT position.",
        ],
        markingGuide: [
            {
                item: "Transaction classification",
                marks: 2,
            },
            {
                item: "Output VAT treatment",
                marks: 2,
            },
            {
                item: "Input VAT treatment",
                marks: 2,
            },
            {
                item: "Correct computation",
                marks: 3,
            },
            {
                item: "Conclusion",
                marks: 1,
            },
        ],
        tags: [
            "vat",
            "calculation",
            "weak topic",
        ],
    },
];
