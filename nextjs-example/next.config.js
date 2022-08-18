/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  pageExtensions: ['page.tsx'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
