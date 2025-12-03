# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Name - AI Agent Instructions

**Philosophy**: 簡潔 (kanketsu - simplicity) • 純粋 (junsui - purity) • 効率 (kōritsu - efficiency)

Follow Japanese minimalism: the simplest solution that works is the correct solution.

## Documentation Structure

**Key Standards**:
- **Features**: Single .md per feature (spec + tasks) in `.claude/features/`
- **Dependencies**: One folder per dependency in `.claude/deps/`
- **Tests**: Colocated with source files (`.test.ts` next to source)
- **Src Folders**: Each folder in `src/` has a `readme.md`
- **Steering**: product.md, tech.md, structure.md in `.claude/steering/`

**Navigation**:
- Feature specifications: `.claude/features/`
- Dependency documentation: `.claude/deps/`
- Architecture context: `.claude/steering/`
- **Common mistakes to avoid**: `.claude/common-mistakes.md` ← **READ THIS FIRST**

## Current Tech Stack

<!-- Update this section based on your chosen variant (Next.js or SvelteKit) -->

**Core**: [Framework] + TypeScript 5.x + TailwindCSS 4.x
**UI Components**: [Component library]
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth
**Package Manager**: PNPM 10.x
**Node**: >= 22.0.0

## Project Structure

```
project-name/
├── src/
│   ├── app/                    # Framework-specific routing
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── [feature]/          # Feature-specific components
│   ├── lib/                    # ALL shared utilities (single location)
│   │   ├── supabase/           # Supabase clients & auth
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── index.ts        # Barrel exports
│   │   ├── schemas/            # Zod validation schemas
│   │   └── utils.ts            # General utilities (cn)
│   ├── hooks/                  # React/Svelte hooks
│   └── types/                  # TypeScript definitions
├── .claude/                    # AI agent configuration
│   ├── CLAUDE.md               # This file
│   ├── steering/               # Project context docs
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── features/               # Feature specifications
│   ├── deps/                   # Dependency documentation
│   ├── commands/               # Slash commands
│   └── common-mistakes.md      # Patterns to avoid
├── .env.local                  # Environment variables (not committed)
└── [Config Files]              # TypeScript, ESLint, Prettier, etc.
```

## Japanese Coding Principles

### 1. 簡潔 (Kanketsu - Simplicity)

- One file, one purpose
- Functions under 10 lines when possible
- No unnecessary abstractions
- Direct solutions over clever ones

### 2. 純粋 (Junsui - Purity)

- Pure functions with no side effects
- Immutable data patterns
- Clear input/output contracts
- No hidden dependencies

### 3. 効率 (Kōritsu - Efficiency)

- Minimal code that achieves the goal
- No premature optimization
- Use existing patterns before creating new ones
- Delete unused code immediately

### 4. 明確 (Meikaku - Clarity)

- Self-documenting code
- Descriptive variable names
- Obvious flow and structure
- **Single-line comments for every key step** - explain the "why" behind each important operation

### 5. 断捨離 (Danshari - Marie Kondo)

- **Delete unused code immediately** - no orphaned variables, imports, or functions
- **Fix root causes, not symptoms** - update interfaces/types instead of using underscore workarounds
- **Clean as you go** - leave code cleaner than you found it
- **Question: "Does this spark joy (serve a purpose)?"** - if no, delete it
- Every line of code must justify its existence

### 6. 無借金経営 (Mushakkin Keiei - Zero Technical Debt)

- **NEVER create backward-compatible layers** - update the source, delete the old code
- **No legacy code tolerated** - if it's deprecated, delete it completely
- **Update schemas directly** - no parallel validation schemas for "compatibility"
- **Breaking changes are fine** - update all references immediately
- **Migration over duplication** - write a migration script if needed, never maintain two versions
- **Zero tolerance for "TODO: remove this later"** - either do it now or don't write it

## Development Rules

### Before Coding

1. **Read `.claude/common-mistakes.md`** - avoid repeating known mistakes
2. Read existing code to understand patterns
3. Use existing utilities before creating new ones
4. Check package.json for available dependencies
5. Follow established file naming conventions
6. **Check `src/lib/` structure** before creating new folders

### During Coding

1. **Never over-engineer** - the simplest working solution wins
2. **Match existing patterns** - consistency over innovation
3. **Use existing libraries** - check imports in similar files
4. **One change at a time** - minimal focused modifications
5. **Refactor proactively** - when fixing issues, simplify and eliminate spaghetti code

### After Coding

1. Remove any unused imports or code
2. Ensure TypeScript compliance
3. Test the specific change made
4. Update only what changed

## Common Commands

**CRITICAL**: **NEVER run `pnpm dev` or `pnpm build`** - These commands should only be run by the user, not by Claude. Use `pnpm exec tsc --noEmit` for type checking instead.

