# Neo4j Knowledge Graph Setup for Apptivity v1

## Overview
This document outlines the Neo4j knowledge graph implementation for the Apptivity v1 project, providing a comprehensive data model for project information, relationships, and MCP integrations.

## 🚀 Quick Setup

### Prerequisites
- Neo4j Desktop or Neo4j Community Server
- Python 3.8+ with neo4j driver
- MCP-Knowledge-Graph server configured

### Installation Steps

1. **Install Neo4j**
   ```bash
   # macOS with Homebrew
   brew install neo4j
   brew services start neo4j
   
   # Or download Neo4j Desktop from https://neo4j.com/download/
   ```

2. **Set Initial Password**
   ```bash
   # Connect with default credentials and set new password
   cypher-shell -u neo4j -p neo4j
   # Follow prompts to set new password: hunterrr777!!!
   ```

3. **Create Database**
   ```cypher
   CREATE DATABASE bookhubdata IF NOT EXISTS;
   USE bookhubdata;
   ```

## 📊 Data Model

### Node Types

#### Project Node
```cypher
CREATE (p:Project {
  name: "Apptivity Final v1",
  type: "NextJS Application", 
  description: "Advanced bookmark and app organization tool",
  repository: "https://github.com/baller70/appitivityv1.git",
  status: "Active Development",
  version: "2.2.0",
  created_date: datetime(),
  last_updated: datetime()
})
```

#### Technology Nodes
```cypher
CREATE (t:Technology {
  name: "Next.js 15.3.3",
  category: "Framework",
  type: "Frontend"
})
```

#### Feature Nodes
```cypher
CREATE (f:Feature {
  name: "Smart Bookmarks",
  category: "Core",
  status: "Active"
})
```

#### Component Nodes
```cypher
CREATE (c:Component {
  name: "BookmarkHubDashboard",
  type: "Page",
  category: "Core"
})
```

#### MCP Server Nodes
```cypher
CREATE (m:MCPServer {
  name: "Supabase MCP",
  type: "Database",
  status: "Active",
  purpose: "Database operations and management"
})
```

#### Recent Fix Nodes
```cypher
CREATE (r:RecentFix {
  name: "View Selector Visibility Fix",
  date: date("2025-01-13"),
  description: "Fixed view selector disappearing when folder-grid view is selected",
  impact: "High",
  status: "Completed"
})
```

### Relationship Types

- **USES_TECHNOLOGY**: Project → Technology
- **HAS_FEATURE**: Project → Feature  
- **HAS_COMPONENT**: Project → Component
- **INTEGRATES_WITH**: Project → MCPServer
- **RECENTLY_FIXED**: Project → RecentFix
- **CONTAINS**: Component → Component
- **IMPLEMENTS**: Feature → Feature

## 🔧 MCP Integration

### Configuration
The MCP-Knowledge-Graph server is configured in `.cursor/mcp.json`:

```json
{
  "MCP-Knowledge-Graph": {
    "command": "npx",
    "args": ["-y", "mcp-knowledge-graph"],
    "env": {
      "NEO4J_URI": "bolt://localhost:7687",
      "NEO4J_USERNAME": "neo4j", 
      "NEO4J_PASSWORD": "hunterrr777!!!",
      "NEO4J_DATABASE": "bookhubdata"
    }
  }
}
```

### Available MCP Tools
- **add_node**: Create new nodes in the graph
- **add_relationship**: Create relationships between nodes
- **query_graph**: Execute Cypher queries
- **get_schema**: Retrieve graph schema information

## 📁 Data Files

### JSON Export
The complete project data is available in `apptivity_knowledge_graph.json`:
- 50+ nodes across 6 node types
- 35+ relationships
- Complete project metadata
- Ready for Neo4j import

### Python Scripts
- `save_to_neo4j.py`: Main data import script
- `update_bookhubdata.py`: Update existing data
- `connect_bookhubdata.py`: Connection testing

## 🔍 Sample Queries

### Get Project Overview
```cypher
MATCH (p:Project {name: "Apptivity Final v1"})
RETURN p
```

### Find All Technologies
```cypher
MATCH (p:Project)-[:USES_TECHNOLOGY]->(t:Technology)
RETURN t.name, t.category, t.type
ORDER BY t.category
```

### Get Recent Fixes
```cypher
MATCH (p:Project)-[:RECENTLY_FIXED]->(r:RecentFix)
RETURN r.name, r.date, r.status, r.impact
ORDER BY r.date DESC
```

