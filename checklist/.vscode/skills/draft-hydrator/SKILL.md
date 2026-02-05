---
name: Draft Hydrator
description: Load drafts properly. No half-states.
triggers:
  - load
  - open
  - hydrate
  - recover
---

Hydration is sacred — no shortcuts.

# LAWS

1. ALWAYS start with mode: `setJobType(payload.mode)`
2. REBUILD room list from `base_room` + addons for that mode
3. ONLY THEN apply saved values: rooms, client, notes
4. Recalc totals. Render.
5. If draft missing — create blank, set `dirty=false`
6. If mode switched mid-load — prompt: "Start new quote?"

# HYDRATION SEQUENCE

```
┌─────────────────────────────┐
│ 1. setJobType(payload.mode) │  ← MODE FIRST
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ 2. rebuildRoomList()        │  ← base_room + addons
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ 3. applyPayload()           │  ← rooms, client, notes
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ 4. recalcTotals()           │
└─────────────┬───────────────┘
              ▼
┌─────────────────────────────┐
│ 5. render()                 │  ← UI updates LAST
└─────────────────────────────┘
```

# FAILURE MODES

| Skip This | You Get |
|-----------|---------|
| Step 1 | Wrong rooms for mode |
| Step 2 | 3-item rooms (no base) |
| Step 3 | Empty form |
| Step 4 | Wrong totals |
| Step 5 | Stale UI |

# UI FEEDBACK

```javascript
// Show loading state
ui.showStatus('Hydrating...');

// After complete
ui.hideStatus();
```

UI shows "Hydrating..." until done.

Never let form win. State wins.
