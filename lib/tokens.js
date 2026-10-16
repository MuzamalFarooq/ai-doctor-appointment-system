import crypto from 'crypto';

/**
 * Generates a cryptographically secure password reset token (256 bits)
 * and its SHA-256 hash for database storage.
 * 
 * Token lifetime: 30 minutes
 */
export function generatePasswordResetToken() {
  // 32 bytes = 256 bits of cryptographically secure randomness
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

/**
 * Computes the SHA-256 hash of a submitted raw reset token.
 * Never store, compare, or query by raw tokens.
 */
export function hashResetToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}
