# Docker MCP Installation Guide

## What is Docker MCP?

Docker MCP (Model Context Protocol) provides containerized MCP servers that enable AI applications to interact with external tools and data sources securely and efficiently.

## Prerequisites

- Docker Desktop 4.38+ installed and running
- Docker account (for accessing Docker Hub)

## Installation Methods

### Method 1: Docker MCP Catalog and Toolkit (Recommended)

1. **Install Docker Desktop Extension**
   - Open Docker Desktop
   - Go to Extensions menu
   - Search for "MCP Catalog and Toolkit"
   - Install the extension

2. **Enable Docker AI (if available)**
   - Open Docker Desktop Settings
   - Navigate to "Features in development"
   - Enable "Docker AI"
   - Accept terms and restart Docker Desktop

### Method 2: Manual MCP Server Installation

Pull the MCP server images you need:

```bash
# Essential MCP servers
docker pull mcp/time
docker pull mcp/filesystem
docker pull mcp/sqlite
docker pull mcp/puppeteer

# Development & Productivity servers
docker pull mcp/github
docker pull mcp/git
docker pull mcp/postgres
docker pull mcp/memory
docker pull mcp/fetch

# Additional servers (optional)
docker pull mcp/brave-search
docker pull mcp/google-maps
docker pull mcp/slack
```

## Available MCP Servers

### Core Servers
- **mcp/time** - Time and timezone utilities
- **mcp/filesystem** - File operations with access controls
- **mcp/sqlite** - Database interactions
- **mcp/puppeteer** - Browser automation and web scraping

### Development Servers
- **mcp/github** - GitHub repository management and API integration
- **mcp/git** - Git repository operations and version control
- **mcp/postgres** - PostgreSQL database access and queries

### Utility Servers
- **mcp/memory** - Knowledge graph-based persistent memory system
- **mcp/fetch** - Web content fetching and conversion
- **mcp/everything** - Test server with multiple features

### Additional Servers (Community/Third-party)
- **mcp/brave-search** - Web search using Brave's API
- **mcp/google-maps** - Location services and mapping
- **mcp/slack** - Slack integration for messaging
- **mcp/google-drive** - Google Drive file operations

## Configuration

### For Gordon (Docker AI Agent)

Create a `gordon-mcp.yml` file in your project directory:

```yaml
services:
  time:
    image: mcp/time
    
  filesystem:
    image: mcp/filesystem
    command: /workspace
    volumes:
      - .:/workspace
      
  sqlite:
    image: mcp/sqlite
    
  puppeteer:
    image: mcp/puppeteer
    environment:
      - DOCKER_CONTAINER=true
```

### For Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "-e", "DOCKER_CONTAINER=true", "mcp/puppeteer"]
    },
    "time": {
      "command": "docker", 
      "args": ["run", "-i", "--rm", "--init", "mcp/time"]
    },
    "filesystem": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "-v", "/Users:/Users", "mcp/filesystem", "/Users"]
    }
  }
}
```

## Testing Your Installation

### Test with Docker Commands

```bash
# Test time server
docker run -i --rm --init mcp/time

# Test filesystem server (with volume mount)
docker run -i --rm --init -v $(pwd):/workspace mcp/filesystem /workspace

# Test SQLite server
docker run -i --rm --init mcp/sqlite
```

### Test with Gordon (if available)

```bash
# Ask Gordon for current time
docker ai "What time is it now in Tokyo?"

# Ask Gordon to list files
docker ai "List the files in the current directory"
```

## Troubleshooting

### Common Issues

1. **Docker daemon not running**
   ```bash
   # Start Docker Desktop manually
   open -a "Docker Desktop"  # macOS
   ```

2. **Permission denied errors**
   - Ensure Docker Desktop is running
   - Check volume mount permissions
   - Verify Docker account access

3. **MCP server not responding**
   - Check if image was pulled successfully: `docker images | grep mcp`
   - Verify container can start: `docker run --rm mcp/time`

### Getting Help

- Docker MCP Documentation: https://docs.docker.com/desktop/features/gordon/mcp/
- Docker Community: https://forums.docker.com/
- GitHub Issues: https://github.com/docker/mcp-servers

## Security Considerations

- MCP servers run in isolated containers by default
- Use volume mounts carefully to limit filesystem access
- Regularly update MCP server images
- Review server documentation for specific security requirements

## Next Steps

1. Explore more MCP servers on Docker Hub: https://hub.docker.com/u/mcp
2. Learn about building custom MCP servers
3. Integrate with your preferred AI client (Claude, Cursor, etc.)
4. Join the Docker community to share experiences and get help 