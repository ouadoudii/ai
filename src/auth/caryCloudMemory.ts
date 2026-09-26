import { CarySession } from './supabaseAuth';
import { DailyCheckIn, FoodMoment } from '../types';

const SUPABASE_URL = 'https://iedexrvvmpymnyyursdx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6ZGjIW09VXZ8kT2vu1L2Kg_2JCmDg37';
const TOMBSTONE = '__momentDeletedAt';

type Tombstone = { id: string; [TOMBSTONE]: string };

export type CaryMemorySnapshot = {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
  deletedMomentIds?: string[];
  deletedCheckInIds?: string[];
};

function authHeaders(session: CarySession) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

function isTombstone(value: unknown): value is Tombstone {
  return Boolean(value && typeof value === 'object' && typeof (value as Tombstone).id === 'string' && typeof (value as Tombstone)[TOMBSTONE] === 'string');
}

function splitStored<T>(values: unknown): { live: T[]; deletedIds: string[] } {
  if (!Array.isArray(values)) return { live: [], deletedIds: [] };
  return {
    live: values.filter((item) => !isTombstone(item)) as T[],
    deletedIds: values.filter(isTombstone).map((item) => item.id),
  };
}

function storedRecords<T>(live: T[], deletedIds: string[] = []): Array<T | Tombstone> {
  const deletedAt = new Date().toISOString();
  return [...live, ...deletedIds.map((id) => ({ id, [TOMBSTONE]: deletedAt }))];
}

export function mergeById<T extends { id: string }>(local: T[], remote: T[], deletedIds: string[] = []): T[] {
  const deleted = new Set(deletedIds);
  const merged = new Map<string, T>();
  remote.forEach((item) => { if (!deleted.has(item.id)) merged.set(item.id, item); });
  local.forEach((item) => { if (!deleted.has(item.id)) merged.set(item.id, item); });
  return Array.from(merged.values());
}

export function deriveDeletedIds<T extends { id: string }>(baseline: T[], current: T[]): string[] {
  const currentIds = new Set(current.map((item) => item.id));
  return baseline.filter((item) => !currentIds.has(item.id)).map((item) => item.id);
}

export function withLocalDeletions(local: CaryMemorySnapshot, baseline: CaryMemorySnapshot | null): CaryMemorySnapshot {
  if (!baseline) return local;
  return {
    ...local,
    deletedMomentIds: Array.from(new Set([...(local.deletedMomentIds || []), ...deriveDeletedIds(baseline.moments, local.moments)])),
    deletedCheckInIds: Array.from(new Set([...(local.deletedCheckInIds || []), ...deriveDeletedIds(baseline.checkIns, local.checkIns)])),
  };
}

export function mergeMemory(local: CaryMemorySnapshot, remote: CaryMemorySnapshot): CaryMemorySnapshot {
  const deletedMomentIds = Array.from(new Set([...(local.deletedMomentIds || []), ...(remote.deletedMomentIds || [])]));
  const deletedCheckInIds = Array.from(new Set([...(local.deletedCheckInIds || []), ...(remote.deletedCheckInIds || [])]));
  return {
    moments: mergeById(local.moments, remote.moments, deletedMomentIds),
    checkIns: mergeById(local.checkIns, remote.checkIns, deletedCheckInIds),
    deletedMomentIds,
    deletedCheckInIds,
  };
}

export async function loadCloudMemory(session: CarySession): Promise<CaryMemorySnapshot | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cary_memory?user_id=eq.${encodeURIComponent(session.user.id)}&select=moments,check_ins`, {
    headers: authHeaders(session),
  });
  if (!res.ok) throw new Error('Cloud-Daten konnten nicht geladen werden.');
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]) return null;
  const moments = splitStored<FoodMoment>(rows[0].moments);
  const checkIns = splitStored<DailyCheckIn>(rows[0].check_ins);
  return {
    moments: moments.live,
    checkIns: checkIns.live,
    deletedMomentIds: moments.deletedIds,
    deletedCheckInIds: checkIns.deletedIds,
  };
}

export async function saveCloudMemory(session: CarySession, memory: CaryMemorySnapshot): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cary_memory?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      ...authHeaders(session),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      user_id: session.user.id,
      moments: storedRecords(memory.moments, memory.deletedMomentIds),
      check_ins: storedRecords(memory.checkIns, memory.deletedCheckInIds),
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error('Cloud-Daten konnten nicht gespeichert werden.');
}
