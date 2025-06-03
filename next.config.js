/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Completely disable webpack caching
    config.cache = false;
    
    // Disable module concatenation that can cause import issues
    if (config.optimization) {
      config.optimization.concatenateModules = false;
      config.optimization.providedExports = false;
      config.optimization.usedExports = false;
      config.optimization.sideEffects = false;
    }
    
    // Disable infrastructure logging for cleaner output
    config.infrastructureLogging = {
      level: 'error',
    };

    return config;
  },
};

module.exports = nextConfig; 