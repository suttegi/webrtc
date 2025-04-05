/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["storage.googleapis.com"],
  },
  async rewrites() {
    return [
      {
        source: '/api/game/:path*',
        destination: 'https://api-game.gameorbit.kz/api/v1/game/:path*', // прокси на API
      },
    ]
  },
}

module.exports = nextConfig
