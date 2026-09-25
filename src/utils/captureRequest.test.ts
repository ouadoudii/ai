import { describe, expect, it } from 'vitest';
import { isActiveCaptureRequest } from './captureRequest';

describe('isActiveCaptureRequest',()=>{
  it('accepts only the current open non-cancelled capture',()=>{
    expect(isActiveCaptureRequest(4,4,false,true)).toBe(true);
  });

  it('rejects a result after close or back invalidates the request',()=>{
    expect(isActiveCaptureRequest(4,5,true,false)).toBe(false);
    expect(isActiveCaptureRequest(4,5,false,true)).toBe(false);
    expect(isActiveCaptureRequest(4,4,true,true)).toBe(false);
    expect(isActiveCaptureRequest(4,4,false,false)).toBe(false);
  });
});
