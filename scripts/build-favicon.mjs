import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function generateFavicons() {
  const svgPath = path.resolve('app/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG icons of various standard sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  for (const size of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    if (size === 32) {
      fs.writeFileSync('public/favicon-32x32.png', pngBuffer);
    }
    if (size === 16) {
      fs.writeFileSync('public/favicon-16x16.png', pngBuffer);
    }
    if (size === 180) {
      fs.writeFileSync('public/apple-touch-icon.png', pngBuffer);
    }
    if (size === 192) {
      fs.writeFileSync('public/android-chrome-192x192.png', pngBuffer);
    }
    if (size === 512) {
      fs.writeFileSync('public/android-chrome-512x512.png', pngBuffer);
    }
  }

  // Create standard ICO file with 16, 32, 48 px PNG frames
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/favicon.ico', png32);
  fs.writeFileSync('app/favicon.ico', png32);

  console.log('Favicons generated successfully.');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
