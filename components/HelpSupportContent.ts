// Help content adapted from the supplied support template.
export /* =============================================================================
   TYPES
============================================================================= */
type HelpTopicId = "getting-started" | "my-subjects" | "weekly-plan" | "practice-room" | "learning-report" | "account-technical";
export type HelpTopic = {
    id: HelpTopicId;
    title: string;
    description: string;
    icon: "start" | "subjects" | "plan" | "practice" | "report" | "technical";
    articles: HelpArticle[];
};
export type HelpArticle = {
    id: string;
    title: string;
    answer: string;
};
export type FAQ = {
    id: string;
    question: string;
    answer: string;
    topic: HelpTopicId;
    keywords: string[];
};
export /* =============================================================================
   HELP TOPICS
============================================================================= */
const helpTopics: HelpTopic[] = [
    {
        id: "getting-started",
        title: "Getting Started",
        description: "Learn the basics of setting up and navigating Mastrevo.",
        icon: "start",
        articles: [
            {
                id: "getting-started-1",
                title: "How the portal is organised",
                answer: "Mastrevo separates planning, learning, practice and performance reporting. Use Weekly Plan to know what to do, My Subjects to study, Practice Room to test yourself and Learning Report to understand your results.",
            },
            {
                id: "getting-started-2",
                title: "How your exam setup works",
                answer: "Review your exam stage, diet and registered papers in My Profile. Use Manage papers to change your selected subjects. Contact your coordinator to correct your name or exam stage.",
            },
            {
                id: "getting-started-3",
                title: "Where to continue studying",
                answer: "Open My Subjects, choose your paper and select a topic or available lesson to continue learning.",
            },
        ],
    },
    {
        id: "my-subjects",
        title: "My Subjects",
        description: "Help with lessons, reading modes, syllabus and section completion.",
        icon: "subjects",
        articles: [
            {
                id: "subjects-1",
                title: "How Standard and Simplified modes work",
                answer: "Standard and Simplified are two reading versions of the same lesson. Standard keeps the fuller technical explanation, while Simplified presents the same concept in clearer language. Switching modes does not create separate progress.",
            },
            {
                id: "subjects-2",
                title: "How to mark a section complete",
                answer: "Use the progress controls available for your topic. Account-wide section completion is not connected to Learning Report yet. Standard and Simplified are views of the same lesson, not separate progress.",
            },
            {
                id: "subjects-3",
                title: "Where past questions went",
                answer: "Open Practice Room for Quick Review, Past Questions and Exam Focus. The current question collection is a clearly labelled sample; availability depends on the selected paper.",
            },
            {
                id: "subjects-4",
                title: "Where to find additional technical references",
                answer: "Open Study Resources to browse available study texts, IFRS materials and extra references. A listed category does not guarantee that a resource has been published.",
            },
        ],
    },
    {
        id: "weekly-plan",
        title: "Weekly Plan",
        description: "Help with schedules, availability, lectures and missed sessions.",
        icon: "plan",
        articles: [
            {
                id: "weekly-1",
                title: "What happens if I miss a study session?",
                answer: "Review unfinished sessions in Weekly Plan and adjust your next week before adding more work. Check and save any proposed plan; do not assume a missed session has moved automatically.",
            },
            {
                id: "weekly-2",
                title: "How to change study availability",
                answer: "Open Weekly Plan → Plan Setup to review your available days and study time, then save the changes.",
            },
            {
                id: "weekly-3",
                title: "How I Have Some Free Time works",
                answer: "Select I Have Some Free Time and choose a duration. The portal checks recent unfinished study and topics flagged for practice, then suggests a next action.",
            },
            {
                id: "weekly-4",
                title: "Where to log lectures",
                answer: "Lecture attendance and lecture coverage should be recorded under Weekly Plan → Lectures. This helps the portal distinguish lecture exposure from personal mastery.",
            },
        ],
    },
    {
        id: "practice-room",
        title: "Practice Room",
        description: "Help with Quick Review, Past Questions, Exam Focus and simulations.",
        icon: "practice",
        articles: [
            {
                id: "practice-1",
                title: "Can I answer questions on paper?",
                answer: "Yes. For longer written, calculation and professional questions, select Answer on Paper. Complete the question physically, return to the portal, review the suggested solution and marking guide, then record your score.",
            },
            {
                id: "practice-2",
                title: "What is Quick Review?",
                answer: "Quick Review is short recall practice, normally around 5 to 10 minutes. It is intended to reinforce recently studied material rather than replace longer exam practice.",
            },
            {
                id: "practice-3",
                title: "What is Exam Focus?",
                answer: "Exam Focus is for deeper application through calculations, scenarios, theory, professional judgement and report-style questions depending on the paper.",
            },
            {
                id: "practice-4",
                title: "How are practice scores used?",
                answer: "Sample attempts and drafts are saved in this browser only. They are not synced across devices or included in Learning Report. Account-wide scored practice is not connected yet.",
            },
        ],
    },
    {
        id: "learning-report",
        title: "Learning Report",
        description: "Understand coverage, mastery, weak areas and next steps.",
        icon: "report",
        articles: [
            {
                id: "report-1",
                title: "Why is coverage different from mastery?",
                answer: "Coverage describes completed syllabus sections. Mastery needs reliable evidence of understanding. Account-wide completion and scored attempts are not connected yet, so unavailable metrics display a dash. Sample view is illustrative.",
            },
            {
                id: "report-2",
                title: "How are weak areas identified?",
                answer: "My report currently shows topics you marked Needs Practice or requested to reattempt. These are self-reported flags, not a score-based diagnosis. Sample view illustrates future performance patterns.",
            },
            {
                id: "report-3",
                title: "How does Send to Weekly Plan work?",
                answer: "Use Next Steps to decide what to work on and open Weekly Plan to schedule it yourself. Automatic transfer is not connected, and sample recommendations do not create sessions.",
            },
            {
                id: "report-4",
                title: "Does attending a lecture increase mastery?",
                answer: "Lecture attendance can show that a topic has been touched, but attendance alone does not mean mastery. Personal study, review and practice are still required.",
            },
        ],
    },
    {
        id: "account-technical",
        title: "Account & Technical Help",
        description: "Help with login, account access, notifications and technical issues.",
        icon: "technical",
        articles: [
            {
                id: "technical-1",
                title: "I cannot sign in",
                answer: "Use the email address approved for your account and request a sign-in link on the login page. Check your spam folder and use the newest link. Contact your Mastrevo coordinator if access still fails. Never share your sign-in link.",
            },
            {
                id: "technical-2",
                title: "A page is not loading correctly",
                answer: "Refresh the page after saving any work. If the problem continues, prepare a problem report below with the page name, what you tried and what happened. Support delivery is not connected yet; share the draft with your coordinator through your usual contact channel.",
            },
            {
                id: "technical-3",
                title: "How to change notification preferences",
                answer: "Notification settings are not available in this version of the portal. Use your usual calendar reminders until notification controls are connected.",
            },
            {
                id: "technical-4",
                title: "A resource will not open",
                answer: "Retry the resource from Study Resources. If it still fails, note its title and prepare a problem report. Share it with your coordinator through your usual contact channel.",
            },
        ],
    },
];
export /* =============================================================================
   FREQUENTLY ASKED QUESTIONS
============================================================================= */
const faqs: FAQ[] = [
    {
        id: "faq-coverage",
        question: "Why is my syllabus coverage different from my mastery score?",
        answer: "Coverage describes completed material; mastery requires demonstrated understanding. Current account metrics remain unavailable until their evidence is connected. Sample view figures are examples, not your scores.",
        topic: "learning-report",
        keywords: [
            "coverage",
            "mastery",
            "learning report",
            "progress",
        ],
    },
    {
        id: "faq-missed-session",
        question: "What happens if I miss a planned study session?",
        answer: "Review unfinished work in Weekly Plan and adjust your next week. Check and save changes rather than assuming the session has been moved automatically.",
        topic: "weekly-plan",
        keywords: [
            "missed session",
            "weekly plan",
            "recovery",
            "backlog",
        ],
    },
    {
        id: "faq-simplified",
        question: "How do Standard and Simplified lesson modes work?",
        answer: "Both modes contain the same learning objective. Standard preserves the fuller technical explanation while Simplified presents the same concept more plainly. Changing modes does not create duplicate lesson progress.",
        topic: "my-subjects",
        keywords: [
            "standard",
            "simplified",
            "reading mode",
            "lesson",
        ],
    },
    {
        id: "faq-paper",
        question: "Can I answer Practice Room questions on paper?",
        answer: "Yes. For longer written and calculation questions, select Answer on Paper. When you finish, return to the portal, review the suggested solution and marking guide, then self-mark your attempt.",
        topic: "practice-room",
        keywords: [
            "paper",
            "practice room",
            "written",
            "answer",
        ],
    },
    {
        id: "faq-papers",
        question: "How do I change my registered ICAN papers?",
        answer: "Open My Profile → Manage papers to update your selected subjects. Removing a paper hides it from your active selection; existing saved topic progress is retained.",
        topic: "getting-started",
        keywords: [
            "registered papers",
            "ican",
            "exam setup",
            "profile",
        ],
    },
    {
        id: "faq-next-week",
        question: "Why was a topic added to my Next Week plan?",
        answer: "Review the proposed next-week sessions and any unfinished work before saving. Learning Report recommendations are not transferred automatically yet.",
        topic: "weekly-plan",
        keywords: [
            "next week",
            "recommendation",
            "weak topic",
            "weekly plan",
        ],
    },
    {
        id: "faq-resources",
        question: "Where can I find IFRS, Finance Acts and other references?",
        answer: "Open Study Resources for the references currently published. Main lesson content remains in My Subjects.",
        topic: "getting-started",
        keywords: [
            "ifrs",
            "finance act",
            "resources",
            "legislation",
        ],
    },
];
