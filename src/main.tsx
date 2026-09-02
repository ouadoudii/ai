import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CaryAccountGate } from './components/CaryAccountGate';
import { CaryOnboarding } from './components/CaryOnboarding';
import { CaryCloudMemorySync } from './components/CaryCloudMemorySync';
import { migrateLegacyStorage } from './storageMigration';
import './index.css';

const rootElement = document.getElementById('root');

function showFatalError(error: unknown) {
  if (!rootElement) return;
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  rootElement.innerHTML = `
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f7f2ea;font-family:system-ui,-apple-system,sans-serif;color:#292524">
      <section style="max-width:560px;width:100%;background:white;border:1px solid #e7e5e4;border-radius:24px;padding:28px;box-shadow:0 14px 40px rgba(57,45,35,.08)">
        <div style="font-size:28px;margin-bottom:8px">🍽️</div>
        <h1 style="font-size:22px;margin:0 0 10px">Rhythm could not start</h1>
        <p style="margin:0 0 16px;color:#78716c;line-height:1.5">The app loaded, but a browser runtime error occurred.</p>
        <pre style="white-space:pre-wrap;word-break:break-word;background:#fafaf9;border-radius:14px;padding:14px;font-size:12px;line-height:1.45">${message.replace(/[&<>\"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c))}</pre>
      </section>
    </main>`;
}

window.addEventListener('error', (event) => {
  console.error('Rhythm runtime error', event.error || event.message);
  showFatalError(event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('Rhythm unhandled rejection', event.reason);
  showFatalError(event.reason);
});

class RuntimeErrorBoundary extends React.Component<React.PropsWithChildren, { error: unknown | null }> {
  state: { error: unknown | null } = { error: null };
  static getDerivedStateFromError(error: unknown) { return { error }; }
  componentDidCatch(error: unknown, info: React.ErrorInfo) { console.error('Rhythm render error', error, info); }
  render() {
    if (this.state.error) {
      const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
      return <main className="min-h-screen flex items-center justify-center p-6 bg-[#f7f2ea] text-stone-800"><section className="max-w-xl w-full bg-white border border-stone-200 rounded-3xl p-7 shadow-lg"><div className="text-3xl mb-2">🍽️</div><h1 className="text-xl font-bold mb-2">Rhythm could not start</h1><p className="text-stone-500 mb-4">A browser runtime error occurred.</p><pre className="whitespace-pre-wrap break-words bg-stone-50 rounded-2xl p-4 text-xs">{message}</pre></section></main>;
    }
    return this.props.children;
  }
}

if (!rootElement) throw new Error('Root element #root is missing');
migrateLegacyStorage();
createRoot(rootElement).render(<StrictMode><RuntimeErrorBoundary><CaryAccountGate>{({ accessMode, session, openAccount }) => (<CaryOnboarding><CaryCloudMemorySync session={accessMode === 'account' ? session : null} /><App /><button type="button" onClick={openAccount} className="fixed z-40 right-4 bottom-28 md:bottom-5 rounded-full border border-[#E5D6CB] bg-white/95 backdrop-blur-xl px-4 py-2.5 shadow-[0_10px_30px_rgba(72,49,38,.16)] text-xs font-bold text-[#5F4538] hover:-translate-y-0.5 transition-transform" aria-label="Open account">{accessMode === 'account' ? (session?.user.email || 'My account') : 'Guest · Sign in'}</button></CaryOnboarding>)}</CaryAccountGate></RuntimeErrorBoundary></StrictMode>);
