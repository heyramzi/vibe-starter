import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async () => {
  // For Convex, auth is handled client-side via ConvexAuthProvider
  // Server-side auth can be checked via Convex HTTP client if needed
  return { user: null }
}
