# App Factory bootstrap

This directory is an isolated control plane for turning one business idea into a tested, deployed application and then handing it to the shared improvement loop.

## Product contract

After the one-time private setup, the normal input is only a business idea.

The pipeline is deliberately gated:
1. Authenticate to the private Factory once; the browser receives a Secure + HttpOnly session cookie.
2. Generate a focused MVP blueprint through the OpenAI Responses API with strict JSON Schema output.
3. Inject the Factory-owned `factory.json`, environment-file protection and immutable GitHub Actions quality workflow.
4. Reject unsafe paths, duplicate paths, real `.env` files, common secret formats, missing tests, missing Playwright journeys, or test-bypass scripts.
5. Create a private GitHub repository and a `factory/bootstrap` branch, push the app there and open a pull request.
6. Wait for `Factory Quality Gate`: type/lint checks, unit/integration tests, production-dependency audit, real Chromium Playwright journeys and production build.
7. If the gate is red, do not merge and do not create a Vercel project.
8. Only after the gate is green, squash-merge the bootstrap PR.
9. Only after merge, create/link the Vercel project and wait until the matching production deployment is `READY`.
10. The root `factory.json` then makes the app discoverable by the shared ChatGPT `Factory App Improvement` loop for later branch -> PR -> tests -> merge -> production verification iterations.

## Required one-time Vercel environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (defaults to `gpt-5.6`)
- `GITHUB_TOKEN` with permission to create repositories, branches, pull requests, merges and read Actions
- `GITHUB_OWNER`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `FACTORY_REPO_VISIBILITY=private` (recommended)
- `FACTORY_ACCESS_KEY` (at least 24 random characters)

Never commit these values. `.env.example` contains names/placeholders only.

## Bootstrap quality gate

```bash
npm run lint
npm test
npm run test:e2e
npm run build
```

The GitHub workflow executes all four checks before this bootstrap may be promoted anywhere.
