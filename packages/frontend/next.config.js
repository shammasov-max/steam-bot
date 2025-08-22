/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  // Configure for development server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Proxy API calls to backend server
      },
    ]
  },
  // Enable source maps in development
  productionBrowserSourceMaps: true,
}

module.exports = nextConfig
