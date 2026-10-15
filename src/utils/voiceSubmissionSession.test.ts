import { describe, expect, it } from 'vitest';
import { createVoiceSubmissionSession } from './voiceSubmissionSession';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}

describe('full Voice AI submission identity (#234)', () => {
  it('invalidates a pending answer as soon as text/editor navigation takes ownership', async () => {
    const session = createVoiceSubmissionSession();
    const oldAnswer = deferred<string>();
    const applied: string[] = [];
    const a = session.begin();
    const finishA = oldAnswer.promise.then(answer => {
      if (session.finish(a)) applied.push(answer);
    });
    session.invalidate();
    const b = session.begin();
    oldAnswer.resolve('stale German clarification');
    await finishA;
    expect(applied).toEqual([]);
    expect(session.isCurrent(b)).toBe(true);
    expect(session.finish(b)).toBe(true);
  });

  it.each(['A then B', 'B then A'])('keeps only B when two Voice responses resolve %s', async order => {
    const session = createVoiceSubmissionSession();
    const first = deferred<string>();
    const second = deferred<string>();
    const writes: string[] = [];
    const a = session.begin();
    const taskA = first.promise.then(value => { if(session.finish(a)) writes.push(value); });
    const b = session.begin();
    const taskB = second.promise.then(value => { if(session.finish(b)) writes.push(value); });
    if(order === 'A then B') {
      first.resolve('stale French meal');
      await taskA;
      second.resolve('current Arabic correction');
      await taskB;
    } else {
      second.resolve('current Arabic correction');
      await taskB;
      first.resolve('stale French meal');
      await taskA;
    }
    expect(writes).toEqual(['current Arabic correction']);
    expect(session.finish(b)).toBe(false);
  });

  it('checks identity after the second awaited intent classifier', async () => {
    const session = createVoiceSubmissionSession();
    const ai = deferred<string>();
    const intent = deferred<string>();
    const actions: string[] = [];
    const id = session.begin();
    const work = (async () => {
      await ai.promise;
      if(!session.isCurrent(id))return;
      const kind = await intent.promise;
      if(!session.isCurrent(id))return;
      if(session.finish(id))actions.push(kind);
    })();
    ai.resolve('no meal');
    await Promise.resolve();
    session.invalidate();
    intent.resolve('profile_goal');
    await work;
    expect(actions).toEqual([]);
  });

  it('allows a single current response to complete exactly once', () => {
    const session = createVoiceSubmissionSession();
    const id = session.begin();
    expect(session.isCurrent(id)).toBe(true);
    expect(session.finish(id)).toBe(true);
    expect(session.finish(id)).toBe(false);
    expect(session.isCurrent(id)).toBe(false);
  });
});
