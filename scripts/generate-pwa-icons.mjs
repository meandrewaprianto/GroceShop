/**
 * Generate simple PWA icons: green background with white letter "G"
 * Run with: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createSVG(size) {
  const cornerRadius = size * 0.15;
  const fontSize = size * 0.5;
  const fontWeight = 'bold';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#22c55e"/>
  <text 
    x="50%" 
    y="54%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    fill="white" 
    font-family="Arial, Helvetica, sans-serif" 
    font-size="${fontSize}" 
    font-weight="${fontWeight}"
  >G</text>
</svg>`;
}

const iconsDir = join(__dirname, '..', 'client', 'public', 'icons');

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
const sizes = [192, 512];
for (const size of sizes) {
  const svg = createSVG(size);
  const filePath = join(iconsDir, `icon-${size}x${size}.svg`);
  writeFileSync(filePath, svg);
  console.log(`Created: icon-${size}x${size}.svg`);
}

// Also update favicon (32x32 SVG)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="5" fill="#22c55e"/>
  <text 
    x="50%" 
    y="54%" 
    dominant-baseline="middle" 
    text-anchor="middle" 
    fill="white" 
    font-family="Arial, Helvetica, sans-serif" 
    font-size="18" 
    font-weight="bold"
  >G</text>
</svg>`;

const faviconPath = join(__dirname, '..', 'client', 'public', 'favicon.svg');
writeFileSync(faviconPath, faviconSvg);
console.log('Created: favicon.svg');

console.log('\nAll icons generated successfully!');