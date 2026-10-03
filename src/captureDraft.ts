export const CAPTURE_DRAFT_STORAGE_KEY = 'moment:capture-draft:v1';

export type CaptureDraft = {
  version: 1;
  updatedAt: string;
  title?: string;
  note?: string;
};

export type CaptureDraftInput = {
  title?: string;
  note?: string;
  /** True only when the title came from explicit user input/acceptance. */
  titleConfirmedByUser?: boolean;
};

const clean = (value?: string) => value?.trim() || undefined;

export function buildCaptureDraft(
  input: CaptureDraftInput,
  now = new Date(),
): CaptureDraft | null {
  const title = input.titleConfirmedByUser ? clean(input.title) : undefined;
  const note = clean(input.note);
  if (!title && !note) return null;
  return { version: 1, updatedAt: now.toISOString(), ...(title ? { title } : {}), ...(note ? { note } : {}) };
}

export function saveCaptureDraft(storage: Pick<Storage, 'setItem' | 'removeItem'>, input: CaptureDraftInput, now = new Date()) {
  const draft = buildCaptureDraft(input, now);
  if (!draft) {
    storage.removeItem(CAPTURE_DRAFT_STORAGE_KEY);
    return null;
  }
  storage.setItem(CAPTURE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  return draft;
}

export function loadCaptureDraft(storage: Pick<Storage, 'getItem'>): CaptureDraft | null {
  try {
    const raw = storage.getItem(CAPTURE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<CaptureDraft>;
    if (value.version !== 1 || typeof value.updatedAt !== 'string') return null;
    const title = clean(value.title);
    const note = clean(value.note);
    if (!title && !note) return null;
    return { version: 1, updatedAt: value.updatedAt, ...(title ? { title } : {}), ...(note ? { note } : {}) };
  } catch {
    return null;
  }
}

export function clearCaptureDraft(storage: Pick<Storage, 'removeItem'>) {
  storage.removeItem(CAPTURE_DRAFT_STORAGE_KEY);
}
