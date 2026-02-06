# Boot Sequence Fix: DB-First Hydration

**Date**: 2026-02-07  
**Status**: ✅ IMPLEMENTED  
**Risk**: Low (sequencing change only, no logic changes)
**Commit**: `6f764c8`

---

## Problem Statement

The current boot sequence in `checklist-script.js` runs in the wrong order:

```javascript
// CURRENT (wrong order)
this.restoreSnapshotBestEffort();  // ← Snapshot applied BEFORE DB verified
this.initQuoteStorage();            // ← DB verification happens AFTER
this.initQuoteManager();
```

### Why This Is Wrong

1. **Snapshot runs first** — applies state from localStorage
2. **DB verification runs second** — might clear a stale `quoteId`
3. **Result**: Snapshot could hydrate with a `quoteId` that gets cleared moments later

This violates the **"DB is the spine, snapshot is the overlay"** principle from our migration plan.

---

## Solution

Reorder boot sequence to:

```javascript
// CORRECT (DB-first)
this.initQuoteStorage()           // 1. Verify/clear quoteId from DB
  .finally(function() {
    self.restoreSnapshotBestEffort();  // 2. Apply snapshot as overlay
    self.initQuoteManager();           // 3. Manager UI
    // ... other dependent init
  });
```

### Key Invariant

> At any time in runtime, there is exactly **one active `quoteId`**, and all snapshots reference that `quoteId`.

---

## Implementation Plan

### Step 1: Make `initQuoteStorage()` Return a Promise

**Current**: Returns nothing (fire-and-forget async)  
**After**: Returns `Promise` so caller can chain

```javascript
// BEFORE
initQuoteStorage: function() {
  if (typeof QuoteStorage === 'undefined') {
    return;  // ← No promise
  }
  QuoteStorage.whenReady().then(...);  // ← Not returned
}

// AFTER
initQuoteStorage: function() {
  if (typeof QuoteStorage === 'undefined') {
    return Promise.resolve();  // ← Returns promise
  }
  return QuoteStorage.whenReady().then(...);  // ← Returned
}
```

### Step 2: Reorder `init()` to Chain DB-Dependent Calls

**Current**: All calls are synchronous fire-and-forget  
**After**: DB-dependent calls wait for `initQuoteStorage()` to complete

```javascript
init: function() {
  // ... early init (DOM, settings, UI) ...
  
  var self = this;
  
  // DB-FIRST: Verify quote identity before applying snapshot
  this.initQuoteStorage()
    .finally(function() {
      // Snapshot overlay AFTER quoteId verified/cleared
      self.restoreSnapshotBestEffort();
      
      // UI that depends on stable quoteId
      self.initQuoteManager();
      self.refreshQuoteCountBadge();
      self.restoreClientContextBestEffort();
      self.loadProgress();
      self.updateAllProgress();
      self.updateClientSummary();
      self.updateSystemStatus();
    });

  // Independent: can run in parallel
  window.addEventListener('online', () => this.updateSystemStatus());
  window.addEventListener('offline', () => this.updateSystemStatus());
  this.initServiceToggleRenderer();
},
```

---

## What Changes

| Function | Change |
|----------|--------|
| `initQuoteStorage()` | Add `return` to make it return a Promise |
| `init()` | Reorder to chain DB-dependent calls after `initQuoteStorage()` |

---

## What Doesn't Change

- All individual functions keep their existing logic
- No new functions created
- No parameters changed
- No external API changes

---

## Test Procedure

### Manual Test (30 seconds)

1. Open browser DevTools → Console
2. Run this to set a fake stale quoteId:
   ```javascript
   localStorage.setItem('ays_current_quote_id', '99999');
   ```
3. Reload the page
4. **Expected logs in order**:
   ```
   [Checklist] Quote 99999 not found, clearing stale ID
   [Checklist] Legacy snapshot format, applying without ID verification
   ```
   OR
   ```
   [Checklist] Quote 99999 not found, clearing stale ID
   [Checklist] Snapshot draftId mismatch... skipping restore
   ```

5. The key is: **"clearing stale ID" appears BEFORE any snapshot message**

### Failure Indicator

If you see snapshot restore happening **before** "clearing stale ID", the fix didn't work.

---

## Rollback

If issues arise, revert to the previous commit. The change is purely sequencing — no data migration needed.

---

## Files Modified

- `checklist/js/checklist-script.js`
  - `init()` function (lines ~60-100)
  - `initQuoteStorage()` function (lines ~3902-3935)

---

## Commit Message

```
fix: Boot sequence DB-first (quoteId verification before snapshot)

- initQuoteStorage() now returns Promise for chaining
- init() waits for DB verification before applying snapshot
- Enforces invariant: one active quoteId, DB is spine, snapshot is overlay

Ref: BOOT-SEQUENCE-FIX.md
```
