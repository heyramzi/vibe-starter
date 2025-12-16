export type StorageBucket = 'avatars' | 'documents' | 'public'

export type UploadOptions = {
  bucket?: StorageBucket
  path?: string
  upsert?: boolean
  contentType?: string
}

export type UploadResult = {
  path: string
  fullPath: string
  publicUrl: string | null
}

export type SignedUrlOptions = {
  bucket?: StorageBucket
  expiresIn?: number // seconds, default 3600 (1 hour)
  download?: boolean | string // true or filename
}

export type ListOptions = {
  bucket?: StorageBucket
  path?: string
  limit?: number
  offset?: number
  sortBy?: { column: string; order: 'asc' | 'desc' }
}

export type FileObject = {
  name: string
  id: string | null
  bucket_id: string
  created_at: string | null
  updated_at: string | null
  metadata: Record<string, unknown> | null
}
