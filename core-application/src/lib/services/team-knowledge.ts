import { createSupabaseClient } from '../supabase'
import type { TeamKnowledgeEdge, TeamKnowledgeEdgeInsert } from '../../types/supabase'

export class TeamKnowledgeGraphService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async addEdge(teamId: string, sourceType: string, sourceId: string, targetType: string, targetId: string, edgeType?: string): Promise<TeamKnowledgeEdge> {
    const payload: Omit<TeamKnowledgeEdgeInsert, 'created_at'> = {
      team_id: teamId,
      source_type: sourceType,
      source_id: sourceId,
      target_type: targetType,
      target_id: targetId,
      edge_type: edgeType ?? null,
    }
    const { data, error } = await this.supabase
      .from('team_knowledge_edges')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw new Error(`Failed to add edge: ${error.message}`)
    return data as TeamKnowledgeEdge
  }

  async listEdges(teamId: string): Promise<TeamKnowledgeEdge[]> {
    const { data, error } = await this.supabase
      .from('team_knowledge_edges')
      .select('*')
      .eq('team_id', teamId)

    if (error) throw new Error(`Failed to list edges: ${error.message}`)
    return data ?? []
  }
} 