/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // WSL-friendly settings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig