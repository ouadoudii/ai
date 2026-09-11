# App Factory bootstrap

This directory is a standalone control-plane prototype. It is intentionally isolated from the Cary app while the factory is being built.

## Contract

Input: one business idea.

Output pipeline:
1. Generate a production-oriented MVP blueprint with OpenAI structured outputs.
2. Reject generated secrets, unsafe paths, duplicate paths, and real `.env` files.
3. Create a GitHub repository and push the generated app in one bootstrap commit.
4. Create a linked Vercel project.
5. Generated repositories must contain `factory.json`, GitHub Actions quality gates, unit/integration tests, Playwright browser journeys, `.env.example`, and no real secrets.
6. The ChatGPT `Factory App Improvement` loop discovers `factory.json` repositories and performs later improvements through branch -> PR -> full tests -> merge -> Vercel production verification.

## Required one-time Vercel environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (defaults to `gpt-5.6`)
- `GITHUB_TOKEN` with permission to create repositories and push contents
- `GITHUB_OWNER`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `FACTORY_REPO_VISIBILITY=private` (recommended)

Never commit the values. `.env.example` contains names only.

## Quality gate

```bash
npm run quality:deploy
npm run test:e2e
```

Production must not be promoted if either command fails.
