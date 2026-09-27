import { describe, expect, it, vi } from 'vitest';
import { createEntityId } from './entityId';

describe('createEntityId',()=>{
  it('keeps ids unique when wall-clock time does not advance',()=>{
    const now=1_700_000_000_000;
    const first=createEntityId('user-checkin',now);
    const second=createEntityId('user-checkin',now);
    expect(first).not.toBe(second);
    expect(first).toMatch(/^user-checkin-1700000000000-/);
    expect(second).toMatch(/^user-checkin-1700000000000-/);
  });

  it('keeps entity namespaces explicit',()=>{
    const now=1_700_000_000_000;
    expect(createEntityId('user-checkin',now)).toMatch(/^user-checkin-/);
    expect(createEntityId('moment',now)).toMatch(/^moment-/);
  });

  it('falls back to counter plus randomness when randomUUID is unavailable',()=>{
    const originalCrypto=globalThis.crypto;
    Object.defineProperty(globalThis,'crypto',{value:undefined,configurable:true});
    vi.spyOn(Math,'random').mockReturnValue(0.123456789);
    try{
      const first=createEntityId('moment',42);
      const second=createEntityId('moment',42);
      expect(first).not.toBe(second);
    }finally{
      vi.restoreAllMocks();
      Object.defineProperty(globalThis,'crypto',{value:originalCrypto,configurable:true});
    }
  });
});
