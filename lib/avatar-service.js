import sharp from 'sharp';
import { prisma } from './prisma.js';
import {
  isCloudinaryConfigured,
  uploadImage,
  deleteImage,
  extractCloudinaryPublicId,
} from './cloudinary.js';

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Check magic bytes of buffer to detect true binary format
 */
export function checkMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: 'RIFF' .... 'WEBP'
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return null;
}

/**
 * Validate and sanitize image buffer using magic bytes and Sharp
 */
export async function validateAndProcessImage(buffer) {
  if (!buffer || !(buffer instanceof Buffer)) {
    return { error: 'No image data provided.' };
  }

  if (buffer.length > MAX_AVATAR_SIZE) {
    return { error: 'File size exceeds the 5 MB limit. Please select a smaller image.' };
  }

  // 1. Check binary magic bytes
  const detectedMime = checkMagicBytes(buffer);
  if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
    return {
      error: 'Unsupported or corrupted image format. Please upload a valid JPEG, PNG, or WebP image.',
    };
  }

  // 2. Decode and verify with Sharp
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (err) {
    console.error('Sharp image parse error:', err);
    return {
      error: 'The uploaded file is not a valid or readable image.',
    };
  }

  if (!metadata || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    return {
      error: 'Invalid image format. Supported formats are JPEG, PNG, and WebP.',
    };
  }

  if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
    return {
      error: 'Invalid image dimensions.',
    };
  }

  // 3. Optimize image: auto-rotate, center crop to 500x500 square, convert to WebP
  try {
    const optimizedBuffer = await sharp(buffer)
      .rotate() // Auto-orient based on EXIF
      .resize(500, 500, {
        fit: 'cover',
        position: sharp.strategy?.entropy || 'center',
      })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    return { buffer: optimizedBuffer, mime: 'image/webp' };
  } catch (err) {
    console.error('Sharp optimization error:', err);
    return { error: 'Failed to process and optimize image.' };
  }
}

/**
 * Upload an avatar buffer to Cloudinary (or local dev fallback)
 */
export async function uploadAvatarToStorage({ buffer, userId, role }) {
  const safeRole = (role || 'user').toLowerCase();
  const safeId = (userId || 'anon').replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now();
  const publicId = `${safeRole}_${safeId}_${timestamp}`;

  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadImage(buffer, {
        folder: 'mediconnect/avatars',
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          {
            width: 500,
            height: 500,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        overwrite: true,
        invalidate: true,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        storage: 'cloudinary',
      };
    } catch (err) {
      console.error('Cloudinary avatar upload error:', err);
      throw new Error('Image storage service failed. Please try again later.');
    }
  }

  // Local development fallback when Cloudinary credentials are placeholders
  const base64Data = `data:image/webp;base64,${buffer.toString('base64')}`;
  return {
    url: base64Data,
    publicId: null,
    storage: 'fallback_data_url',
  };
}

/**
 * Safely delete an old avatar image from Cloudinary if it is no longer referenced
 */
export async function safeDeleteOldAvatar(oldUrl, currentUserId = null, currentDoctorId = null) {
  if (!oldUrl || typeof oldUrl !== 'string') return;
  if (!oldUrl.includes('res.cloudinary.com')) return;

  const publicId = extractCloudinaryPublicId(oldUrl);
  if (!publicId) return;

  // Only delete images that belong to the mediconnect/avatars folder
  if (!publicId.startsWith('mediconnect/avatars/')) return;

  try {
    // Check if any other user has this same URL
    const otherUser = await prisma.user.findFirst({
      where: {
        image: oldUrl,
        ...(currentUserId ? { id: { not: currentUserId } } : {}),
      },
      select: { id: true },
    });

    if (otherUser) return;

    // Check if any other doctor has this same URL
    const otherDoctor = await prisma.doctor.findFirst({
      where: {
        profilePhoto: oldUrl,
        ...(currentDoctorId ? { id: { not: currentDoctorId } } : {}),
      },
      select: { id: true },
    });

    if (otherDoctor) return;

    // Safe to delete from Cloudinary
    await deleteImage(publicId);
  } catch (err) {
    console.error('Error during safe avatar deletion:', err);
  }
}
