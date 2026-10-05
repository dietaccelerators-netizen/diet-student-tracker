import { createClient } from './supabase/client';
import { parseDraft, type PlanDraft } from './plan-setup';

export interface ActivePlan { version: 1; draft: PlanDraft; paperIds: string[]; savedAt: string }
export interface PlanAccount { draft: PlanDraft | null; active: ActivePlan | null; revision: number; updatedAt: string | null }
export const emptyAccount = (): PlanAccount => ({ draft: null, active: null, revision: 0, updatedAt: null });
export function parseActive(value: unknown): ActivePlan | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as ActivePlan, draft = parseDraft(p.draft);
  return p.version === 1 && draft && Array.isArray(p.paperIds) && p.paperIds.every(id => typeof id === 'string') && typeof p.savedAt === 'string' && Number.isFinite(Date.parse(p.savedAt)) ? { ...p, draft } : null;
}
function parseAccount(row: { draft: unknown; active_plan: unknown; revision: number; updated_at: string }): PlanAccount {
  const draft = parseDraft(row.draft), active = row.active_plan === null ? null : parseActive(row.active_plan);
  if (!draft || (row.active_plan !== null && !active)) throw new Error('The saved plan could not be read. Please contact support; your account data has not been replaced.');
  return { draft, active, revision: row.revision, updatedAt: row.updated_at };
}
export async function loadPlanAccount(userId: string, stage: string): Promise<PlanAccount> {
  const { data, error } = await createClient().from('weekly_plan_accounts').select('draft,active_plan,revision,updated_at').eq('user_id', userId).eq('stage', stage).maybeSingle();
  if (error) throw new Error('Your account plan could not be loaded. Check your connection and try again.');
  return data ? parseAccount(data) : emptyAccount();
}
export async function savePlanAccount(userId: string, stage: string, previous: PlanAccount, draft: PlanDraft, active: ActivePlan | null): Promise<PlanAccount> {
  if (!parseDraft(draft)) throw new Error('Check your plan settings before saving.');
  const client = createClient();
  const values = { draft, active_plan: active, revision: previous.revision + 1, updated_at: new Date().toISOString() };
  const query = previous.revision === 0
    ? client.from('weekly_plan_accounts').insert({ user_id: userId, stage, ...values })
    : client.from('weekly_plan_accounts').update(values).eq('user_id', userId).eq('stage', stage).eq('revision', previous.revision);
  const { data, error } = await query.select('draft,active_plan,revision,updated_at').maybeSingle();
  if (error?.code === '23505' || (!error && !data)) throw new Error('This plan changed in another tab or device. Your edits are still here. Copy any changes you need, then reload the page to open the latest saved plan.');
  if (error || !data) throw new Error('The plan was not saved to your account. Check your connection or sign in again, then retry. Your edits are still here.');
  return parseAccount(data);
}
