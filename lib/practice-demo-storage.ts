export type ObjectiveDemo = {
 version:1;phase:'setup'|'active'|'confirm'|'results';mode:'practice'|'timed';minutes:number;
 ids:string[];answers:Record<string,number>;flags:string[];index:number;deadline:number|null;expired:boolean;
};
export const objectiveIds=['equation','credit','gross-profit','receivable','depreciation'];
export const objectiveKey=(student:string)=>`mastrevo-objective-demo:v1:${student}`;
export function parseObjectiveDemo(value:unknown):ObjectiveDemo|null {
 const s=value as ObjectiveDemo;
 if(!s||s.version!==1||!['setup','active','confirm','results'].includes(s.phase)||!['practice','timed'].includes(s.mode)||![1,5,10].includes(s.minutes)||!Array.isArray(s.ids)||!s.ids.length||s.ids.length>5||new Set(s.ids).size!==s.ids.length||!s.ids.every(id=>objectiveIds.includes(id))||!Number.isInteger(s.index)||s.index<0||s.index>=s.ids.length||!s.answers||typeof s.answers!=='object'||Array.isArray(s.answers)||!Object.entries(s.answers).every(([id,n])=>s.ids.includes(id)&&Number.isInteger(n)&&n>=0&&n<4)||!Array.isArray(s.flags)||!s.flags.every(id=>s.ids.includes(id))||typeof s.expired!=='boolean'||(s.deadline!==null&&(!Number.isFinite(s.deadline)||s.deadline<0)))return null;
 if(s.mode==='timed'&&['active','confirm'].includes(s.phase)&&s.deadline===null)return null;
 return s;
}
export function readObjectiveDemo(student:string):ObjectiveDemo|null {
 const raw=localStorage.getItem(objectiveKey(student));
 if(!raw)return null;
 const parsed=parseObjectiveDemo(JSON.parse(raw));
 if(!parsed)throw new Error('The saved objective demo could not be read.');
 return parsed;
}
