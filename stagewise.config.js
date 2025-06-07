module.exports = {
  // Stagewise configuration
  enabled: true,
  
  // Development server settings
  server: {
    port: 5747, // Default Stagewise port
    host: 'localhost',
    autoStart: true
  },
  
  // Toolbar configuration
  toolbar: {
    enabled: true,
    position: 'bottom-right',
    theme: 'dark'
  },
  
  // Plugin configuration
  plugins: [
    '@stagewise-plugins/react'
  ],
  
  // Framework-specific settings
  framework: 'next',
  
  // Development environment settings
  development: {
    enabled: true,
    verbose: true,
    debug: true
  }
}; 