#!/bin/bash
# Usage: ./activate-mcp.sh <mcp-name>
# Example: ./activate-mcp.sh github

set -e

MCP_NAME="$1"
if [ -z "$MCP_NAME" ]; then
  echo "Usage: $0 <mcp-name>"
  exit 1
fi

# Find the image (case-insensitive match)
IMAGE=$(docker images --format '{{.Repository}}:{{.Tag}}' | grep -i "mcp/$MCP_NAME" | head -n1)
if [ -z "$IMAGE" ]; then
  echo "No MCP Docker image found for: $MCP_NAME"
  exit 2
fi

# Check if a container is already running for this image
CONTAINER_ID=$(docker ps --filter ancestor="$IMAGE" --format '{{.ID}}')
if [ -n "$CONTAINER_ID" ]; then
  echo "MCP '$MCP_NAME' is already running (container: $CONTAINER_ID)"
  docker ps --filter id=$CONTAINER_ID --format 'Endpoint: {{.Ports}}'
  exit 0
fi

# Start the container (auto-assign ports, detach)
CONTAINER_ID=$(docker run -d --rm -P $IMAGE)

# Wait a moment for the container to start
sleep 2

PORTS=$(docker ps --filter id=$CONTAINER_ID --format '{{.Ports}}')
echo "Started MCP '$MCP_NAME' (container: $CONTAINER_ID)"
echo "Endpoint: $PORTS" 