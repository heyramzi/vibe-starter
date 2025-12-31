/**
 * Convex Storage Service
 *
 * Convex has built-in file storage. Use it like this:
 *
 * Client-side upload:
 * const generateUploadUrl = useMutation(api.files.generateUploadUrl)
 * const url = await generateUploadUrl()
 * await fetch(url, { method: "POST", body: file })
 *
 * Server-side in Convex functions:
 * const storageId = await ctx.storage.store(blob)
 * const url = await ctx.storage.getUrl(storageId)
 *
 * See: https://docs.convex.dev/file-storage
 */

import type {
  StorageBucket,
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  ListOptions,
  FileObject,
} from './types'

// Placeholder - implement using Convex file storage
export const StorageService = {
  async upload(
    _file: File | Blob,
    _fileName: string,
    _options: UploadOptions = {}
  ): Promise<UploadResult> {
    throw new Error('Use Convex file storage: useMutation(api.files.generateUploadUrl)')
  },

  async uploadForUser(
    _userId: string,
    _file: File | Blob,
    _fileName: string,
    _options: Omit<UploadOptions, 'path'> = {}
  ): Promise<UploadResult> {
    throw new Error('Use Convex file storage with user context')
  },

  async uploadForOrg(
    _orgId: string,
    _file: File | Blob,
    _fileName: string,
    _options: Omit<UploadOptions, 'path'> = {}
  ): Promise<UploadResult> {
    throw new Error('Use Convex file storage with org context')
  },

  async download(_path: string, _bucket: StorageBucket = 'documents'): Promise<Blob> {
    throw new Error('Use Convex ctx.storage.get(storageId)')
  },

  getPublicUrl(_path: string, _bucket: StorageBucket = 'public'): string {
    throw new Error('Use Convex ctx.storage.getUrl(storageId)')
  },

  async getSignedUrl(_path: string, _options: SignedUrlOptions = {}): Promise<string> {
    throw new Error('Convex storage URLs are already time-limited')
  },

  async list(_options: ListOptions = {}): Promise<FileObject[]> {
    throw new Error('Query your Convex files table instead')
  },

  async listForUser(_userId: string, _options: Omit<ListOptions, 'path'> = {}): Promise<FileObject[]> {
    throw new Error('Query your Convex files table with user filter')
  },

  async listForOrg(_orgId: string, _options: Omit<ListOptions, 'path'> = {}): Promise<FileObject[]> {
    throw new Error('Query your Convex files table with org filter')
  },

  async delete(_paths: string | string[], _bucket: StorageBucket = 'documents'): Promise<void> {
    throw new Error('Use Convex ctx.storage.delete(storageId)')
  },

  async move(
    _fromPath: string,
    _toPath: string,
    _bucket: StorageBucket = 'documents'
  ): Promise<void> {
    throw new Error('Convex storage does not support move - copy and delete instead')
  },

  async copy(
    _fromPath: string,
    _toPath: string,
    _bucket: StorageBucket = 'documents'
  ): Promise<void> {
    throw new Error('Convex storage does not support copy directly')
  },
}
