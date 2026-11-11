import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../api/[...path]';

describe('coach API deterministic regional intents', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Coach API test server did not bind');
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  });

  it.each([
    ['ma 3andich chahiya lyoum', 'تتغيّر الشهية'],
    ['ma klitch ghir tfa7a lyoum', 'تناولت شيئًا اليوم'],
    ['ma akaltsh kteer elnaharda', 'تناولت كمية قليلة اليوم'],
  ])('returns the relevant live API response for %s', async (query, expected) => {
    const response = await fetch(`${baseUrl}/api/coach-chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, moments: [], checkIns: [] }),
    });

    expect(response.status).toBe(200);
    const body = await response.json() as { reply?: string };
    expect(body.reply).toContain(expected);
    expect(body.reply).not.toMatch(/فشل|عقاب|ذنب|ممنوع|88%|28%/);
  });
});
