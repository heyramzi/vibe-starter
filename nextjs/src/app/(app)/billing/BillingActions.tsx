'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function BillingActions() {
  const [isLoading, setIsLoading] = useState(false)

  async function openPortal() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={openPortal} disabled={isLoading} variant="outline">
      {isLoading ? 'Opening...' : 'Manage in Stripe'}
      <ExternalLink className="ml-2 size-4" />
    </Button>
  )
}
