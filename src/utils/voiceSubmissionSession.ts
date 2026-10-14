/**
 * Latest-interaction-wins identity for the full Voice journal hand-off.
 * Finishing or invalidating a request prevents any late continuation
 * from mutating a newer editor, profile, or persistent journal.
 */
export function createVoiceSubmissionSession() {
  let nextId = 0;
  let activeId: number | null = null;
  return {
    begin(): number {
      activeId = ++nextId;
      return activeId;
    },
    invalidate(): void {
      activeId = null;
      nextId++;
    },
    isCurrent(requestId: number): boolean {
      return activeId === requestId;
    },
    finish(requestId: number): boolean {
      if (activeId !== requestId) return false;
      activeId = null;
      return true;
    },
  };
}
