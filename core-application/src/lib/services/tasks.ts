import { createSupabaseClient } from '../supabase'
import type { Task, TaskInsert, TaskUpdate, TaskAssignment, TaskAssignmentInsert } from '../../types/supabase'

export class TaskService {
  private supabase
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.supabase = createSupabaseClient(userId)
  }

  async listTasks(): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch tasks: ${error.message}`)
    return data ?? []
  }

  async createTask(input: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({ ...input, user_id: this.userId })
      .select()
      .single()

    if (error) throw new Error(`Create task error: ${error.message}`)
    return data as Task
  }

  async updateTask(id: string, updates: TaskUpdate): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(`Update task error: ${error.message}`)
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Delete task error: ${error.message}`)
  }

  async assignTask(taskId: string, assigneeId: string): Promise<TaskAssignment> {
    const { data, error } = await this.supabase
      .from('task_assignments')
      .insert({ task_id: taskId, assignee_id: assigneeId })
      .select()
      .single()

    if (error) throw new Error(`Assign task error: ${error.message}`)
    return data as TaskAssignment
  }

  async listAssignments(taskId: string): Promise<TaskAssignment[]> {
    const { data, error } = await this.supabase
      .from('task_assignments')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw new Error(`Fetch assignments error: ${error.message}`)
    return data ?? []
  }
} 