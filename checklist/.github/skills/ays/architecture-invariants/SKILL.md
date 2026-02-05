# Skill: ays.architecture.invariants

> **Purpose:** Define project-wide invariants that apply across ALL AYS modules.

---

## When to Use

Trigger this skill when:

- Creating or modifying any AYS feature
- Making architectural decisions
- Designing state management
- Working with persistence

---

## AYS Core Principles

### 1. Offline-First

All AYS features MUST work without network connectivity.

```
User action → Local state → Local persistence → (Later) Sync to server
```

Never block user actions waiting for network.

### 2. Device-Local Data

- Drafts live on the device, not the server
- Sync is eventual, not immediate
- User can work all day offline

### 3. Single Source of Truth

Every piece of data has ONE authoritative source:

| Data | Source of Truth |
|------|-----------------|
| Active draft | `DraftManager.activeDraftId` |
| Quote type | `draft.serviceType` |
| Form state | `draft.snapshot` |
| Sync status | `draft.syncStatus` |

### 4. State → UI (Never Reverse)

```
STATE is the authority
UI reflects state
UI never defines state
```

---

## Hard Rules

### ✅ DO

- Store critical data in IndexedDB (survives app restart)
- Use localStorage only for tiny flags
- Design for phone lock / battery death
- Make state changes explicit and traceable

### ❌ DON'T

- Require network for core functionality
- Read state FROM the DOM
- Create competing sources of truth
- Assume data persists in memory

---

## Data Persistence Hierarchy

```
1. IndexedDB (drafts, queues)     — Survives everything
2. localStorage (flags, prefs)    — Small, sync only
3. Memory (runtime state)         — Lost on refresh
```

---

## Related Skills

- `ays.persistence.rules` — Specific persistence contracts
- `ays.drafts.lifecycle` — Draft state machine
