# Types Directory

## Purpose

This directory contains **domain types** that are shared across 2+ different `src/lib/` folders.

## Organization Rules

| Category | Location | When to Use |
|----------|----------|-------------|
| **Domain types** | `src/types/` | Shared across 2+ different lib folders |
| **Library-internal types** | `src/lib/{lib}/types.ts` | Only used within one lib module |
| **Single-file types** | Inline in file | Props interfaces, local state types |

## Decision Rule

If a type is imported from 2+ different `src/lib/` folders, it belongs here. Otherwise, colocate it with the library.

## Examples

```typescript
// Domain types (shared) - import from @/types
import type { User, Project } from '@/types/user'

// Library types (internal) - import from lib barrel
import type { SupabaseClient } from '@/lib/supabase'
```
