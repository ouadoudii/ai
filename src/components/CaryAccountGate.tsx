import React from 'react';
import { ArrowLeft, LogIn, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import {
  CarySession,
  getValidStoredSession,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '../auth/supabaseAuth';

export type CaryAccessMode = 'guest' | 'account';

interface CaryAccountGateProps {
  children: (props: {
    accessMode: CaryAccessMode;
    session: CarySession | null;
    openAccount: () => void;
  }) => React.ReactNode;
}

const ACCESS_KEY = 'cary_access_mode_v1';

export const CaryAccountGate: React.FC<CaryAccountGateProps> = ({ children }) => {
  const [mode, setMode] = React.useState<CaryAccessMode | null>(() => {
    const stored = localStorage.getItem(ACCESS_KEY);
    return stored === 'guest' || stored === 'account' ? stored : null;
  });
  const [session, setSession] = React.useState<CarySession | null>(null);
  const [showAccount, setShowAccount] = React.useState(false);
  const [screen, setScreen] = React.useState<'choice' | 'login' | 'signup'>('choice');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getValidStoredSession().then((stored) => {
      if (stored) {
        setSession(stored);
        setMode('account');
        localStorage.setItem(ACCESS_KEY, 'account');
      } else if (mode === 'account') {
        setMode(null);
        localStorage.removeItem(ACCESS_KEY);
      }
    });
  }, []);

  const chooseGuest = () => {
    localStorage.setItem(ACCESS_KEY, 'guest');
    setMode('guest');
    setShowAccount(false);
    setScreen('choice');
    setError('');
    setMessage('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (screen === 'login') {
        const next = await signInWithPassword(email, password);
        setSession(next);
        setMode('account');
        localStorage.setItem(ACCESS_KEY, 'account');
        setShowAccount(false);
      } else {
        const result = await signUpWithPassword(email, password);
        if (result.session) {
          setSession(result.session);
          setMode('account');
          localStorage.setItem(ACCESS_KEY, 'account');
          setShowAccount(false);
        } else {
          setMessage('Konto erstellt. Bitte bestätige die E-Mail und melde dich danach an.');
          setScreen('login');
          setPassword('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    await signOut(session);
    setSession(null);
    localStorage.removeItem(ACCESS_KEY);
    setMode(null);
    setShowAccount(false);
    setScreen('choice');
    setBusy(false);
  };

  if (!mode || showAccount) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#FFE7D5_0,#FFF8F0_34%,#F7F2EA_70%,#F2E9DF_100%)] text-[#34251E] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-[1.15fr_.85fr] gap-6 lg:gap-10 items-stretch">
          <section className="rounded-[36px] bg-[#3A2922] text-white p-7 sm:p-10 lg:p-12 shadow-[0_26px_70px_rgba(58,41,34,.18)] overflow-hidden relative">
            <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-[#E86F45]/30 blur-2xl" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-[18px] bg-[#E86F45] flex items-center justify-center font-display font-black text-xl">C</div>
                <div><div className="font-display font-bold text-2xl">Cary</div><div className="text-xs text-[#DCCBBE]">Essen · Schlaf · Befinden</div></div>
              </div>
              <div className="max-w-xl my-auto">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#F2D9C9] mb-5"><Sparkles className="w-3.5 h-3.5" />Dein persönlicher Alltag, nicht noch eine Tracking-App</div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight">Cary lernt deinen Rhythmus kennen.</h1>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#E7DAD1] max-w-lg">Halte Essen, Schlaf und Befinden leicht fest. Cary verbindet die Muster und gibt dir genau dann einen sanften Impuls, wenn er nützlich ist.</p>
              </div>
              <div className="mt-10 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/8 border border-white/10 p-4"><ShieldCheck className="w-5 h-5 mb-2 text-[#F7B48F]" /><strong className="block mb-1">Gast bleibt lokal</strong><span className="text-[#CDBDB2]">Ohne Konto direkt starten.</span></div>
                <div className="rounded-2xl bg-white/8 border border-white/10 p-4"><UserRound className="w-5 h-5 mb-2 text-[#F7B48F]" /><strong className="block mb-1">Stammspieler mit Konto</strong><span className="text-[#CDBDB2]">Sicher anmelden und später geräteübergreifend erweitern.</span></div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] bg-white/90 backdrop-blur-xl border border-white p-6 sm:p-8 shadow-[0_22px_60px_rgba(92,64,48,.12)] flex flex-col justify-center">
            {mode && <button onClick={() => setShowAccount(false)} className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#8B6856] mb-5"><ArrowLeft className="w-4 h-4" />Zurück zu Cary</button>}
            {screen === 'choice' ? (
              <>
                <p className="text-xs font-black tracking-[.16em] uppercase text-[#C26D48]">Willkommen</p>
                <h2 className="font-display text-3xl font-black mt-2">Wie möchtest du Cary nutzen?</h2>
                <p className="text-sm text-[#826657] mt-3 leading-relaxed">Du kannst sofort als Gast loslegen oder dich als Stammspieler anmelden.</p>
                <div className="mt-7 space-y-3">
                  {session ? (
                    <div className="rounded-2xl border border-[#E7DACF] bg-[#FFF9F4] p-4">
                      <div className="text-xs text-[#9A7867]">Angemeldet als</div>
                      <div className="font-bold mt-1 break-all">{session.user.email || 'Cary Stammspieler'}</div>
                      <div className="flex gap-2 mt-4"><button onClick={() => setShowAccount(false)} className="flex-1 rounded-2xl bg-[#3A2922] text-white py-3 font-bold text-sm">Weiter</button><button onClick={logout} disabled={busy} className="rounded-2xl border border-[#E3D5CA] px-4 py-3 font-bold text-sm">Abmelden</button></div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setScreen('login')} className="w-full rounded-2xl bg-[#3A2922] text-white p-4 flex items-center justify-between text-left shadow-sm hover:translate-y-[-1px] transition-transform"><span><span className="block font-bold">Stammspieler anmelden</span><span className="block text-xs text-[#D7C8BE] mt-1">Mit deinem Cary-Konto weitermachen</span></span><LogIn className="w-5 h-5" /></button>
                      <button onClick={() => setScreen('signup')} className="w-full rounded-2xl bg-[#FDE7D9] text-[#6A3B29] p-4 text-left border border-[#F7D1BC]"><span className="block font-bold">Konto erstellen</span><span className="block text-xs text-[#95634D] mt-1">Für deinen persönlichen Cary-Verlauf</span></button>
                    </>
                  )}
                  {!session && <button onClick={chooseGuest} className="w-full rounded-2xl border border-[#E3D5CA] bg-white p-4 text-left hover:bg-[#FFF9F4]"><span className="block font-bold">Als Gast starten</span><span className="block text-xs text-[#8E7161] mt-1">Ohne Registrierung. Deine Daten bleiben auf diesem Gerät.</span></button>}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => { setScreen('choice'); setError(''); setMessage(''); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B6856] mb-4"><ArrowLeft className="w-4 h-4" />Zur Auswahl</button>
                <p className="text-xs font-black tracking-[.16em] uppercase text-[#C26D48]">{screen === 'login' ? 'Stammspieler' : 'Neues Konto'}</p>
                <h2 className="font-display text-3xl font-black mt-2">{screen === 'login' ? 'Schön, dass du wieder da bist.' : 'Dein Cary-Konto.'}</h2>
                <form onSubmit={submit} className="mt-7 space-y-4">
                  <label className="block"><span className="text-xs font-bold text-[#765747]">E-Mail</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required className="mt-1.5 w-full rounded-2xl border border-[#E4D7CD] bg-[#FFFCF9] px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E86F45]/30" placeholder="du@beispiel.de" /></label>
                  <label className="block"><span className="text-xs font-bold text-[#765747]">Passwort</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={screen === 'login' ? 'current-password' : 'new-password'} required minLength={6} className="mt-1.5 w-full rounded-2xl border border-[#E4D7CD] bg-[#FFFCF9] px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E86F45]/30" placeholder="Mindestens 6 Zeichen" /></label>
                  {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {message && <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">{message}</div>}
                  <button disabled={busy} className="w-full rounded-2xl bg-[#E86F45] text-white py-3.5 font-bold shadow-sm disabled:opacity-60">{busy ? 'Einen Moment …' : screen === 'login' ? 'Anmelden' : 'Konto erstellen'}</button>
                </form>
                <button onClick={() => setScreen(screen === 'login' ? 'signup' : 'login')} className="mt-5 text-sm font-bold text-[#765747]">{screen === 'login' ? 'Noch kein Konto? Jetzt erstellen' : 'Schon ein Konto? Anmelden'}</button>
              </>
            )}
          </section>
        </div>
      </div>
    );
  }

  return <>{children({ accessMode: mode, session, openAccount: () => { setShowAccount(true); setScreen('choice'); } })}</>;
};
