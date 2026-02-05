# Migration Plan: Templates → OOP Architecture

## Executive Summary

The codebase has **two parallel systems** for generating room items:
1. **Templates** (current): `BEDROOM_ITEMS_TEMPLATE` → `AysChecklistConfigBuilder` → `CHECKLIST_CONFIG`
2. **OOP Classes** (target): `ITEM_DEFINITIONS` → `Room Classes` → `RoomRegistry` → UI

The goal is to migrate from templates to the OOP pattern, where service type selection (EOT/Residential/Commercial) drives the entire form dynamically.

---

## Current Architecture (AS-IS)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAGE LOAD                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROPERTY_CONFIG                                                │
│    ├── property_type: 'residential'                             │
│    ├── numBedrooms: 3                                           │
│    └── numBathrooms: 2                                          │
│           │                                                     │
│           ▼                                                     │
│  AysChecklistConfigBuilder                                      │
│    ├── forPropertyType('residential')                           │
│    ├── withBedroomCount(3)                                      │
│    ├── withBathroomCount(2)                                     │
│    └── .build()                                                 │
│           │                                                     │
│           ▼                                                     │
│  CHECKLIST_CONFIG  ◄── Uses BEDROOM_ITEMS_TEMPLATE              │
│    └── rooms: [                                                 │
│          { roomId: 'bed-1', items: [...] },                     │
│          { roomId: 'bed-2', items: [...] },                     │
│          { roomId: 'bath-1', items: [...] },                    │
│        ]                                                        │
│           │                                                     │
│           ▼                                                     │
│  AysChecklistFormFactory.generate(CHECKLIST_CONFIG)             │
│    └── Creates AysDisclosureRoomCard for each room              │
│           │                                                     │
│           ▼                                                     │
│  HTML rendered to #rooms-container                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Problems with Current Architecture

1. **Templates are static** - `BEDROOM_ITEMS_TEMPLATE` is hardcoded, not service-type aware
2. **Service type is disconnected** - The dropdown exists but doesn't rebuild the form
3. **Duplicate sources of truth** - Templates in `checklist-config.js` AND definitions in `ITEM_DEFINITIONS.js`
4. **No polymorphism** - Can't have different behavior for EOT Bedroom vs Residential Bedroom

---

## Target Architecture (TO-BE)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE TYPE CHANGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User selects "End of Tenancy" ────┐                            │
│                                    │                            │
│                                    ▼                            │
│  QuoteOrchestrator.setServiceType('eot')                        │
│    ├── serviceType = 'eot'                                      │
│    ├── propertyConfig = { bedrooms: 3, bathrooms: 2 }           │
│    └── rebuildForm()                                            │
│           │                                                     │
│           ▼                                                     │
│  RoomFactory.createRoomsForProperty(serviceType, config)        │
│    │                                                            │
│    ├── For each room in config:                                 │
│    │     RoomClass = RoomRegistry.get('Bedroom')                │
│    │     room = new RoomClass({                                 │
│    │       serviceType: 'eot',                                  │
│    │       variant: 'master',                                   │
│    │       number: 1                                            │
│    │     })                                                     │
│    │     items = room.getItems()  ◄── Fetches from ITEM_DEFINITIONS.eot.bedroom
│    │                                                            │
│    └── Returns array of Room instances                          │
│           │                                                     │
│           ▼                                                     │
│  AysRoomOrchestrator.renderRooms(rooms)                         │
│    └── Creates AysDisclosureRoomCard per room                   │
│           │                                                     │
│           ▼                                                     │
│  HTML rendered to #rooms-container                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Phases

### Phase 1: Move Service Type Dropdown (Quick Win)
**Effort: 1 hour | Risk: Low**

Currently the Service Type dropdown is in the Quotes tab, buried after client info. Move it to be:
- Part of the main header/toolbar
- Visible on ALL tabs
- The FIRST decision the user makes

