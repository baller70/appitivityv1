// Service classes
export { BookmarkService } from './bookmarks'
export { CommentService } from './comments'
export { FolderService } from './folders'
export { TagService } from './tags'
export { ProfileService } from './profiles'
export { NotificationService } from './notifications'
export { TeamBookmarkService } from './team-bookmarks'
export { TemplateService } from './templates'
export { TaskService } from './tasks'
export { TeamMemberService } from './team-members'
export { TeamDnaService } from './team-dna'
export { BookmarkStatusService } from './bookmark-status'
export { TeamKnowledgeGraphService } from './team-knowledge'
// export { CollaborationService } from './collaboration'

// Import service classes for the factory function
import { BookmarkService } from './bookmarks'
import { FolderService } from './folders'
import { TagService } from './tags'
import { ProfileService } from './profiles'

// Service types
export type { BookmarkWithRelations } from './bookmarks'
export type { BookmarkComment } from '../../types/supabase'
export type { FolderWithChildren } from './folders'
export type { TagWithCount } from './tags'

// Database types re-export for convenience
export type {
  Bookmark,
  BookmarkInsert,
  BookmarkUpdate,
  Folder,
  FolderInsert,
  FolderUpdate,
  Tag,
  TagInsert,
  TagUpdate,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  BookmarkTag,
  BookmarkTagInsert,
  BookmarkTagUpdate,
  Database
} from '../../types/supabase'

// Service factory function for easy initialization
export function createServices(userId: string) {
  return {
    bookmarks: new BookmarkService(userId),
    folders: new FolderService(userId),
    tags: new TagService(userId),
    profiles: new ProfileService(userId)
  }
} 