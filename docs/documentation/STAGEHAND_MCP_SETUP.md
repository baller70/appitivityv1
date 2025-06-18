# Stagehand MCP Installation & Setup Guide

## 🤘 What is Stagehand MCP?

Stagehand MCP is an AI-powered browser automation server that integrates with the Model Context Protocol. It provides sophisticated web automation capabilities using natural language instructions, powered by OpenAI's models and Browserbase cloud browsers.

## ✅ Installation Status

**Successfully Installed!** Stagehand MCP is now configured for:
- ✅ **Cursor** (`~/.cursor/mcp.json`)
- ✅ **Claude Desktop** (`claude_desktop_config.json`)
- ✅ **Gordon AI** (`gordon-mcp.yml`)

## 🎯 Stagehand Capabilities

### Core Tools Available:
1. **stagehand_navigate** - Navigate to any URL
2. **stagehand_act** - Perform actions on web pages (click, type, scroll)
3. **stagehand_extract** - Extract structured data from web pages
4. **stagehand_observe** - Observe and analyze web page elements
5. **screenshot** - Take screenshots of current page state

### What Makes Stagehand Special:
- **AI-Powered**: Uses OpenAI models to understand web pages
- **Natural Language**: Describe actions in plain English
- **Cloud Browsers**: Runs in Browserbase cloud for reliability
- **Structured Data**: Extract complex data with schema validation
- **Visual Understanding**: Takes screenshots for context

## 🔐 Required Credentials

To use Stagehand MCP, you need:

### 1. OpenAI API Key
- Get from: https://platform.openai.com/api-keys
- Used for: AI-powered web understanding and actions
- Cost: Pay-per-use based on OpenAI pricing

### 2. Browserbase Account
- Sign up: https://www.browserbase.com/
- Get API Key and Project ID from dashboard
- Used for: Cloud browser instances
- Cost: Free tier available, then pay-per-session

## ⚙️ Configuration

### For Cursor
Your configuration is already added to `~/.cursor/mcp.json`. To activate:

1. **Add your credentials** to the environment variables:
```json
{
  "stagehand": {
    "command": "node",
    "args": ["/Volumes/Softwaare Program/apptivity final v1/mcp-server-browserbase/stagehand/dist/index.js"],
    "env": {
      "OPENAI_API_KEY": "sk-your-key-here",
      "BROWSERBASE_API_KEY": "bb_your-key-here", 
      "BROWSERBASE_PROJECT_ID": "prj_your-project-id"
    }
  }
}
```

2. **Restart Cursor** for changes to take effect

### For Claude Desktop
Similar configuration is in `claude_desktop_config.json`. Just add your real credentials and restart Claude Desktop.

## 🚀 Usage Examples

### Basic Navigation
```
"Navigate to github.com and take a screenshot"
```

### Data Extraction
```
"Go to news.ycombinator.com and extract the top 5 story titles and their URLs"
```

### Web Interaction
```
"Go to google.com, search for 'Stagehand browser automation', and click on the first result"
```

### Complex Automation
```
"Navigate to linkedin.com, log in with my credentials, go to my profile, and extract my connections count"
```

## 📁 File Structure

```
mcp-server-browserbase/
└── stagehand/
    ├── dist/           # Built JavaScript files
    │   ├── index.js    # Main entry point
    │   ├── server.js   # Core server logic
    │   ├── tools.js    # Tool implementations
    │   └── ...
    ├── src/            # TypeScript source files
    ├── package.json    # Dependencies
    └── tsconfig.json   # TypeScript config
```

## 🛠️ Development & Debugging

### Build from Source
```bash
cd mcp-server-browserbase/stagehand
npm install
npm run build
```

### Debug Mode
Add to environment variables:
```
DEBUG=true
STAGEHAND_DEBUG=true
```

### Test the Server
```bash
# Test if the server starts
node dist/index.js

# Should show: "Stagehand MCP server started"
```

## 🎨 Advanced Usage

### Custom Schemas for Data Extraction
```json
{
  "instruction": "Extract product information",
  "schema": {
    "type": "object",
    "properties": {
      "name": {"type": "string"},
      "price": {"type": "number"},
      "description": {"type": "string"},
      "inStock": {"type": "boolean"}
    }
  }
}
```

### Action Templates with Variables
```json
{
  "action": "Fill in the form with name: {name} and email: {email}",
  "variables": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

**1. "Server not responding"**
- Check your API keys are correct
- Verify Browserbase account is active
- Ensure Node.js is installed

**2. "OpenAI API error"**
- Check API key is valid and has credits
- Verify you have access to required models

**3. "Browserbase connection failed"**
- Check API key and project ID
- Verify Browserbase account status
- Try creating a new project

**4. "Tool not found in Cursor"**
- Restart Cursor completely
- Check MCP configuration syntax
- Verify file paths are correct

### Log Files
- Stagehand logs are written to console when running
- Check Cursor's MCP logs for connection issues
- Browserbase provides session logs in their dashboard

## 💡 Tips & Best Practices

1. **Start Simple**: Begin with basic navigation before complex interactions
2. **Use Screenshots**: Always take screenshots to verify page state
3. **Specific Instructions**: Be detailed in your action descriptions
4. **Error Handling**: Stagehand will retry failed actions automatically
5. **Rate Limits**: Be mindful of API usage and costs

## 🔗 Resources

- **Stagehand Documentation**: https://docs.stagehand.dev/
- **Browserbase Docs**: https://docs.browserbase.com/
- **MCP Specification**: https://modelcontextprotocol.io/
- **OpenAI API Docs**: https://platform.openai.com/docs/

## 🎉 You're Ready!

Stagehand MCP is now installed and configured. Start with simple navigation tasks and gradually explore more complex web automation scenarios. The AI-powered approach makes it incredibly powerful for tasks that would be difficult with traditional automation tools.

Happy automating! 🤖🌐 