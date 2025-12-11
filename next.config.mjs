/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  // Disable source maps to avoid Turbopack source map parsing issues
  productionBrowserSourceMaps: false,
};

export default nextConfig;
