#!/usr/bin/env python3
"""
Setup script for bookhubdata Neo4j database
This will help you create and manage your project's knowledge graph data
"""

from neo4j import GraphDatabase
import json
import os
from datetime import datetime

class BookHubDataManager:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="password"):
        """Initialize connection to Neo4j"""
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        
    def close(self):
        """Close the database connection"""
        self.driver.close()
        
    def create_database(self, database_name="bookhubdata"):
        """Create the bookhubdata database"""
        with self.driver.session(database="system") as session:
            try:
                # Check if database exists
                result = session.run("SHOW DATABASES")
                databases = [record["name"] for record in result]
                
                if database_name not in databases:
                    session.run(f"CREATE DATABASE {database_name}")
                    print(f"✅ Created database: {database_name}")
                else:
                    print(f"✅ Database '{database_name}' already exists")
                    
            except Exception as e:
                print(f"❌ Error creating database: {e}")
                
    def save_project_data(self, database_name="bookhubdata"):
        """Save current project information to the knowledge graph"""
        project_data = {
            "name": "Apptivity Final v1",
            "type": "NextJS Application",
            "description": "Personal bookmark and app organization tool",
            "technologies": ["Next.js 15.3.3", "TypeScript", "Clerk Auth", "Tailwind CSS"],
            "created_date": datetime.now().isoformat(),
            "status": "In Development",
            "features": [
                "Smart Bookmarks",
                "Powerful Tags", 
                "Quick Search",
                "User Authentication",
                "Dark Mode Support"
            ]
        }
        
        with self.driver.session(database=database_name) as session:
            try:
                # Create project node
                query = """
                CREATE (p:Project {
                    name: $name,
                    type: $type,
                    description: $description,
                    created_date: $created_date,
                    status: $status
                })
                RETURN p
                """
                session.run(query, **project_data)
                
                # Create technology nodes and relationships
                for tech in project_data["technologies"]:
                    tech_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (t:Technology {name: $tech_name})
                    MERGE (p)-[:USES_TECHNOLOGY]->(t)
                    """
                    session.run(tech_query, project_name=project_data["name"], tech_name=tech)
                
                # Create feature nodes and relationships
                for feature in project_data["features"]:
                    feature_query = """
                    MATCH (p:Project {name: $project_name})
                    MERGE (f:Feature {name: $feature_name})
                    MERGE (p)-[:HAS_FEATURE]->(f)
                    """
                    session.run(feature_query, project_name=project_data["name"], feature_name=feature)
                
                print("✅ Project data saved to Neo4j bookhubdata database")
                
            except Exception as e:
                print(f"❌ Error saving project data: {e}")
                
    def get_connection_info(self):
        """Get connection information for your project"""
        print("\n🔗 Neo4j Connection Information:")
        print("=" * 50)
        print(f"Browser URL: http://localhost:7474")
        print(f"Bolt URL: bolt://localhost:7687")
        print(f"Database: bookhubdata")
        print(f"Username: neo4j")
        print(f"Password: [your Neo4j password]")
        print("\n📊 To view your project data:")
        print("1. Open http://localhost:7474 in your browser")
        print("2. Connect using your Neo4j credentials")
        print("3. Select 'bookhubdata' database")
        print("4. Run: MATCH (n) RETURN n LIMIT 25")


if __name__ == "__main__":
    print("🚀 Setting up BookHubData Neo4j Database...")
    
    # You may need to update the password
    password = input("Enter your Neo4j password (default: password): ").strip()
    if not password:
        password = "password"
    
    manager = BookHubDataManager(password=password)
    
    try:
        # Create the database
        manager.create_database()
        
        # Save project data
        manager.save_project_data()
        
        # Show connection info
        manager.get_connection_info()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure Neo4j is running and you have the correct credentials")
    finally:
        manager.close() 