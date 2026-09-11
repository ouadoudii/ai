import type { GeneratedFile } from './openai';

const API = 'https://api.github.com';

function headers() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured.');
  return {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'content-type': 'application/json',
  };
}

async function gh(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, { ...init, headers: { ...headers(), ...(init.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.status === 204 ? null : response.json();
}

export async function createRepository(name: string, description: string) {
  const owner = process.env.GITHUB_OWNER;
  if (!owner) throw new Error('GITHUB_OWNER is not configured.');
  const isPrivate = process.env.FACTORY_REPO_VISIBILITY !== 'public';
  const profile = await gh('/user') as { login: string };
  const route = profile.login.toLowerCase() === owner.toLowerCase() ? '/user/repos' : `/orgs/${encodeURIComponent(owner)}/repos`;
  return gh(route, {
    method: 'POST',
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
  }) as Promise<{ full_name: string; html_url: string; default_branch: string }>;
}

export async function pushGeneratedFiles(repo: string, branch: string, files: GeneratedFile[]) {
  const ref = await gh(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`) as { object: { sha: string } };
  const baseCommit = await gh(`/repos/${repo}/git/commits/${ref.object.sha}`) as { tree: { sha: string } };

  const tree = await gh(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: files.map((file) => ({ path: file.path, mode: '100644', type: 'blob', content: file.content })),
    }),
  }) as { sha: string };

  const commit = await gh(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: 'Bootstrap app from App Factory', tree: tree.sha, parents: [ref.object.sha] }),
  }) as { sha: string };

  await gh(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}
