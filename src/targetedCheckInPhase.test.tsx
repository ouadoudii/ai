import React from 'react';
import {describe,expect,it,beforeAll,afterAll} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {DailyCheckInModal,resolveCheckInDate} from './components/DailyCheckInModal';

let oldStorage:any;
beforeAll(()=>{oldStorage=(globalThis as any).localStorage;(globalThis as any).localStorage={getItem:()=>null,setItem:()=>{}}});
afterAll(()=>{(globalThis as any).localStorage=oldStorage});

const noop=()=>{};

describe('targeted day-phase check-ins',()=>{
  it('renders Arabic Morning when Morning was explicitly selected, independent of clock time',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="morning"/></LanguageProvider>);
    expect(html).toContain('صباحك');
    expect(html).toContain('كيف بدأت يومك؟');
    expect(html).not.toContain('مساؤك');
  });

  it('renders Arabic Midday when Midday was explicitly selected',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="midday"/></LanguageProvider>);
    expect(html).toContain('منتصف يومك');
    expect(html).toContain('كيف يسير يومك؟');
  });

  it('renders Arabic Evening when Evening was explicitly selected',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="evening"/></LanguageProvider>);
    expect(html).toContain('مساؤك');
    expect(html).toContain('كيف كان يومك؟');
  });

  it('keeps an explicitly selected previous date instead of silently using today',()=>{
    expect(resolveCheckInDate('2026-10-15',new Date('2026-10-16T02:00:00'))).toBe('2026-10-15');
  });
});
