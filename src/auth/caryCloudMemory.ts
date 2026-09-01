import { CarySession } from './supabaseAuth';
import { DailyCheckIn, FoodMoment } from '../types';

const SUPABASE_URL = 'https://iedexrvvmpymnyyursdx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6ZGjIW09VXZ8kT2vu1L2Kg_2JCmDg37';

export type CaryMemorySnapshot = {
  moments: FoodMoment[];
  checkIns: DailyCheckIn[];
};

function authHeaders(session: CarySession) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>();
  remote.forEach((item) => merged.set(item.id, item));
  local.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
}

export function mergeMemory(local: CaryMemorySnapshot, remote: CaryMemorySnapshot): CaryMemorySnapshot {
  return {
    moments: mergeById(local.moments, remote.moments),
    checkIns: mergeById(local.checkIns, remote.checkIns),
  };
}

export async function loadCloudMemory(session: CarySession): Promise<CaryMemorySnapshot | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cary_memory?user_id=eq.${encodeURIComponent(session.user.id)}&select=moments,check_ins`, {
    headers: authHeaders(session),
  });
  if (!res.ok) throw new Error('Cloud-Daten konnten nicht geladen werden.');
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]) return null;
  return {
    moments: Array.isArray(rows[0].moments) ? rows[0].moments : [],
    checkIns: Array.isArray(rows[0].check_ins) ? rows[0].check_ins : [],
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
      moments: memory.moments,
      check_ins: memory.checkIns,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error('Cloud-Daten konnten nicht gespeichert werden.');
}
