# Loading Order & Data Flow - Critical Path Analysis

**Last Updated**: 2026-02-07

> ⚠️ **CRITICAL CHANGE (2026-02-07)**: Boot sequence now uses DB-first pattern.
> See [BOOT-SEQUENCE-FIX.md](BOOT-SEQUENCE-FIX.md) for details.

---

## Key Invariant

> At any time in runtime, there is exactly **one active `quoteId`**, and all snapshots reference that `quoteId`.

**DB is the spine, snapshot is the overlay.**

---

## Script Loading Sequence (HTML)

```
<head>
  ├─ jQuery 3.6.0 (external CDN)
  ├─ html2pdf (external CDN)
  └─ Flatpickr (external CDN)

<body>
  ...DOM content...
  
  <script src="js/patterns/AysPropertyType.js">
    └─ Creates: window.AysPropertyType (type hierarchy)
    └─ Size: ~280 lines
    └─ Dependency: NONE
    └─ Used by: AysChecklistConfigBuilder, AysServiceToggleRenderer

  <script src="js/data/ITEM_DEFINITIONS.js">
    └─ Creates: window.ITEM_DEFINITIONS (service metadata)
    └─ Size: 1000+ lines (Windows, Carpet, Gardening definitions)
    └─ Dependency: NONE
    └─ Used by: AysServiceToggleRenderer (looks up label/description)
    └─ ⚠️ SLOWEST FILE: Can take 100-200ms on 4G networks
    └─ Awaited by: AysServiceToggleRenderer.waitForDependency()

  <script src="js/components/AysDisclosureRoomCard.js">
    └─ Creates: window.AysDisclosureRoomCard (room card component)
    └─ Size: ~400 lines
    └─ Dependency: NONE
    └─ Used by: AysChecklistFormFactory

  <script src="js/components/AysChecklistItemCheckbox.js">
    └─ Creates: window.AysChecklistItemCheckbox (checkbox item)
    └─ Size: ~200 lines
    └─ Dependency: NONE
    └─ Used by: AysDisclosureRoomCard

  <script src="js/components/AysProductionRateSettings.js">
    └─ Creates: window.AysProductionRateSettings (production rate UI)
    └─ Size: ~300 lines
    └─ Dependency: NONE
    └─ Used by: Settings tab (Quotes section)

  <script src="js/components/AysServiceToggleRenderer.js">
    ├─ Creates: window.AysServiceToggleRenderer
    ├─ Size: ~300 lines
    └─ Dependencies:
        ├─ PROPERTY_CONFIG (set by checklist-config.js)
        ├─ AysPropertyType (needs to get available services)
        └─ ITEM_DEFINITIONS (needs to look up service metadata)
    ├─ CRITICAL METHOD: waitForDependency() 
    │   └─ Waits up to 5 seconds for ITEM_DEFINITIONS to load
    │   └─ Non-blocking (yields to browser every 50ms)
    │   └─ Fails with error message if timeout
    └─ Used by: Checklist.initServiceToggleRenderer()

  <script src="js/data/checklist-config.js">
    ├─ Creates: window.CHECKLIST_CONFIG (room/item definitions)
    ├─ Creates: window.AysChecklistConfigBuilder (fluent builder)
    ├─ Creates: window.PROPERTY_CONFIG (user settings manager)
    ├─ Size: ~666 lines
    └─ Dependencies:
        ├─ AysPropertyType (reads available services per type)
        └─ ITEM_TEMPLATES (bedroom/bathroom/kitchen/etc definitions)
    ├─ CRITICAL: setPropertyType() method
    │   └─ Called when user changes property type in Settings
    │   └─ Rebuilds CHECKLIST_CONFIG with new property_type + size
    ├─ NEW: getConfig() method
    │   └─ Returns current CHECKLIST_CONFIG
    │   └─ Used by factory regeneration
    └─ Used by: AysChecklistFormFactory, Checklist.onPropertyTypeChanged()

  <script src="js/generators/AysChecklistFormFactory.js">
    ├─ Creates: window.AysChecklistFormFactory
    ├─ Size: ~110 lines
    └─ Dependencies:
        ├─ CHECKLIST_CONFIG (reads rooms/items)
        └─ AysDisclosureRoomCard (creates room cards)
    ├─ CRITICAL: generate() method
    │   └─ Takes CHECKLIST_CONFIG, creates room cards
    │   └─ Called on initial page load
    ├─ NEW: regenerate() method
    │   └─ Clears existing cards, generates new ones
    │   └─ Called when PROPERTY_CONFIG.setPropertyType() is invoked
    └─ Used by: DOMContentLoaded event, Checklist.onPropertyTypeChanged()

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // INITIAL GENERATION (on page load)
      const generator = new AysChecklistFormFactory('rooms-container');
      generator.generate(CHECKLIST_CONFIG);
      window.checklistGenerator = generator;  // Store for later regeneration
      
      // Settings tab navigation...
    });
  </script>

  <script src="js/checklist-script.js">
    ├─ Creates: window.Checklist object with methods
    ├─ Size: ~5700 lines
    └─ Key Methods:
        ├─ init()
        │   └─ Called on DOMContentLoaded via Checklist.init()
        │   ├─ Calls various initialization methods
        │   ├─ ⚠️ DB-FIRST BOOT SEQUENCE (2026-02-07):
        │   │   └─ initQuoteStorage().finally(() => {
        │   │       └─ restoreSnapshotBestEffort()  // Snapshot AFTER DB verified
        │   │       └─ initQuoteManager()
        │   │       └─ refreshQuoteCountBadge()
        │   │       └─ restoreClientContextBestEffort()
        │   │       └─ loadProgress()
        │   │       └─ updateAllProgress()
        │   │       └─ updateClientSummary()
        │   │       └─ updateSystemStatus()
        │   │   })
        │   └─ Calls initServiceToggleRenderer() [ASYNC, parallel]
        │
        ├─ initQuoteStorage() [RETURNS PROMISE]
        │   └─ Verifies current quoteId exists in IndexedDB
        │   └─ If stale (quote deleted), clears the ID
        │   └─ Does NOT create new quote (lazy creation on first save)
        │
        ├─ restoreSnapshotBestEffort()
        │   └─ Loads snapshot from localStorage
        │   └─ Verifies snapshot.draftId matches current quoteId
        │   └─ Skips restore if mismatch (prevents cross-quote contamination)
        │
        ├─ initServiceToggleRenderer()
        │   └─ Calls AysServiceToggleRenderer.render() [PROMISE-BASED]
        │   └─ Returns Promise (doesn't block)
        │
        └─ onPropertyTypeChanged(newPropertyType, params)
            ├─ Called when user changes property type
            ├─ Calls PROPERTY_CONFIG.setPropertyType(newPropertyType, params)
            ├─ Calls window.checklistGenerator.regenerate(newConfig)
            └─ Calls AysServiceToggleRenderer.render() again
  </script>
</body>
```

