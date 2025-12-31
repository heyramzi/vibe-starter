import { Metadata } from 'next'
import { CheckCircle, XCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Billing | Vibe Starter',
  description: 'Manage your subscription and billing.',
}

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams

  // For Convex, auth and org data is fetched client-side
  // This page shows a placeholder - implement with useQuery hooks in a client component

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="mb-8 text-2xl font-bold">Billing</h1>

        {/* Checkout Result Messages */}
        {params.success && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="flex items-center gap-4 pt-6">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Payment successful!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your subscription is now active. Thank you for your purchase.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {params.canceled && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
            <CardContent className="flex items-center gap-4 pt-6">
              <XCircle className="size-8 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Checkout canceled
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your payment was not processed. You can try again anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder - implement with Convex queries */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Current Plan
              </CardTitle>
              <Badge variant="outline">Loading...</Badge>
            </div>
            <CardDescription>
              TODO: Fetch organization data from Convex
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Implement billing with Convex queries
              </p>
              <Button asChild>
                <a href="/pricing">View Plans</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
