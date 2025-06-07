# Stagewise VS Code Extension Integration

## Overview

This document details the integration of the Stagewise VS Code extension with the Appitivity project, providing enhanced development workflows and AI-powered code assistance directly within the development environment.

## Features Implemented

### 🔌 Stagewise Toolbar Integration
- **Real-time Connection**: Toolbar automatically connects to the Stagewise VS Code extension
- **Dynamic Status Monitoring**: Health checks and connection status tracking
- **Interactive Development**: Direct integration with AI coding assistance
- **Context Awareness**: Toolbar adapts based on current page and user context

### 🛠️ Development Tools
- **Mock Server**: Standalone mock server for testing Stagewise functionality
- **Debug Pages**: Dedicated debugging pages for development and testing
- **API Endpoints**: RESTful endpoints for Stagewise communication
- **Configuration Management**: Comprehensive configuration system

### 📊 MCP (Model Context Protocol) Configuration
- **Firecrawl Integration**: Web scraping and content extraction capabilities
- **Firebase Tools**: Database and authentication management
- **Desktop Commander**: System-level automation and control
- **Claude Squad**: Multi-AI instance management and coordination

## Architecture

### Component Structure
```
src/
├── components/dev/
│   └── stagewise-toolbar.tsx          # Main toolbar component
├── app/
│   ├── api/stagewise-check/           # Health check endpoint
│   ├── api/stagewise-mock-server/     # Mock server API
│   ├── stagewise-debug/               # Debug page
│   └── test-stagewise/                # Testing page
├── types/
│   └── stagewise.d.ts                 # TypeScript definitions
└── configuration files:
    ├── .cursor/mcp.json               # MCP server configuration
    ├── stagewise.config.js            # Stagewise configuration
    └── stagewise-mock-server.js       # Standalone mock server
```

### Connection Flow
1. **Initialization**: Toolbar component loads and checks for Stagewise extension
2. **Health Check**: Regular ping to extension server on port 5747
3. **Connection**: Establishes WebSocket or HTTP connection for real-time communication
4. **Status Updates**: Continuous monitoring and status reporting
5. **Context Sync**: Synchronizes current page context with extension

## Configuration

### MCP Server Setup
The project includes MCP (Model Context Protocol) configuration for enhanced AI development capabilities:

```json
{
  "mcpServers": {
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-4400edeafe75408caad65b62e3e1110f"
      }
    },
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"]
    }
  }
}
```

### Stagewise Configuration
```javascript
module.exports = {
  // Stagewise extension settings
  extensionPort: 5747,
  healthCheckInterval: 5000,
  reconnectAttempts: 3,
  timeout: 10000,
  
  // Development settings
  mockServer: {
    enabled: process.env.NODE_ENV === 'development',
    port: 5747
  }
}
```

## Development Workflow

### Setting Up Stagewise
1. **Install VS Code Extension**: Install the Stagewise extension in VS Code
2. **Start Extension Server**: Ensure the extension server is running on port 5747
3. **Launch Development Server**: Start the Next.js development server
4. **Verify Connection**: Check the toolbar for connection status

### Testing with Mock Server
When the Stagewise extension is not available, use the mock server:

```bash
# Start the mock server
node stagewise-mock-server.js

# Or use the npm script (if configured)
npm run stagewise:mock
```

### API Endpoints

#### Health Check
- **URL**: `/api/stagewise-check`
- **Method**: GET
- **Response**: JSON with connection status and extension availability

#### Connection Management
- **URL**: `/connect` (Extension server)
- **Method**: POST
- **Payload**: Connection details and context information

## Enhanced Bookmark Functionality

### Usage Percentage Display
- **Bold Numbers**: Usage percentages are displayed in bold for better visibility
- **Contextual Tooltips**: Enhanced tooltips provide detailed usage information
- **Real-time Updates**: Percentages update dynamically based on bookmark interactions

### Validation Improvements
- **Enhanced Validation**: Improved bookmark validation with better error handling
- **Type Safety**: Strict TypeScript types for all bookmark operations
- **Service Layer**: Refactored service layer for better maintainability

### UI Components
- **Calendar Integration**: Enhanced calendar component for date-based features
- **Moving Borders**: Animated UI elements for improved user experience
- **Professional Styling**: Consistent design language across all components

## Testing Strategy

### End-to-End Testing
Comprehensive E2E testing for dashboard functionality:
- **Bookmark Operations**: Create, read, update, delete operations
- **Navigation Testing**: Full navigation flow testing
- **Responsive Design**: Multi-device testing scenarios
- **Performance Testing**: Load time and interaction performance

### Test Files
```
tests/e2e/
└── dashboard.spec.ts              # Main dashboard testing suite
```

### Running Tests
```bash
# Run E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/dashboard.spec.ts
```

## Migration and Cleanup

### Service Layer Refactoring
- **Disabled Services**: Old bookmark-relationships service moved to `.disabled` extension
- **Migration Scripts**: Automated migration for database schema updates
- **Backward Compatibility**: Maintained compatibility with existing data

### Code Organization
- **Component Restructuring**: Improved component organization and hierarchy
- **Type Definitions**: Enhanced TypeScript definitions for better development experience
- **Configuration Management**: Centralized configuration for all external services

## Security Considerations

### API Key Management
- **Environment Variables**: All API keys stored securely in environment variables
- **Access Control**: Proper access control for development endpoints
- **CORS Configuration**: Appropriate CORS settings for cross-origin requests

### Development Safety
- **Mock Server Security**: Mock server only available in development mode
- **Debug Endpoints**: Debug endpoints restricted to development environment
- **Data Validation**: Input validation for all external API communications

## Troubleshooting

### Common Issues
1. **Extension Not Found**: Ensure Stagewise VS Code extension is installed and running
2. **Port Conflicts**: Check if port 5747 is available for the extension server
3. **Connection Timeouts**: Verify network settings and firewall configurations
4. **Mock Server Issues**: Ensure Node.js version compatibility

### Debug Tools
- **Debug Page**: Visit `/stagewise-debug` for comprehensive debugging information
- **Test Page**: Use `/test-stagewise` for manual testing of functionality
- **Console Logging**: Detailed console logs for connection status and errors

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user development session support
- **Advanced AI Integration**: Enhanced AI-powered code suggestions and refactoring
- **Plugin System**: Extensible plugin architecture for custom workflows
- **Performance Monitoring**: Real-time performance monitoring and optimization

### Integration Roadmap
- **Additional MCP Servers**: Integration with more specialized development tools
- **Cloud Synchronization**: Cloud-based configuration and state synchronization
- **Team Collaboration**: Team-based development workflows and shared configurations
- **Analytics Dashboard**: Development analytics and productivity metrics

## Support and Documentation

### Resources
- **Stagewise Documentation**: Refer to the official Stagewise VS Code extension documentation
- **MCP Protocol**: Model Context Protocol specification and implementation guides
- **Development Guides**: Internal development guidelines and best practices

### Getting Help
- **Issue Tracking**: Use GitHub issues for bug reports and feature requests
- **Development Team**: Contact the development team for technical support
- **Community**: Join the development community for shared knowledge and solutions 