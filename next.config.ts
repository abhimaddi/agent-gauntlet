import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright'],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
