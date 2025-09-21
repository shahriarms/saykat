
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  allowedDevOrigins: ["*.cloudworkstations.dev"],
};

export default nextConfig;
