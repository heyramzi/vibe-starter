import Link from "next/link"
import { AuthCard, OTPForm } from "@/components/auth"

export default function SignupPage() {
  return (
    <AuthCard title="Create an account" description="Get started with your free account">
      <div className="grid gap-4">
        <OTPForm mode="signup" />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
