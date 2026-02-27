# Project Structure & Organization Patterns

## Directory Structure

### Root Level Organization

```
project-name/
├── .claude/                    # AI agent documentation system
│   ├── CLAUDE.md              # AI agent instructions
│   ├── context/               # Project context documents
│   │   ├── product.md         # Product vision and goals
│   │   ├── tech.md            # Technical architecture
│   │   └── structure.md       # This file
│   ├── features/              # Feature specifications
│   ├── deps/                  # Dependency documentation
│   ├── commands/              # Slash command definitions
│   └── common-mistakes.md     # Anti-patterns to avoid
├── src/                        # Source code
├── tests/                      # E2E tests (if separated)
└── config files                # package.json, tsconfig, etc.
```

### Source Code Organization

```
src/
├── app/                        # Next.js app router / SvelteKit routes
│   ├── (auth)/                # Auth-related routes (login, register)
│   ├── dashboard/             # Protected dashboard routes
│   ├── api/                   # API routes
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/bits-ui)
│   ├── [feature]/             # Feature-specific components
│   └── shared/                # Cross-feature shared components
├── lib/                       # ALL shared utilities (single location)
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client (sync)
│   │   ├── server.ts          # Server client (async)
│   │   └── index.ts           # Barrel exports
│   ├── schemas/               # Zod validation schemas
│   └── utils.ts               # General utilities (cn helper)
├── hooks/                     # Custom hooks (useDebounce, etc.)
├── types/                     # TypeScript definitions
│   └── database.ts            # Supabase generated types
└── styles/                    # Global styles
    └── globals.css            # Tailwind + CSS variables
```

## File Organization Patterns

### Component Structure

```
ComponentName/
├── index.tsx                  # Main component export
├── ComponentName.tsx          # Component implementation (if complex)
├── ComponentName.test.ts      # Colocated tests
└── types.ts                   # Component-specific types (if needed)
```

Or for simple components:
```
ComponentName.tsx              # Everything in one file
ComponentName.test.ts          # Colocated test
```

### Library Module Structure

```
src/lib/{domain}/
├── types.ts                   # Type definitions, interfaces
├── client.ts                  # Core implementation
├── config.ts                  # Configuration constants
└── index.ts                   # Barrel exports
```

## Naming Conventions

### Files and Directories

- **Components**: PascalCase (`Button.tsx`, `UserProfile/`)
- **Utilities**: camelCase (`formatDate.ts`, `sendEmail.ts`)
- **Configuration**: kebab-case (`next.config.js`, `tailwind.config.ts`)
- **Types**: PascalCase with `.types.ts` or inline (`User.types.ts`)

### Code Elements

- **Variables**: camelCase (`userEmail`, `postContent`)
- **Functions**: camelCase (`getUserData`, `formatSlug`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_LOCALE`, `MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)
- **Enums**: PascalCase (`UserRole`, `PostStatus`)

### URL and Route Patterns

- **Pages**: kebab-case (`/about-us`, `/contact-form`)
- **API endpoints**: kebab-case (`/api/send-email`, `/api/user-data`)

## Import Order Convention

```typescript
// 1. Node modules
import React from 'react'
import { NextPage } from 'next'

// 2. Internal utilities and types
import { formatDate } from '@/lib/utils'
import type { User } from '@/types/user'

// 3. Components
import { Button } from '@/components/ui/button'
import { UserCard } from '@/components/user/user-card'

// 4. Local imports (relative - only within same module)
import './styles.css'
```

## Dependency Hierarchy

```
app/ (routes)
↓
components/ (UI components) ← hooks/ (business logic)
↓
lib/ (utilities, clients)
↓
types/ (type definitions)
```

### Circular Dependency Prevention

- **Utilities** should never import from components or hooks
- **Hooks** can import from utilities and types, but not from components
- **Components** can import from hooks, utilities, and types
- **Pages** can import from all layers

## Configuration Files

### Core Configuration

- **`package.json`**: Project metadata, dependencies, scripts
- **`tsconfig.json`**: TypeScript compiler configuration
- **`next.config.js`** / **`svelte.config.js`**: Framework configuration
- **`tailwind.config.ts`**: Tailwind CSS configuration

### Development Tools

- **`biome.json`**: Linting and formatting (Biome)
- **`vitest.config.ts`**: Unit testing
- **`.env.local`**: Environment variables (not committed)

## Path Alias Configuration

### TypeScript Path Mapping

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Usage

```typescript
// Good: Using path aliases
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types/user'

// Avoid: Deep relative paths
import { Button } from '../../../../components/ui/button'
```

---

_Update when structure changes_
