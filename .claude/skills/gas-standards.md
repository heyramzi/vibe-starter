---
name: gas-standards
description: Use when writing or reviewing Google Apps Script code. Ensures correct patterns for Apps Script's unique runtime environment.
---

# Google Apps Script Standards

**Philosophy**: Embrace Apps Script's constraints. Global scope is a feature, not a bug.

---

## When to Use

**Trigger conditions:**
- Writing new Google Apps Script code
- Reviewing Apps Script code
- Debugging Apps Script issues
- Building Google Workspace Add-ons

---

## Critical Understanding

### Apps Script Runtime

```
NOT Node.js!
├─ Code runs in Google's cloud environment
├─ All TypeScript imports removed during build
├─ Files concatenated into single global scope
├─ Execution contexts are isolated (UI, triggers, callbacks)
└─ No persistent state between executions
```

---

## Core Patterns

### Const Service Object Pattern (MANDATORY)

```typescript
// =============================================================================
// IMPORTS
// =============================================================================

// Types only - removed during build
import type { Task, SyncConfig } from '@/types'

// =============================================================================
// TYPES
// =============================================================================

interface ProcessResult {
  success: boolean
  count: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BATCH_SIZE = 100
const MAX_RETRIES = 3

// =============================================================================
// SERVICE
// =============================================================================

/**
 * Task synchronization service.
 * Uses const object pattern required by Apps Script.
 */
export const TaskSyncService = {
  /**
   * Process tasks from source.
   */
  processAll(config: SyncConfig): ProcessResult {
    const tasks = this.fetchTasks(config)
    return this.processBatch(tasks)
  },

  /**
   * Fetch tasks from API.
   */
  fetchTasks(config: SyncConfig): Task[] {
    const response = UrlFetchApp.fetch(config.apiUrl, {
      headers: { Authorization: `Bearer ${config.token}` },
    })
    return JSON.parse(response.getContentText())
  },

  /**
   * Process a batch of tasks.
   */
  processBatch(tasks: Task[]): ProcessResult {
    let count = 0
    for (const task of tasks) {
      if (this.processTask(task)) count++
    }
    return { success: true, count }
  },

  /**
   * Process single task.
   */
  processTask(task: Task): boolean {
    // Implementation
    return true
  },
}
```

**Why const objects?**
- Apps Script's global scope requires stable references
- Classes can cause issues with Google's execution model
- `this` binding is predictable within object methods
- Enables method chaining and self-reference

---

## Execution Context Isolation

### Understanding Contexts

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI Context    │     │ Trigger Context │     │ Callback Context│
│                 │     │                 │     │                 │
│ CardService     │     │ Time-driven     │     │ OAuth callback  │
│ onHomepage()    │     │ onEdit()        │     │ doGet()         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                    NO SHARED STATE!
```

### State Management

```typescript
// ❌ WRONG: Global variable state
let cachedData: Task[] = []  // Doesn't persist between executions!

