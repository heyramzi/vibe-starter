"use client"

import { cn } from "@/lib/utils"

interface AuthDividerProps {
  className?: string
}

export function AuthDivider({ className }: AuthDividerProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background text-muted-foreground px-2">or</span>
      </div>
    </div>
  )
}