```bash
# Testing
pnpm test                  # Run tests in watch mode
pnpm test:run              # Run tests once (CI mode)

# Code quality
pnpm lint                  # ESLint checking
pnpm lint:fix              # Auto-fix lint issues
pnpm format                # Format with Prettier
pnpm format:check          # Check formatting
pnpm exec tsc --noEmit     # TypeScript type checking (use this instead of build)
```

## Architecture Patterns

### Const Service Pattern (核心パターン)

**Always organize related functions into const service objects.** This is the core pattern for all library code.

```typescript
// ❌ Bad: Individual exports require many imports
export function getUser() { ... }
export function updateUser() { ... }
export function deleteUser() { ... }

// ✅ Good: Const service wrapper - single import, discoverability via IDE
export const UserService = {
  get(id: string) { ... },
  update(id: string, data: UserUpdate) { ... },
  delete(id: string) { ... },
}

// Usage is clean and discoverable
import { UserService } from '@/lib/user'
UserService.get(id)
UserService.update(id, data)
```

**Benefits**:
- Minimizes imports (one import, all methods)
- IDE autocomplete shows all available methods
- Clear service boundaries
- Self-documenting code structure

**File Structure for Services**:
```
src/lib/{domain}/
├── {domain}-service.ts    # Main service const with all methods
├── types.ts               # Type definitions (if needed)
└── index.ts               # Barrel export
```

**Real Example** (API Service Pattern):
```typescript
// Internal helper (not exported)
const request = async <T>(endpoint: string, method = 'GET', body?: object): Promise<T> => {
  const token = await getAccessToken()
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return response.json()
}

// Exported const service
export const ApiService = {
  // Grouped by domain
  getWorkspaces: () => request<WorkspacesResponse>('/workspaces'),
  getSpaces: (teamId: string) => request<SpacesResponse>(`/team/${teamId}/spaces`),

  // User operations
  getUser: () => request<UserResponse>('/user'),

  // Task operations
  createTask: (listId: string, data: CreateTaskParams) =>
    request<Task>(`/list/${listId}/task`, 'POST', data),
  getTasks: (listId: string) => request<TasksResponse>(`/list/${listId}/task`),
}
```

### Data Flow

1. **Server-Side Rendering (SSR)**
   - Pages fetch data in Server Components using Supabase server client
   - No loading states needed - framework handles streaming

2. **Client-Side Mutations**
   - Forms submit to API routes via fetch
   - API routes validate with Zod, interact with Supabase, return JSON
   - Client components handle loading states and errors

3. **Authentication Check Pattern**
   ```typescript
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login') // or return 401
   ```

### Supabase Client Usage

- **Server Components & API Routes**: `import { createClient } from '@/lib/supabase/server'` (async)
- **Client Components**: `import { createClient } from '@/lib/supabase/client'` (sync)
- Both use `@supabase/ssr` for proper session handling
- Server client requires `await createClient()`

## File Conventions

### Types Organization

| Category | Location | When to Use |
|----------|----------|-------------|
| **Domain types** | `src/types/` | Shared across 2+ different lib folders |
| **Library-internal types** | `src/lib/{lib}/types.ts` | Only used within one lib module |
| **Single-file types** | Inline in file | Props interfaces, local state types |

### Styling

- TailwindCSS utilities only
- Use CSS variables defined in globals.css
- Responsive design with mobile-first approach
- Dark mode support via `dark:` classes

## Critical Guidelines

**See `.claude/common-mistakes.md` for detailed patterns and anti-patterns.**

### Quick Reference

**Never**:
- Run `pnpm dev` or `pnpm build` (user only)
- Create `src/utils/`, `src/services/`, `src/config/`, `src/helpers/` (use `src/lib/`)
- Create backward-compatible layers (update source, delete old)
- Add features not explicitly requested

**Always**:
- Read `.claude/common-mistakes.md` before coding
- Check `src/lib/` structure before creating folders
- Delete old code immediately when refactoring
- Use the simplest working solution
- Follow existing code patterns exactly

**When Stuck**:
- Look at similar existing files
- Check `.claude/common-mistakes.md` for known issues
- Use existing utilities before creating new ones
- Ask for clarification rather than guess

## Environment Setup

Required environment variables (see `.env.example`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # or PUBLIC_SUPABASE_URL for SvelteKit
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # or PUBLIC_SUPABASE_ANON_KEY for SvelteKit
SUPABASE_SECRET_KEY=                # Service role key (server-side only)

# App
NEXT_PUBLIC_APP_URL=                # or PUBLIC_APP_URL for SvelteKit
```

**Critical**: Never commit `.env.local` or expose secret keys in client code

## Success Metrics

**Code Quality**: Simple, readable, follows existing patterns
**Functionality**: Works as requested, nothing more
**Maintenance**: Easy to understand and modify later
**Performance**: Fast, efficient, no unnecessary complexity
**Security**: Proper auth checks, no data leaks

---

**Remember**: 完璧は善の敵 (Kanpeki wa zen no teki) - "Perfect is the enemy of good"

The best code is the simplest code that works correctly.