**UI Change:**
```
┌──────────────────────────────────────────────────────────────┐
│  AYS Checklist                                               │
│  ┌─────────────────────────────────────────────┐             │
│  │ Service: [End of Tenancy ▼]                 │   [New Quote]│
│  └─────────────────────────────────────────────┘             │
├──────────────────────────────────────────────────────────────┤
│  [EOT] [Residential] [Commercial] [Custom] [Quotes] [System] │
├──────────────────────────────────────────────────────────────┤
│  Client: ________  Phone: ________  Address: ________        │
├──────────────────────────────────────────────────────────────┤
│  🛏 Bedroom 1                                    [☑ All]      │
│    ☑ Ceiling cobwebs                                         │
│    ☑ Light fittings                                          │
└──────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Service type is prominent
- Client info stays together
- Form content changes based on service type

---

### Phase 2: Wire Service Type → Form Rebuild (Core Change)
**Effort: 4 hours | Risk: Medium**

When service type changes:
1. Save current form state
2. Look up rooms for service type from ITEM_DEFINITIONS
3. Instantiate Room classes via RoomRegistry
4. Render new form
5. Restore compatible state where possible

**New Component: `QuoteOrchestrator`**
```javascript
class QuoteOrchestrator {
  constructor() {
    this.currentQuoteId = null;
    this.serviceType = null;
    this.propertyConfig = {};
    this.rooms = [];
  }

  setServiceType(serviceType) {
    this.serviceType = serviceType;
    this.rebuildForm();
  }

  rebuildForm() {
    // 1. Create room instances from RoomRegistry
    this.rooms = RoomFactory.createRoomsForProperty(
      this.serviceType,
      this.propertyConfig
    );

    // 2. Render each room
    const container = document.getElementById('rooms-container');
    container.innerHTML = '';
    
    this.rooms.forEach(room => {
      const orchestrator = new AysRoomOrchestrator(room);
      orchestrator.render(container);
    });
  }
}
```

---

### Phase 3: Deprecate Templates (Cleanup)
**Effort: 2 hours | Risk: Low**

Once the OOP flow is working:
1. Mark templates as `@deprecated` in comments
2. Add console warnings if templates are used
3. Eventually remove template code

---

### Phase 4: Add Quote Auto-Increment Flow
**Effort: 3 hours | Risk: Medium**

When "New Quote" is clicked:
```
┌─────────────────────────────────────────────────────────────────┐
│  NEW QUOTE FLOW                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User clicks [+ New Quote]                                      │
│           │                                                     │
│           ▼                                                     │
│  QuoteStorage.save({}) → Returns auto-increment ID              │
│    └── id: 147                                                  │
│           │                                                     │
│           ▼                                                     │
│  QuoteOrchestrator.startQuote(147)                              │
│    ├── this.currentQuoteId = 147                                │
│    ├── Clear form                                               │
│    ├── Show "Quote #147" in header                              │
│    └── Prompt for service type                                  │
│           │                                                     │
│           ▼                                                     │
│  User selects "End of Tenancy"                                  │
│           │                                                     │
│           ▼                                                     │
│  QuoteOrchestrator.setServiceType('eot')                        │
│    └── Rebuild form with EOT items                              │
│           │                                                     │
│           ▼                                                     │
│  Every change → auto-save to QuoteStorage                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pros and Cons

### Pros of OOP Migration

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | All items in `ITEM_DEFINITIONS.js` - no templates |
| **Polymorphism** | Different room behavior per service type (EOT Bedroom != Residential Bedroom) |
| **Extensibility** | Add new service types by adding to ITEM_DEFINITIONS |
| **Testability** | Room classes can be unit tested in isolation |
| **Type Safety** | Room classes enforce required fields (roomId, serviceType, variant) |
| **Serialization** | `room.serialize()` gives consistent quote line items |

### Cons / Risks

| Risk | Mitigation |
|------|------------|
| **Breaking existing quotes** | Keep snapshot schema backward-compatible |
| **Increased complexity** | Document the new flow clearly |
| **Learning curve** | Good JSDoc + examples in code |
| **Parallel systems during migration** | Feature flag to switch between old/new |

---

## File Changes Required

### Files to Modify

| File | Changes |
|------|---------|
| `checklist-modern.html` | Move service type dropdown to header |
| `checklist-script.js` | Add service type change listener, call QuoteOrchestrator |
| `AysChecklistFormFactory.js` | Wire to use Room classes instead of templates |

### New Files to Create

| File | Purpose |
|------|---------|
| `QuoteOrchestrator.js` | Manages quote lifecycle and form state |
| `RoomFactory.js` | Creates Room instances for a property config |

### Files to Deprecate (Phase 3)

| File | Status |
|------|--------|
| Template constants in `checklist-config.js` | Mark deprecated, then remove |

---

