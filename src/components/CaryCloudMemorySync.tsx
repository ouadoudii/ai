import React from 'react';
import { CarySession } from '../auth/supabaseAuth';
import { loadCloudMemory, mergeMemory, saveCloudMemory, CaryMemorySnapshot } from '../auth/caryCloudMemory';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';

function readLocalMemory(): CaryMemorySnapshot {
  try {
    const momentsRaw = localStorage.getItem(MOMENTS_KEY);
    const checkInsRaw = localStorage.getItem(CHECKINS_KEY);
    return {
      moments: momentsRaw ? JSON.parse(momentsRaw) : [],
      checkIns: checkInsRaw ? JSON.parse(checkInsRaw) : [],
    };
  } catch {
    return { moments: [], checkIns: [] };
  }
}

function writeLocalMemory(memory: CaryMemorySnapshot) {
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(memory.moments));
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(memory.checkIns));
}

export const CaryCloudMemorySync: React.FC<{ session: CarySession | null }> = ({ session }) => {
  const syncingRef = React.useRef(false);
  const lastPayloadRef = React.useRef('');

  const syncNow = React.useCallback(async () => {
    if (!session || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const local = readLocalMemory();
      const remote = await loadCloudMemory(session);
      const merged = mergeMemory(local, remote || { moments: [], checkIns: [] });
      const localPayload = JSON.stringify(local);
      const payload = JSON.stringify(merged);
      if (payload !== localPayload) {
        writeLocalMemory(merged);
        await saveCloudMemory(session, merged);
        lastPayloadRef.current = payload;
        window.location.reload();
        return;
      }
      if (payload !== lastPayloadRef.current) {
        await saveCloudMemory(session, merged);
        lastPayloadRef.current = payload;
      }
    } catch (error) {
      console.warn('Cary cloud sync skipped', error);
    } finally {
      syncingRef.current = false;
    }
  }, [session?.access_token, session?.user.id]);

  React.useEffect(() => {
    if (!session) return;
    void syncNow();
    const onStorage = (event: StorageEvent) => {
      if (event.key === MOMENTS_KEY || event.key === CHECKINS_KEY) void syncNow();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void syncNow();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    const timer = window.setInterval(syncNow, 15_000);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(timer);
    };
  }, [session, syncNow]);

  return null;
};
