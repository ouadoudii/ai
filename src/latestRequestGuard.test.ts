import {describe,expect,it} from 'vitest';
import {createLatestRequestGuard} from './utils/latestRequestGuard';

describe('latest request guard',()=>{
  it('accepts only the newest overlapping request',()=>{
    const guard=createLatestRequestGuard();
    const first=guard.start();
    const second=guard.start();
    expect(guard.isCurrent(first)).toBe(false);
    expect(guard.isCurrent(second)).toBe(true);
  });

  it('invalidates pending work when a session closes or changes language',()=>{
    const guard=createLatestRequestGuard();
    const pending=guard.start();
    guard.invalidate();
    expect(guard.isCurrent(pending)).toBe(false);
    const reopened=guard.start();
    expect(guard.isCurrent(reopened)).toBe(true);
  });
});
