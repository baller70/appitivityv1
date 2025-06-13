#!/usr/bin/env python3
"""
Update project data in bookhubdata Neo4j database
"""

from neo4j import GraphDatabase
import json
import os
from datetime import datetime

class BookHubDataUpdater:
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
            
    def update_project_data(self, database_name="bookhubdata"):
        """Update current project information in the knowledge graph"""
        updated_project_data = {
            "name": "Apptivity Final v1",
            "type": "NextJS Application",
            "description": "Advanced bookmark and app organization tool with analytics",
            "technologies": [
                "Next.js 15.3.3", 
                "TypeScript", 
                "Clerk Auth", 
                "Tailwind CSS",
                "Supabase",
                "Neo4j",
                "MCP Servers"
            ],
            "updated_date": datetime.now().isoformat(),
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
                "Knowledge Graph Storage"
            ],
            "components": [
                "BookmarkHubDashboard",
                "SettingsPage", 
                "Analytics",
                "VoiceInput",
                "BookmarkCard",
                "FolderGridView",
                "EnhancedSidebar",
                "TimeCapsulePage"
            ]
        }
        
        with self.driver.session(database=database_name) as session:
            try:
                # Update project node
                update_query = """
                MATCH (p:Project {name: $name})
                SET p.description = $description,
                    p.updated_date = $updated_date,
                    p.status = $status
                RETURN p
                """
                result = session.run(update_query, 
                    name=updated_project_data["name"],
                    description=updated_project_data["description"],
                    updated_date=updated_project_data["updated_date"],
                    status=updated_project_data["status"]
                )
                
                if result.single():
                    print("✅ Updated project node")
                else:
                    print("❌ Project node not found")
                
                # Add new technologies
                for tech in updated_project_data["technologies"]:
                    tech_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (t:Technology {name: $tech_name})
                    MERGE (p)-[:USES_TECHNOLOGY]->(t)
                    """
                    session.run(tech_query, project_name=updated_project_data["name"], tech_name=tech)
                
                print(f"✅ Updated {len(updated_project_data['technologies'])} technologies")
                
                # Add new features
                for feature in updated_project_data["features"]:
                    feature_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (f:Feature {name: $feature_name})
                    MERGE (p)-[:HAS_FEATURE]->(f)
                    """
                    session.run(feature_query, project_name=updated_project_data["name"], feature_name=feature)
                
                print(f"✅ Updated {len(updated_project_data['features'])} features")
                
                # Add components
                for component in updated_project_data["components"]:
                    component_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (c:Component {name: $component_name})
                    MERGE (p)-[:HAS_COMPONENT]->(c)
                    """
                    session.run(component_query, project_name=updated_project_data["name"], component_name=component)
                
                print(f"✅ Added {len(updated_project_data['components'])} components")
                
                print("✅ Project data updated successfully in Neo4j bookhubdata database")
                
            except Exception as e:
                print(f"❌ Error updating project data: {e}")
                
    def get_updated_stats(self, database_name="bookhubdata"):
        """Get updated statistics from the database"""
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
                
                print("\n📊 Updated NOGS Statistics:")
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
    print("🚀 Updating BookHubData Neo4j Database...")
    
    updater = BookHubDataUpdater()
    
    if updater.driver:
        try:
            # Update project data
            updater.update_project_data()
            
            # Show updated stats
            updater.get_updated_stats()
            
            print("\n🔗 Neo4j Connection Information:")
            print("=" * 50)
            print(f"Browser URL: http://localhost:7474")
            print(f"Bolt URL: bolt://localhost:7687")
            print(f"Database: bookhubdata")
            print(f"Status: Updated ✅")
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            updater.close()
    else:
        print("❌ Failed to establish connection to Neo4j") 