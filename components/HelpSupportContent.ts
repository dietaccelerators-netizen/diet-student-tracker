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
                answer: "Where both versions are published, Standard provides the fuller technical explanation and Simplified uses plainer language. Switching modes does not create separate progress. Report a missing technical point to support; do not assume unpublished versions are available.",
            },
            {
                id: "subjects-2",
                title: "How to mark a section complete",
                answer: "Use the progress controls available for your topic. Account-wide section completion is not connected to Learning Report yet. Standard and Simplified are views of the same lesson, not separate progress.",
            },
            {
                id: "subjects-3",
                title: "Where past questions went",
                answer: "Open Practice Room to see the available formats. The optional guided demo contains sample questions; it is separate from your account work. Activities marked as forthcoming are not ready to start.",
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
                answer: "Weekly Plan can reserve lecture times. Lecture attendance logging and post-lecture checks are not connected yet; a reserved lecture time is not evidence of completion or mastery.",
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
                answer: "In the guided written-practice demo, choose Answer on paper, complete your work, then review the marking guide and assess your response. This is self-assessment, not an automatically awarded exam score.",
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
        description: "Understand recorded activity, topic flags and useful next steps.",
        icon: "report",
        articles: [
            {
                id: "report-1",
                title: "Why is coverage different from mastery?",
                answer: "Topic updates describe the progress you record. Finished study sessions provide study-time evidence. These do not establish mastery or predict a pass. Mastery and exam-readiness scores are deferred until reliable evidence is connected.",
            },
            {
                id: "report-2",
                title: "How are weak areas identified?",
                answer: "Learning Report identifies topics you marked Needs Practice or requested to reattempt. These are your recorded flags, not a score-based diagnosis. Open the relevant topic to revise or practise when content is available.",
            },
            {
                id: "report-3",
                title: "How does Send to Weekly Plan work?",
                answer: "Open the relevant topic from Learning Report or use Weekly Plan to schedule study. Report findings do not automatically create or move sessions.",
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
                answer: "Use your registered email on the sign-in page. If your password is not working, use the password reset option or request a sign-in link. Check spam, use the newest link and open it in the browser where you requested it. Never share passwords or sign-in links.",
            },
            {
                id: "technical-2",
                title: "A page is not loading correctly",
                answer: "Refresh the page after saving any work. If the problem continues, prepare a problem report below with the page name, what you tried and what happened. Saving a draft does not send it. Use the verified contact route shown on this page when it is available.",
            },
            {
                id: "technical-3",
                title: "How to change notification preferences",
                answer: "Notification settings are not available in this version of the portal. Use your usual calendar reminders until notification controls are connected.",
            },
            {
                id: "technical-4",
                title: "A resource will not open",
                answer: "Retry the resource from Study Resources. If it still fails, note its title and prepare a problem report. Use the contact route shown on this page when available; saving a draft alone does not contact the team.",
            },
        ],
    },
];
export /* =============================================================================
   FREQUENTLY ASKED QUESTIONS
============================================================================= */
const faqs: FAQ[] = [
    {id:'faq-login',question:'I cannot sign in',answer:'Use your registered email. On the sign-in page, choose password reset or request a sign-in link. Check spam and use the newest link in the browser where you requested it. Never send your password or sign-in link to support.',topic:'account-technical',keywords:['login','password','sign in','access']},
    {id:'faq-unavailable',question:'Why is study content unavailable?',answer:'A registered paper may appear before its lessons or resources are published. An availability message is not a loading error. Check the paper and topic name; if you expected access, include those names in your support message. Sample resources do not imply a published downloadable file.',topic:'my-subjects',keywords:['unavailable','content','lesson','missing','published']},
    {id:'faq-progress',question:'Where is my saved progress?',answer:'Check that you are signed into the same account and that the paper is selected in Manage papers. Account topic updates differ from browser-only reading position, support drafts and sample practice attempts. If a save error appeared, retry the change. Do not clear browser data while investigating missing local work.',topic:'account-technical',keywords:['saved','progress','lost','sync','browser']},
    {
        id: "faq-coverage",
        question: "What does Learning Report actually measure?",
        answer: "Learning Report uses recorded topic updates and finished study sessions. A topic flag or time spent studying is not a mastery score. Exam-readiness scoring remains unavailable; the report does not predict a pass.",
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
        answer: "Find the session in Weekly Plan and choose Move session to select a new day and start time. Check the saved result; missed sessions are not moved automatically.",
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
        answer: "Where published, Standard and Simplified are alternative versions of a lesson. Standard offers the fuller technical explanation and Simplified uses plainer language. Changing modes does not create duplicate progress. Report any missing technical point.",
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
        answer: "In the guided written-practice demo, select Answer on paper. Review the marking guide when you finish and assess your own response. Sample attempts remain separate from account-wide scored results.",
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
