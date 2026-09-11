import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { generateAppBlueprint } from '../server/lib/openai';
import { assertSafeGeneratedFiles } from '../server/lib/security';
import { createRepository, pushGeneratedFiles } from '../server/lib/github';
import { createVercelProject } from '../server/lib/vercel';

const bodySchema = z.object({ idea: z.string().trim().min(20).max(6000) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Ungültige Geschäftsidee.' });

  try {
    const blueprint = await generateAppBlueprint(parsed.data.idea);
    assertSafeGeneratedFiles(blueprint.files);

    const repo = await createRepository(blueprint.repoName, blueprint.summary);
    const commitSha = await pushGeneratedFiles(repo.full_name, repo.default_branch || 'main', blueprint.files);
    const project = await createVercelProject(blueprint.repoName, repo.full_name);

    return res.status(201).json({
      id: commitSha.slice(0, 12),
      appName: blueprint.appName,
      repo: repo.full_name,
      stage: 'testing',
      message: 'Repo und Vercel-Projekt sind erstellt. GitHub Actions führt jetzt das vollständige Quality-Gate aus; Production wird erst nach Grün freigegeben.',
      githubUrl: repo.html_url,
      vercelProjectId: project.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Factory-Job fehlgeschlagen.' });
  }
}
