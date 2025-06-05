#!/usr/bin/env python3
"""
MCP Server Status Checker
Tests all configured MCP servers to see which ones are working
"""

import subprocess
import json
import os
from datetime import datetime

def test_server_availability(server_name, config):
    """Test if an MCP server is available and responding"""
    try:
        if "url" in config:
            # URL-based server (like Git docs)
            import urllib.request
            urllib.request.urlopen(config["url"], timeout=5)
            return "✅ URL accessible"
        
        elif "command" in config:
            # Command-based server
            cmd = [config["command"]] + config.get("args", [])
            
            # Add environment variables if specified
            env = os.environ.copy()
            if "env" in config:
                env.update(config["env"])
            
            # Test with --help flag for most servers
            test_cmd = cmd + ["--help"]
            result = subprocess.run(
                test_cmd, 
                capture_output=True, 
                text=True, 
                timeout=10,
                env=env
            )
            
            if result.returncode == 0:
                return "✅ Command available"
            else:
                return f"❌ Error: {result.stderr[:100]}"
                
    except subprocess.TimeoutExpired:
        return "⏰ Timeout (may still work)"
    except Exception as e:
        return f"❌ Error: {str(e)[:100]}"

def main():
    """Main function to test all MCP servers"""
    print("🔍 MCP Server Status Check")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Load MCP configuration
    mcp_config_path = "/Users/kevinhouston/.cursor/mcp.json"
    try:
        with open(mcp_config_path, 'r') as f:
            mcp_config = json.load(f)
    except Exception as e:
        print(f"❌ Could not load MCP config: {e}")
        return
    
    servers = mcp_config.get("mcpServers", {})
    
    working_servers = []
    issue_servers = []
    
    for server_name, config in servers.items():
        print(f"Testing: {server_name}")
        status = test_server_availability(server_name, config)
        print(f"  Status: {status}")
        print()
        
        if status.startswith("✅"):
            working_servers.append(server_name)
        else:
            issue_servers.append((server_name, status))
    
    # Summary
    print("=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"✅ Working servers ({len(working_servers)}):")
    for server in working_servers:
        print(f"   • {server}")
    
    print(f"\n❌ Servers with issues ({len(issue_servers)}):")
    for server, issue in issue_servers:
        print(f"   • {server}: {issue}")
    
    print(f"\n📈 Success rate: {len(working_servers)}/{len(servers)} ({len(working_servers)/len(servers)*100:.1f}%)")

if __name__ == "__main__":
    main() 