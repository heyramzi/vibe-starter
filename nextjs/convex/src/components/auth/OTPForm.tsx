"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useConvexAuth } from "@/lib/convex/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OTPFormProps {
  mode: "login" | "signup"
  redirectTo?: string
}

export function OTPForm({ mode, redirectTo = "/dashboard" }: OTPFormProps) {
  const router = useRouter()
  const { sendOTP } = useConvexAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await sendOTP(email)
      router.push(`/verify?email=${encodeURIComponent(email)}&next=${redirectTo}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : mode === "login" ? (
          "Send magic link"
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  )
}
