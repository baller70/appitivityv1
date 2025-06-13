#!/usr/bin/env python3
"""
Connect to bookhubdata Neo4j database
"""

from neo4j import GraphDatabase
import json
import os
from datetime import datetime

class BookHubDataManager:
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
            
    def test_connection(self):
        """Test the database connection"""
        if not self.driver:
            return False
            
        try:
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                record = result.single()
                if record and record["test"] == 1:
                    print("✅ Database connection test successful")
                    return True
        except Exception as e:
            print(f"❌ Database connection test failed: {e}")
            return False
            
    def create_database(self, database_name="bookhubdata"):
        """Create the bookhubdata database"""
        if not self.driver:
            return False
            
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
                return True
                    
            except Exception as e:
                print(f"❌ Error creating database: {e}")
                return False
                
    def query_nogs_data(self, database_name="bookhubdata"):
        """Query NOGS data from the database"""
        if not self.driver:
            return None
            
        try:
            with self.driver.session(database=database_name) as session:
                # Get all nodes and relationships
                result = session.run("MATCH (n) RETURN n LIMIT 25")
                nodes = []
                for record in result:
                    nodes.append(dict(record["n"]))
                
                if nodes:
                    print(f"✅ Found {len(nodes)} nodes in bookhubdata:")
                    for i, node in enumerate(nodes, 1):
                        print(f"  {i}. {node}")
                else:
                    print("📭 No data found in bookhubdata database")
                
                return nodes
                
        except Exception as e:
            print(f"❌ Error querying NOGS data: {e}")
            return None

if __name__ == "__main__":
    print("🚀 Connecting to BookHubData Neo4j Database...")
    
    manager = BookHubDataManager()
    
    if manager.driver:
        try:
            # Test connection
            if manager.test_connection():
                # Create database if needed
                manager.create_database()
                
                # Query NOGS data
                nogs_data = manager.query_nogs_data()
                
                print("\n🔗 Neo4j Connection Information:")
                print("=" * 50)
                print(f"Browser URL: http://localhost:7474")
                print(f"Bolt URL: bolt://localhost:7687")
                print(f"Database: bookhubdata")
                print(f"Status: Connected ✅")
                
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            manager.close()
    else:
        print("❌ Failed to establish connection to Neo4j") 