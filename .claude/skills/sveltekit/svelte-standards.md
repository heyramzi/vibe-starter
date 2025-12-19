---
name: svelte-standards
description: Use when writing or reviewing Svelte code. Ensures Svelte 5 runes, component patterns, and best practices are followed consistently.
---

# Svelte 5 Standards

**Philosophy**: Svelte 5 runes provide cleaner, more explicit reactivity. Always use modern patterns.

---

## When to Use

**Trigger conditions:**
- Writing new Svelte components
- Reviewing Svelte code
- Migrating Svelte 4 → 5
- Debugging reactivity issues

---

## Core Runes

### $props - Component Props

```svelte
<script lang="ts">
// Always use interface for type safety
interface Props {
  title: string
  count?: number
  items: string[]
  onUpdate?: (value: number) => void
}

// Destructure with defaults
let { title, count = 0, items, onUpdate }: Props = $props()
</script>
```

**Rules:**
- Always define `interface Props`
- Use `let { ... } = $props()` (never `export let`)
- Provide defaults via destructuring
- Never mutate props directly

### $state - Reactive State

```svelte
<script lang="ts">
// Simple state
let count = $state(0)

// Object state (deep reactive)
let user = $state({ name: '', email: '' })

// Array state (deep reactive)
let todos = $state<Todo[]>([])

// Shallow state (for large objects)
let largeData = $state.raw(initialData)
</script>
```

**Rules:**
- Use `$state()` for all reactive variables
- Objects and arrays are deeply reactive by default
- Use `$state.raw()` for performance with large non-mutated data
- Don't destructure reactive proxies (breaks reactivity)

### $derived - Computed Values

```svelte
<script lang="ts">
let items = $state<Item[]>([])

// Simple derived
const total = $derived(items.length)

// Complex derived with $derived.by()
const summary = $derived.by(() => {
  const active = items.filter(i => i.active)
  return {
    total: items.length,
    active: active.length,
    inactive: items.length - active.length,
  }
})
</script>
```

**Rules:**
- Use `$derived()` for simple expressions
- Use `$derived.by()` for multi-line logic
- Keep derived values pure (no side effects)
- Never use `$effect` to sync state (use `$derived` instead)

### $effect - Side Effects

```svelte
<script lang="ts">
let userId = $state('')

// Basic effect
$effect(() => {
  console.log('User changed:', userId)
})

// Effect with cleanup
$effect(() => {
  const interval = setInterval(() => tick(), 1000)
  return () => clearInterval(interval)
})
</script>
```

**Rules:**
- Use ONLY for side effects (logging, DOM, external APIs)
- NOT for state synchronization (use `$derived`)
- Always return cleanup function when needed
- Dependencies are tracked automatically

### $bindable - Two-Way Binding

```svelte
<!-- Child.svelte -->
<script lang="ts">
let { value = $bindable('') } = $props()
</script>

<input bind:value />

<!-- Parent.svelte -->
<script lang="ts">
let text = $state('')
</script>

<Child bind:value={text} />
```

**Rules:**
- Use sparingly - prefer one-way data flow
- Mark props as `$bindable()` explicitly
- Only for form controls and similar patterns

---

## Component Patterns

### Children & Snippets

```svelte
<!-- Wrapper with children -->
<script lang="ts">
let { children } = $props()
</script>

<div class="wrapper">
  {@render children?.()}
</div>

<!-- Named snippets -->
<script lang="ts">
interface Props {
  header?: Snippet
  footer?: Snippet
  children?: Snippet
}

let { header, footer, children }: Props = $props()
</script>

<div>
  {@render header?.()}
  <main>{@render children?.()}</main>
  {@render footer?.()}
</div>
```

**Rules:**
- Use `{@render children?.()}` instead of `<slot />`
- Use optional chaining (`?.()`) for optional snippets
- Import `Snippet` type from 'svelte' for typing

### Event Handlers

```svelte
<script lang="ts">
let count = $state(0)

function handleClick() {
  count++
}
</script>

<!-- Modern syntax (no colon) -->
<button onclick={handleClick}>Click</button>
<button onclick={() => count++}>Inline</button>

<!-- With event object -->
<input oninput={(e) => console.log(e.currentTarget.value)} />
```

**Rules:**
- Use `onclick` not `on:click`
- Use arrow functions for inline handlers
- Use `e.currentTarget` for typed event targets

### Class and Style Bindings

