import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const sourceDir = 'generated-food-src';
const outputDir = 'public/generated-food';
const outputFile = join(outputDir, 'cary-food-hd.webp');

const parts = readdirSync(sourceDir)
  .filter((name) => name.startsWith('cary-food-hd.part'))
  .sort();

if (parts.length !== 8) {
  throw new Error(`Expected 8 generated food gallery parts, found ${parts.length}`);
}

const encoded = parts.map((name) => readFileSync(join(sourceDir, name), 'utf8').trim()).join('');
const image = Buffer.from(encoded, 'base64');

if (image.length < 100_000) {
  throw new Error(`Generated food gallery is unexpectedly small (${image.length} bytes)`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, image);
console.log(`Generated ${outputFile} (${image.length} bytes)`);
