export type CarySession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
  };
};

const SUPABASE_URL = 'https://iedexrvvmpymnyyursdx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6ZGjIW09VXZ8kT2vu1L2Kg_2JCmDg37';
const SESSION_KEY = 'cary_auth_session_v1';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  'Content-Type': 'application/json',
};

async function readResponse(res: Response) {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.msg || payload?.message || payload?.error_description || 'Anmeldung fehlgeschlagen');
  }
  return payload;
}

export function loadStoredSession(): CarySession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(session: CarySession | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

export async function signInWithPassword(email: string, password: string): Promise<CarySession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await readResponse(res);
  const session: CarySession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  };
  storeSession(session);
  return session;
}

export async function signUpWithPassword(email: string, password: string): Promise<{ session: CarySession | null; needsEmailConfirmation: boolean }> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const data = await readResponse(res);
  if (!data.access_token || !data.refresh_token) {
    return { session: null, needsEmailConfirmation: true };
  }
  const session: CarySession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  };
  storeSession(session);
  return { session, needsEmailConfirmation: false };
}

export async function refreshSession(session: CarySession): Promise<CarySession | null> {
  if (!session.refresh_token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!res.ok) {
    storeSession(null);
    return null;
  }
  const data = await res.json();
  const refreshed: CarySession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    user: data.user,
  };
  storeSession(refreshed);
  return refreshed;
}

export async function getValidStoredSession(): Promise<CarySession | null> {
  const session = loadStoredSession();
  if (!session) return null;
  const expiresSoon = !session.expires_at || session.expires_at * 1000 < Date.now() + 60_000;
  if (expiresSoon) return refreshSession(session);
  return session;
}

export async function signOut(session: CarySession | null) {
  if (session?.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  storeSession(null);
}
