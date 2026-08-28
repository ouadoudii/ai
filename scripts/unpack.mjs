import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const deployDir = path.resolve('.deploy');
const chunks = fs.readdirSync(deployDir)
  .filter((name) => name.startsWith('chunk_'))
  .sort((a, b) => a.localeCompare(b));

if (!chunks.length) throw new Error('No .deploy/chunk_* files found');

const base64 = chunks
  .map((name) => fs.readFileSync(path.join(deployDir, name), 'utf8'))
  .join('')
  .replace(/\s+/g, '');

const archive = Buffer.from(base64, 'base64');
if (archive.length < 2 || archive[0] !== 0x1f || archive[1] !== 0x8b) {
  throw new Error(`Reconstructed Cary source archive is not gzip (base64 ${base64.length})`);
}

const archivePath = path.join(os.tmpdir(), 'cary-source.tar.gz');
fs.writeFileSync(archivePath, archive);
execFileSync('tar', ['-tzf', archivePath], { stdio: 'inherit' });
execFileSync('tar', ['-xzf', archivePath, '-C', process.cwd()], { stdio: 'inherit' });

for (const required of ['src/App.tsx','src/components/TodayHomeView.tsx','src/i18n/LanguageContext.tsx','src/index.css']) {
  if (!fs.existsSync(path.resolve(required))) throw new Error(`Archive extracted but ${required} is missing`);
}

console.log(`Restored Cary source from independent chunk set: ${chunks.length} parts, ${archive.length} bytes.`);
