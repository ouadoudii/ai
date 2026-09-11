const VERCEL_API = 'https://api.vercel.com';

function authHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN is not configured.');
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

export async function createVercelProject(name: string, repoFullName: string) {
  const teamId = process.env.VERCEL_TEAM_ID;
  const url = new URL('/v11/projects', VERCEL_API);
  if (teamId) url.searchParams.set('teamId', teamId);
  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      name,
      framework: 'vite',
      gitRepository: { type: 'github', repo: repoFullName },
    }),
  });
  if (!response.ok) throw new Error(`Vercel project creation failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<{ id: string; name: string }>;
}
