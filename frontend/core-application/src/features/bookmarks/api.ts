import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/apiClient'

export interface Bookmark {
  id: string
  url: string
  title: string
  description: string
  tags: string[]
  icon_url?: string
  created_at: string
}

export interface Metrics {
  total_visits: number
  delta_visits_pct: number
  avg_time_sec: number
  week_visits: number
  busy_day: string
  uptime_pct: number
  health_label: string
}

export interface RelatedBookmark {
  id: string
  parent_id: string
  title: string
  url: string
  favicon_url?: string
  tags: string[]
  visit_count?: number
  last_visit?: string
  created_at: string
}

/* ---------------- BOOKMARK ------------------ */
export function useBookmark(id: string) {
  return useQuery({
    queryKey: ['bookmark', id],
    queryFn: async () => {
      const { data } = await api.get<Bookmark>(`/bookmarks/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateBookmark(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates: Partial<Bookmark>) => {
      const { data } = await api.patch<Bookmark>(`/bookmarks/${id}`, updates)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark', id] })
    },
  })
}

/* ---------------- METRICS ------------------ */
export function useBookmarkMetrics(id: string) {
  return useQuery({
    queryKey: ['bookmark', id, 'metrics'],
    queryFn: async () => {
      const { data } = await api.get<Metrics>(`/bookmarks/${id}/metrics`)
      return data
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}

/* ---------------- RELATED ------------------ */
export function useRelatedBookmarks(id: string) {
  return useQuery({
    queryKey: ['bookmark', id, 'related'],
    queryFn: async () => {
      const { data } = await api.get<RelatedBookmark[]>(`/bookmarks/${id}/related`)
      return data
    },
    enabled: !!id,
  })
}

export function useAddRelated(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { url: string; title: string; tags: string[]; notes?: string }) => {
      const { data } = await api.post<RelatedBookmark>(`/bookmarks/${id}/related`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark', id, 'related'] })
    },
  })
}

export function useDeleteRelated(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (relId: string) => {
      await api.delete(`/bookmarks/${id}/related/${relId}`)
      return relId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark', id, 'related'] })
    },
  })
}

export function useReorderRelated(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.patch(`/bookmarks/${id}/related/order`, { ids })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmark', id, 'related'] })
    },
  })
}

/* ---------------- TAGS ------------------ */
export function useTags(query: string) {
  return useQuery({
    queryKey: ['tags', query],
    queryFn: async () => {
      const { data } = await api.get<string[]>(`/tags`, { params: { query } })
      return data
    },
    enabled: query.length > 0,
  })
}

export function useCreateTag() {
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<string[]>(`/tags`, { name })
      return data
    },
  })
}

/* ---------------- ICON UPLOAD ------------------ */
export async function uploadIcon(file: File): Promise<string> {
  // 1. presign
  const { data: presign } = await api.post<{ url: string; key: string }>(`/upload-url`, {
    mime: file.type,
  })
  // 2. PUT
  await api.put(presign.url, file, {
    headers: {
      'Content-Type': file.type,
    },
  })
  // 3. return public URL
  return `https://cdn.example.com/${presign.key}`
} 