## Service Type → Rooms Mapping

The `QuoteOrchestrator` needs to know which rooms to create for each service type:

```javascript
const SERVICE_TYPE_ROOMS = {
  'eot': [
    { type: 'Kitchen', variant: 'standard', count: 1 },
    { type: 'Bedroom', variant: 'master', count: 1 },
    { type: 'Bedroom', variant: 'single', countFromConfig: 'numBedrooms - 1' },
    { type: 'Bathroom', variant: 'ensuite', countFromConfig: 'numBathrooms' },
    { type: 'LivingArea', variant: 'standard', count: 1 },
    { type: 'Laundry', variant: 'standard', count: 1 },
    { type: 'Garage', variant: 'single', count: 1 },
    { type: 'Outdoor', variant: 'standard', count: 1 }
  ],
  'residential': [
    // Similar but fewer items per room
  ],
  'commercial': [
    { type: 'Reception', variant: 'standard', count: 1 },
    { type: 'Office', variant: 'standard', countFromConfig: 'numOffices' },
    { type: 'Boardroom', variant: 'standard', count: 1 },
    // ...
  ]
};
```

---

## Data Flow: Service Type Selection to Rendered Items

```
User clicks "End of Tenancy"
        │
        ▼
QuoteOrchestrator.setServiceType('eot')
        │
        ▼
RoomFactory.createRoomsForProperty('eot', { bedrooms: 3, bathrooms: 2 })
        │
        ├── RoomRegistry.get('Kitchen') → Kitchen class
        │     └── new Kitchen({ serviceType: 'eot', variant: 'standard' })
        │           └── getItems() → ITEM_DEFINITIONS.eot.kitchen (47 items)
        │
        ├── RoomRegistry.get('Bedroom') → Bedroom class
        │     └── new Bedroom({ serviceType: 'eot', variant: 'master' })
        │           └── getItems() → ITEM_DEFINITIONS.eot.bedroom (32 items)
        │
        └── ... more rooms ...
        │
        ▼
Array of Room instances, each with their items
        │
        ▼
AysRoomOrchestrator.renderRooms(rooms)
        │
        ▼
AysDisclosureRoomCard rendered for each room
```

---

## Quick Start: Implementing Phase 1

### Step 1: Move the dropdown

In `checklist-modern.html`, find the service type dropdown (line ~1970) and move it to the header area (line ~68).

### Step 2: Make it global

Add an event listener that fires on change:
```javascript
document.getElementById('quote-service-type').addEventListener('change', function(e) {
  const serviceType = e.target.value;
  // Map UI values to internal keys
  const typeMap = {
    'end-of-tenancy': 'eot',
    'residential': 'residential',
    'commercial': 'commercial'
  };
  QuoteOrchestrator.setServiceType(typeMap[serviceType]);
});
```

### Step 3: Show the current quote ID

Add a display in the header:
```html
<span id="current-quote-display">Quote #—</span>
```

Update when quote changes:
```javascript
QuoteOrchestrator.on('quoteChange', (id) => {
  document.getElementById('current-quote-display').textContent = `Quote #${id}`;
});
```

---

## Appendix: Existing Components That Are Ready

| Component | Status | Notes |
|-----------|--------|-------|
| `Room.js` | ✅ Ready | Base class with `getItems()` abstract method |
| `Bedroom.js` | ✅ Ready | Has `normalizeToArray()` for flat EOT objects |
| `Bathroom.js` | ✅ Ready | Has `normalizeToArray()` |
| `Kitchen.js` | ✅ Ready | Has `normalizeToArray()` |
| `Garage.js` | ✅ Ready | Newly created with pattern |
| `RoomRegistry.js` | ✅ Ready | 27 room types registered |
| `ITEM_DEFINITIONS.js` | ✅ Ready | EOT definitions for all rooms |
| `AysRoomOrchestrator.js` | ✅ Ready | Bridges Room ↔ AysDisclosureRoomCard |
| `AysDisclosureRoomCard.js` | ✅ Ready | Renders room UI |

---

## Recommended Execution Order

1. **Phase 1** (Today) - Move dropdown, visible win
2. **Phase 2** (Next session) - Wire the flow end-to-end
3. **Phase 4** (Same session) - Auto-increment quotes
4. **Phase 3** (Later) - Cleanup deprecated templates

This order prioritizes visible progress and defers cleanup until the new system is proven.
