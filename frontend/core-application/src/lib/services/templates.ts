import { createSupabaseClient } from '../supabase'
import type { BookmarkTemplate, BookmarkTemplateInsert } from '../../types/supabase'

export class TemplateService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async listTemplates(): Promise<BookmarkTemplate[]> {
    const { data, error } = await this.supabase
      .from('bookmark_templates')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`)
    return data ?? []
  }

  async createTemplate(input: Omit<BookmarkTemplateInsert, 'user_id'>): Promise<BookmarkTemplate> {
    const { data, error } = await this.supabase
      .from('bookmark_templates')
      .insert({ ...input, user_id: this.userId })
      .select()
      .single()

    if (error) throw new Error(`Failed to create template: ${error.message}`)
    return data as BookmarkTemplate
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookmark_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw new Error(`Failed to delete template: ${error.message}`)
  }
} 