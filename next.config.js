/* eslint-disable */
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode for better performance
  reactStrictMode: false,
  
  // Disable dev indicators
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
  // Optimize images
  images: {
    unoptimized: true,
  },
  
  // Disable source maps in development
  productionBrowserSourceMaps: false,
  
  // Experimental features for performance
  experimental: {
    typedRoutes: true,
    // Remove clientTraceMetadata to fix Sentry conflicts
  },
  
  // Optimize webpack for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable optimization in development
      config.optimization.minimize = false
      config.optimization.removeAvailableModules = false
      config.optimization.removeEmptyChunks = false
      config.optimization.splitChunks = false
      
      // Disable source maps for faster builds
      config.devtool = false
      
      // Reduce memory usage
      config.cache = {
        type: 'memory',
      }
    }
    
    return config
  },
  
  // Optimize on-demand entries
  onDemandEntries: {
    maxInactiveAge: 25000, // 25 seconds
    pagesBufferLength: 2,
  },
  
  // Build ID for cache busting
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, configFile, stripPrefix, urlPrefix, include, ignore

  org: "tbf-skillz",
  project: "javascript-nextjs",
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Disable automatic client config injection since we use instrumentation-client.ts
  disableClientWebpackPlugin: true,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
