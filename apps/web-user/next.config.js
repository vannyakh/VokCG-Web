/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@vokcg/ui',
    '@vokcg/api',
    '@vokcg/store',
    '@vokcg/config',
    '@vokcg/types',
    '@vokcg/constants',
    '@vokcg/i18n',
  ],
  async rewrites() {
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
