#!/usr/bin/env python3

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
import httpx
from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
import mcp.server.stdio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nocodebackend-mcp")

# NoCodeBackend Configuration
NOCODEBACKEND_API_BASE = "https://api.nocodebackend.com"
NOCODEBACKEND_API_KEY = "50b42c68b68196cb63a93843323a9cfd2658b41e3a455ae00a58c718af78"
NOCODEBACKEND_INSTANCE = "49892_test_data"

# Initialize the MCP server
server = Server("nocodebackend-mcp")

async def make_api_request(
    method: str,
    endpoint: str,
    data: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Make an HTTP request to the NoCodeBackend API."""
    url = f"{NOCODEBACKEND_API_BASE}{endpoint}"
    headers = {
        "Authorization": f"Bearer {NOCODEBACKEND_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Add instance parameter to all requests
    if params is None:
        params = {}
    params["Instance"] = NOCODEBACKEND_INSTANCE
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = await client.post(url, headers=headers, json=data)
            elif method.upper() == "PUT":
                response = await client.put(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json() if response.content else {"message": "Success"}
        
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code}: {e.response.text}")
            raise Exception(f"API request failed: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
            raise Exception(f"Request failed: {str(e)}")

@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    """List available NoCodeBackend tools."""
    return [
        types.Tool(
            name="nocodebackend_create_customer",
            description="Create a new customer record in NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "customer_data": {
                        "type": "object",
                        "description": "Customer data to create",
                        "additionalProperties": True
                    }
                },
                "required": ["customer_data"]
            }
        ),
        types.Tool(
            name="nocodebackend_read_all_customers",
            description="Retrieve all customer records from NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of records to return",
                        "default": 100
                    },
                    "offset": {
                        "type": "integer", 
                        "description": "Number of records to skip",
                        "default": 0
                    }
                }
            }
        ),
        types.Tool(
            name="nocodebackend_read_customer_by_id",
            description="Retrieve a specific customer record by ID from NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "The ID of the customer to retrieve"
                    }
                },
                "required": ["customer_id"]
            }
        ),
        types.Tool(
            name="nocodebackend_search_customers",
            description="Search for customer records in NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "search_criteria": {
                        "type": "object",
                        "description": "Search criteria for finding customers",
                        "additionalProperties": True
                    }
                },
                "required": ["search_criteria"]
            }
        ),
        types.Tool(
            name="nocodebackend_update_customer",
            description="Update an existing customer record in NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "The ID of the customer to update"
                    },
                    "customer_data": {
                        "type": "object",
                        "description": "Updated customer data",
                        "additionalProperties": True
                    }
                },
                "required": ["customer_id", "customer_data"]
            }
        ),
        types.Tool(
            name="nocodebackend_delete_customer",
            description="Delete a customer record from NoCodeBackend",
            inputSchema={
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "The ID of the customer to delete"
                    }
                },
                "required": ["customer_id"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: Dict[str, Any]
) -> List[types.TextContent]:
    """Handle tool calls for NoCodeBackend operations."""
    
    try:
        if name == "nocodebackend_create_customer":
            customer_data = arguments.get("customer_data", {})
            result = await make_api_request("POST", "/create/customer", data=customer_data)
            return [types.TextContent(
                type="text",
                text=f"Customer created successfully: {json.dumps(result, indent=2)}"
            )]
        
        elif name == "nocodebackend_read_all_customers":
            params = {}
            if "limit" in arguments:
                params["limit"] = arguments["limit"]
            if "offset" in arguments:
                params["offset"] = arguments["offset"]
            
            result = await make_api_request("GET", "/read/customer", params=params)
            return [types.TextContent(
                type="text",
                text=f"Retrieved customers: {json.dumps(result, indent=2)}"
            )]
        
        elif name == "nocodebackend_read_customer_by_id":
            customer_id = arguments.get("customer_id")
            result = await make_api_request("GET", f"/read/customer/{customer_id}")
            return [types.TextContent(
                type="text",
                text=f"Customer details: {json.dumps(result, indent=2)}"
            )]
        
        elif name == "nocodebackend_search_customers":
            search_criteria = arguments.get("search_criteria", {})
            result = await make_api_request("POST", "/search/customer", data=search_criteria)
            return [types.TextContent(
                type="text",
                text=f"Search results: {json.dumps(result, indent=2)}"
            )]
        
        elif name == "nocodebackend_update_customer":
            customer_id = arguments.get("customer_id")
            customer_data = arguments.get("customer_data", {})
            result = await make_api_request("PUT", f"/update/customer/{customer_id}", data=customer_data)
            return [types.TextContent(
                type="text",
                text=f"Customer updated successfully: {json.dumps(result, indent=2)}"
            )]
        
        elif name == "nocodebackend_delete_customer":
            customer_id = arguments.get("customer_id")
            result = await make_api_request("DELETE", f"/delete/customer/{customer_id}")
            return [types.TextContent(
                type="text",
                text=f"Customer deleted successfully: {json.dumps(result, indent=2)}"
            )]
        
        else:
            raise ValueError(f"Unknown tool: {name}")
            
    except Exception as e:
        logger.error(f"Tool call failed: {str(e)}")
        return [types.TextContent(
            type="text",
            text=f"Error: {str(e)}"
        )]

async def main():
    # Run the server using stdin/stdout streams
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="nocodebackend",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main()) 