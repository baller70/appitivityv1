export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookmark_tags: {
        Row: {
          bookmark_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          bookmark_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          bookmark_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_tags_bookmark_id_fkey"
            columns: ["bookmark_id"]
            isOneToOne: false
            referencedRelation: "bookmarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmark_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string | null
          description: string | null
          favicon_url: string | null
          folder_id: string | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          last_visited_at: string | null
          screenshot_url: string | null
          title: string
          updated_at: string | null
          url: string
          user_id: string
          visit_count: number | null
          tags: {
            id: string
            name: string
            color: string | null
            created_at: string | null
            updated_at: string | null
            user_id: string
          }[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          last_visited_at?: string | null
          screenshot_url?: string | null
          title: string
          updated_at?: string | null
          url: string
          user_id: string
          visit_count?: number | null
          tags?: {
            id: string
            name: string
            color: string | null
            created_at: string | null
            updated_at: string | null
            user_id: string
          }[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          folder_id?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          last_visited_at?: string | null
          screenshot_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          user_id?: string
          visit_count?: number | null
          tags?: {
            id: string
            name: string
            color: string | null
            created_at: string | null
            updated_at: string | null
            user_id: string
          }[] | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          reminder_at?: string | null
          deadline_date?: string | null
          goal_type?: string | null
          goal_description?: string | null
          goal_status?: string | null
          goal_priority?: string | null
          goal_progress?: number | null
          goal_notes?: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          reminder_at?: string | null
          deadline_date?: string | null
          goal_type?: string | null
          goal_description?: string | null
          goal_status?: string | null
          goal_priority?: string | null
          goal_progress?: number | null
          goal_notes?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          reminder_at?: string | null
          deadline_date?: string | null
          goal_type?: string | null
          goal_description?: string | null
          goal_status?: string | null
          goal_priority?: string | null
          goal_progress?: number | null
          goal_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          is_favorite: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_favorite?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_favorite?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      playlist_bookmarks: {
        Row: {
          id: string
          playlist_id: string
          bookmark_id: string
          position: number | null
          added_at: string | null
        }
        Insert: {
          id?: string
          playlist_id: string
          bookmark_id: string
          position?: number | null
          added_at?: string | null
        }
        Update: {
          id?: string
          playlist_id?: string
          bookmark_id?: string
          position?: number | null
          added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlist_bookmarks_playlist_id_fkey",
            columns: ["playlist_id"],
            isOneToOne: false,
            referencedRelation: "playlists",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_bookmarks_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          }
        ]
      },
      time_capsules: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_capsules_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      time_capsule_bookmarks: {
        Row: {
          id: string
          time_capsule_id: string
          bookmark_id: string
          added_at: string | null
        }
        Insert: {
          id?: string
          time_capsule_id: string
          bookmark_id: string
          added_at?: string | null
        }
        Update: {
          id?: string
          time_capsule_id?: string
          bookmark_id?: string
          added_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_capsule_bookmarks_time_capsule_id_fkey",
            columns: ["time_capsule_id"],
            isOneToOne: false,
            referencedRelation: "time_capsules",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_capsule_bookmarks_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          }
        ]
      },
      dna_profile_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          payload: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          payload?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          payload?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_profile_events_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      user_dna_profiles: {
        Row: {
          id: string
          user_id: string
          profile_data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          profile_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          profile_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_dna_profiles_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      dna_profile_insights: {
        Row: {
          id: string
          user_dna_profile_id: string
          insight: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_dna_profile_id: string
          insight: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_dna_profile_id?: string
          insight?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_profile_insights_user_dna_profile_id_fkey",
            columns: ["user_dna_profile_id"],
            isOneToOne: false,
            referencedRelation: "user_dna_profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      dna_profile_recommendations: {
        Row: {
          id: string
          user_dna_profile_id: string
          recommendation: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_dna_profile_id: string
          recommendation: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_dna_profile_id?: string
          recommendation?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dna_profile_recommendations_user_dna_profile_id_fkey",
            columns: ["user_dna_profile_id"],
            isOneToOne: false,
            referencedRelation: "user_dna_profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      bookmark_comments: {
        Row: {
          id: string
          bookmark_id: string
          user_id: string
          text: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          bookmark_id: string
          user_id: string
          text: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          bookmark_id?: string
          user_id?: string
          text?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_comments_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmark_comments_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string | null
          message: string
          type: string | null
          priority: string | null
          link: string | null
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          message: string
          type?: string | null
          priority?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          message?: string
          type?: string | null
          priority?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
        Relationships: []
      },
      team_bookmarks: {
        Row: {
          id: string
          team_id: string
          bookmark_id: string
          added_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          bookmark_id: string
          added_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          bookmark_id?: string
          added_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_bookmarks_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_bookmarks_team_id_fkey",
            columns: ["team_id"],
            isOneToOne: false,
            referencedRelation: "teams",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_bookmarks_added_by_fkey",
            columns: ["added_by"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      bookmark_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          title: string | null
          description: string | null
          url: string | null
          favicon_url: string | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          title?: string | null
          description?: string | null
          url?: string | null
          favicon_url?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          title?: string | null
          description?: string | null
          url?: string | null
          favicon_url?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_templates_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      tasks: {
        Row: {
          id: string
          user_id: string
          bookmark_id: string | null
          title: string
          description: string | null
          status: string | null
          priority: string | null
          due_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          bookmark_id?: string | null
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          bookmark_id?: string | null
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          }
        ]
      },
      task_assignments: {
        Row: {
          id: string
          task_id: string
          assignee_id: string
          assigned_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          assignee_id: string
          assigned_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          assignee_id?: string
          assigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey",
            columns: ["task_id"],
            isOneToOne: false,
            referencedRelation: "tasks",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_assignee_id_fkey",
            columns: ["assignee_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string | null
          invited_at: string | null
          joined_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string | null
          invited_at?: string | null
          joined_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string | null
          invited_at?: string | null
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey",
            columns: ["team_id"],
            isOneToOne: false,
            referencedRelation: "teams",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      bookmark_status: {
        Row: {
          id: string
          bookmark_id: string
          status: string | null
          updated_by: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          bookmark_id: string
          status?: string | null
          updated_by: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          bookmark_id?: string
          status?: string | null
          updated_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_status_bookmark_id_fkey",
            columns: ["bookmark_id"],
            isOneToOne: false,
            referencedRelation: "bookmarks",
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmark_status_updated_by_fkey",
            columns: ["updated_by"],
            isOneToOne: false,
            referencedRelation: "profiles",
            referencedColumns: ["id"]
          }
        ]
      },
      team_knowledge_edges: {
        Row: {
          id: string
          team_id: string
          source_type: string
          source_id: string
          target_type: string
          target_id: string
          edge_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          source_type: string
          source_id: string
          target_type: string
          target_id: string
          edge_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          source_type?: string
          source_id?: string
          target_type?: string
          target_id?: string
          edge_type?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_knowledge_edges_team_id_fkey",
            columns: ["team_id"],
            isOneToOne: false,
            referencedRelation: "teams",
            referencedColumns: ["id"]
          }
        ]
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Convenience type exports for easy use
export type Bookmark = Tables<'bookmarks'>
export type BookmarkInsert = TablesInsert<'bookmarks'>
export type BookmarkUpdate = TablesUpdate<'bookmarks'>

export type Folder = Tables<'folders'>
export type FolderInsert = TablesInsert<'folders'>
export type FolderUpdate = TablesUpdate<'folders'>

export type Tag = Tables<'tags'>
export type TagInsert = TablesInsert<'tags'>
export type TagUpdate = TablesUpdate<'tags'>

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type BookmarkTag = Tables<'bookmark_tags'>
export type BookmarkTagInsert = TablesInsert<'bookmark_tags'>
export type BookmarkTagUpdate = TablesUpdate<'bookmark_tags'>

// Time Capsule related types
export type TimeCapsule = Tables<'time_capsules'>
export type TimeCapsuleInsert = TablesInsert<'time_capsules'>
export type TimeCapsuleUpdate = TablesUpdate<'time_capsules'>

export type TimeCapsuleBookmark = Tables<'time_capsule_bookmarks'>
export type TimeCapsuleBookmarkInsert = TablesInsert<'time_capsule_bookmarks'>
export type TimeCapsuleBookmarkUpdate = TablesUpdate<'time_capsule_bookmarks'>

// DNA Profile related types
export type DnaProfileEvent = Tables<'dna_profile_events'>
export type DnaProfileEventInsert = TablesInsert<'dna_profile_events'>
export type DnaProfileEventUpdate = TablesUpdate<'dna_profile_events'>

export type UserDnaProfile = Tables<'user_dna_profiles'>
export type UserDnaProfileInsert = TablesInsert<'user_dna_profiles'>
export type UserDnaProfileUpdate = TablesUpdate<'user_dna_profiles'>

export type DnaProfileInsight = Tables<'dna_profile_insights'>
export type DnaProfileInsightInsert = TablesInsert<'dna_profile_insights'>
export type DnaProfileInsightUpdate = TablesUpdate<'dna_profile_insights'>

export type DnaProfileRecommendation = Tables<'dna_profile_recommendations'>
export type DnaProfileRecommendationInsert = TablesInsert<'dna_profile_recommendations'>
export type DnaProfileRecommendationUpdate = TablesUpdate<'dna_profile_recommendations'>

// Comments
export type BookmarkComment = Tables<'bookmark_comments'>
export type BookmarkCommentInsert = TablesInsert<'bookmark_comments'>
export type BookmarkCommentUpdate = TablesUpdate<'bookmark_comments'>

// Notifications
export type UserNotification = Tables<'notifications'>
export type UserNotificationInsert = TablesInsert<'notifications'>
export type UserNotificationUpdate = TablesUpdate<'notifications'>

// Teams
export type Team = Tables<'teams'>
export type TeamInsert = TablesInsert<'teams'>
export type TeamUpdate = TablesUpdate<'teams'>

export type TeamBookmark = Tables<'team_bookmarks'>
export type TeamBookmarkInsert = TablesInsert<'team_bookmarks'>
export type TeamBookmarkUpdate = TablesUpdate<'team_bookmarks'>

export type BookmarkTemplate = Tables<'bookmark_templates'>
export type BookmarkTemplateInsert = TablesInsert<'bookmark_templates'>
export type BookmarkTemplateUpdate = TablesUpdate<'bookmark_templates'>

export type Task = Tables<'tasks'>
export type TaskInsert = TablesInsert<'tasks'>
export type TaskUpdate = TablesUpdate<'tasks'>

export type TaskAssignment = Tables<'task_assignments'>
export type TaskAssignmentInsert = TablesInsert<'task_assignments'>
export type TaskAssignmentUpdate = TablesUpdate<'task_assignments'>

export type TeamMember = Tables<'team_members'>
export type TeamMemberInsert = TablesInsert<'team_members'>
export type TeamMemberUpdate = TablesUpdate<'team_members'>

export type BookmarkStatus = Tables<'bookmark_status'>
export type BookmarkStatusInsert = TablesInsert<'bookmark_status'>
export type BookmarkStatusUpdate = TablesUpdate<'bookmark_status'>

// Team knowledge graph types
export type TeamKnowledgeEdge = Tables<'team_knowledge_edges'>
export type TeamKnowledgeEdgeInsert = TablesInsert<'team_knowledge_edges'>
export type TeamKnowledgeEdgeUpdate = TablesUpdate<'team_knowledge_edges'> 