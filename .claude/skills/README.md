# Standard Skills

Skills contain detailed methodology, patterns, and checklists. Commands invoke skills; skills provide the "how".

## Structure

```
skills/
├── code-commenting.md      # Common - section comments, WHY not WHAT
├── code-refactoring.md     # Common - cleanup including legacy patterns
├── ui-audit.md             # Common - with framework sections
├── ux-design.md            # Common - with framework sections
├── file-reorganizer.md     # Common - with framework paths table
├── unit-testing.md         # Common - Vitest core + framework sections
├── sveltekit/
│   └── svelte-standards.md # Svelte 5 runes, migration patterns
└── nextjs/
    └── react-standards.md  # React 19, App Router, server components
```

## Standard Skills

### Common Trunk (6 skills)

| Skill | Purpose | Framework Sections |
|-------|---------|-------------------|
| `code-commenting.md` | Section comments, WHY not WHAT | Yes (separator lengths) |
| `code-refactoring.md` | Danshari cleanup + legacy patterns | Minimal |
| `ui-audit.md` | Design system audit | Yes (component patterns) |
| `ux-design.md` | UX design methodology | Yes (route structure) |
| `file-reorganizer.md` | Codebase organization | Yes (paths table) |
| `unit-testing.md` | Vitest testing patterns | Yes (rendering libs) |

### Framework-Specific (1 skill per framework)

| Skill | Purpose |
|-------|---------|
| `svelte-standards.md` | Svelte 5 runes, $props/$state/$derived, migration from Svelte 4 |
| `react-standards.md` | React 19, hooks, server/client components, App Router |

## For Individual Projects

When copying to a real project:
1. Copy all 6 common trunk skills to `skills/`
2. Copy ONLY the relevant framework standards file (flattened)

Example for a SvelteKit project:
```
skills/
├── code-commenting.md
├── code-refactoring.md
├── ui-audit.md
├── ux-design.md
├── file-reorganizer.md
├── unit-testing.md
└── svelte-standards.md    # From sveltekit/
```

## Skill Format

Skills should include:
- YAML frontmatter with name and description
- "When to Use" section with trigger conditions
- "Framework-Specific" sections where applicable
- Execution flow with phases
- Quick reference tables
- Verification checklist
- Anti-patterns to avoid
