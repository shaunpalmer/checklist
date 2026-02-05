# Copilot Instructions: Linked Cache Draft Persistence + Sync

**Status**: MANDATORY — do it this way or don't do it at all  
**Scope**: All draft/quote persistence, loading, saving, syncing  
**Last Updated**: 2026-02-01

---

## Context

This project is an offline-first checklist/quoting UI. A single "draft" represents one quote-in-progress. Draft state must survive:

- Phone lock / refresh / crash / battery loss
- Short offline windows
- Switching between multiple drafts (5+ per day)

---

## Non-Negotiable Architecture Rules

### 1. Drafts Have Identity
Every saved snapshot **MUST** be tied to a stable `draftId`. No anonymous snapshots.

### 2. IndexedDB Is Source of Truth
It stores all drafts and supports CRUD + search.

### 3. localStorage Is Hot Backup Cache
For the **ACTIVE draft only**. It is never anonymous and never a second database.

### 4. localStorage and IndexedDB Are Linked
localStorage must always carry:
- `currentDraftId`
- `hotBackup` snapshot for that **SAME** `currentDraftId`

### 5. Fallback Is ID-Locked
You may **only** hydrate from `hotBackup` if `hotBackup.draftId === currentDraftId`.

### 6. One Hydration Lane
All load paths must go through a single `openDraft(draftId)` / `hydrateDraft()` pipeline. No partial hydration.

---

## Data Contract

### localStorage Keys

```javascript
STORAGE_KEYS = {
  currentDraftId: 'ays.currentDraftId',      // string - active draft ID
  hotBackup: 'ays.hotBackup'                  // object - see below
}
```

### hotBackup Structure (Single Object)

```javascript
{
  draftId: string,           // MUST match currentDraftId
  snapshot: { ... },         // Full snapshot object
  updatedAt: ISO timestamp,
  schemaVersion: number
}
```

**Rule**: Never store multiple drafts in localStorage. One hotBackup only.

### IndexedDB Stores

#### `drafts` (Primary Key: `draftId`)

| Field | Type | Description |
|-------|------|-------------|
| `draftId` | string | UUID, primary key |
| `snapshot` | object | Canonical state |
| `updatedAt` | ISO timestamp | Last modification |
| `status` | enum | `draft` / `ready` / `synced` / `archived` |
| `schemaVersion` | number | For migrations |
| `displayName` | string | Client name + address for list |
| `serviceType` | string | `end-of-tenancy` / `residential` / `commercial` |

#### `syncQueue` (Optional)

| Field | Type | Description |
|-------|------|-------------|
| `draftId` | string | Reference to draft |
| `revision` | string/number | Version marker |
| `attempts` | number | Retry count |
| `lastAttemptAt` | ISO timestamp | Last sync try |

---

## Write Flow (Vertical → Horizontal Intersection)

**Vertical**: UI events mutate state → state serializes to envelope snapshot (factory)  
**Horizontal**: Persistence + sync happen together using same `draftId`

### When Saving (autosave OR manual snapshot):

```javascript
async function saveDraft() {
  // 1. Build snapshot via factory/envelope from single source-of-truth state
  const snapshot = buildSnapshot();
  const draftId = getCurrentDraftId();
  
  // 2. Persist to IndexedDB (PRIMARY)
  await QuoteStorage.updateSnapshot(draftId, snapshot);
  
  // 3. Persist identical snapshot to localStorage hotBackup (FALLBACK CACHE)
  localStorage.setItem(STORAGE_KEYS.hotBackup, JSON.stringify({
    draftId: draftId,
    snapshot: snapshot,
    updatedAt: new Date().toISOString(),
    schemaVersion: snapshot.schema || 2
  }));
  
  // 4. Enqueue sync by referencing draftId + revision (NOT storing second payload)
  if (navigator.onLine) {
    syncQueue.enqueue(draftId, snapshot.updated_at);
  }
}
```

**Rule**: The snapshot written to IndexedDB and the hotBackup must be the **same draft** and **same data shape**.

---

## Read Flow (Deterministic, Not "Try Random Stuff")

### On App Load:

```javascript
async function initializeDraft() {
  // 1. Read currentDraftId from localStorage
  const currentDraftId = localStorage.getItem(STORAGE_KEYS.currentDraftId);
  
  if (!currentDraftId) {
    // No active draft - create new or show empty state
    return createNewDraft();
  }
  
  // 2. Attempt IndexedDB.get(currentDraftId)
  try {
    await QuoteStorage.whenReady();
    const draft = await QuoteStorage.get(currentDraftId);
    
    if (draft && draft.snapshot) {
      await openDraft(currentDraftId, draft.snapshot);
      return;
    }
  } catch (err) {
    console.warn('[Init] IndexedDB failed, trying hotBackup:', err);
  }
  
  // 3. Fallback: use localStorage.hotBackup ONLY if draftId matches
  const hotBackup = JSON.parse(localStorage.getItem(STORAGE_KEYS.hotBackup) || 'null');
  
  if (hotBackup && hotBackup.draftId === currentDraftId && hotBackup.snapshot) {
    console.log('[Init] Restoring from hotBackup for draft:', currentDraftId);
    await openDraft(currentDraftId, hotBackup.snapshot);
    return;
  }
  
  // 4. Both failed - start fresh
  console.warn('[Init] No valid draft found, starting fresh');
  createNewDraft();
}
```

### openDraft() - The Single Hydration Lane

