import Link from "next/link"
import { AuthCard, AuthDivider, GoogleButton, OTPForm } from "@/components/auth"

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your account">
      <div className="grid gap-4">
        <OTPForm mode="login" />
        <AuthDivider />
        <GoogleButton />
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
