import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase Database Type Helpers
 *
 * After generating types with `supabase gen types typescript`:
 * 1. Import your Database type
 * 2. Uncomment and use these helpers
 *
 * @example
 * ```ts
 * // Get a table row type
 * type User = Tables<'users'>
 *
 * // Get insert type (for creating records)
 * type NewUser = TablesInsert<'users'>
 *
 * // Get update type (for partial updates)
 * type UserUpdate = TablesUpdate<'users'>
 * ```
 */

// TODO: Generate types with: pnpm supabase gen types typescript --project-id <id> > src/types/supabase.ts
// Then uncomment below and import { Database } from './supabase'

// export type Tables<T extends keyof Database['public']['Tables']> =
//   Database['public']['Tables'][T]['Row']

// export type TablesInsert<T extends keyof Database['public']['Tables']> =
//   Database['public']['Tables'][T]['Insert']

// export type TablesUpdate<T extends keyof Database['public']['Tables']> =
//   Database['public']['Tables'][T]['Update']

// export type Enums<T extends keyof Database['public']['Enums']> =
//   Database['public']['Enums'][T]

// Typed Supabase client (use after generating Database type)
// export type TypedSupabaseClient = SupabaseClient<Database>

// Placeholder until database types are generated
export type TypedSupabaseClient = SupabaseClient
