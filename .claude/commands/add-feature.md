# Add Feature: $ARGUMENTS

Creates a new feature specification directory with scaffolding files.

## Usage

`/add-feature {feature-name}`

## What It Does

Creates `.claude/features/{feature-name}/` with:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - System design and architecture
- `tasks.md` - Implementation task list

## Example

`/add-feature user-authentication`

Creates:
```
.claude/features/user-authentication/
├── requirements.md
├── design.md
└── tasks.md
```

---

## Template: requirements.md

```markdown
# {Feature Name} Requirements

## Overview
Brief description of the feature and its purpose.

## User Stories

### Story 1: [Title]
**As a** [user type]
**I want** [capability]
**So that** [benefit]

#### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Non-Functional Requirements
- Performance: [Requirements]
- Security: [Requirements]
- Accessibility: [Requirements]

## Out of Scope
- [What's explicitly NOT included]
```

---

## Template: design.md

```markdown
# {Feature Name} Design

## Architecture

### Component Structure
[Diagram or description of components]

### Data Model
[Database tables/types affected]

### API Endpoints
[Routes and their purpose]

## Technical Decisions
[Key decisions and rationale]

## Dependencies
[External services or libraries needed]

## Security Considerations
[Auth, RLS, data protection]
```

---

## Template: tasks.md

```markdown
# {Feature Name} Tasks

## Phase 1: Foundation
- [ ] Task 1
- [ ] Task 2

## Phase 2: Core Implementation
- [ ] Task 3
- [ ] Task 4

## Phase 3: Polish
- [ ] Task 5
- [ ] Task 6

## Verification
- [ ] All tests pass
- [ ] Type check passes
- [ ] Manual testing complete
```

---

## Instructions

1. Create the feature directory at `.claude/features/{feature-name}/`
2. Create all three template files
3. Replace `{Feature Name}` with the actual feature name (Title Case)
4. Present the created structure to the user
5. Ask if they want to start filling in the requirements

## Naming Convention

- Use kebab-case for directory names: `user-authentication`, `stripe-billing`
- Use Title Case in document headings: "User Authentication", "Stripe Billing"
