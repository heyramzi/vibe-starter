"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface OTPVerifyProps {
  email: string
  redirectTo?: string
}

export function OTPVerify({ email, redirectTo = "/dashboard" }: OTPVerifyProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVerify(token: string) {
    if (token.length !== 6) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (verifyError) {
      setError(verifyError.message)
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
  }

  async function handleResend() {
    setIsResending(true)
    setError(null)

    const supabase = createClient()

    const { error: resendError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (resendError) {
      setError(resendError.message)
    }

    setIsResending(false)
  }

  function handleChange(value: string) {
    setCode(value)
    if (value.length === 6) {
      handleVerify(value)
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-muted-foreground text-center text-sm">
        Enter the 6-digit code sent to <strong>{email}</strong>
      </p>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={handleChange}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p className="text-destructive text-center text-sm">{error}</p>
      )}

      {isLoading && (
        <p className="text-muted-foreground text-center text-sm">Verifying...</p>
      )}

      <Button
        variant="ghost"
        onClick={handleResend}
        disabled={isResending}
        className="w-full"
      >
        {isResending ? "Sending..." : "Resend code"}
      </Button>
    </div>
  )
}
