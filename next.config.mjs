/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore README.md and LICENSE files from node_modules
    config.module.rules.push({
      test: /\.(md|txt)$/,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
