/**
 * Production Security Headers Configuration snippet for next.config.mjs
 */

const securityHeaders = [
  // Mitigate clickjacking attacks by disallowing iframes
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent browser from MIME-sniffing away from declared Content-Type
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enforce HSTS (2 years, include subdomains, preload list eligible)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Ensure referrer is sent only for same-origin or HTTPS transitions
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict sensitive device APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Strips 'X-Powered-By: Next.js' header
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
