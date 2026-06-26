/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@vokcg/ui',
    '@vokcg/api',
    '@vokcg/store',
    '@vokcg/config',
    '@vokcg/types',
    '@vokcg/constants',
    '@vokcg/i18n',
  ],
  // Dev-only proxy rewrites — in production the browser calls the API directly
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return []
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_PROXY_URL ?? 'http://127.0.0.1:8888'}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${process.env.API_PROXY_URL ?? 'http://127.0.0.1:8888'}/health`,
      },
    ]
  },
}

export default nextConfig
