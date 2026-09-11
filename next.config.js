/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'cytoscape'],
  },
  async rewrites() {
    const backendUrl = process.env.API_URL || 'http://127.0.0.1:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/firs/:path*',
        destination: `${backendUrl}/firs/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
