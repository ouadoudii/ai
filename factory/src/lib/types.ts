export type FactoryStage = 'planning' | 'generating' | 'github' | 'testing' | 'vercel' | 'ready' | 'blocked';

export interface FactoryJob {
  id?: string;
  appName: string;
  repoName: string;
  repo: string;
  headSha: string;
  prNumber: number;
  productionSha?: string;
  stage: FactoryStage;
  message: string;
  githubUrl?: string;
  actionsUrl?: string;
  vercelUrl?: string;
}
