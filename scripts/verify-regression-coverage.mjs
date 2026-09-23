import { execFileSync } from 'node:child_process';

const TEST_FILE_RE = /(^|\/)([^/]+\.)?(test|spec)\.[cm]?[jt]sx?$/;

export function isUnitOrIntegrationTest(path) {
  return path.startsWith('tests/') || (path.startsWith('src/') && TEST_FILE_RE.test(path));
}

export function isE2E(path) {
  return path.startsWith('e2e/') && TEST_FILE_RE.test(path);
}

export function isProductCode(path) {
  if (isUnitOrIntegrationTest(path) || isE2E(path)) return false;
  return path === 'server.ts' || path.startsWith('api/') || path.startsWith('src/');
}

export function isUserVisibleFlow(path) {
  if (!isProductCode(path)) return false;
  return path === 'src/App.tsx' || path.startsWith('src/components/') || path === 'src/i18n.tsx' || path.startsWith('src/i18n/');
}

export function parseNameStatus(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split('\t');
    const status = parts[0] || '';
    return { status, path: (status.startsWith('R') || status.startsWith('C')) ? (parts[2] || parts[1] || '') : (parts[1] || '') };
  }).filter(change => change.path);
}

export function validateChanges(changes) {
  const productChanges = changes.filter(change => isProductCode(change.path));
  const uiChanges = productChanges.filter(change => isUserVisibleFlow(change.path));
  const changedTests = changes.filter(change => isUnitOrIntegrationTest(change.path) && !change.status.startsWith('D'));
  const changedE2E = changes.filter(change => isE2E(change.path) && !change.status.startsWith('D'));
  const deletedTests = changes.filter(change => (isUnitOrIntegrationTest(change.path) || isE2E(change.path)) && change.status.startsWith('D'));
  const errors = [];
  if (deletedTests.length) errors.push(`Test files may not be deleted in a normal product PR: ${deletedTests.map(change => change.path).join(', ')}`);
  if (productChanges.length && changedTests.length === 0) errors.push(`Product code changed without a regression test change. Product files: ${productChanges.map(change => change.path).join(', ')}`);
  if (uiChanges.length && changedE2E.length === 0) errors.push(`User-visible UI/flow changed without an E2E change. UI files: ${uiChanges.map(change => change.path).join(', ')}`);
  return { ok: errors.length === 0, errors, productChanges, uiChanges, changedTests, changedE2E, deletedTests };
}

function runCli() {
  const [base, head = 'HEAD'] = process.argv.slice(2);
  if (!base) {
    console.error('Usage: node scripts/verify-regression-coverage.mjs <base-sha> [head-sha]');
    process.exit(2);
  }
  const diff = execFileSync('git', ['diff', '--name-status', `${base}...${head}`], { encoding: 'utf8' });
  const result = validateChanges(parseNameStatus(diff));
  console.log(`Product files changed: ${result.productChanges.length}`);
  console.log(`Regression test files changed: ${result.changedTests.length}`);
  console.log(`User-visible flow files changed: ${result.uiChanges.length}`);
  console.log(`E2E files changed: ${result.changedE2E.length}`);
  if (!result.ok) {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log('Regression coverage guard passed.');
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runCli();
