import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEmailConfirmationRedirectUrl, signUpWithPassword } from '../src/auth/supabaseAuth';

describe('email confirmation redirect', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses the current app origin as the explicit confirmation destination', () => {
    vi.stubGlobal('window', { location: { origin: 'https://moment.example' } });
    expect(getEmailConfirmationRedirectUrl()).toBe('https://moment.example/?auth=confirmed');
  });

  it('sends Supabase an explicit redirect_to on signup', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://moment.example' } });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: 'u1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await signUpWithPassword('user@example.com', 'secret-password');

    const [requestUrl, request] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl);
    expect(url.pathname).toBe('/auth/v1/signup');
    expect(url.searchParams.get('redirect_to')).toBe('https://moment.example/?auth=confirmed');
    expect(request.method).toBe('POST');
  });
});
