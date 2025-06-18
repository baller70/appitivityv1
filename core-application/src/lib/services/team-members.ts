import { createSupabaseClient } from '../supabase'
import type { TeamMember, TeamMemberInsert } from '../../types/supabase'

export class TeamMemberService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async listMembers(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*, profiles!inner(*)')
      .eq('team_id', teamId)

    if (error) throw new Error(`Fetch members error: ${error.message}`)
    return data ?? []
  }

  async addMember(teamId: string, memberId: string, role: 'owner' | 'editor' | 'viewer' = 'viewer'): Promise<TeamMember> {
    const { data, error } = await this.supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: memberId, role })
      .select()
      .single()

    if (error) throw new Error(`Add member error: ${error.message}`)
    return data as TeamMember
  }

  async updateRole(memberId: string, role: 'owner' | 'editor' | 'viewer'): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
    if (error) throw new Error(`Update role error: ${error.message}`)
  }

  async removeMember(memberId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
    if (error) throw new Error(`Remove member error: ${error.message}`)
  }
} 