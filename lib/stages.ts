import type { Paper } from './types';
export const STAGES = ['ATS 1','ATS 2','ATS 3','Foundation','Skills','Professional'] as const;
export type ExamStage = typeof STAGES[number];
export const SUBJECTS: Record<ExamStage, readonly (readonly [string,string])[]> = {
 'ATS 1': [['ATS1-BA','Basic Accounting'],['ATS1-ECO','Economics'],['ATS1-BL','Business Law'],['ATS1-CS','Communication Skills']],
 'ATS 2': [['ATS2-FA','Financial Accounting'],['ATS2-PSA','Public Sector Accounting'],['ATS2-QA','Quantitative Analysis'],['ATS2-IT','Information Technology']],
 'ATS 3': [['ATS3-PAA','Principles of Auditing & Assurance'],['ATS3-CA','Cost Accounting'],['ATS3-TAX','Taxation'],['ATS3-MGT','Management']],
 Foundation: [['BE','Business Environment'],['FA','Financial Accounting'],['MA','Management Accounting'],['CBL','Corporate and Business Law']],
 Skills: [['FR','Financial Reporting'],['AAF','Audit, Assurance and Forensics'],['TAX','Taxation'],['PM','Performance Management'],['FM','Financial Management'],['PSAF','Public Sector Accounting and Finance']],
 Professional: [['SBR','Strategic Business Reporting'],['AAAF','Advanced Audit, Assurance and Forensics'],['SFM','Strategic Financial Management'],['ATAX','Advanced Taxation'],['CS','Case Study']],
};
export function stageFor(level: string): ExamStage | null {
 const normalized = level.trim().replace(/\s+level$/i,'');
 return STAGES.find(stage => stage.toLowerCase() === normalized.toLowerCase()) ?? null;
}
export function stagePapers(papers: Paper[], level: string) {
 const stage = stageFor(level);
 if (!stage) return papers;
 const codes = SUBJECTS[stage].map(([code]) => code);
 return papers.filter(p => codes.includes(p.code) || (stage === 'Professional' && ['CR','AAA','CASE STUDY'].includes(p.code)));
}
export function resourcesFor(level: string) {
 return level.startsWith('ATS') ? 'https://icanig.org/ican/students/atswa/atswa-learning-materials.php' : 'https://icanig.org/ican/students/professional/professional-learning-materials.php';
}
