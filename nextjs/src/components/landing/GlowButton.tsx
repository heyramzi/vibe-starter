'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlowButtonProps {
  href: string
  children: React.ReactNode
  size?: 'sm' | 'lg'
  className?: string
}

export function GlowButton({
  href,
  children,
  size = 'lg',
  className,
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    let angle = 0
    let animationId: number
    let isVisible = true

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0 }
    )
    observer.observe(button)

    const rotate = () => {
      if (isVisible) {
        angle = (angle + 1) % 360
        button.style.setProperty('--glow-angle', `${angle}deg`)
      }
      animationId = requestAnimationFrame(rotate)
    }

    rotate()

    return () => {
      observer.disconnect()
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <Link
      ref={buttonRef}
      href={href}
      style={{ '--glow-angle': '0deg' } as React.CSSProperties}
      className={cn(
        'btn-glow group relative inline-flex cursor-pointer items-center justify-center overflow-hidden',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-[0_25px_50px_-12px_rgba(123,104,238,0.5)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--upsys-purple)] focus-visible:ring-offset-2',
        size === 'sm' ? 'rounded-xl px-6 py-2 text-sm' : 'rounded-2xl px-12 py-5 text-lg font-bold',
        className
      )}
    >
      {/* Growing dot effect */}
      <div
        className={cn(
          'absolute top-1/2 z-[2] -translate-y-1/2',
          size === 'sm' ? 'left-4' : 'left-6'
        )}
      >
        <div className="h-2 w-2 origin-center rounded-full bg-[var(--upsys-magenta)] transition-all duration-500 ease-out group-hover:scale-[80]" />
      </div>

      {/* Default content */}
      <div className="relative z-10 flex items-center justify-center gap-2 transition-all duration-300 group-hover:-translate-x-8 group-hover:opacity-0">
        <div className="h-2 w-2" />
        <span>{children}</span>
      </div>

      {/* Hover content */}
      <div className="absolute inset-0 z-20 flex translate-x-8 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight className="h-4 w-4 stroke-2" />
      </div>
    </Link>
  )
}
