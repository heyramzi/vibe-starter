// Auth middleware for Convex
// Note: Convex uses client-side auth via useConvexAuth hook
// Server-side auth is handled in Convex functions via ctx.auth

export interface AuthContext {
  userId: string
}

// Placeholder for server-side auth patterns
// In Convex, auth is typically checked in Convex functions using ctx.auth.getUserIdentity()
export async function requireAuth(): Promise<AuthContext> {
  // This pattern doesn't apply to Convex in the same way as Supabase
  // For protected routes, use Next.js middleware or check auth in components
  throw new Error('Use Convex auth hooks instead: useConvexAuth()')
}