---

## Boot Sequence: DB-First Pattern (CRITICAL)

**Fixed 2026-02-07** — See [BOOT-SEQUENCE-FIX.md](BOOT-SEQUENCE-FIX.md)

### The Problem (Before Fix)

```javascript
// OLD (wrong order - caused race conditions)
this.restoreSnapshotBestEffort();  // Snapshot applied BEFORE DB verified
this.initQuoteStorage();            // DB verification happens AFTER
this.initQuoteManager();
```

Snapshot could hydrate with a `quoteId` that gets cleared moments later.

### The Solution (After Fix)

```javascript
// NEW (DB-first - correct order)
this.initQuoteStorage()             // 1. Verify/clear quoteId from DB FIRST
  .finally(function() {
    self.restoreSnapshotBestEffort();  // 2. Apply snapshot as overlay
    self.initQuoteManager();           // 3. Manager UI (stable quoteId)
    // ... other dependent init
  });
```

### Boot Sequence Flow

```
1. initQuoteStorage() runs
   ├─ Wait for QuoteStorage.whenReady()
   ├─ Get currentQuoteId from localStorage
   ├─ If quoteId exists:
   │   ├─ Verify quote still exists in IndexedDB
   │   ├─ If NOT found: clear stale ID (setCurrentQuoteId(null))
   │   └─ If found: log "verified"
   └─ Return Promise (resolves when verification complete)

2. .finally() runs AFTER verification
   ├─ restoreSnapshotBestEffort()
   │   ├─ Load snapshot from localStorage
   │   ├─ Check snapshot.draftId matches currentQuoteId
   │   ├─ If mismatch: skip restore (log warning)
   │   └─ If match: applySnapshot()
   ├─ initQuoteManager()
   ├─ refreshQuoteCountBadge()
   └─ ... other dependent init
```

