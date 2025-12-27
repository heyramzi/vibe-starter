import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Proxy analytics script to bypass ad blockers
  async rewrites() {
    const umamiHost = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
      ? new URL(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL).origin
      : 'https://cloud.umami.is'

    return [
      {
        source: '/u/:path*',
        destination: `${umamiHost}/:path*`,
      },
    ]
  },
}

export default nextConfig

// Initialize OpenNext Cloudflare for local development
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
initOpenNextCloudflareForDev()
