import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

function pngToIco(pngBuffer, size = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

async function generateFavicons() {
  const sourcePath = path.resolve('app/fevicon.jpg');
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source favicon file not found at ${sourcePath}`);
  }
  const sourceBuffer = fs.readFileSync(sourcePath);

  // Generate PNG icons of various standard sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  for (const size of sizes) {
    const pngBuffer = await sharp(sourceBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    if (size === 32) {
      fs.writeFileSync('public/favicon-32x32.png', pngBuffer);
    }
    if (size === 16) {
      fs.writeFileSync('public/favicon-16x16.png', pngBuffer);
    }
    if (size === 48) {
      fs.writeFileSync('public/favicon-48x48.png', pngBuffer);
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

  // Generate standard ICO file for public/favicon.ico
  const png32 = await sharp(sourceBuffer).resize(32, 32).png().toBuffer();
  const icoBuffer = pngToIco(png32, 32);
  fs.writeFileSync('public/favicon.ico', icoBuffer);

  // Clean up any app/favicon.ico to prevent Next.js metadata collision
  if (fs.existsSync('app/favicon.ico')) {
    fs.unlinkSync('app/favicon.ico');
  }

  // Copy fevicon.jpg to public directory for direct access
  fs.copyFileSync(sourcePath, 'public/fevicon.jpg');
  fs.copyFileSync(sourcePath, 'public/favicon.jpg');

  console.log('Favicons generated successfully from app/fevicon.jpg.');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
