/**
 * Convex Database Type Helpers
 *
 * Convex generates types automatically from your schema.
 * Import from convex/_generated/dataModel for type-safe queries.
 *
 * @example
 * ```ts
 * import { Doc, Id } from "convex/_generated/dataModel"
 *
 * // Get a document type
 * type User = Doc<"users">
 *
 * // Get an ID type
 * type UserId = Id<"users">
 * ```
 *
 * Note: Types are generated when you run `npx convex dev`
 */

// Placeholder types until Convex generates them
export type Doc<_T extends string> = { _id: string; _creationTime: number } & Record<string, unknown>
export type Id<_T extends string> = string
