import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [192, 512];

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1b3022;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d4a35;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.38}" r="${size * 0.12}" fill="#faf7f2" opacity="0.9"/>
  <circle cx="${size * 0.3}" cy="${size * 0.82}" r="${size * 0.12}" fill="#faf7f2" opacity="0.9"/>
  <circle cx="${size * 0.7}" cy="${size * 0.82}" r="${size * 0.12}" fill="#faf7f2" opacity="0.9"/>
  <path d="M${size * 0.5} ${size * 0.82} L${size * 0.5} ${size * 0.65} L${size * 0.38} ${size * 0.55} L${size * 0.5} ${size * 0.45} L${size * 0.62} ${size * 0.55} L${size * 0.5} ${size * 0.65}" fill="none" stroke="#faf7f2" stroke-width="${size * 0.02}" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${size * 0.5}" y="${size * 0.28}" text-anchor="middle" fill="#faf7f2" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.08}">GroceShop</text>
</svg>`;

const outDir = join(process.cwd(), 'client', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

for (const size of sizes) {
  const svg = svgTemplate(size);
  writeFileSync(join(outDir, `icon-${size}x${size}.svg`), svg);
  console.log(`✅ Created icon-${size}x${size}.svg`);
}

console.log('🎉 Done! PWA icons created in client/public/icons/');