### Find MCP Integrations
```cypher
MATCH (p:Project)-[:INTEGRATES_WITH]->(m:MCPServer)
RETURN m.name, m.type, m.status, m.purpose
```

### Component Relationships
```cypher
MATCH (p:Project)-[:HAS_COMPONENT]->(c:Component)
OPTIONAL MATCH (c)-[:CONTAINS]->(sub:Component)
RETURN c.name, c.type, collect(sub.name) as subcomponents
```

### Full Project Graph
```cypher
MATCH (p:Project {name: "Apptivity Final v1"})-[r]->(n)
RETURN p, r, n
```

## 🌐 Browser Access

### Neo4j Browser
1. Open http://localhost:7474
2. Connect with credentials:
   - Username: `neo4j`
   - Password: `hunterrr777!!!`
3. Select database: `bookhubdata`
4. Run queries to explore the graph

### Visualization
```cypher
// Visualize the entire project graph
MATCH (p:Project)-[r]->(n)
RETURN p, r, n
LIMIT 50
```

## 🔄 Data Updates

### Adding New Features
```cypher
MATCH (p:Project {name: "Apptivity Final v1"})
CREATE (f:Feature {
  name: "New Feature Name",
  category: "Category",
  status: "In Development"
})
CREATE (p)-[:HAS_FEATURE]->(f)
```

### Recording Fixes
```cypher
MATCH (p:Project {name: "Apptivity Final v1"})
CREATE (r:RecentFix {
  name: "Fix Description",
  date: date(),
  status: "Completed",
  impact: "Medium"
})
CREATE (p)-[:RECENTLY_FIXED]->(r)
```

### Adding MCP Servers
```cypher
MATCH (p:Project {name: "Apptivity Final v1"})
CREATE (m:MCPServer {
  name: "New MCP Server",
  type: "Service Type",
  status: "Active",
  purpose: "Server purpose"
})
CREATE (p)-[:INTEGRATES_WITH]->(m)
```

## 📈 Analytics Queries

### Technology Distribution
```cypher
MATCH (p:Project)-[:USES_TECHNOLOGY]->(t:Technology)
RETURN t.category, count(t) as count
ORDER BY count DESC
```

### Feature Status Overview
```cypher
MATCH (p:Project)-[:HAS_FEATURE]->(f:Feature)
RETURN f.status, count(f) as count
ORDER BY count DESC
```

### Component Types
```cypher
MATCH (p:Project)-[:HAS_COMPONENT]->(c:Component)
RETURN c.type, count(c) as count
ORDER BY count DESC
```

### Recent Activity
```cypher
MATCH (p:Project)-[:RECENTLY_FIXED]->(r:RecentFix)
WHERE r.date >= date() - duration('P30D')
RETURN r.name, r.date, r.impact
ORDER BY r.date DESC
```

## 🛠 Troubleshooting

### Connection Issues
1. Verify Neo4j is running: `brew services list | grep neo4j`
2. Check port 7687 is available: `lsof -i :7687`
3. Reset password if needed: `cypher-shell -u neo4j -p neo4j`

### Data Import Issues
1. Ensure database exists: `SHOW DATABASES`
2. Check permissions: `SHOW USERS`
3. Verify JSON format: `python -m json.tool apptivity_knowledge_graph.json`

### MCP Integration Issues
1. Restart Cursor after MCP configuration changes
2. Check MCP server logs for connection errors
3. Verify environment variables are set correctly

## 📚 Resources

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Cypher Query Language](https://neo4j.com/docs/cypher-manual/current/)
- [MCP Knowledge Graph](https://github.com/modelcontextprotocol/servers/tree/main/src/knowledge-graph)
- [Neo4j Browser Guide](https://neo4j.com/docs/browser-manual/current/)

## 🎯 Next Steps

1. **Complete Neo4j Setup**: Resolve authentication issues and import data
2. **MCP Tool Integration**: Test knowledge graph tools in Cursor
3. **Real-time Updates**: Implement automatic graph updates on code changes
4. **Advanced Queries**: Develop complex analytics and relationship queries
5. **Visualization**: Create custom graph visualizations for project insights

---

**Status**: Neo4j installed and configured, data model defined, ready for import
**Last Updated**: January 13, 2025
**Version**: 1.0 