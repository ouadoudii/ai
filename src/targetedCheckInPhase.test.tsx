import React from 'react';
import {describe,expect,it,beforeAll,afterAll} from 'vitest';
import {renderToString} from 'react-dom/server';
import {LanguageProvider} from './i18n';
import {DailyCheckInModal} from './components/DailyCheckInModal';

let oldStorage:any;
beforeAll(()=>{oldStorage=(globalThis as any).localStorage;(globalThis as any).localStorage={getItem:()=>null,setItem:()=>{}}});
afterAll(()=>{(globalThis as any).localStorage=oldStorage});

const noop=()=>{};

describe('targeted day-phase check-ins',()=>{
  it('renders Morning when Morning was explicitly selected, independent of clock time',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="morning"/></LanguageProvider>);
    expect(html).toContain('Your morning');
    expect(html).toContain('How did your day begin?');
    expect(html).not.toContain('Your evening');
  });

  it('renders Midday when Midday was explicitly selected',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="midday"/></LanguageProvider>);
    expect(html).toContain('Your midday');
    expect(html).toContain('How is your day going?');
  });

  it('renders Evening when Evening was explicitly selected',()=>{
    const html=renderToString(<LanguageProvider><DailyCheckInModal isOpen onClose={noop} onSaveCheckIn={noop as any} phase="evening"/></LanguageProvider>);
    expect(html).toContain('Your evening');
    expect(html).toContain('How did today feel?');
  });
});