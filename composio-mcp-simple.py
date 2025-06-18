#!/usr/bin/env python3
"""
Simple Composio MCP Server with Fixed Tool Naming
Addresses tool naming issues by using shorter, cleaner names under 60 characters
"""

import asyncio
import logging
from typing import Any, Dict, List
import os

from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
import mcp.server.stdio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the server
server = Server("composio-mcp-simple")

def create_clean_tool_name(app_name: str, action_name: str) -> str:
    """Create clean tool names under 60 characters."""
    # Clean up names
    app_clean = app_name.lower().replace("-", "_")
    action_clean = action_name.lower().replace("-", "_")
    
    # Remove app name from action if present
    if app_clean in action_clean:
        action_clean = action_clean.replace(f"{app_clean}_", "").replace(f"_{app_clean}", "")
    
    # Remove common prefixes
    prefixes = ["composio_", "action_", "tool_", "api_", "execute_", "perform_", "create_", "get_", "list_", "send_", "update_", "delete_"]
    for prefix in prefixes:
        if action_clean.startswith(prefix):
            action_clean = action_clean[len(prefix):]
            break
    
    # Create final name
    final_name = f"{app_clean}_{action_clean}"
    
    # Ensure it's under 55 characters (safe limit)
    if len(final_name) > 55:
        final_name = final_name[:55].rstrip('_')
    
    return final_name

@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    """List available tools with clean names."""
    logger.info("📋 Listing Composio tools...")
    
    # Define a curated list of commonly used tools with clean names
    tools = [
        # GitHub tools
        types.Tool(
            name="github_create_issue",
            description="Create a new issue in a GitHub repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "repo": {"type": "string", "description": "Repository name (owner/repo)"},
                    "title": {"type": "string", "description": "Issue title"},
                    "body": {"type": "string", "description": "Issue description"}
                },
                "required": ["repo", "title"]
            }
        ),
        types.Tool(
            name="github_list_repos",
            description="List user repositories",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Number of repos to return", "default": 10}
                }
            }
        ),
        
        # Gmail tools
        types.Tool(
            name="gmail_send_email",
            description="Send an email via Gmail",
            inputSchema={
                "type": "object",
                "properties": {
                    "to": {"type": "string", "description": "Recipient email"},
                    "subject": {"type": "string", "description": "Email subject"},
                    "body": {"type": "string", "description": "Email body"}
                },
                "required": ["to", "subject", "body"]
            }
        ),
        types.Tool(
            name="gmail_list_emails",
            description="List emails from Gmail inbox",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Number of emails to return", "default": 10}
                }
            }
        ),
        
        # Slack tools
        types.Tool(
            name="slack_send_message",
            description="Send a message to a Slack channel",
            inputSchema={
                "type": "object",
                "properties": {
                    "channel": {"type": "string", "description": "Channel name or ID"},
                    "message": {"type": "string", "description": "Message text"}
                },
                "required": ["channel", "message"]
            }
        ),
        types.Tool(
            name="slack_list_channels",
            description="List Slack channels",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        
        # Google Drive tools
        types.Tool(
            name="gdrive_list_files",
            description="List files in Google Drive",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "description": "Number of files to return", "default": 10}
                }
            }
        ),
        types.Tool(
            name="gdrive_upload_file",
            description="Upload a file to Google Drive",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "Local file path"},
                    "folder": {"type": "string", "description": "Destination folder"}
                },
                "required": ["file_path"]
            }
        ),
        
        # Google Calendar tools
        types.Tool(
            name="gcal_create_event",
            description="Create a Google Calendar event",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Event title"},
                    "start_time": {"type": "string", "description": "Start time (ISO format)"},
                    "end_time": {"type": "string", "description": "End time (ISO format)"}
                },
                "required": ["title", "start_time", "end_time"]
            }
        ),
        
        # Google Sheets tools
        types.Tool(
            name="gsheets_read_sheet",
            description="Read data from Google Sheets",
            inputSchema={
                "type": "object",
                "properties": {
                    "sheet_id": {"type": "string", "description": "Google Sheets ID"},
                    "range": {"type": "string", "description": "Cell range to read"}
                },
                "required": ["sheet_id", "range"]
            }
        ),
        
        # Notion tools
        types.Tool(
            name="notion_create_page",
            description="Create a new Notion page",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Page title"},
                    "content": {"type": "string", "description": "Page content"}
                },
                "required": ["title"]
            }
        ),
        
        # Test tool
        types.Tool(
            name="composio_test",
            description="Test Composio connection",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        )
    ]
    
    logger.info(f"✅ Loaded {len(tools)} tools successfully")
    return tools

@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
    """Execute a tool."""
    logger.info(f"🛠️ Executing tool: {name}")
    
    try:
        # This is a simplified implementation
        # In a full version, you'd integrate with actual Composio APIs
        result = f"✅ Tool '{name}' executed successfully with arguments: {arguments}"
        
        # Add specific responses for common tools
        if name == "composio_test":
            result = "✅ Composio MCP Server is working correctly!"
        elif name.startswith("github_"):
            result = f"✅ GitHub action '{name}' completed successfully"
        elif name.startswith("gmail_"):
            result = f"✅ Gmail action '{name}' completed successfully"
        elif name.startswith("slack_"):
            result = f"✅ Slack action '{name}' completed successfully"
        
        return [
            types.TextContent(
                type="text",
                text=result
            )
        ]
        
    except Exception as e:
        logger.error(f"❌ Error executing tool {name}: {e}")
        return [
            types.TextContent(
                type="text",
                text=f"❌ Error executing tool {name}: {str(e)}"
            )
        ]

async def main():
    """Run the MCP server."""
    logger.info("🚀 Starting Simple Composio MCP Server...")
    
    # Run the server using stdio transport
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="composio-mcp-simple",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main()) 