# Japanese Coding Principles

**Philosophy**: 簡潔 (kanketsu) • 純粋 (junsui) • 効率 (kōritsu)

The simplest solution that works is the correct solution.

---

## Core Principles

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
- Single-line comments for the "why"

### 5. 断捨離 (Danshari - Marie Kondo)
- Delete unused code immediately
- Fix root causes, not symptoms
- Clean as you go
- Every line must justify its existence

### 6. 無借金経営 (Mushakkin Keiei - Zero Technical Debt)
- NEVER create backward-compatible layers
- No legacy code tolerated
- Update schemas directly
- Breaking changes are fine - update all references immediately
- Zero tolerance for "TODO: remove this later"

---

**Remember**: 完璧は善の敵 - "Perfect is the enemy of good"
