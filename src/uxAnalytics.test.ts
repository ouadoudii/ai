import {describe,expect,it,beforeEach} from 'vitest';
import {buildUxPayload,sanitizeUxMetadata} from './utils/uxAnalytics';

beforeEach(()=>{(globalThis as any).localStorage={getItem:()=>null,setItem:()=>{}}});

describe('privacy-safe UX analytics',()=>{
  it('drops free-text and personal metadata fields',()=>{
    const meta=sanitizeUxMetadata({flow:'meal',step:'open',mealTitle:'Private dinner',note:'secret',email:'x@y.com'} as any);
    expect(meta).toEqual({flow:'meal',step:'open'});
  });
  it('normalizes language, country and duration',()=>{
    const p=buildUxPayload({eventName:'flow_finished',surface:'meal',language:'ar',country:'ma',durationMs:99999999,outcome:'completed',metadata:{count:2}});
    expect(p.language).toBe('ar');
    expect(p.country).toBeNull();
    expect(p.duration_ms).toBe(3600000);
    expect(p.metadata).toEqual({count:2});
  });
});
