/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
  webpack: (config) => {
    // Ignore node-fetch warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/next\/dist\/compiled\/@next\/font/,
        message: /node-fetch/,
      },
    ];
    return config;
  },
};

module.exports = nextConfig;
