# Skill: ays.persistence.rules

> **Purpose:** Define how data is saved, when, and where across AYS.

---

## When to Use

Trigger this skill when:

- Implementing save/load functionality
- Working with IndexedDB or localStorage
- Designing autosave behaviour
- Handling app lifecycle events

---

## Persistence Layers

| Layer | Technology | Use For | Survives |
|-------|------------|---------|----------|
| Primary | IndexedDB | Drafts, sync queue | App restart, phone lock |
| Secondary | localStorage | Preferences, flags | App restart |
| Runtime | Memory | Active state | Nothing (volatile) |

---

## Autosave Rules

### When to Save

| Trigger | Debounce | What Saves |
|---------|----------|------------|
| Checkbox change | 800ms | `payload.progress[itemId]` |
| Field input | 1000ms | Customer/address fields |
| Settings change | Immediate | `propertyConfig` |
| Mode switch | Immediate | `serviceType` |
| `visibilitychange` (hidden) | Immediate | Full state |
| `pagehide` | Immediate | Full state |
| `beforeunload` | Immediate | Full state |

### Debounce Strategy

```javascript
// ❌ Bad: Save every 250ms (too aggressive)
setInterval(save, 250);

// ✅ Good: Debounce 800-1500ms after last change
let saveTimeout;
function scheduleAutosave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(save, 1000);
}
```

---

## Lifecycle Saves (Critical)

These MUST save immediately, no debounce:

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveImmediately();
});

window.addEventListener('pagehide', saveImmediately);
window.addEventListener('beforeunload', saveImmediately);
```

---

## Retention Policy

| Condition | Action |
|-----------|--------|
| Synced drafts | Delete 14 days after `syncedAt` |
| Unsynced drafts | Delete 30 days after `updatedAt` |
| Stale (no activity) | Warn at 21 days, delete at 30 |

---

## Hard Rules

### ✅ DO

- Save on lifecycle events (phone lock, tab switch)
- Use IndexedDB for anything important
- Keep draft schema versioned
- Provide migration hooks for schema changes

### ❌ DON'T

- Save every 250ms (battery drain, write amplification)
- Rely on `beforeunload` alone (unreliable on mobile)
- Store large data in localStorage
- Assume memory state persists

---

## Related Skills

- `ays.architecture.invariants` — Core AYS principles
- `ays.drafts.lifecycle` — Draft state machine
