// Barrel exports for Supabase clients
// Use server.ts for Server Components and API routes
// Use client.ts for Client Components
export { createClient as createServerClient } from './server'
export { createClient as createBrowserClient } from './client'
export { SupabaseAuth } from './auth'
