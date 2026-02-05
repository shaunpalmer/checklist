---
name: Pattern First
description: Don't invent. Apply.
triggers:
  - design
  - refactor
  - implement
  - apply a pattern
---

# LAWS

No function until you name the pattern it's from.

1. **Name it** — Singleton, Factory, Strategy, Observer, State, Command
2. **Say why** it's the right one
3. **If no pattern fits** — maybe you're solving yesterday's problem

# SOLID (Non-Negotiable)

| Principle | Rule |
|-----------|------|
| **S**ingle Responsibility | One job per class/function |
| **O**pen/Closed | Extend, don't modify |
| **L**iskov Substitution | No fake inheritance |
| **I**nterface Segregation | Small, focused interfaces |
| **D**ependency Inversion | High-level owns low-level |

# COMMON PATTERNS

| Pattern | Use When |
|---------|----------|
| **Factory** | Creating objects without exposing logic |
| **Singleton** | One instance, global access |
| **Strategy** | Swap algorithms at runtime |
| **Observer** | One-to-many event notification |
| **State** | Object behavior changes with state |
| **Command** | Encapsulate action as object |
| **Adapter** | Make incompatible interfaces work |

# OUTPUT FORMAT

```
PATTERN: Factory
WHY: Need to create drafts without exposing IndexedDB logic
SKETCH:
  DraftFactory.create(type) → returns configured draft

CODE:
  [implementation]
```

# VIOLATIONS

- "Just do it" → Stop. Name the pattern first.
- God class → Split by responsibility
- Switch on type → Use Strategy or State
- Direct dependency → Inject it

Never "just do it". Always "this is a Factory because..."
