#!/usr/bin/env python3

import asyncio
import json
import httpx
from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
import mcp.server.stdio

# NoCodeBackend Configuration
NOCODEBACKEND_API_BASE = "https://api.nocodebackend.com"
NOCODEBACKEND_API_KEY = "50b42c68b68196cb63a93843323a9cfd2658b41e3a455ae00a58c718af78"
NOCODEBACKEND_INSTANCE = "49892_test_data"

# Create a simple NoCodeBackend MCP server
server = Server("simple-nocodebackend")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available NoCodeBackend tools."""
    return [
        types.Tool(
            name="nocodebackend_test",
            description="Test NoCodeBackend API connectivity",
            inputSchema={
                "type": "object",
                "properties": {},
                "additionalProperties": False
            }
        ),
        types.Tool(
            name="nocodebackend_read_customers",
            description="Read customers from NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of records to return",
                        "default": 10
                    }
                }
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict
) -> list[types.TextContent]:
    """Handle tool calls."""
    
    if name == "nocodebackend_test":
        return [types.TextContent(
            type="text",
            text="NoCodeBackend MCP server is working! API configured for instance: " + NOCODEBACKEND_INSTANCE
        )]
    
    elif name == "nocodebackend_read_customers":
        try:
            limit = arguments.get("limit", 10)
            
            # Make API request
            url = f"{NOCODEBACKEND_API_BASE}/read/customer"
            headers = {
                "Authorization": f"Bearer {NOCODEBACKEND_API_KEY}",
                "Content-Type": "application/json"
            }
            params = {"Instance": NOCODEBACKEND_INSTANCE, "limit": limit}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
            return [types.TextContent(
                type="text",
                text=f"Retrieved customers: {json.dumps(data, indent=2)}"
            )]
            
        except Exception as e:
            return [types.TextContent(
                type="text",
                text=f"Error reading customers: {str(e)}"
            )]
    
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    """Run the server using stdin/stdout streams."""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="simple-nocodebackend",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main()) 