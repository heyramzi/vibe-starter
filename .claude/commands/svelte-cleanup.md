# /svelte-cleanup

Reorganize Svelte component files to follow the standard section ordering and comment format.

## Instructions

You are reorganizing Svelte files to follow the project's code-commenting standards.

### Section Order (MANDATORY)

All `.svelte` files must have sections in this exact order:

```
1. IMPORTS
2. TYPES (if any)
3. PROPS (if any)
4. STATE (if any)
5. DERIVED (if any)
6. CONSTANTS (if any)
7. FUNCTIONS (if any)
8. EFFECTS (if any)
```

### Separator Format

Use exactly 25 `=` characters for script sections:
```
// =========================
// SECTION NAME
// =========================
```

Use exactly 27 `=` characters for HTML comments:
```
<!-- =========================== -->
<!-- MARKUP -->
<!-- =========================== -->
```

### Process

1. **Find target files**:
   - If a file/folder is specified, process that
   - Otherwise, ask user which files to clean up

2. **For each `.svelte` file**:
   - Read the current content
   - Identify all code blocks and their types (imports, props, state, etc.)
   - Reorganize into correct section order
   - Add/fix section comment separators
   - Remove empty sections
   - Preserve all functionality

3. **Section Detection Rules**:
   - IMPORTS: `import` statements
   - TYPES: `type` or `interface` declarations
   - PROPS: `$props()` destructuring and Props interface
   - STATE: `$state()` declarations
   - DERIVED: `$derived()` declarations
   - CONSTANTS: `const` declarations that aren't derived/state
   - FUNCTIONS: Function declarations and arrow functions
   - EFFECTS: `$effect()` blocks

4. **Skip files**:
   - Files under 30 lines (unless they already have sections)
   - Files in `/components/ui/` (shadcn primitives)
   - Type-only files

### Example Transformation

**Before:**
```svelte
<script lang="ts">
let count = $state(0)
import { Button } from '$lib/components/ui/button'
const doubled = $derived(count * 2)
function increment() { count++ }
interface Props { title: string }
let { title }: Props = $props()
</script>
```

**After:**
```svelte
<script lang="ts">
// =========================
// IMPORTS
// =========================
import { Button } from '$lib/components/ui/button'

// =========================
// TYPES
// =========================
interface Props { title: string }

// =========================
// PROPS
// =========================
let { title }: Props = $props()

// =========================
// STATE
// =========================
let count = $state(0)

// =========================
// DERIVED
// =========================
const doubled = $derived(count * 2)

// =========================
// FUNCTIONS
// =========================
function increment() { count++ }
</script>
```

### Verification

After cleanup, verify:
- [ ] Sections are in correct order
- [ ] Separators use exactly 25 `=` characters
- [ ] No empty sections remain
- [ ] All imports are grouped at top
- [ ] Props interface is with PROPS section (not TYPES)
- [ ] File still compiles without errors