### Why This Matters

| Scenario | Old Behavior | New Behavior |
|----------|--------------|--------------|
| Stale quoteId in localStorage | Snapshot restores with bad ID, then ID cleared → orphan state | ID cleared FIRST, snapshot skipped |
| Quote deleted by user | Snapshot restores deleted quote's state | Snapshot sees null ID, applies fresh |
| Fresh page load | Race between snapshot and DB | DB always wins, snapshot is overlay |

---

## Data Flow: What Happens on Page Load

```
1. SCRIPT LOADING (Synchronous)
   ├─ AysPropertyType.js loaded → window.AysPropertyType exists ✓
   ├─ ITEM_DEFINITIONS.js loaded → window.ITEM_DEFINITIONS exists ✓
   │   (May take 100-200ms to parse 1000+ line definitions)
   ├─ All component files loaded ✓
   ├─ checklist-config.js loaded
   │   └─ CHECKLIST_CONFIG = default residential 3-bedroom
   │   └─ PROPERTY_CONFIG = {property_type: 'residential', numBedrooms: 3, ...}
   └─ AysChecklistFormFactory.js loaded ✓

2. DOMContentLoaded EVENT (Early)
   ├─ Create generator: new AysChecklistFormFactory('rooms-container')
   ├─ Call generator.generate(CHECKLIST_CONFIG)
   │   └─ Creates 3 bedroom cards + 2 bathroom cards + kitchen/living/etc
   │   └─ Renders to DOM
   ├─ Store generator globally: window.checklistGenerator = generator
   └─ Set up Settings tab navigation
   
3. checklist-script.js Loads & Checklist.init() Called
   ├─ initAdminView()
   ├─ cacheDOM()
   ├─ ... [other initialization methods] ...
   │
   ├─ ⚠️ DB-FIRST BOOT CHAIN (Promise-based):
   │   ├─ initQuoteStorage() [RETURNS PROMISE]
   │   │   ├─ Wait for QuoteStorage.whenReady()
   │   │   ├─ Verify currentQuoteId exists in DB
   │   │   └─ Clear if stale (quote was deleted)
   │   │
   │   └─ .finally() — runs AFTER DB verification:
   │       ├─ restoreSnapshotBestEffort()
   │       │   └─ Loads localStorage snapshot
   │       │   └─ Verifies draftId matches quoteId
   │       │   └─ Skips if mismatch
   │       ├─ initQuoteManager()
   │       ├─ refreshQuoteCountBadge()
   │       ├─ restoreClientContextBestEffort()
   │       ├─ loadProgress()
   │       ├─ updateAllProgress()
   │       ├─ updateClientSummary()
   │       └─ updateSystemStatus()
   │
   └─ initServiceToggleRenderer() [ASYNC - runs in parallel]
       ├─ Calls AysServiceToggleRenderer.render() [RETURNS PROMISE]
       ├─ Promise-based flow:
       │   ├─ Show loading indicator in #service-toggles-container
       │   ├─ Wait for 3 dependencies:
       │   │   ├─ window.PROPERTY_CONFIG [already exists ✓]
       │   │   ├─ window.AysPropertyType [already exists ✓]
       │   │   └─ window.ITEM_DEFINITIONS
       │   │       └─ If not loaded yet, wait up to 5 seconds
       │   │       └─ Yields to browser every 50ms (non-blocking)
       │   ├─ Once all dependencies ready:
       │   │   ├─ Get propertyType: 'residential'
       │   │   ├─ Call AysPropertyType.getAvailableServices('residential')
       │   │   ├─ Result: ['windows', 'carpet', 'gardening']
       │   │   ├─ Loop through services
       │   │   │   └─ Look up each in ITEM_DEFINITIONS
       │   │   │   └─ Build toggle HTML
       │   │   ├─ Render toggles to #service-toggles-container
       │   │   └─ Log success
       │   └─ On failure:
       │       ├─ Show yellow warning box with error
       │       └─ Log error to console
       └─ Does NOT block other code (returns immediately with Promise)

4. USER INTERACTION: Property Type Change
   ├─ User opens Settings tab
   ├─ User selects "Commercial Gym" from property type dropdown
   ├─ onChange handler:
   │   ├─ Call PROPERTY_CONFIG.setPropertyType('commercial_gym', {numShowers: 3})
   │   ├─ Inside setPropertyType():
   │   │   ├─ Validate property type ✓
   │   │   ├─ Create AysChecklistConfigBuilder
   │   │   ├─ Set numShowers: 3
   │   │   ├─ Call builder.build()
   │   │   ├─ Update global CHECKLIST_CONFIG
   │   │   └─ Return new config
   │   ├─ Call Checklist.onPropertyTypeChanged('commercial_gym', {numShowers: 3})
   │   ├─ Inside onPropertyTypeChanged():
   │   │   ├─ Get new config: PROPERTY_CONFIG.getConfig()
   │   │   ├─ Call window.checklistGenerator.regenerate(newConfig)
   │   │   │   └─ Clear existing cards from DOM
   │   │   │   └─ Generate new cards for gym
   │   │   │   └─ Result: 3 shower cards + locker/toilet/lunchroom
   │   │   ├─ Call AysServiceToggleRenderer.render() again
   │   │   │   └─ Wait for dependencies (now much faster, all cached)
   │   │   │   └─ Get new available services for 'commercial_gym'
   │   │   │   └─ Result: ['windows'] ONLY (no carpet in wet areas)
   │   │   │   └─ Update #service-toggles-container with new toggles
   │   │   └─ Log success
   │   └─ Return (Promise-based, doesn't block)
   └─ Checklist is now showing gym rooms with gym-only services

5. USER INTERACTION: Toggle Service On/Off
   ├─ User toggles "Windows" checkbox
   ├─ onChange listener fires:
   │   ├─ Save to localStorage: {include_windows: true}
   │   └─ [FUTURE: Trigger factory refresh to include window items]
   └─ User sees window cleaning items in room cards
```

