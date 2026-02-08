# Safe Incremental Migrations Plan

> Decomposing `checklist-script.js` (5,700 lines, ~120 methods) without breaking production.

## Current State

The Checklist object is a **God Object** containing:
- State management (ChecklistState)
- Quote operations (ChecklistQuote)
- Sync/worker logic (ChecklistSync)
- Custom items CRUD (ChecklistCustomItems)
- UI rendering (ChecklistUI)
- Voice dictation (ChecklistVoice)
- Settings management (ChecklistSettings)

All tightly coupled, all in one file.

---

## The Strategy: Mechanical, Reversible, One-at-a-Time

**Rule**: One refactor per commit. Each commit is mechanically safe and reversible.

### Key Invariant
- **One active `quoteId`** at runtime
- **DB is the spine**, snapshot is the overlay
- Lazy quote creation (no orphans)

---

## Phase 1: Guardrails (Schema Versioning at Boundaries)

**Goal**: Add versioning so we can detect/migrate stale data before it causes bugs.

### Targets
| Boundary | Current | Add |
|----------|---------|-----|
| Snapshot (localStorage fallback) | `schema: 2` | ✅ Already versioned |
| DB record meta (QuoteStorage) | None | `schema_version` field |
| Worker queue item | None | `schema_version` field |
| Envelope (sync payload) | None | `envelope_version` field |

### Implementation

1. **Add `migrateAny(input)` function**
   ```js
   function migrateAny(input) {
     const version = input.schema || input.schema_version || 1;
     if (version < 2) return migrateV1toV2(input);
     if (version < 3) return migrateV2toV3(input);
     return input; // current
   }
   ```

2. **Add runtime validation at boundaries**
   - `buildSnapshot()` — tag with schema
   - `hydrateFromSnapshot()` — migrate before apply
   - `AysQuoteEnvelope.create()` — tag with envelope_version
   - `worker.enqueue()` — tag queue items
   - `sync.send()` — validate before POST

3. **Add fail-safe log ring buffer**
   - Last 50 operations stored in memory
   - Dump on error for debugging

---

## Phase 2: Canonical Identity Rules

**Goal**: Single function that resolves quote identity conflicts.

### The Problem
- Snapshot has `quoteId: 5`
- DB has quote `7` as most recent
- localStorage says `currentQuoteId: 5`
- Which wins?

### Solution: `ensureQuoteIdentity(state)`

```js
/**
 * Resolves quote identity from multiple sources.
 * Priority: DB > localStorage > snapshot
 * Returns: { quoteId, source, action }
 */
function ensureQuoteIdentity(state) {
  const dbId = await QuoteStorage.getMostRecentId();
  const localId = getCurrentQuoteId();
  const snapshotId = state?.snapshot?.quoteId;
  
  // DB is source of truth
  if (dbId && await QuoteStorage.exists(dbId)) {
    if (localId !== dbId) setCurrentQuoteId(dbId);
    return { quoteId: dbId, source: 'db', action: 'verified' };
  }
  
  // Fallback to localStorage if valid
  if (localId && await QuoteStorage.exists(localId)) {
    return { quoteId: localId, source: 'localStorage', action: 'verified' };
  }
  
  // Clear stale references, lazy create on save
  setCurrentQuoteId(null);
  return { quoteId: null, source: 'none', action: 'cleared' };
}
```

### Where to Call
- `initQuoteStorage()` — on boot ✅ (already done)
- `loadQuote()` — before switching
- `restoreSnapshotBestEffort()` — before hydrating

---

## Phase 3: Decompose God Object into Modules

**Goal**: Extract cohesive method groups into separate files.

### Extraction Order (lowest risk first)

| Order | Module | Methods | Lines | Risk |
|-------|--------|---------|-------|------|
| 1 | ChecklistVoice | `initVoiceDictationMicButtons`, voice handlers | ~250 | Low |
| 2 | ChecklistCustomItems | `initCustomItems`, `renderCustomItems`, CRUD | ~200 | Low |
| 3 | ChecklistSettings | `saveSettings`, `resetSettings`, `applySettingsToUI` | ~150 | Low |
| 4 | ChecklistSync | `initEventWorker`, `enqueueEvent`, `flushEventQueue` | ~200 | Medium |
| 5 | ChecklistQuote | Quote CRUD, envelope building | ~400 | Medium |
| 6 | ChecklistState | `buildSnapshot`, `applySnapshot`, progress | ~300 | High |
| 7 | ChecklistUI | DOM, rendering, progress bars | ~500 | High |

### Extraction Pattern

```js
// BEFORE (in checklist-script.js)
const Checklist = {
  initVoiceDictationMicButtons: function() { /* 250 lines */ },
  // ... 119 other methods
};

// AFTER
// File: js/checklist/ChecklistVoice.js
const ChecklistVoice = {
  init: function(checklist) {
    this.checklist = checklist;
    this._initMicButtons();
  },
  _initMicButtons: function() { /* moved code */ }
};

// File: checklist-script.js (delegating)
const Checklist = {
  initVoiceDictationMicButtons: function() {
    ChecklistVoice.init(this);
  },
  // ... rest unchanged
};
```

### Commit Pattern

```
1. Create ChecklistVoice.js with extracted code
2. Add <script> tag to HTML
3. Update Checklist to delegate
4. Test voice dictation works
5. Commit: "extract: ChecklistVoice module"
```

---

## Testing Checklist

### After Each Extraction
- [ ] App boots without errors
- [ ] Quote loads correctly
- [ ] Quote saves correctly
- [ ] Service type switching works
- [ ] Checkboxes persist
- [ ] Sync status updates

### Regression Tests
- [ ] Load quote from Manage Quotes tab
- [ ] Create new quote
- [ ] Delete quote
- [ ] Bulk delete
- [ ] Voice dictation (if extracted)
- [ ] Custom items (if extracted)

---

## Timeline Estimate

| Phase | Effort | Sessions |
|-------|--------|----------|
| Phase 1 (Guardrails) | 2-3 hours | 1 |
| Phase 2 (Identity) | 1 hour | 1 |
| Phase 3 (Decompose) | 4-6 hours | 2-3 |

**Total**: ~8-10 hours across 3-4 sessions

---

## Files Involved

| File | Role |
|------|------|
| `checklist-script.js` | Source (God Object) |
| `js/checklist/` | Target folder for modules |
| `QuoteStorage.js` | DB operations |
| `AysQuoteEnvelope.js` | Sync envelope |
| `checklist-modern.html` | Script loading order |

---

## Success Criteria

1. No runtime errors after each commit
2. All quote operations work identically
3. File size of `checklist-script.js` reduced by 50%+
4. Each module has single responsibility
5. Easy to test modules in isolation
