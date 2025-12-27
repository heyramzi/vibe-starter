/**
 * Umami Analytics - Type definitions and tracking helpers
 *
 * @see https://umami.is/docs/tracker-functions
 */

declare global {
  interface Window {
    umami?: UmamiTracker
  }
}

type UmamiTracker = {
  track: {
    (): void
    (event: string): void
    (event: string, data: Record<string, unknown>): void
    (payload: UmamiPayload): void
    (fn: (props: UmamiPayload) => UmamiPayload): void
  }
  identify: {
    (id: string): void
    (id: string, data: Record<string, unknown>): void
    (data: Record<string, unknown>): void
  }
}

type UmamiPayload = {
  website?: string
  hostname?: string
  language?: string
  referrer?: string
  screen?: string
  title?: string
  url?: string
  name?: string
  data?: Record<string, unknown>
}

/**
 * Track a page view or custom event
 */
export function track(event?: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.umami) return

  if (!event) {
    window.umami.track()
  } else if (data) {
    window.umami.track(event, data)
  } else {
    window.umami.track(event)
  }
}

/**
 * Identify a user session
 */
export function identify(
  idOrData: string | Record<string, unknown>,
  data?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.umami) return

  if (typeof idOrData === 'string' && data) {
    window.umami.identify(idOrData, data)
  } else if (typeof idOrData === 'string') {
    window.umami.identify(idOrData)
  } else {
    window.umami.identify(idOrData)
  }
}

/**
 * Disable tracking for current browser (useful for developers)
 */
export function disableTracking(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('umami.disabled', '1')
}

/**
 * Re-enable tracking for current browser
 */
export function enableTracking(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('umami.disabled')
}
