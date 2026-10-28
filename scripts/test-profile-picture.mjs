import { checkMagicBytes, validateAndProcessImage, MAX_AVATAR_SIZE } from '../lib/avatar-service.js';
import { extractCloudinaryPublicId, isCloudinaryConfigured } from '../lib/cloudinary.js';
import sharp from 'sharp';
import { Prisma } from '@prisma/client';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- STARTING PROFILE PICTURE TEST SUITE ---\n');

  // Test 1: Cloudinary configuration check
  const isConfigured = isCloudinaryConfigured();
  console.log(`Cloudinary configured with real keys: ${isConfigured}`);
  assert(typeof isConfigured === 'boolean', 'isCloudinaryConfigured returns a boolean');

  // Test 2: PublicId extraction
  const sampleUrl1 = 'https://res.cloudinary.com/demo/image/upload/v1612345678/mediconnect/avatars/patient_12345_6789.webp';
  const extracted1 = extractCloudinaryPublicId(sampleUrl1);
  assert(extracted1 === 'mediconnect/avatars/patient_12345_6789', 'Extracts public_id from versioned Cloudinary URL');

  const sampleUrl2 = 'https://res.cloudinary.com/demo/image/upload/mediconnect/avatars/doctor_999.jpg';
  const extracted2 = extractCloudinaryPublicId(sampleUrl2);
  assert(extracted2 === 'mediconnect/avatars/doctor_999', 'Extracts public_id from unversioned Cloudinary URL');

  const nonCloudinary = 'https://images.unsplash.com/photo-12345';
  assert(extractCloudinaryPublicId(nonCloudinary) === null, 'Returns null for non-Cloudinary URLs');

  // Test 3: Magic Bytes Detection
  const validPngBuffer = await sharp({
    create: { width: 50, height: 50, channels: 4, background: { r: 16, g: 185, b: 129, alpha: 1 } }
  }).png().toBuffer();
  assert(checkMagicBytes(validPngBuffer) === 'image/png', 'Detects PNG magic bytes correctly');

  const validJpgBuffer = await sharp({
    create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 0, b: 0 } }
  }).jpeg().toBuffer();
  assert(checkMagicBytes(validJpgBuffer) === 'image/jpeg', 'Detects JPEG magic bytes correctly');

  const validWebpBuffer = await sharp({
    create: { width: 50, height: 50, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } }
  }).webp().toBuffer();
  assert(checkMagicBytes(validWebpBuffer) === 'image/webp', 'Detects WebP magic bytes correctly');

  const fakeScriptBuffer = Buffer.from('<script>alert("hack")</script>');
  assert(checkMagicBytes(fakeScriptBuffer) === null, 'Rejects script file buffer as non-image');

  // Test 4: Image Validation & Processing with Sharp
  const validResult = await validateAndProcessImage(validPngBuffer);
  assert(!validResult.error && validResult.buffer instanceof Buffer, 'Validates and optimizes PNG buffer');
  assert(validResult.mime === 'image/webp', 'Converts optimized image to WebP');

  const meta = await sharp(validResult.buffer).metadata();
  assert(meta.width === 500 && meta.height === 500, 'Resizes image to exactly 500x500 square');

  // Test 5: File Size Restriction (>5MB)
  const oversizedBuffer = Buffer.alloc(MAX_AVATAR_SIZE + 1024, 0xff);
  const sizeResult = await validateAndProcessImage(oversizedBuffer);
  assert(sizeResult.error && sizeResult.error.includes('5 MB'), 'Rejects files larger than 5 MB');

  // Test 6: Corrupted Buffer
  const corruptedBuffer = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  const corruptResult = await validateAndProcessImage(corruptedBuffer);
  assert(corruptResult.error !== undefined, 'Rejects corrupted image bytes gracefully');

  // Test 7: Prisma Client Schema verification (DMMF)
  const userModel = Prisma.dmmf.datamodel.models.find(m => m.name === 'User');
  const userImageField = userModel?.fields.find(f => f.name === 'image');
  assert(userImageField?.type === 'String', 'Prisma User model includes String image field');

  const doctorModel = Prisma.dmmf.datamodel.models.find(m => m.name === 'Doctor');
  const doctorPhotoField = doctorModel?.fields.find(f => f.name === 'profilePhoto');
  assert(doctorPhotoField?.type === 'String', 'Prisma Doctor model includes String profilePhoto field');

  const patientModel = Prisma.dmmf.datamodel.models.find(m => m.name === 'Patient');
  const patientPhotoField = patientModel?.fields.find(f => f.name === 'profilePhoto');
  assert(patientPhotoField?.type === 'String', 'Prisma Patient model includes String profilePhoto field');

  console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
