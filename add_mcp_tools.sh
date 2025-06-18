#!/bin/bash

echo "🔧 MCP Tools Installer"
echo "====================="

# Function to install a specific MCP server
install_mcp_server() {
    local server_name=$1
    echo "📦 Installing mcp/$server_name..."
    
    if docker pull "mcp/$server_name"; then
        echo "✅ Successfully installed mcp/$server_name"
    else
        echo "❌ Failed to install mcp/$server_name"
    fi
}

# Available MCP servers to install
echo "Available MCP servers to install:"
echo ""
echo "Core Servers:"
echo "  1. time         - Time and timezone utilities"
echo "  2. filesystem   - File operations with access controls"
echo "  3. sqlite       - Database interactions"
echo "  4. puppeteer    - Browser automation and web scraping"
echo ""
echo "Development Servers:"
echo "  5. github       - GitHub repository management"
echo "  6. git          - Git repository operations"
echo "  7. postgres     - PostgreSQL database access"
echo "  8. memory       - Knowledge graph-based memory"
echo ""
echo "Utility Servers:"
echo "  9. fetch        - Web content fetching"
echo " 10. brave-search - Web search using Brave's API"
echo " 11. google-maps  - Location services and mapping"
echo " 12. slack        - Slack integration"
echo ""
echo "Enter the numbers of servers you want to install (e.g., 1,5,9):"
echo "Or enter 'all' to install all servers, or 'core' for just core servers:"

read -r selection

case $selection in
    "all")
        servers=(time filesystem sqlite puppeteer github git postgres memory fetch brave-search google-maps slack)
        ;;
    "core")
        servers=(time filesystem sqlite puppeteer)
        ;;
    *)
        # Parse comma-separated numbers
        IFS=',' read -ra numbers <<< "$selection"
        servers=()
        for num in "${numbers[@]}"; do
            case $num in
                1) servers+=(time) ;;
                2) servers+=(filesystem) ;;
                3) servers+=(sqlite) ;;
                4) servers+=(puppeteer) ;;
                5) servers+=(github) ;;
                6) servers+=(git) ;;
                7) servers+=(postgres) ;;
                8) servers+=(memory) ;;
                9) servers+=(fetch) ;;
                10) servers+=(brave-search) ;;
                11) servers+=(google-maps) ;;
                12) servers+=(slack) ;;
                *) echo "❌ Invalid selection: $num" ;;
            esac
        done
        ;;
esac

echo ""
echo "Installing selected MCP servers..."

for server in "${servers[@]}"; do
    install_mcp_server "$server"
done

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update your gordon-mcp.yml or claude_desktop_config.json"
echo "   2. Set up environment variables (see mcp-env-template.txt)"
echo "   3. Run ./test_mcp_installation.sh to verify" 