```javascript
async function openDraft(draftId, snapshot) {
  // Block saves during hydration
  this._isHydrating = true;
  
  try {
    // 1. Set active draft ID
    setCurrentDraftId(draftId);
    
    // 2. Set mode (residential/eot/commercial)
    const mode = snapshot.serviceType || 'end-of-tenancy';
    
    // 3. Rebuild UI from mode (CSS switch only, no async rebuild)
    switchTabVisualOnly(mode);
    
    // 4. Rebuild room DOM to match snapshot's property config
    rebuildRoomsForSnapshot(snapshot);
    
    // 5. Apply snapshot values (checkboxes, variants, client fields)
    applySnapshotValues(snapshot);
    
    // 6. Recalc derived totals
    updateAllProgress();
    updateFloorSummary();
    
    // 7. Update hotBackup cache
    updateHotBackup(draftId, snapshot);
    
  } finally {
    // Always unblock saves
    this._isHydrating = false;
  }
}
```

---

## Mode Switching Rule

Mode is owned by the draft snapshot (`snapshot.serviceType`).

If user selects a different mode and current draft is dirty:
1. **Prompt** to start a new draft
2. Optional: copy client details to new draft
3. **Never** silently mutate a dirty draft into a different structural schema

```javascript
function handleModeSwitch(newMode) {
  const currentMode = getActiveServiceType();
  const isDirty = hasUnsavedChanges();
  
  if (newMode === currentMode) {
    return; // No-op
  }
  
  if (isDirty) {
    // Prompt user
    const confirmed = confirm(
      `Start a new ${newMode} quote? Your current work will be saved.`
    );
    if (!confirmed) return;
    
    // Save current draft first
    await saveDraft();
  }
  
  // Create new draft with new mode
  await createNewDraft({ serviceType: newMode });
}
```

---

## Autosave Rule (Stop Race Conditions)

### DO:
- Event-driven debounce (800–1500ms after last change)
- Flush on `visibilitychange` / `pagehide`
- Set `_isHydrating = true` during `openDraft()` to prevent autosave writes

### DON'T:
- Save every 250ms by interval timer
- Save while hydration is in progress

```javascript
// Good: Debounced save
let saveTimeout = null;

function scheduleSave() {
  if (this._isHydrating) return; // Block during hydration
  
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDraft();
  }, 1000); // 1 second debounce
}

// Flush on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !this._isHydrating) {
    clearTimeout(saveTimeout);
    saveDraft();
  }
});
```

---

## Anti-Patterns (DO NOT IMPLEMENT)

| ❌ Anti-Pattern | Why It's Bad |
|-----------------|--------------|
| localStorage containing anonymous snapshot with no draftId | Can't link to IndexedDB record |
| Separate "snapshot store" and "draft store" with different identities | Two sources of truth = conflict |
| Loading a draft without rebuilding UI from its mode | UI shows wrong rooms/labels |
| Updating UI labels without updating underlying mode/roomKind/state | UI drift from data |
| Saving every 250ms by interval timer | Race conditions, wasted writes |
| Reading from localStorage without checking draftId match | May hydrate wrong draft |
| Parallel async rebuilds during hydration | DOM corruption |

---

## Acceptance Tests (Must Pass)

| Test | Expected Result |
|------|-----------------|
| Create draft, make 70–100 selections, kill app, reopen | Restored exactly |
| Create 10 drafts, open Manage Quotes | List shows all 10 |
| Search for older draft | Found and loadable |
| Load draft from yesterday | UI mode and room labels correct (Office vs Bedroom) |
| Switch draft while dirty | Prompt + autosave preserves current |
| Offline for hours | Drafts still editable; sync resumes later |
| IndexedDB fails to open | hotBackup restores active draft only |
| Load draft, edit, close tab, reopen | Same draft restored with edits |

---

## Implementation Checklist

When implementing this spec, you MUST:

- [ ] Identify existing draft/state manager entry points
- [ ] Implement `currentDraftId` + `hotBackup` linkage
- [ ] Route ALL loads through one `openDraft(draftId)` function
- [ ] Ensure save pipeline writes IndexedDB THEN hotBackup
- [ ] Remove interval-based autosave in favour of debounced event-based
- [ ] Add `_isHydrating` flag to block saves during hydration
- [ ] Add minimal logging around load/save/hydrate boundaries
- [ ] Test CRUD cycle end-to-end

---

## File References

| File | Relevant Functions |
|------|-------------------|
| `js/checklist-script.js` | `buildSnapshot()`, `applySnapshot()`, `saveSnapshot()`, `init()` |
| `js/storage/QuoteStorage.js` | `save()`, `get()`, `getAll()`, `updateSnapshot()` |
| `STORAGE_KEYS` object | Defines localStorage key names |

---

## Summary

**One truth, one cache, one ID linking them.**

```
┌─────────────────────────────────────────────────────────────┐
│                    currentDraftId = "abc123"                │
├─────────────────────────────────────────────────────────────┤
│  IndexedDB.drafts["abc123"]  ←──── SOURCE OF TRUTH          │
│         ↕ (same data)                                       │
│  localStorage.hotBackup      ←──── FALLBACK CACHE           │
│    { draftId: "abc123", snapshot: {...} }                   │
├─────────────────────────────────────────────────────────────┤
│  UI/DOM                      ←──── PROJECTION OF SNAPSHOT   │
└─────────────────────────────────────────────────────────────┘
```

All three are linked by `draftId`. They are never strangers.
