export interface GeneratedFile { path: string; content: string; }
export interface AppBlueprint {
  appName: string;
  repoName: string;
  summary: string;
  testScenarios: string[];
  files: GeneratedFile[];
}

const SYSTEM_PROMPT = `You are the builder inside a strict App Factory. Turn one business idea into a production-ready MVP web app.
Hard rules:
- Use a simple Vite + React + TypeScript stack unless the product clearly requires another web stack.
- Produce complete text files only, never binaries.
- Include package.json, README.md, .gitignore, .env.example, factory.json, a GitHub Actions quality workflow, unit/integration tests, and Playwright browser tests for critical user journeys.
- factory.json must contain {"active":true,"lastImprovedAt":null} plus app metadata.
- Never include real credentials or secret values. Environment variables may appear only as names/placeholders in .env.example.
- Add scripts so one quality command runs type/lint checks, unit/integration tests, browser tests, and a production build.
- Tests must verify meaningful behavior, not placeholder assertions.
- The UI must be understandable on mobile without onboarding knowledge.
- Prefer a focused, usable MVP over many half-built features.`;

export async function generateAppBlueprint(idea: string): Promise<AppBlueprint> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');
  const model = process.env.OPENAI_MODEL || 'gpt-5.6';

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['appName', 'repoName', 'summary', 'testScenarios', 'files'],
    properties: {
      appName: { type: 'string', minLength: 2, maxLength: 80 },
      repoName: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' },
      summary: { type: 'string', minLength: 20, maxLength: 1000 },
      testScenarios: { type: 'array', minItems: 3, maxItems: 20, items: { type: 'string' } },
      files: {
        type: 'array', minItems: 8, maxItems: 80,
        items: {
          type: 'object', additionalProperties: false, required: ['path', 'content'],
          properties: { path: { type: 'string' }, content: { type: 'string' } },
        },
      },
    },
  };

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'high' },
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Business idea:\n${idea}` },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'app_factory_blueprint',
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!response.ok) throw new Error(`OpenAI generation failed (${response.status}).`);
  const data = await response.json() as { output_text?: string };
  if (!data.output_text) throw new Error('OpenAI returned no structured blueprint.');
  return JSON.parse(data.output_text) as AppBlueprint;
}
