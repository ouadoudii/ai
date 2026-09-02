import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CaryAccountGate } from './components/CaryAccountGate';
import { CaryOnboarding } from './components/CaryOnboarding';
import { CaryCloudMemorySync } from './components/CaryCloudMemorySync';
import { LanguageProvider, useLanguage } from './i18n';
import { migrateLegacyStorage } from './storageMigration';
import './index.css';

const rootElement = document.getElementById('root');

function showFatalError(error: unknown) {
  if (!rootElement) return;
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  rootElement.innerHTML = `<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f7f2ea;font-family:system-ui,-apple-system,sans-serif;color:#292524"><section style="max-width:560px;width:100%;background:white;border:1px solid #e7e5e4;border-radius:24px;padding:28px"><h1 style="font-size:22px;margin:0 0 10px">Rhythm could not start</h1><pre style="white-space:pre-wrap;word-break:break-word;background:#fafaf9;border-radius:14px;padding:14px;font-size:12px">${message.replace(/[&<>\"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c))}</pre></section></main>`;
}
window.addEventListener('error',(event)=>showFatalError(event.error||event.message));
window.addEventListener('unhandledrejection',(event)=>showFatalError(event.reason));
class RuntimeErrorBoundary extends React.Component<React.PropsWithChildren,{error:unknown|null}>{state={error:null};static getDerivedStateFromError(error:unknown){return{error}}render(){if(this.state.error)return <main className="min-h-screen flex items-center justify-center p-6 bg-[#f7f2ea]"><section className="max-w-xl w-full bg-white rounded-3xl p-7"><h1 className="text-xl font-bold">Rhythm could not start</h1></section></main>;return this.props.children;}}

const AccountButton:React.FC<{accessMode:'guest'|'account';session:any;openAccount:()=>void}>=({accessMode,session,openAccount})=>{const {language}=useLanguage();return <button type="button" onClick={openAccount} className="fixed z-40 right-4 bottom-28 md:bottom-5 rounded-full border border-[#E5D6CB] bg-white/95 backdrop-blur-xl px-4 py-2.5 shadow-[0_10px_30px_rgba(72,49,38,.16)] text-xs font-bold text-[#5F4538]" aria-label={language==='ar'?'فتح الحساب':'Open account'}>{accessMode==='account'?(session?.user.email||(language==='ar'?'حسابي':'My account')):(language==='ar'?'ضيف · تسجيل الدخول':'Guest · Sign in')}</button>};

if(!rootElement)throw new Error('Root element #root is missing');
migrateLegacyStorage();
createRoot(rootElement).render(<StrictMode><RuntimeErrorBoundary><LanguageProvider><CaryAccountGate>{({accessMode,session,openAccount})=>(<CaryOnboarding><CaryCloudMemorySync session={accessMode==='account'?session:null}/><App/><AccountButton accessMode={accessMode} session={session} openAccount={openAccount}/></CaryOnboarding>)}</CaryAccountGate></LanguageProvider></RuntimeErrorBoundary></StrictMode>);
