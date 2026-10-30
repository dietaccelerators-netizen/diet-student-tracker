// Keep preview journeys inside preview and construct internal destinations only.
export function journeyPortal(view: 'weekly' | 'report' | 'practice', previewStage?: string) {
 const q = new URLSearchParams(previewStage ? {mode:'preview',stage:previewStage} : {});
 q.set('view',view);
 return `${previewStage ? '/login' : '/dashboard'}?${q}`;
}
export function journeySubject(paper: string, previewStage?: string) {
 const q = new URLSearchParams(previewStage ? {mode:'preview',stage:previewStage,subject:paper} : {});
 q.set('fromSession','1');
 return `${previewStage ? '/login' : '/papers/'+encodeURIComponent(paper)}?${q}`;
}