// ✅ CORRECT: Use PropertiesService
export const StateService = {
  get(key: string): string | null {
    return PropertiesService.getUserProperties().getProperty(key)
  },

  set(key: string, value: string): void {
    PropertiesService.getUserProperties().setProperty(key, value)
  },

  getJSON<T>(key: string): T | null {
    const value = this.get(key)
    return value ? JSON.parse(value) : null
  },

  setJSON<T>(key: string, data: T): void {
    this.set(key, JSON.stringify(data))
  },
}
```

---

## Google Apps Script APIs

### SpreadsheetApp

```typescript
export const SheetService = {
  /**
   * Get or create sheet by name.
   */
  getOrCreateSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName(name)
    if (!sheet) {
      sheet = ss.insertSheet(name)
    }
    return sheet
  },

  /**
   * Write data to sheet efficiently.
   */
  writeData(sheet: GoogleAppsScript.Spreadsheet.Sheet, data: string[][]): void {
    if (data.length === 0) return

    const range = sheet.getRange(1, 1, data.length, data[0].length)
    range.setValues(data)
  },

  /**
   * Read all data from sheet.
   */
  readData(sheet: GoogleAppsScript.Spreadsheet.Sheet): string[][] {
    const lastRow = sheet.getLastRow()
    const lastCol = sheet.getLastColumn()

    if (lastRow === 0 || lastCol === 0) return []

    return sheet.getRange(1, 1, lastRow, lastCol).getValues() as string[][]
  },
}
```

### UrlFetchApp

```typescript
export const ApiService = {
  /**
   * Make authenticated API request.
   */
  fetch<T>(url: string, token: string, options: Partial<GoogleAppsScript.URL_Fetch.URLFetchRequestOptions> = {}): T {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      muteHttpExceptions: true,
      ...options,
    })

    const code = response.getResponseCode()
    const text = response.getContentText()

    if (code >= 400) {
      throw new Error(`API error ${code}: ${text}`)
    }

    return JSON.parse(text)
  },

  /**
   * POST with JSON body.
   */
  post<T>(url: string, token: string, body: unknown): T {
    return this.fetch<T>(url, token, {
      method: 'post',
      payload: JSON.stringify(body),
    })
  },
}
```

### CardService (Add-on UI)

```typescript
export const CardBuilder = {
  /**
   * Create a card with header and sections.
   */
  createCard(title: string, sections: GoogleAppsScript.Card_Service.CardSection[]): GoogleAppsScript.Card_Service.Card {
    const card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle(title))

    for (const section of sections) {
      card.addSection(section)
    }

    return card.build()
  },

  /**
   * Create a section with widgets.
   */
  createSection(header: string, widgets: GoogleAppsScript.Card_Service.Widget[]): GoogleAppsScript.Card_Service.CardSection {
    const section = CardService.newCardSection().setHeader(header)

    for (const widget of widgets) {
      section.addWidget(widget)
    }

    return section
  },

  /**
   * Create a text button.
   */
  textButton(text: string, functionName: string): GoogleAppsScript.Card_Service.TextButton {
    return CardService.newTextButton()
      .setText(text)
      .setOnClickAction(
        CardService.newAction().setFunctionName(functionName)
      )
  },
}
```

---

## Build System

### TypeScript + Rollup + CLASP

```
src/           TypeScript source
    │
    ▼
  Rollup       Bundle + transform
    │
    ▼
dist/          JavaScript output
    │
    ▼
  CLASP        Deploy to Google
    │
    ▼
Apps Script    Running code
```

### Path Aliases

```typescript
// tsconfig.json paths become import shortcuts
import { TaskService } from '@services/task'
import { formatDate } from '@utils/date'
import { Button } from '@ui/components'

// These are REMOVED during build - code becomes global scope
// Only type imports survive (import type)
```

---

## Anti-Patterns to Avoid

### ❌ Common Mistakes

```typescript
// WRONG: Using classes
class TaskService {
  process() { ... }
}

// CORRECT: Const object
export const TaskService = {
  process() { ... },
}

// WRONG: Expecting state to persist
let cache = new Map()  // Reset on each execution!

// CORRECT: Use PropertiesService
PropertiesService.getUserProperties().setProperty('cache', JSON.stringify(data))

// WRONG: Synchronous-looking async code
const data = fetch(url)  // This isn't Node.js!

// CORRECT: UrlFetchApp is synchronous
const data = UrlFetchApp.fetch(url).getContentText()

// WRONG: Node.js APIs
import fs from 'fs'
import path from 'path'

// CORRECT: Google APIs
DriveApp.getFileById(id)
SpreadsheetApp.getActiveSpreadsheet()
```

### ❌ Don't Do These

| Pattern | Problem | Fix |
|---------|---------|-----|
| Classes | Unstable in global scope | Use const objects |
| Global state | Lost between executions | PropertiesService |
| Node.js APIs | Not available | Google Apps Script APIs |
| async/await | Different behavior | UrlFetchApp is sync |
| npm packages | Won't work | Apps Script libraries |
| ES modules | Removed during build | Type imports only |

---

## Testing

### Vitest with Mocks

```typescript
// Mock Apps Script globals
vi.mock('gas', () => ({
  SpreadsheetApp: {
    getActiveSpreadsheet: vi.fn(() => ({
      getSheetByName: vi.fn(),
    })),
  },
  UrlFetchApp: {
    fetch: vi.fn(() => ({
      getContentText: vi.fn(() => '{}'),
      getResponseCode: vi.fn(() => 200),
    })),
  },
}))

describe('TaskService', () => {
  it('should process tasks', () => {
    const result = TaskSyncService.processAll(mockConfig)
    expect(result.success).toBe(true)
  })
})
```

---

## Verification Checklist

When reviewing Apps Script code:

- [ ] Uses const object pattern (not classes)
- [ ] No global mutable state (uses PropertiesService)
- [ ] No Node.js APIs (uses Google APIs)
- [ ] Type imports only (import type)
- [ ] Handles API errors gracefully
- [ ] Uses batch operations for sheets
- [ ] Comments explain WHY, not WHAT

---

**Remember**: Apps Script has its own rules. Work with them, not against them.

制約を受け入れろ - "Embrace the constraints"
