# Code Quality Review — Horizontal Data Flow

**Date**: 2026-02-03 (Updated 2026-02-06)  
**Scope**: Form State → Snapshot → Storage → Sync  
**Focus**: DRY violations, pattern inconsistencies, architectural smells

---

## Executive Summary

After deeper investigation, the **OOP architecture is actually well-designed**:
- `Room` base class with 20+ subclasses (Bedroom, Kitchen, Bathroom, etc.)
- `PropertyService` base class for property-wide services (Windows, Carpet, Gardening)
- `AysRoomOrchestrator` and `PropertyServiceOrchestrator` for UI management
- `AysQuoteEnvelope` for structured data wrapping
- `QuoteStorage` for IndexedDB persistence with proper Promise handling
- `event-worker.js` for durable sync queue with fingerprint deduplication

**The real problem is `checklist-script.js`** — a ~5,700 line monolith with **~120 methods** in a single `Checklist` object. This violates Single Responsibility and is the source of most DRY violations.

| Category | Issue Count | Severity |
|----------|-------------|----------|
| **God Object** | 1 (Checklist - 120 methods) | **Critical** |
| DRY Violations | 20+ | High |
| Timing/Race Conditions | 3 (documented in problems/) | High |
| Missing Utilities | 3 | Medium |
| Inconsistent Patterns | 4 | Medium |

---

## 0. CRITICAL: The God Object Problem

### Problem
`checklist-script.js` contains a single `Checklist` object with **~120 methods**:

```
init, initSettingsTabs, updateEndpointBanner, updateSystemStatus,
initFirstRunSetup, initAdminDiagnostics, initGeneratedRoomsForTabs,
buildChecklistConfigFor, initFloorDefaultsPanel, initQuickPropertyTypeSelector,
initGlobalServiceTypeSelector, initServiceToggleRenderer, onPropertyTypeChanged,
initAdminView, loadCustomItems, saveCustomItems, renderCustomItems,
getLeadDataBestEffort, applyLeadDataToQuoteForm, initVoiceDictationMicButtons,
applySettingsToUI, cacheDOM, initRoomProgressBars, getActiveServiceType,
persistClientContext, scheduleSaveProgress, initEventWorker, getSettings,
buildSnapshot, saveSnapshot, applySnapshot, restoreSnapshotBestEffort,
initQuoteStorage, createQuoteFromCurrentState, renderQuoteList,
saveProgress, loadProgress, updateProgress, print, downloadPDF,
switchServiceTab, generateQuote, sendEmailQuote, sendSmsQuote, ...
```

This is a **God Object anti-pattern** — one class doing everything.

### Impact
- Hard to test (everything is intertwined)
- Hard to maintain (changes ripple everywhere)
- Hard to reason about (no clear boundaries)
- Race conditions (see `docs/problems/timing-mess.md`)

### Recommended Fix — Decomposition
Split into focused modules:

| New Module | Responsibility | Methods to Extract |
|------------|----------------|-------------------|
| `ChecklistInit` | Initialization, DOM caching | `init`, `cacheDOM`, `initSettingsTabs` |
| `ChecklistState` | Snapshot, progress, persistence | `buildSnapshot`, `saveSnapshot`, `applySnapshot`, `saveProgress`, `loadProgress` |
| `ChecklistQuote` | Quote generation, pricing | `generateQuote`, `renderQuoteLineItems`, `computeLinePrice` |
| `ChecklistSync` | Event worker, sync status | `initEventWorker`, `enqueueEvent`, `flushEventQueue`, `setSyncStatus` |
| `ChecklistCustomItems` | Custom item CRUD | `loadCustomItems`, `saveCustomItems`, `renderCustomItems` |
| `ChecklistUI` | UI interactions, animations | `updateProgress`, `switchServiceTab`, `applyTheme` |
| `ChecklistVoice` | Voice dictation | `initVoiceDictationMicButtons` |

---

## 1. DRY Violations — The `.toString().trim()` Pattern

### Problem
The same defensive string normalization pattern appears **20+ times**:

```javascript
// This pattern is repeated everywhere:
($('#quote-client-name').val() || '').toString().trim() || null
($('#quote-phone').val() || '').toString().trim() || null
($('#quote-email').val() || '').toString().trim() || null
// ... repeated for every field
```

### Found In
- `checklist-script.js:1497-1513` — 10+ occurrences in `parseIncomingClientData()`
- `checklist-script.js:1596-1600` — 5+ occurrences building client object
- `checklist-script.js:2606+` — Multiple in `buildSnapshot()`

### Recommended Fix
Create utility functions:

```javascript
// js/utils/AysStringUtils.js
export const AysStringUtils = {
    /**
     * Safely convert any value to a trimmed string, or null if empty
     * @param {*} value - Any input value
     * @returns {string|null}
     */
    toTrimmedString(value) {
        const trimmed = (value || '').toString().trim();
        return trimmed || null;
    },

    /**
     * Get trimmed value from a jQuery selector, or null if empty
     * @param {string} selector - jQuery selector
     * @returns {string|null}
     */
    getInputValue(selector) {
        return this.toTrimmedString($(selector).val());
    },

    /**
     * Extract first non-empty value from object using multiple possible keys
     * @param {object} obj - Source object
     * @param {...string} keys - Keys to try in order
     * @returns {string|null}
     */
    extractFirst(obj, ...keys) {
        for (const key of keys) {
            const val = this.toTrimmedString(obj?.[key]);
            if (val) return val;
        }
        return null;
    }
};
```

