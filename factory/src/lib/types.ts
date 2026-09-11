export type FactoryStage =
  | 'planning'
  | 'generating'
  | 'github'
  | 'testing'
  | 'vercel'
  | 'ready'
  | 'blocked';

export interface FactoryJob {
  id: string;
  appName: string;
  repo: string;
  stage: FactoryStage;
  message: string;
  githubUrl?: string;
  vercelUrl?: string;
}
