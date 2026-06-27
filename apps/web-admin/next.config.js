import { createDevProxyRewrites } from '../../packages/config/dev-proxy-rewrites.mjs'

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
    return createDevProxyRewrites()
  },
}

export default nextConfig
