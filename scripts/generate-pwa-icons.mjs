/**
 * PWA Icon Generator
 * Generates PNG icons for the PWA manifest from the SVG source.
 * Run once with: node scripts/generate-pwa-icons.mjs
 * Requires: npm install -D sharp (if not installed)
 */
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public/icons/icon.svg');
const outDir = resolve(root, 'public/icons');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

let sharp;
try {
    sharp = (await import('sharp')).default;
} catch {
    console.error('❌  sharp not found. Run: npm install -D sharp');
    process.exit(1);
}

const svgBuffer = readFileSync(svgPath);
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
    await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(resolve(outDir, `icon-${size}x${size}.png`));
    console.log(`✅  icon-${size}x${size}.png`);
}

console.log('\n🎉  PWA icons generated in public/icons/');
