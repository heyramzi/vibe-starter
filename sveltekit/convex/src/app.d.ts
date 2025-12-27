// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { ConvexHttpClient } from "convex/browser"

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      convex: ConvexHttpClient
    }
    interface PageData {
      user: { id: string; email: string } | null
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