```svelte
<script lang="ts">
let { class: className = '' } = $props()
let isActive = $state(false)
</script>

<!-- Class binding -->
<div class={cn('base-class', isActive && 'active', className)}>

<!-- Conditional classes -->
<div class:active={isActive} class:disabled={!isActive}>

<!-- Style binding -->
<div style:color="red" style:--custom-var={value}>
```

---

## Anti-Patterns to Avoid

### ❌ Svelte 4 Patterns (Never Use)

```svelte
<!-- WRONG: Old props syntax -->
<script>
  export let count = 0
</script>

<!-- WRONG: Old reactive declarations -->
<script>
  $: doubled = count * 2
  $: if (count > 10) console.log('High')
</script>

<!-- WRONG: Old event syntax -->
<button on:click={handler}>Click</button>

<!-- WRONG: Old slot syntax -->
<slot />
<slot name="header" />
```

### ✅ Svelte 5 Equivalents

```svelte
<!-- CORRECT: New props syntax -->
<script lang="ts">
  let { count = 0 } = $props()
</script>

<!-- CORRECT: New reactive declarations -->
<script lang="ts">
  const doubled = $derived(count * 2)
  $effect(() => {
    if (count > 10) console.log('High')
  })
</script>

<!-- CORRECT: New event syntax -->
<button onclick={handler}>Click</button>

<!-- CORRECT: New render syntax -->
{@render children?.()}
{@render header?.()}
```

### ❌ Common Mistakes

```svelte
<!-- WRONG: Using $effect for derived state -->
<script>
  let count = $state(0)
  let doubled = $state(0)
  $effect(() => { doubled = count * 2 }) // Anti-pattern!
</script>

<!-- CORRECT: Use $derived -->
<script>
  let count = $state(0)
  const doubled = $derived(count * 2)
</script>

<!-- WRONG: Destructuring reactive proxy -->
<script>
  let user = $state({ name: 'John', age: 30 })
  let { name, age } = user // Breaks reactivity!
</script>

<!-- CORRECT: Access properties directly -->
<script>
  let user = $state({ name: 'John', age: 30 })
  // Use user.name and user.age directly
</script>

<!-- WRONG: Self-closing non-void elements -->
<div class="container" />

<!-- CORRECT: Proper closing -->
<div class="container"></div>
```

---

## Migration Checklist

When updating Svelte 4 code:

- [ ] Replace `export let` → `let { ... } = $props()`
- [ ] Replace `$:` reactive → `$derived()` or `$derived.by()`
- [ ] Replace `$:` side effects → `$effect()`
- [ ] Replace `on:event` → `onevent`
- [ ] Replace `<slot>` → `{@render children?.()}`
- [ ] Replace `<svelte:component>` → direct component usage
- [ ] Fix self-closing non-void HTML elements
- [ ] Update `$app/stores` → `$app/state` (SvelteKit)

---

## TypeScript Patterns

### Typed Props

```svelte
<script lang="ts">
import type { Snippet } from 'svelte'
import type { HTMLAttributes } from 'svelte/elements'

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string
  count?: number
  children?: Snippet
  header?: Snippet<[{ title: string }]>
}

let { title, count = 0, children, header, ...restProps }: Props = $props()
</script>

<div {...restProps}>
  {@render header?.({ title })}
  {@render children?.()}
</div>
```

### Typed Events

```svelte
<script lang="ts">
interface Props {
  onSelect?: (item: Item) => void
  onChange?: (value: string) => void
}

let { onSelect, onChange }: Props = $props()

function handleSelect(item: Item) {
  onSelect?.(item)
}
</script>
```

---

## Performance Tips

1. **Use `$state.raw()`** for large objects that won't be mutated
2. **Avoid unnecessary effects** - prefer `$derived`
3. **Use `{#key}` blocks** to force re-renders when needed
4. **Memoize expensive computations** in `$derived.by()`

---

## Verification Checklist

When reviewing Svelte code:

- [ ] No `export let` (use `$props()`)
- [ ] No `$:` reactive declarations (use `$derived`)
- [ ] No `on:event` syntax (use `onevent`)
- [ ] No `<slot>` (use `{@render}`)
- [ ] Props have TypeScript interface
- [ ] Effects only for side effects, not state sync
- [ ] No destructuring of reactive proxies
- [ ] Non-void elements properly closed

---

**Remember**: Svelte 5 is cleaner and more explicit. Embrace the runes.

明示は暗黙に勝る - "Explicit is better than implicit"
