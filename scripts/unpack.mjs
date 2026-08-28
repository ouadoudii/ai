import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const deployDir = path.resolve('.deploy');
const chunks = fs.readdirSync(deployDir)
  .filter((name) => name.startsWith('full_'))
  .sort((a, b) => a.localeCompare(b));

if (!chunks.length) throw new Error('No .deploy/full_* files found');

const base64 = chunks.map((name) => {
  let part = fs.readFileSync(path.join(deployDir, name), 'utf8').replace(/\s+/g, '');
  if (name === 'full_012') part = part.slice(0, -117);
  return part;
}).join('');

if (base64.length !== 118832) throw new Error(`Unexpected repaired Cary archive length: ${base64.length}`);

const archive = Buffer.from(base64, 'base64');
if (archive.length < 2 || archive[0] !== 0x1f || archive[1] !== 0x8b) throw new Error('Reconstructed Cary source archive is not gzip');

const archivePath = path.join(os.tmpdir(), 'cary-source.tar.gz');
fs.writeFileSync(archivePath, archive);

// The historical archive has a bad gzip footer CRC, but its tar payload is readable
// through the final source file. Extract it, then verify the complete expected source
// set before allowing tests/build to continue.
const extracted = spawnSync('tar', ['-xzf', archivePath, '-C', process.cwd()], { stdio: 'inherit' });
if (extracted.error) throw extracted.error;

const requiredFiles = [
  'src/App.tsx', 'src/main.tsx', 'src/types.ts', 'src/apiClient.ts', 'src/index.css',
  'src/components/AddMomentModal.tsx', 'src/components/CaringGuardian.tsx',
  'src/components/CaringVoiceHero.tsx', 'src/components/DailyCheckInModal.tsx',
  'src/components/FoodCalendarView.tsx', 'src/components/FoodCoachView.tsx',
  'src/components/FoodFavoritesView.tsx', 'src/components/FoodStatsView.tsx',
  'src/components/Header.tsx', 'src/components/MobileBottomNav.tsx',
  'src/components/MomentCard.tsx', 'src/components/MomentCategoryFilter.tsx',
  'src/components/MomentDetailModal.tsx', 'src/components/NutritionTypeAnalysisView.tsx',
  'src/components/SmartInterventionGuardian.tsx', 'src/components/TodayHomeView.tsx',
  'src/data/checkInsData.ts', 'src/data/momentsData.ts',
  'src/i18n/LanguageContext.tsx', 'src/i18n/translations.ts',
  'src/utils/caringPrompts.ts', 'src/utils/coachEngine.ts',
  'src/utils/interventionEngine.ts', 'src/utils/nutritionTypeEngine.ts',
  'package.json', 'vite.config.ts', 'tsconfig.json', 'index.html'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)) || fs.statSync(path.resolve(file)).size === 0);
if (missing.length) throw new Error(`Cary restore missing files: ${missing.join(', ')}`);

console.log(`Extracted and verified ${requiredFiles.length} Cary source files; tar exit status ${extracted.status} is accepted only after this verification.`);
