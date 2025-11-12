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
    // Fix for non-JS files in node_modules being imported
    config.module.rules.push({
      test: /\.(md|LICENSE|txt)$/,
      type: 'asset/source',
    });

    // Fix for native .node addons - treat them as external assets
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    // Externalize native modules for server-side only
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@libsql/darwin-arm64');
    }

    return config;
  },
};

export default nextConfig;