## Critical Dependency Chain

```
                         AysPropertyType
                              ▲
                              │ (reads type definitions)
                              │
    ITEM_DEFINITIONS ◄────────┴──────────► AysServiceToggleRenderer
          ▲                                  ▲
          │                                  │
          │ (looks up service metadata)      │ (waits for definitions)
          │                                  │
    checklist-config.js          Checklist.onPropertyTypeChanged()
          ▲                                  ▲
          │                                  │
          │ (builds config)                  │ (triggers regeneration)
          │                                  │
    AysChecklistConfigBuilder     AysChecklistFormFactory
          ▲                                  ▲
          │                                  │
          │                                  │
    PROPERTY_CONFIG.setPropertyType()────────┘
```

## What Breaks if Dependencies Load in Wrong Order?

| Scenario | Problem | Prevention |
|---|---|---|
| **Snapshot before DB verification** | Hydrates with stale quoteId that gets cleared | `initQuoteStorage().finally()` chains snapshot after DB |
| ITEM_DEFINITIONS loads AFTER render() | Toggle lookup fails silently | `waitForDependency()` blocks and waits |
| AysPropertyType missing when building config | Config builder fails | Script loads before checklist-config.js |
| Factory.regenerate() called without generator | No regeneration happens | Store generator in window.checklistGenerator |
| Property type changes before toggles render | Wrong toggles appear | Promise-based flow ensures ordering |
| Slow 4G network (100-200ms file load) | Browser freezes waiting for ITEM_DEFINITIONS | `await` yields to browser every 50ms |

## Performance Optimizations

- **Parallel Script Loading**: All scripts load in parallel, only data dependencies matter
- **Non-Blocking Waits**: `waitForDependency()` uses `setInterval` to yield to browser
- **Promise-Based**: No blocking calls, UI remains responsive
- **Cached Dependencies**: After first load, ITEM_DEFINITIONS is in memory, subsequent renders are instant
- **Early Exit**: If dependencies already loaded, renders immediately without waiting

## Testing Checklist

### Boot Sequence Tests (DB-First)
- [ ] Set stale quoteId: `localStorage.setItem('ays_current_quote_id', '99999')`
- [ ] Reload page
- [ ] Verify logs show "clearing stale ID" BEFORE any snapshot message
- [ ] Verify form loads clean (not with stale data)

### Service Toggle Tests
- [ ] Page loads without errors
- [ ] Service toggles appear for residential (windows, carpet, gardening)
- [ ] Service toggles appear for gym (windows ONLY)
- [ ] Changing property type regenerates room cards
- [ ] Changing property type updates service toggles
- [ ] Toggling service on/off saves to localStorage
- [ ] Slow 4G network simulation: toggles still render (with spinner)
- [ ] Network timeout (>5s): Error message appears in UI
