import { createClient as createServerClient } from '@/lib/supabase/server'
import type {
  StorageBucket,
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  ListOptions,
  FileObject,
} from './types'

const DEFAULT_BUCKET: StorageBucket = 'documents'

export const StorageService = {
  // Upload a file to storage
  async upload(
    file: File | Blob,
    fileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const supabase = await createServerClient()
    const bucket = options.bucket ?? DEFAULT_BUCKET
    const filePath = options.path ? `${options.path}/${fileName}` : fileName

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      upsert: options.upsert ?? false,
      contentType: options.contentType,
    })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL if bucket is public
    const publicUrl =
      bucket === 'public'
        ? supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
        : null

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl,
    }
  },

  // Upload with user-scoped path (user-{id}/filename)
  async uploadForUser(
    userId: string,
    file: File | Blob,
    fileName: string,
    options: Omit<UploadOptions, 'path'> = {}
  ): Promise<UploadResult> {
    return this.upload(file, fileName, {
      ...options,
      path: `user-${userId}`,
    })
  },

  // Upload with org-scoped path (org-{id}/filename)
  async uploadForOrg(
    orgId: string,
    file: File | Blob,
    fileName: string,
    options: Omit<UploadOptions, 'path'> = {}
  ): Promise<UploadResult> {
    return this.upload(file, fileName, {
      ...options,
      path: `org-${orgId}`,
    })
  },

  // Download file data
  async download(path: string, bucket: StorageBucket = DEFAULT_BUCKET): Promise<Blob> {
    const supabase = await createServerClient()

    const { data, error } = await supabase.storage.from(bucket).download(path)

    if (error) {
      throw new Error(`Download failed: ${error.message}`)
    }

    return data
  },

  // Get public URL (only works for public bucket)
  getPublicUrl(path: string, bucket: StorageBucket = 'public'): string {
    // This is sync - doesn't need auth, just constructs URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  },

  // Get signed URL for private files
  async getSignedUrl(path: string, options: SignedUrlOptions = {}): Promise<string> {
    const supabase = await createServerClient()
    const bucket = options.bucket ?? DEFAULT_BUCKET
    const expiresIn = options.expiresIn ?? 3600

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn, {
      download: options.download,
    })

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  },

  // List files in a path
  async list(options: ListOptions = {}): Promise<FileObject[]> {
    const supabase = await createServerClient()
    const bucket = options.bucket ?? DEFAULT_BUCKET

    const { data, error } = await supabase.storage.from(bucket).list(options.path, {
      limit: options.limit ?? 100,
      offset: options.offset ?? 0,
      sortBy: options.sortBy ?? { column: 'created_at', order: 'desc' },
    })

    if (error) {
      throw new Error(`List failed: ${error.message}`)
    }

    return data as FileObject[]
  },

  // List files for a user
  async listForUser(userId: string, options: Omit<ListOptions, 'path'> = {}): Promise<FileObject[]> {
    return this.list({
      ...options,
      path: `user-${userId}`,
    })
  },

  // List files for an org
  async listForOrg(orgId: string, options: Omit<ListOptions, 'path'> = {}): Promise<FileObject[]> {
    return this.list({
      ...options,
      path: `org-${orgId}`,
    })
  },

  // Delete a file
  async delete(paths: string | string[], bucket: StorageBucket = DEFAULT_BUCKET): Promise<void> {
    const supabase = await createServerClient()
    const pathArray = Array.isArray(paths) ? paths : [paths]

    const { error } = await supabase.storage.from(bucket).remove(pathArray)

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  },

  // Move/rename a file
  async move(
    fromPath: string,
    toPath: string,
    bucket: StorageBucket = DEFAULT_BUCKET
  ): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase.storage.from(bucket).move(fromPath, toPath)

    if (error) {
      throw new Error(`Move failed: ${error.message}`)
    }
  },

  // Copy a file
  async copy(
    fromPath: string,
    toPath: string,
    bucket: StorageBucket = DEFAULT_BUCKET
  ): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath)

    if (error) {
      throw new Error(`Copy failed: ${error.message}`)
    }
  },
}
