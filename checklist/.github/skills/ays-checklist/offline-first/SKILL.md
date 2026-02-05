# Skill: ays-checklist.offline-first

> **Purpose:** Ensure the Checklist app works reliably without network connectivity.

---

## When to Use

Trigger this skill when:

- Implementing save/load functionality
- Working with sync behaviour
- Handling network state changes
- Designing data flow

---

## Core Principle

**The user can complete an entire quote without network.**

```
User arrives at job site
     ↓
Opens app (may be offline)
     ↓
Creates/loads quote
     ↓
Completes walkthrough (checks items)
     ↓
Calculates quote
     ↓
Shows customer
     ↓
Saves locally
     ↓
(Later, when online) → Syncs to server
```

---

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   USER INPUT    │ ──▶ │  LOCAL STATE    │ ──▶ │   IndexedDB     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Event Queue    │
                                               │  (outbox)       │
                                               └─────────────────┘
                                                        │
                                                        │ (when online)
                                                        ▼
                                               ┌─────────────────┐
                                               │    SERVER       │
                                               └─────────────────┘
```

---

## What Must Work Offline

| Feature | Offline Support |
|---------|----------------|
| Create new quote | ✅ Yes |
| Load existing quote | ✅ Yes (from IndexedDB) |
| Edit quote | ✅ Yes |
| Check/uncheck items | ✅ Yes |
| Calculate totals | ✅ Yes |
| Save quote | ✅ Yes (to IndexedDB) |
| Show to customer | ✅ Yes |
| Sync to server | ❌ No (queued) |

---

## Sync Queue Pattern

Events are queued locally and synced when online:

```javascript
async function queueForSync(event) {
  // 1. Save to local queue (IndexedDB)
  await eventQueue.add({
    id: crypto.randomUUID(),
    type: event.type,
    payload: event.payload,
    createdAt: Date.now(),
    status: 'pending'
  });
  
  // 2. Attempt sync if online
  if (navigator.onLine) {
    attemptFlush();
  }
}

// Listen for reconnection
window.addEventListener('online', attemptFlush);
```

---

## PWA Requirements

### Service Worker

- Cache app shell (HTML, CSS, JS)
- Cache icons and assets
- Serve from cache when offline

### Manifest

- `display: standalone`
- Appropriate icons
- Start URL

### Install Prompt

- Show "Add to Home Screen" at appropriate time
- Track installation state

---

## Hard Rules

### ✅ DO

- Store drafts in IndexedDB (survives app restart)
- Queue sync events, don't block on network
- Show clear offline/online status
- Auto-resume sync when connection returns

### ❌ DON'T

- Require network for core functionality
- Block user actions waiting for sync
- Lose data on network timeout
- Show error for expected offline state

---

## UI Indicators

| State | Indicator | Meaning |
|-------|-----------|---------|
| Online, synced | 🟢 Green | All data synced |
| Online, pending | 🔵 Blue | Sync in progress |
| Offline | 🟡 Amber | Working offline, will sync later |
| Error | 🔴 Red | Sync failed, retry needed |

---

## Related Skills

- `ays.persistence.rules` — When/how to save
- `ays-checklist.drafts` — Draft storage
