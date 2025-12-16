"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthCard, OTPVerify } from "@/components/auth"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const next = searchParams.get("next") ?? "/dashboard"

  if (!email) {
    return (
      <AuthCard title="Invalid link" description="No email provided">
        <Link
          href="/login"
          className="text-primary block text-center text-sm underline-offset-4 hover:underline"
        >
          Back to login
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Check your email" description="We sent you a verification code">
      <OTPVerify email={email} redirectTo={next} />
    </AuthCard>
  )
}
