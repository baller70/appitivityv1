#!/usr/bin/env python3
"""
Save Apptivity v1 project data to Neo4j bookhubdata database
"""

from neo4j import GraphDatabase
import json
from datetime import datetime

class ApptivityDataSaver:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="hunterrr777!!!"):
        """Initialize connection to Neo4j"""
        try:
            self.driver = GraphDatabase.driver(uri, auth=(user, password))
            print("✅ Connected to Neo4j successfully")
        except Exception as e:
            print(f"❌ Failed to connect to Neo4j: {e}")
            self.driver = None
        
    def close(self):
        """Close the database connection"""
        if self.driver:
            self.driver.close()
                
    def save_apptivity_data(self, database_name="neo4j"):
        """Save Apptivity v1 project data to the knowledge graph"""
        if not self.driver:
            return False
            
        project_data = {
            "name": "Apptivity Final v1",
            "type": "NextJS Application",
            "description": "Advanced bookmark and app organization tool with analytics and MCP integration",
            "repository": "https://github.com/baller70/appitivityv1.git",
            "technologies": [
                "Next.js 15.3.3", 
                "TypeScript", 
                "Clerk Auth", 
                "Tailwind CSS",
                "Supabase",
                "Neo4j",
                "MCP Servers",
                "GitHub MCP",
                "Firecrawl MCP"
            ],
            "created_date": datetime.now().isoformat(),
            "status": "Active Development",
            "features": [
                "Smart Bookmarks",
                "Powerful Tags", 
                "Quick Search",
                "User Authentication",
                "Dark Mode Support",
                "Voice Input",
                "Analytics Dashboard",
                "Visit Tracking",
                "Folder Organization",
                "Real-time Updates",
                "Settings Management",
                "MCP Integration",
                "Knowledge Graph Storage",
                "View Selector (Fixed)",
                "GitHub Integration",
                "Documentation Generation"
            ],
            "components": [
                "BookmarkHubDashboard",
                "SettingsPage", 
                "Analytics",
                "VoiceInput",
                "BookmarkCard",
                "FolderGridView",
                "EnhancedSidebar",
                "TimeCapsulePage",
                "ViewSelector",
                "MCPIntegration"
            ],
            "recent_fixes": [
                "View Selector Visibility Fix",
                "MCP Supabase Integration", 
                "GitHub Documentation",
                "Neo4j Knowledge Graph Setup"
            ]
        }
        
        with self.driver.session(database=database_name) as session:
            try:
                # Clear existing project data
                session.run("MATCH (p:Project {name: $name}) DETACH DELETE p", name=project_data["name"])
                
                # Create project node
                query = """
                CREATE (p:Project {
                    name: $name,
                    type: $type,
                    description: $description,
                    repository: $repository,
                    created_date: $created_date,
                    status: $status
                })
                RETURN p
                """
                session.run(query, **{k: v for k, v in project_data.items() if k not in ['technologies', 'features', 'components', 'recent_fixes']})
                print("✅ Created project node")
                
                # Create technology nodes and relationships
                for tech in project_data["technologies"]:
                    tech_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (t:Technology {name: $tech_name})
                    MERGE (p)-[:USES_TECHNOLOGY]->(t)
                    """
                    session.run(tech_query, project_name=project_data["name"], tech_name=tech)
                print(f"✅ Added {len(project_data['technologies'])} technologies")
                
                # Create feature nodes and relationships
                for feature in project_data["features"]:
                    feature_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (f:Feature {name: $feature_name})
                    MERGE (p)-[:HAS_FEATURE]->(f)
                    """
                    session.run(feature_query, project_name=project_data["name"], feature_name=feature)
                print(f"✅ Added {len(project_data['features'])} features")
                
                # Create component nodes and relationships
                for component in project_data["components"]:
                    component_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (c:Component {name: $component_name})
                    MERGE (p)-[:HAS_COMPONENT]->(c)
                    """
                    session.run(component_query, project_name=project_data["name"], component_name=component)
                print(f"✅ Added {len(project_data['components'])} components")
                
                # Create recent fixes nodes and relationships
                for fix in project_data["recent_fixes"]:
                    fix_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (r:RecentFix {name: $fix_name, date: $fix_date})
                    MERGE (p)-[:RECENTLY_FIXED]->(r)
                    """
                    session.run(fix_query, project_name=project_data["name"], fix_name=fix, fix_date=datetime.now().isoformat())
                print(f"✅ Added {len(project_data['recent_fixes'])} recent fixes")
                
                # Create MCP integration nodes
                mcp_servers = [
                    {"name": "Supabase MCP", "type": "Database", "status": "Active"},
                    {"name": "GitHub MCP", "type": "Repository", "status": "Active"},
                    {"name": "Firecrawl MCP", "type": "Web Scraping", "status": "Configured"},
                    {"name": "MCP-Knowledge-Graph", "type": "Neo4j", "status": "Active"}
                ]
                
                for mcp in mcp_servers:
                    mcp_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (m:MCPServer {name: $mcp_name, type: $mcp_type, status: $mcp_status})
                    MERGE (p)-[:INTEGRATES_WITH]->(m)
                    """
                    session.run(mcp_query, project_name=project_data["name"], **mcp)
                print(f"✅ Added {len(mcp_servers)} MCP server integrations")
                
                print("✅ Apptivity v1 data saved successfully to Neo4j knowledge graph")
                return True
                
            except Exception as e:
                print(f"❌ Error saving project data: {e}")
                return False
                
    def get_stats(self, database_name="neo4j"):
        """Get statistics from the database"""
        if not self.driver:
            return None
            
        try:
            with self.driver.session(database=database_name) as session:
                # Count nodes by type
                stats_query = """
                MATCH (n)
                RETURN labels(n)[0] as node_type, count(n) as count
                ORDER BY count DESC
                """
                result = session.run(stats_query)
                
                print("\n📊 Neo4j Database Statistics:")
                print("=" * 40)
                total_nodes = 0
                for record in result:
                    node_type = record["node_type"]
                    count = record["count"]
                    total_nodes += count
                    print(f"  {node_type}: {count}")
                
                print(f"  Total Nodes: {total_nodes}")
                
                # Get relationships
                rel_query = """
                MATCH ()-[r]->()
                RETURN type(r) as relationship_type, count(r) as count
                ORDER BY count DESC
                """
                result = session.run(rel_query)
                
                print("\n🔗 Relationships:")
                print("=" * 40)
                total_rels = 0
                for record in result:
                    rel_type = record["relationship_type"]
                    count = record["count"]
                    total_rels += count
                    print(f"  {rel_type}: {count}")
                
                print(f"  Total Relationships: {total_rels}")
                
        except Exception as e:
            print(f"❌ Error getting stats: {e}")

if __name__ == "__main__":
    print("🚀 Saving Apptivity v1 Data to Neo4j Knowledge Graph...")
    
    saver = ApptivityDataSaver()
    
    if saver.driver:
        try:
            # Save project data to default database
            if saver.save_apptivity_data():
                # Show stats
                saver.get_stats()
                
                print("\n🔗 Neo4j Connection Information:")
                print("=" * 50)
                print(f"Browser URL: http://localhost:7474")
                print(f"Bolt URL: bolt://localhost:7687")
                print(f"Database: neo4j (default)")
                print(f"Username: neo4j")
                print(f"Status: Data Saved Successfully ✅")
                
                print("\n📊 To view your knowledge graph:")
                print("1. Open http://localhost:7474 in your browser")
                print("2. Connect using Neo4j credentials")
                print("3. Run: MATCH (n) RETURN n LIMIT 25")
                print("4. Or run: MATCH (p:Project)-[r]->(n) RETURN p, r, n")
                print("5. Or run: MATCH (p:Project {name: 'Apptivity Final v1'})-[r]->(n) RETURN p, r, n")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            saver.close()
    else:
        print("❌ Failed to establish connection to Neo4j") 