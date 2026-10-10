import { describe, expect, it } from 'vitest';
import { buildCaptureDraft, clearCaptureDraft, loadCaptureDraft, saveCaptureDraft, CAPTURE_DRAFT_STORAGE_KEY } from './captureDraft';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

describe('capture draft recovery', () => {
  it('preserves explicit mixed-script user text verbatim', () => {
    const draft = buildCaptureDraft({ title: 'بيض مسلوق avec thé', note: 'Frühstück مع العائلة', titleConfirmedByUser: true }, new Date('2026-10-03T00:00:00Z'));
    expect(draft?.title).toBe('بيض مسلوق avec thé');
    expect(draft?.note).toBe('Frühstück مع العائلة');
  });

  it('does not persist an unconfirmed AI-only title', () => {
    expect(buildCaptureDraft({ title: 'pizza', titleConfirmedByUser: false })).toBeNull();
  });

  it('replaces, loads and explicitly clears the single local draft', () => {
    const storage = new MemoryStorage();
    saveCaptureDraft(storage, { title: 'Harira', titleConfirmedByUser: true });
    saveCaptureDraft(storage, { title: 'كسكس', titleConfirmedByUser: true, note: 'vendredi' });
    expect(loadCaptureDraft(storage)?.title).toBe('كسكس');
    expect(storage.data.size).toBe(1);
    clearCaptureDraft(storage);
    expect(storage.getItem(CAPTURE_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it('fails safely for corrupt persisted data', () => {
    const storage = new MemoryStorage();
    storage.setItem(CAPTURE_DRAFT_STORAGE_KEY, '{bad json');
    expect(loadCaptureDraft(storage)).toBeNull();
  });
});
