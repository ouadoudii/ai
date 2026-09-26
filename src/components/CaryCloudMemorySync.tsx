import React from 'react';
import { CarySession } from '../auth/supabaseAuth';
import { loadCloudMemory, mergeMemory, saveCloudMemory, withLocalDeletions, CaryMemorySnapshot } from '../auth/caryCloudMemory';

const MOMENTS_KEY = 'nimmapp_moments_v1';
const CHECKINS_KEY = 'nimmapp_checkins_v1';
const BASELINE_KEY = 'nimmapp_cloud_sync_baseline_v1';

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

function readBaseline(): CaryMemorySnapshot | null {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalMemory(memory: CaryMemorySnapshot) {
  localStorage.setItem(MOMENTS_KEY, JSON.stringify(memory.moments));
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(memory.checkIns));
}

function writeBaseline(memory: CaryMemorySnapshot) {
  localStorage.setItem(BASELINE_KEY, JSON.stringify({ moments: memory.moments, checkIns: memory.checkIns }));
}

export const CaryCloudMemorySync: React.FC<{ session: CarySession | null }> = ({ session }) => {
  const syncingRef = React.useRef(false);

  const syncNow = React.useCallback(async () => {
    if (!session || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const local = withLocalDeletions(readLocalMemory(), readBaseline());
      const remote = await loadCloudMemory(session);
      const merged = mergeMemory(local, remote || { moments: [], checkIns: [] });
      const visibleMerged = { moments: merged.moments, checkIns: merged.checkIns };
      const localVisible = { moments: local.moments, checkIns: local.checkIns };
      const localPayload = JSON.stringify(localVisible);
      const payload = JSON.stringify(visibleMerged);

      await saveCloudMemory(session, merged);
      writeBaseline(visibleMerged);

      if (payload !== localPayload) {
        writeLocalMemory(visibleMerged);
        window.location.reload();
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
