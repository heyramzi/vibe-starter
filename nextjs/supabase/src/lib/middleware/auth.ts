import { createServerClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthContext {
  user: User
}

// Get authenticated user or throw
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return { user }
}
