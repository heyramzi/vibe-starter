// Barrel exports for Supabase clients
// Server client is set up in hooks.server.ts and available via event.locals.supabase
// Use this client.ts for browser-side Supabase access
export { createClient } from './client'
export { SupabaseAuth } from './auth'
