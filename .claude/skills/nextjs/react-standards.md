---
name: react-standards
description: Use when writing or reviewing React/Next.js code. Ensures modern React 19 patterns, Next.js App Router conventions, and best practices.
---

# React & Next.js Standards

**Philosophy**: Server-first, minimal client JavaScript, type-safe components.

---

## When to Use

**Trigger conditions:**
- Writing new React/Next.js components
- Reviewing React code
- Converting class components to hooks
- Debugging React state/effects issues

---

## Core Patterns

### Server vs Client Components

```tsx
// Server Component (default in App Router)
// No 'use client' directive - runs on server only
export default async function Page() {
  const data = await fetchData() // Can use async/await directly
  return <div>{data.title}</div>
}

// Client Component (when you need interactivity)
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Rules:**
- Default to Server Components (no directive)
- Add `'use client'` only when needed (hooks, event handlers, browser APIs)
- Keep client components small and leaf-level
- Pass server data down as props

### Component Structure

```tsx
'use client'

// =============================================================================
// IMPORTS
// =============================================================================

// External libraries
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Hooks
import { useUser } from '@/hooks/use-user'

// Services
import { UserService } from '@/lib/services/user'

// Types
import type { User } from '@/types/user'

// =============================================================================
// TYPES
// =============================================================================

interface UserCardProps {
  userId: string
  onUpdate?: (user: User) => void
  className?: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export function UserCard({ userId, onUpdate, className }: UserCardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    UserService.get(userId)
      .then(setUser)
      .finally(() => setIsLoading(false))
  }, [userId])

  const handleUpdate = useCallback(() => {
    if (user) onUpdate?.(user)
  }, [user, onUpdate])

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not found</div>

  return (
    <Card className={className}>
      <h2>{user.name}</h2>
      <Button onClick={handleUpdate}>Update</Button>
    </Card>
  )
}
```

---

## Hooks Best Practices

### useState

```tsx
// Simple state
const [count, setCount] = useState(0)

// Object state - prefer multiple useState for unrelated values
const [name, setName] = useState('')
const [email, setEmail] = useState('')

// Complex related state - use single useState with object
const [form, setForm] = useState({ name: '', email: '', phone: '' })

// Functional updates for state based on previous value
setCount(prev => prev + 1)
```

### useEffect

```tsx
// Data fetching
useEffect(() => {
  let cancelled = false

  async function fetchData() {
    const data = await UserService.get(userId)
    if (!cancelled) setUser(data)
  }

  fetchData()

  return () => { cancelled = true } // Cleanup
}, [userId])

// Event listeners
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [onClose])
```

**Rules:**
- Always include cleanup for subscriptions/listeners
- Use dependency array correctly (ESLint will warn)
- Don't use useEffect for derived state (use useMemo)
- Don't use useEffect for event handlers (use callbacks)

### useCallback & useMemo

```tsx
// useCallback - memoize functions passed to children
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// useMemo - memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name))
}, [items])
```

**Rules:**
- Don't overuse - only when there's actual performance benefit
- Use for: expensive calculations, referential equality for deps
- Skip for: simple values, functions not passed to memoized children

---

## Next.js App Router Patterns

### Page Components

```tsx
// app/dashboard/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const data = await supabase.from('projects').select('*')

  return <DashboardClient initialData={data.data} />
}
```

### Layout Components

```tsx
// app/dashboard/layout.tsx
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### Loading & Error States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}

// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Anti-Patterns to Avoid

### ❌ Common Mistakes

```tsx
// WRONG: Using useEffect for derived state
const [items, setItems] = useState([])
const [total, setTotal] = useState(0)

useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0))
}, [items])

// CORRECT: Use useMemo
const total = useMemo(() =>
  items.reduce((sum, i) => sum + i.price, 0),
  [items]
)

// WRONG: Missing dependency in useEffect
useEffect(() => {
  fetchUser(userId) // userId not in deps!
}, [])

// CORRECT: Include all dependencies
useEffect(() => {
  fetchUser(userId)
}, [userId])

// WRONG: Creating objects/functions in render
<Button style={{ color: 'red' }}> // New object every render
<Button onClick={() => handleClick(id)}> // New function every render

// CORRECT: Memoize or define outside
const style = useMemo(() => ({ color: 'red' }), [])
const handleItemClick = useCallback(() => handleClick(id), [id])

// WRONG: Fetching in client component when server component works
'use client'
export function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetch('/api/users').then(...) }, [])
  // ...
}

// CORRECT: Fetch in server component
export default async function UserList() {
  const users = await db.users.findMany()
  return <UserListClient users={users} />
}
```

### ❌ Don't Do These

| Pattern | Problem | Fix |
|---------|---------|-----|
| `useEffect` for derived state | Extra render, complexity | Use `useMemo` |
| Empty dependency array with deps | Stale closures, bugs | Add all dependencies |
| `'use client'` on everything | Larger bundle, slower | Default to Server Components |
| Inline objects/functions | Unnecessary re-renders | Memoize or extract |
| State for URL params | Out of sync with URL | Use `useSearchParams` |
| `any` type for props | No type safety | Define proper interfaces |

---

## TypeScript Patterns

### Props Interface

```tsx
// Always define Props interface
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className,
}: ButtonProps) {
  // ...
}
```

### Event Types

```tsx
// Form events
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
}

// Input events
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value)
}

// Click events
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  // ...
}

// Keyboard events
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') submit()
}
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

---

## Verification Checklist

When reviewing React/Next.js code:

- [ ] Server Components used by default (no unnecessary `'use client'`)
- [ ] Props have TypeScript interface
- [ ] `useEffect` has correct dependencies
- [ ] `useEffect` has cleanup when needed
- [ ] No derived state in `useEffect` (use `useMemo`)
- [ ] Callbacks memoized when passed to memoized children
- [ ] No inline objects/functions causing re-renders
- [ ] Loading and error states handled
- [ ] Async operations have proper error handling

---

## Quick Reference

### File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group for auth pages
│   ├── dashboard/         # Dashboard routes
│   │   ├── page.tsx       # Server Component
│   │   ├── layout.tsx     # Layout
│   │   ├── loading.tsx    # Loading state
│   │   └── error.tsx      # Error boundary
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI (shadcn/ui)
│   └── features/          # Feature-specific components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities, services
└── types/                 # TypeScript types
```

### Import Aliases

```tsx
// Always use @/ alias
import { Button } from '@/components/ui/button'
import { UserService } from '@/lib/services/user'
import type { User } from '@/types/user'

// Never use relative paths beyond one level
import { helper } from './helper' // OK - same directory
import { util } from '../utils'   // Avoid - use @/lib/utils
```

---

**Remember**: Server-first, type-safe, minimal client JavaScript.

シンプルに保て - "Keep it simple"
