import { describe, expect, it } from 'vitest';
import { getMomentPersistenceMessage, persistMoments } from './momentPersistence';

describe('moment persistence', () => {
  it('reports success only after durable storage accepts the snapshot', () => {
    const writes: string[] = [];
    const storage = { setItem: (_key: string, value: string) => writes.push(value) };
    const result = persistMoments([] as any, storage);
    expect(result).toEqual({ ok: true });
    expect(writes).toEqual(['[]']);
  });

  it('surfaces quota exhaustion instead of silently succeeding', () => {
    const storage = { setItem: () => { throw new DOMException('full', 'QuotaExceededError'); } };
    const result = persistMoments([] as any, storage);
    expect(result.ok).toBe(false);
    if (result.ok === false) expect(result.reason).toBe('quota');
  });

  it('provides actionable localized recovery copy', () => {
    expect(getMomentPersistenceMessage('de', 'quota')).toContain('nicht dauerhaft gespeichert');
    expect(getMomentPersistenceMessage('fr', 'quota')).toContain('pas encore enregistré');
    expect(getMomentPersistenceMessage('ar', 'quota')).toContain('لم يتم حفظ');
    expect(getMomentPersistenceMessage('en', 'quota')).toContain('not saved permanently');
  });
});
