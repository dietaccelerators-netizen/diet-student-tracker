export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export interface Window { day: number; start: string; end: string }
export interface PlanDraft {
  version: 1; approach: 'recommended' | 'custom'; timezone: string; examDate: string;
  windows: Window[]; duration: number; multiple: boolean; nudges: boolean;
  mode: 'self' | 'lecture' | 'hybrid'; lectures: Window[]; allocations: Record<string, number>;
}
export const newDraft = (): PlanDraft => ({ version: 1, approach: 'recommended', timezone: 'Africa/Lagos', examDate: '', windows: [], duration: 45, multiple: true, nudges: false, mode: 'self', lectures: [], allocations: {} });
export function minutes(time: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN; }
export function windowErrors(windows: Window[]) {
  const errors: string[] = [];
  windows.forEach((w, i) => {
    if (!Number.isInteger(w.day) || w.day < 0 || w.day > 6 || !Number.isFinite(minutes(w.start)) || !Number.isFinite(minutes(w.end)) || minutes(w.end) <= minutes(w.start)) errors.push('Choose a valid day and an end time after the start time. Split overnight windows across two days.');
    if (windows.slice(0, i).some(v => v.day === w.day && minutes(v.start) < minutes(w.end) && minutes(w.start) < minutes(v.end))) errors.push('Time windows on the same day must not overlap.');
  });
  return [...new Set(errors)];
}
export function freeWindows(draft: PlanDraft): Window[] {
  let result = draft.windows.map(w => ({ ...w }));
  if (draft.mode === 'self') return result;
  for (const lecture of draft.lectures) result = result.flatMap(w => {
    if (w.day !== lecture.day || minutes(lecture.start) >= minutes(w.end) || minutes(lecture.end) <= minutes(w.start)) return [w];
    return [minutes(w.start) < minutes(lecture.start) ? { ...w, end: lecture.start } : null, minutes(w.end) > minutes(lecture.end) ? { ...w, start: lecture.end } : null].filter((v): v is Window => v !== null);
  });
  return result;
}
export function capacity(draft: PlanDraft) { return freeWindows(draft).reduce((sum, w) => sum + Math.max(0, minutes(w.end) - minutes(w.start)), 0); }
export interface ProposedSession extends Window { paperId: string; duration: number }
const clock = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export function propose(draft: PlanDraft, paperIds: string[]): ProposedSession[] {
  if (!paperIds.length || windowErrors(draft.windows).length || ![30,45,60,90].includes(draft.duration) || (draft.mode !== 'self' && windowErrors(draft.lectures).length)) return [];
  const result: ProposedSession[] = [], used = new Set<number>();
  const remaining = Object.fromEntries(paperIds.map(id => [id, draft.approach === 'custom' ? Math.max(0, Math.round((draft.allocations[id] || 0) * 60)) : Infinity]));
  let cursor = 0;
  for (const w of freeWindows(draft).sort((a,b) => a.day - b.day || minutes(a.start) - minutes(b.start))) {
    let start = minutes(w.start);
    while (minutes(w.end) - start >= 15 && (draft.multiple || !used.has(w.day))) {
      const available = minutes(w.end) - start;
      const candidates = paperIds.map((_, i) => paperIds[(cursor + i) % paperIds.length]);
      const id = candidates.find(id => remaining[id] >= (draft.nudges ? 15 : draft.duration));
      if (!id) break;
      const duration = Math.min(draft.duration, available, remaining[id]);
      if (duration < draft.duration && (!draft.nudges || duration < 15)) break;
      result.push({ day: w.day, start: clock(start), end: clock(start + duration), duration, paperId: id });
      remaining[id] -= duration; start += duration; used.add(w.day); cursor = (paperIds.indexOf(id) + 1) % paperIds.length;
    }
  }
  return result;
}
export function parseDraft(value: unknown): PlanDraft | null {
  if (!value || typeof value !== 'object') return null;
  const d = value as PlanDraft;
  const validWindows = (w: unknown): w is Window[] => Array.isArray(w) && w.length <= 100 && w.every(v => v && typeof v.day === 'number' && typeof v.start === 'string' && typeof v.end === 'string');
  if (d.version !== 1 || !['recommended','custom'].includes(d.approach) || typeof d.timezone !== 'string' || typeof d.examDate !== 'string' || !validWindows(d.windows) || !validWindows(d.lectures) || ![30,45,60,90].includes(d.duration) || typeof d.multiple !== 'boolean' || typeof d.nudges !== 'boolean' || !['self','lecture','hybrid'].includes(d.mode) || !d.allocations || typeof d.allocations !== 'object' || !Object.values(d.allocations).every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 168)) return null;
  try { new Intl.DateTimeFormat('en', {timeZone:d.timezone}); } catch { return null; }
  return d;
}
