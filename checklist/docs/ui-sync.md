# UI Sync Architecture — Engineering Note

> How the mode-switching system works, why bugs appeared after `data-*` adoption, and how to debug future issues.

---

## Timeline: How We Got Here

### 1. String-guessing era (pre-refactor)

Logic inferred state from UI labels, text content, and option values ("Office", "Move out clean", etc.). This *sometimes worked* but was fragile — copy changes, casing, whitespace, and nested markup all broke it silently. Fallback paths accidentally masked bugs.

### 2. `data-*` contract introduced

Stable, machine-readable keys replaced inference:

| Element | Attribute | Example values |
|---|---|---|
| Tabs | `data-service` | `end-of-tenancy`, `residential`, `commercial` |
| Property type `<option>` | `data-family` | `residential`, `eot`, `commercial` |
| Property type `<option>` | `data-has-bedrooms` | `"true"` (present) or absent |
| Property type `<option>` | `data-has-offices` | `"true"` (present) or absent |
| Property type `<option>` | `data-has-showers` | `"true"` (present) or absent |
| Property type `<option>` | `data-has-warehouse` | `"true"` (present) or absent |

JS now reads `opt.dataset.family` / `opt.dataset.hasBedrooms` instead of string content.

### 3. System stopped "getting lucky"

With text inference, the app could accidentally fall back into a working path (strings loosely matched or defaulted). With stable keys, behaviour became *deterministic* — so underlying issues showed up consistently.

### 4. The bugs were always present — `data-*` just exposed them

The real problems were **plumbing**, not identifiers:

- **Change events not dispatched** — programmatic `selector.value = x` doesn't fire `change`; must call `dispatchEvent()`.
- **Wrong element IDs** — handlers targeted `num-bedrooms` but the DOM had `setting-num-bedrooms`.
- **Stale `PROPERTY_CONFIG`** — `onPropertyTypeChanged()` wasn't calling `setPropertyType()` before triggering regeneration.
- **Stale rooms schema** — `buildChecklistConfigFor()` blindly applied bedroom params to commercial types. When `build()` threw (missing required office count), the catch block returned `_getCurrentGeneratedConfig()` → the last residential config. Bedrooms in commercial.
- **No cache invalidation** — switching family didn't clear derived state built from the previous mode.

Result: the UI *partially* updated, but derived sections (rooms list, counts, progress pills) were still built from the old mode.

---

## Three-Layer Model

```
┌──────────────────────────────────────────────┐
│  1. CONTRACT LAYER                           │
│  data-family, data-has-*, data-service       │
│  Defines WHAT mode we're in.                 │
│  ✅ Stable — do not regress.                 │
├──────────────────────────────────────────────┤
│  2. PLUMBING LAYER                           │
│  Events, handlers, dispatch, element IDs     │
│  Defines HOW everything stays in sync.       │
│  ⚠️ Where leaks happen.                     │
├──────────────────────────────────────────────┤
│  3. DERIVED UI LAYER                         │
│  Rooms list, counts, progress pills, badges  │
│  Must be rebuilt/invalidated on mode change.  │
│  ⚠️ Where stale caching lives.              │
└──────────────────────────────────────────────┘
```

**Debugging rule:** if the UI "isn't sticky," it's almost always a **pipe leak** — ordering, dispatch, selectors, stale derived caches — not the contract.

---

## Current Sync Pipeline

```
Intent (tab click / dropdown / restore / quick selector)
  │
  ├─ Tab click → sets global-service-type selector → dispatches change event
  ├─ Quick selector change → updates Settings form inputs → dispatches Settings change
  └─ Settings form change → scheduleRegenerate() (200ms debounce)
         │
         ▼
  onPropertyTypeChanged(newType, params)
    1. PROPERTY_CONFIG.setPropertyType(newType, params)    ← source of truth
    2. setActiveChecklistGenerator(activeService)
         │
         ▼
  buildChecklistConfigFor(serviceType, propertyTypeKey)
    1. Map propertyType to correct family (eot_residential / commercial_office / etc.)
    2. Read AysPropertyType room specs to determine WHICH params the type needs
    3. Apply ONLY those params (with safe defaults)
    4. builder.build() → rooms for this family, never stale fallback
         │
         ▼
  _renderGeneratedRoomsForService(...)
    1. container.innerHTML = '' (clears old rooms)
    2. factory.regenerate(config) (builds fresh rooms)
    3. Update progress bars + floor summary
```

---

## Room-Aware Config Building

The stale-bedrooms fix ensures `buildChecklistConfigFor()` (and `_buildConfigForHydration()`) read the target type's room specifications to determine which parametric rooms it actually requires:

```js
// Read room specs from AysPropertyType
var typeInfo = AysPropertyType.getType(targetType);
var needsRoom = {};
typeInfo.rooms.forEach(function(spec) {
  if (spec.count === null) needsRoom[spec.type] = true;
});

// Only apply params the type needs, with safe defaults
if (needsRoom.Bedroom)    builder.withBedroomCount(bedrooms || 3);
if (needsRoom.Office)     builder.withOfficeCount(offices || 4);
if (needsRoom.Shower)     builder.withShowerCount(showers || 6);
if (needsRoom.LoadingDock) builder.withLoadingDockCount(docks || 2);
```

This prevents `build()` from throwing on missing params and falling back to stale `CHECKLIST_CONFIG` from a different service family.

---

## Key Rules

1. **`data-*` attributes define the contract.** Do not remove or replace with string matching.
2. **Events + state define the pipes.** If mode changes don't propagate, check dispatch/selectors/IDs.
3. **Derived UI must be rebuilt on family change.** Clearing the rooms container + `factory.regenerate()` is the minimum.
4. **One source of truth: `PROPERTY_CONFIG`.** All mode changes go through `setPropertyType()` before regeneration.
5. **Bump `CACHE_VERSION` in `service-worker.js` after ANY code change.**
6. **`buildChecklistConfigFor()` must be room-aware.** Never blindly apply all params — consult `AysPropertyType.getType(targetType).rooms`.

---

## Files Reference

| File | Purpose |
|---|---|
| `checklist-modern.html` | SPA shell, inline config seeding, Settings form, `data-*` options |
| `js/checklist-script.js` | `Checklist` object — init, generators, event handlers, sync pipeline |
| `js/data/checklist-config.js` | `PROPERTY_CONFIG`, `CHECKLIST_CONFIG`, `AysChecklistConfigBuilder` |
| `js/patterns/AysPropertyType.js` | Property type definitions (rooms, families, presets) |
| `js/generators/AysChecklistFormFactory.js` | Factory that renders/regenerates room cards |
| `service-worker.js` | Cache versioning (`CACHE_VERSION`) |
