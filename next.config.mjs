import webpack from 'webpack';

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
  webpack: (config) => {
    // Ignore README.md and LICENSE files from node_modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(md|txt|LICENSE)$/i,
        contextRegExp: /node_modules/,
      })
    );

    return config;
  },
};

export default nextConfig;
