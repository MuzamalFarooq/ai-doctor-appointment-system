import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Check if real Cloudinary credentials are fully configured
 */
export function isCloudinaryConfigured() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    name &&
    name !== 'your-cloud-name' &&
    key &&
    key !== 'your-api-key' &&
    secret &&
    secret !== 'your-api-secret'
  );
}

/**
 * Extract Cloudinary public_id from a full Cloudinary asset URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234/mediconnect/avatars/patient_123.webp
 * Returns: "mediconnect/avatars/patient_123"
 */
export function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let pathPart = url.slice(uploadIndex + 8);
    // Strip version prefix if present e.g. "v1234567890/"
    pathPart = pathPart.replace(/^v\d+\//, '');
    // Strip file extension
    const lastDot = pathPart.lastIndexOf('.');
    if (lastDot !== -1) {
      pathPart = pathPart.slice(0, lastDot);
    }
    return pathPart || null;
  } catch {
    return null;
  }
}

/**
 * Upload an image buffer or base64 string to Cloudinary
 */
export async function uploadImage(file, options = {}) {
  const uploadOptions = {
    folder: 'mediconnect',
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
    ...(typeof options === 'string' ? { folder: options } : options),
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    if (file instanceof Buffer) {
      uploadStream.end(file);
    } else if (typeof file === 'string') {
      // If base64 or file path passed, use standard uploader
      cloudinary.uploader.upload(file, uploadOptions)
        .then(resolve)
        .catch(reject);
    } else {
      reject(new Error('Invalid file type provided for upload'));
    }
  });
}

// Alias for backward compatibility
export const uploadToCloudinary = uploadImage;

/**
 * Delete an image by publicId from Cloudinary
 */
export async function deleteImage(publicId) {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.error('Failed to destroy Cloudinary image:', publicId, err);
    return null;
  }
}

export default cloudinary;
