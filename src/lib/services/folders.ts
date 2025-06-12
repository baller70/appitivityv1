import { supabaseAdmin } from '../supabase'
import { normalizeUserId } from '../uuid-compat'
import type { 
  Folder, 
  FolderInsert, 
  FolderUpdate 
} from '../../types/supabase'

// Folder with children for tree structure
export interface FolderWithChildren extends Folder {
  children?: FolderWithChildren[]
  bookmarkCount?: number
}

export class FolderService {
  private supabase: NonNullable<typeof supabaseAdmin>
  private userId: string

  constructor(userId: string) {
    // Normalize the user ID to UUID format for database operations
    this.userId = normalizeUserId(userId)
    // Use admin client to bypass RLS - we handle user filtering manually
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }
    this.supabase = supabaseAdmin
  }

  // Get all folders for the current user
  async getFolders(): Promise<Folder[]> {
    const { data, error } = await this.supabase!
      .from('folders')
      .select('*')
      .eq('user_id', this.userId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch folders: ${error.message}`)
    }

    return data || []
  }

  // Get folders as a tree structure
  async getFolderTree(): Promise<FolderWithChildren[]> {
    const folders = await this.getFolders()
    return this.buildFolderTree(folders)
  }

  // Get folders with bookmark counts
  async getFoldersWithCounts(): Promise<FolderWithChildren[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select(`
        *,
        bookmarks(count)
      `)
      .eq('user_id', this.userId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch folders with counts: ${error.message}`)
    }

    return data?.map(folder => ({
      ...folder,
      bookmarkCount: folder.bookmarks?.[0]?.count || 0
    })) || []
  }

  // Get a single folder by ID
  async getFolder(id: string): Promise<Folder | null> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', this.userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to fetch folder: ${error.message}`)
    }

    return data
  }

  // Create a new folder
  async createFolder(folder: Omit<FolderInsert, 'user_id'>): Promise<Folder> {
    // Only include fields that exist in the current database schema
    const folderData = {
      name: folder.name,
      description: folder.description,
      color: folder.color,
      parent_id: folder.parent_id,
      user_id: this.userId
    }
    
    console.log('FolderService.createFolder called with:', {
      originalData: folder,
      finalData: folderData,
      userId: this.userId,
      supabaseClientType: 'admin'
    })
    
    const { data, error } = await this.supabase
      .from('folders')
      .insert(folderData)
      .select()
      .single()

    console.log('FolderService.createFolder result:', { data, error })

    if (error) {
      console.error('FolderService.createFolder error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to create folder: ${error.message}`)
    }

    return data
  }

  // Update a folder
  async updateFolder(id: string, updates: FolderUpdate): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update folder: ${error.message}`)
    }

    return data
  }

  // Delete a folder
  async deleteFolder(id: string): Promise<void> {
    // Check if folder has children or bookmarks
    const [children, bookmarks] = await Promise.all([
      this.supabase
        .from('folders')
        .select('id')
        .eq('parent_id', id)
        .eq('user_id', this.userId),
      this.supabase
        .from('bookmarks')
        .select('id')
        .eq('folder_id', id)
        .eq('user_id', this.userId)
    ])

    if (children.data && children.data.length > 0) {
      throw new Error('Cannot delete folder with subfolders. Move or delete subfolders first.')
    }

    if (bookmarks.data && bookmarks.data.length > 0) {
      throw new Error('Cannot delete folder with bookmarks. Move or delete bookmarks first.')
    }

    const { error } = await this.supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`)
    }
  }

  // Get root folders (folders without parent)
  async getRootFolders(): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', this.userId)
      .is('parent_id', null)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch root folders: ${error.message}`)
    }

    return data || []
  }

  // Get subfolders of a specific folder
  async getSubfolders(parentId: string): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', this.userId)
      .eq('parent_id', parentId)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch subfolders: ${error.message}`)
    }

    return data || []
  }

  // Move a folder to a different parent
  async moveFolder(folderId: string, newParentId: string | null): Promise<Folder> {
    // Validate that we're not creating a circular reference
    if (newParentId) {
      const isCircular = await this.wouldCreateCircularReference(folderId, newParentId)
      if (isCircular) {
        throw new Error('Cannot move folder: would create circular reference')
      }
    }

    return this.updateFolder(folderId, { parent_id: newParentId })
  }

  // Check if moving a folder would create a circular reference
  private async wouldCreateCircularReference(folderId: string, newParentId: string): Promise<boolean> {
    let currentParentId: string | null = newParentId

    while (currentParentId) {
      if (currentParentId === folderId) {
        return true // Circular reference detected
      }

      const parentFolder = await this.getFolder(currentParentId)
      currentParentId = parentFolder?.parent_id || null
    }

    return false
  }

  // Build a tree structure from flat folder array
  private buildFolderTree(folders: Folder[]): FolderWithChildren[] {
    const folderMap = new Map<string, FolderWithChildren>()
    const rootFolders: FolderWithChildren[] = []

    // Convert all folders to FolderWithChildren and create map
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build tree structure
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!
      
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(folderWithChildren)
        }
      } else {
        rootFolders.push(folderWithChildren)
      }
    })

    return rootFolders
  }

  // Get folder path (breadcrumb)
  async getFolderPath(folderId: string): Promise<Folder[]> {
    const path: Folder[] = []
    let currentId: string | null = folderId

    while (currentId) {
      const folder = await this.getFolder(currentId)
      if (!folder) break
      
      path.unshift(folder)
      currentId = folder.parent_id
    }

    return path
  }

  // Search folders by name
  async searchFolders(searchTerm: string): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('user_id', this.userId)
      .ilike('name', `%${searchTerm}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search folders: ${error.message}`)
    }

    return data || []
  }
} 