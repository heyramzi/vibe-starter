import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

// Browser-side Supabase client (sync function)
export const createClient = () =>
  createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