**Before** (current code):
```javascript
const name = (obj.name || obj.client_name || obj.full_name || obj.ays_name || '').toString().trim();
const email = (obj.email || obj.client_email || obj.ays_email || '').toString().trim();
const phone = (obj.phone || obj.client_phone || obj.mobile || obj.ays_phone || '').toString().trim();
```

**After** (with utility):
```javascript
const name = AysStringUtils.extractFirst(obj, 'name', 'client_name', 'full_name', 'ays_name');
const email = AysStringUtils.extractFirst(obj, 'email', 'client_email', 'ays_email');
const phone = AysStringUtils.extractFirst(obj, 'phone', 'client_phone', 'mobile', 'ays_phone');
```

---

## 2. Missing Utility Layer

### Problem
No shared utility module exists. Each file re-implements common patterns:
- String sanitization (see above)
- Date formatting
- Safe object access
- DOM element caching

### Recommended Structure
```
js/
├── utils/
│   ├── AysStringUtils.js    # String normalization
│   ├── AysDOMUtils.js       # Cached selector access
│   ├── AysDateUtils.js      # Date formatting/parsing
│   └── AysObjectUtils.js    # Safe property access
```

---

## 3. jQuery Selector Repetition

### Problem
Same selectors are queried multiple times without caching:

```javascript
// In saveProgress() and elsewhere:
$('#quote-client-name').val()  // Line 1596
$('#quote-client-name').val()  // Called again elsewhere
```

### Recommended Fix
Create a cached DOM accessor:

```javascript
// js/utils/AysDOMUtils.js
export const AysDOMUtils = {
    cache: new Map(),
    
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, $(selector));
        }
        return this.cache.get(selector);
    },
    
    invalidate(selector) {
        this.cache.delete(selector);
    },
    
    invalidateAll() {
        this.cache.clear();
    }
};

// Usage:
AysDOMUtils.get('#quote-client-name').val()
```

---

## 4. Inconsistent Property Access Patterns

### Problem
Some files use modern optional chaining, others use defensive OR chains:

```javascript
// Modern (good):
obj?.property ?? defaultValue

// Legacy (inconsistent):
(obj && obj.property) || defaultValue
obj.property || obj.fallback || ''
```

### Files With Mixed Patterns
- `checklist-script.js` — Mix of both styles
- `QuoteStorage.js` — Mostly modern
- `AysQuoteEnvelope.js` — Modern

### Recommended Fix
Standardize on optional chaining (`?.`) and nullish coalescing (`??`) throughout.

---

## 5. Error Handling Inconsistency

### Problem
Error handling varies across layers:

| Layer | Pattern | Issue |
|-------|---------|-------|
| QuoteStorage | try/catch with console.error | Good |
| event-worker.js | try/catch with console.warn | Good |
| buildSnapshot() | No try/catch | Bad - silent failures |
| createQuoteFromCurrentState() | try/catch | Good |

### Recommended Fix
Wrap all data collection in try/catch with fallback behavior.

---

## 6. Magic Strings

### Problem
Field mappings use inline strings scattered across files:

```javascript
// Scattered across checklist-script.js:
'#quote-client-name'
'#quote-phone'
'#quote-email'
// etc.
```

### Recommended Fix
Create a field registry:

```javascript
// js/config/AysFieldRegistry.js
export const AysFieldRegistry = {
    client: {
        name: '#quote-client-name',
        phone: '#quote-phone',
        email: '#quote-email',
        // ...
    },
    booking: {
        date: '#quote-booking-date',
        time: '#quote-booking-time',
    }
};
```

---

## 7. Function Length & Responsibility

### Problem
`buildSnapshot()` is ~100 lines and does too much:
1. Collects progress checkboxes
2. Collects client data
3. Collects variant selections
4. Collects custom items
5. Collects property config

### Recommended Fix
Extract sub-functions:

```javascript
buildSnapshot() {
    return {
        version: 2,
        progress: this.collectProgress(),
        client: this.collectClient(),
        variantSelections: this.collectVariants(),
        customItems: this.collectCustomItems(),
        propertyConfig: this.collectPropertyConfig(),
        meta: this.collectMeta()
    };
}
```

---

## 8. Positives (What's Done Right)

### QuoteStorage.js
- Clean separation of concerns
- Proper Promise handling with `whenReady()`
- Good error logging
- Denormalization logic is clear

### event-worker.js
- Excellent durable queue pattern
- Fingerprint-based deduplication
- Batch flush with exponential backoff
- Clean Web Worker isolation

### AysQuoteEnvelope.js
- Good use of class pattern
- Clear static factory methods
- Documented structure

---

## Action Items (Priority Order)

### P1 — Quick Wins (< 1 hour each)
1. [ ] Create `AysStringUtils.js` with `toTrimmedString()` and `extractFirst()`
2. [ ] Replace top 10 DRY violations with utility calls
3. [ ] Add try/catch to `buildSnapshot()`

### P2 — Medium Effort (1-2 hours)
4. [ ] Create `AysFieldRegistry.js` for magic strings
5. [ ] Extract `buildSnapshot()` sub-functions
6. [ ] Standardize optional chaining across codebase

### P3 — Nice to Have
7. [ ] Create `AysDOMUtils.js` for cached selectors
8. [ ] Add JSDoc to all public functions
9. [ ] Create `AysObjectUtils.js` for safe property access

---

## Metrics Target

| Metric | Current | Target |
|--------|---------|--------|
| `.toString().trim()` occurrences | 20+ | 2 (in utility only) |
| Inline jQuery selectors | 50+ | 0 (all via registry) |
| try/catch coverage | ~70% | 100% |
| JSDoc coverage | ~30% | 80% |

---

*This review focuses on maintainability and code elegance, not functionality. The code works — it just doesn't work with style.*
