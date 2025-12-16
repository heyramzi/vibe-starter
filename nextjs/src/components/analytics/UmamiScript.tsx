'use client'

import Script from 'next/script'

const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

/**
 * Umami Analytics script loader
 *
 * Uses proxied path `/u/script.js` to bypass ad blockers.
 * Set NEXT_PUBLIC_UMAMI_WEBSITE_ID in your environment.
 */
export function UmamiScript() {
  if (!WEBSITE_ID) return null

  return (
    <Script
      defer
      src="/u/script.js"
      data-website-id={WEBSITE_ID}
      strategy="afterInteractive"
    />
  )
}
