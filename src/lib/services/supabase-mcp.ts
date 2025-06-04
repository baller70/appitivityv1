import { SUPABASE_PROJECT_ID } from '../supabase'

/**
 * Supabase MCP Service
 * Uses Supabase MCP tools for database operations
 * This bypasses the need for service role keys in environment variables
 */

export class SupabaseMCPService {
  private projectId = SUPABASE_PROJECT_ID

  /**
   * Execute raw SQL query using MCP
   */
  async executeSQL(query: string): Promise<any> {
    try {
      // Note: This would need to be called from server-side context
      // where MCP tools are available
      const result = await fetch('/api/supabase/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      return await result.json()
    } catch (error) {
      console.error('Error executing SQL:', error)
      throw error
    }
  }

  /**
   * Apply a migration using MCP
   */
  async applyMigration(name: string, query: string): Promise<any> {
    try {
      const result = await fetch('/api/supabase/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, query })
      })
      return await result.json()
    } catch (error) {
      console.error('Error applying migration:', error)
      throw error
    }
  }

  /**
   * Get project information
   */
  async getProjectInfo() {
    try {
      const result = await fetch('/api/supabase/project', {
        method: 'GET'
      })
      return await result.json()
    } catch (error) {
      console.error('Error getting project info:', error)
      throw error
    }
  }
}

export const supabaseMCP = new SupabaseMCPService() 