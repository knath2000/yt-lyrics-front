/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false, // Fix for webpack async dependencies issues
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  trailingSlash: false,
  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Environment variables for build time
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig; 