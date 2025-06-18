/* eslint-disable */
const { withSentryConfig } = require('@sentry/nextjs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Optimize dev indicators
  devIndicators: {
    buildActivity: false,
  },
  
  // Optimize images
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for performance
  experimental: {
    typedRoutes: true,
    // Optimize package imports for faster builds
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns'
    ],
    webpackBuildWorker: false, // Disable for dev stability
  },
  
  // Optimize webpack for faster builds with profiling
  webpack: (config, { dev, isServer }) => {
    // Development optimizations with profiling
    if (dev) {
      // Log webpack compilation phases
      const startTime = Date.now();
      console.log('🔧 Webpack dev config started');
      
      // Disable expensive optimizations in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false, // Disable in dev for speed
        minimize: false, // Disable minification in dev
        concatenateModules: false, // Disable scope hoisting in dev
      };
      
      // Use fastest source maps for development
      config.devtool = false; // Disable source maps for maximum speed
      
      // Optimized file watching with reduced scope
      config.watchOptions = {
        poll: false, // Use native file watching
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/coverage/**',
          '**/build/**',
          '**/*.test.*',
          '**/*.spec.*',
          '**/tests/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/storybook-static/**',
          '**/.storybook/**',
          '**/docs/**',
          '**/*.md',
          '**/*.log'
        ],
        aggregateTimeout: 300, // Debounce file changes
      };
      
      // Enable aggressive persistent caching with absolute path
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
        compression: 'gzip',
        hashAlgorithm: 'xxhash64',
      };
      
      // Optimize module resolution
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
      
      // Disable expensive plugins in development
      config.plugins = config.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name;
        // Remove expensive plugins that aren't needed in dev
        return !['OptimizeCssAssetsWebpackPlugin', 'TerserPlugin'].includes(pluginName);
      });
      
      console.log(`⚡ Webpack dev config completed in ${Date.now() - startTime}ms`);
    } else {
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
      
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    
    // Resolve optimizations for all builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  // TypeScript configuration for faster builds
  typescript: {
    // Disable type checking during build for faster compilation
    // Type checking should be done separately
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ESLint configuration for faster builds
  eslint: {
    // Disable ESLint during build for faster compilation
    // Linting should be done separately
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Output optimization
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Optimize static file serving
  assetPrefix: process.env.NODE_ENV === 'production' ? '/static' : '',
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for better UX
  async redirects() {
    return [];
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return [];
  },
  
  // Power optimizations
  poweredByHeader: false,
  
  // Trailing slash optimization
  trailingSlash: false,
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
  // Disable client webpack plugin to avoid conflicts
  disableClientWebpackPlugin: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
