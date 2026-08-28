import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const deployDir = path.resolve('.deploy');
const chunks = fs.readdirSync(deployDir)
  .filter((name) => name.startsWith('full_'))
  .sort((a, b) => a.localeCompare(b));

if (!chunks.length) throw new Error('No .deploy/full_* files found');

const base64 = chunks.map((name) => {
  let part = fs.readFileSync(path.join(deployDir, name), 'utf8').replace(/\s+/g, '');
  // full_01 was replaced by full_010/full_011/full_012. The final split part
  // contains 117 accidental trailing characters; trim only that part so all
  // subsequent archive bytes remain in their correct positions.
  if (name === 'full_012') part = part.slice(0, -117);
  return part;
}).join('');

if (base64.length !== 118832) {
  throw new Error(`Unexpected repaired Cary archive length: ${base64.length}`);
}

const archive = Buffer.from(base64, 'base64');
if (archive.length < 2 || archive[0] !== 0x1f || archive[1] !== 0x8b) {
  throw new Error('Reconstructed Cary source archive is not gzip');
}

const archivePath = path.join(os.tmpdir(), 'cary-source.tar.gz');
fs.writeFileSync(archivePath, archive);
execFileSync('tar', ['-tzf', archivePath], { stdio: 'inherit' });
execFileSync('tar', ['-xzf', archivePath, '-C', process.cwd()], { stdio: 'inherit' });

for (const required of ['src/App.tsx','src/components/TodayHomeView.tsx','src/components/AddMomentModal.tsx','src/components/DailyCheckInModal.tsx','src/i18n/LanguageContext.tsx','src/utils/coachEngine.ts','src/index.css']) {
  if (!fs.existsSync(path.resolve(required))) throw new Error(`Archive extracted but ${required} is missing`);
}

console.log(`Restored complete Cary source from ${chunks.length} repaired archive parts (${archive.length} bytes).`);
