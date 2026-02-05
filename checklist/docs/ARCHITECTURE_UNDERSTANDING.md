# ARCHITECTURE UNDERSTANDING - Complete System Map

**Date**: January 4-5, 2026  
**Status**: Comprehensive Reading Complete  
**Purpose**: Document what has been built and how it all fits together

---

## 1. THE COMPLETE OBJECT HIERARCHY

### CLASSES (Room-Based)
- **Room** (Base class)
  - **Kitchen** (extends Room)
  - **Bedroom** (extends Room)
  - **Bathroom** (extends Room)
  - **LivingArea** (extends Room)
  - **Laundry** (extends Room)
  - [Future: Other room types as needed]

### CLASSES (Service-Based)
- **PropertyService** (Base class for property-wide services)
  - **PropertyWindowService** (extends PropertyService)
  - **PropertyCarpetService** (extends PropertyService)
  - **PropertyGardeningService** (extends PropertyService)
  - [Future: PropertyPlumberService, PropertyElectricalService, etc.]

### ORCHESTRATORS (UI Management)
- **AysRoomOrchestrator** - Wraps a Room instance, manages its AysDisclosureRoomCard
- **PropertyServiceOrchestrator** - Wraps a PropertyService instance, manages its disclosure card

### COMPONENTS (UI Rendering)
- **AysDisclosureRoomCard** - Renders collapsible details/summary for rooms
- **AysListItemCheckbox** (renamed **AysItemCheckbox**) - Single checkbox item
- **AysServiceToggleRenderer** - Renders conditional service toggles based on property type
- **AysChecklistFormFactory** - Factory that generates rooms and services from CHECKLIST_CONFIG

### PATTERNS (Data Management)
- **AysQuoteEnvelope** - Wraps complete quote data for database storage
- **AysPropertyType** - Polymorphic type hierarchy defining property types & their structure
- **PropertyServiceOrchestrator** - Orchestrates disclosure cards for services

---

## 2. KEY ARCHITECTURAL PRINCIPLES

### 2.1 SOLID Principles Applied

**Single Responsibility**:
- Room knows: own items, own features
- Factory knows: how to generate rooms
- Orchestrator knows: how to manage UI state
- Envelope knows: how to serialize data

**Open/Closed**:
- New room types extend Room class (don't modify existing)
- New services extend PropertyService (don't modify existing)
- Factory uses polymorphism (same code for all types)

**Liskov Substitution**:
- Any Room subclass works where Room is expected
- Any PropertyService subclass works where PropertyService is expected
- Factory doesn't need to know specific types—just calls getItems()

**Interface Segregation**:
- Room has small interface: getItems(), renderItems(), serialize()
- PropertyService has small interface: getItems(), applyParameterModifications()
- Orchestrator has focused interface: render(), getCheckedItems(), serialize()

**Dependency Inversion**:
- Factory depends on abstractions (Room base class)
- Not on concrete implementations (Kitchen, Bedroom, etc.)
- Components use dependency injection (pass dependencies in constructor)

### 2.2 Polymorphism: The Core Design Pattern

**Type Hierarchy**: property_type determines EVERYTHING
```
property_type = 'residential_3bed'
  ↓ reads from AysPropertyType.TYPES['residential_3bed']
  ↓ determines: Bedroom × 3, Bathroom × 2, Kitchen, LivingArea, Laundry
  ↓ determines: available services = ['windows', 'carpet', 'gardening']
  ↓ Factory generates only these rooms + these service toggles
  ↓ No conditional logic, no if/else bloat—pure polymorphism

property_type = 'commercial_gym'
  ↓ reads from AysPropertyType.TYPES['commercial_gym']
  ↓ determines: Showers × N, LockerRooms, Toilet, Lunchroom
  ↓ determines: available services = ['windows'] (no carpet, no gardening)
  ↓ Factory generates only these rooms + these toggles
  ↓ Same code, different output—that's polymorphism
```

### 2.3 Factory Pattern: Dynamic Generation

**Why Factory exists**:
- Property size determines room count (1, 2, 3... bedrooms)
- Service type determines room types (Bedrooms vs. Offices vs. Showers)
- Settings toggles determine which optional services appear
- All of this is dynamic—can't hardcode 700 lines of HTML

**What Factory does**:
1. Reads PROPERTY_CONFIG.property_type
2. Gets room configs from AysPropertyType
3. Creates Room instances (Bedroom, Bathroom, Kitchen, etc.)
4. Wraps each in AysRoomOrchestrator
5. Gets available services from AysPropertyType
6. Creates PropertyService instances (if toggles enabled)
7. Wraps each in PropertyServiceOrchestrator
8. Returns collection ready to render

### 2.4 Settings vs. Form Boundary

**Settings** (Big Structural Choices - LOCKED):
- property_type (residential_3bed, commercial_gym, etc.)
- service toggles (include_windows_cleaning: true/false)
- pricing/rates (all prices, production rates, difficulty multipliers)
- Property size (bedrooms, bathrooms, office count—determines form structure)

**Form** (Small Item-Level Choices - CHANGEABLE):
- Which items are checked (toggles on/off)
- Notes/custom observations
- Variant selections (Oven: single vs. double, 1-8 count)
- Parameter updates (carpet: 2-6 rooms, stain count, etc.)

**Critical**: Changing Settings regenerates entire form. Changing Form just updates checkboxes.

### 2.5 Naming Convention

**Format**: `Ays[Function][Object][Type]`

Examples:
- **AysDisclosureRoomCard** = Ays [Render] [Room] [Card]
- **AysListItemCheckbox** / **AysItemCheckbox** = Ays [Check] [Item] [Checkbox]
- **AysRoomOrchestrator** = Ays [Manage] [Room] [Orchestrator]
- **PropertyServiceOrchestrator** = [Manage] [PropertyService] [Orchestrator]
- **AysServiceToggleRenderer** = Ays [Render] [Service Toggle] [Renderer]
- **AysChecklistFormFactory** = Ays [Generate] [ChecklistForm] [Factory]
- **AysPropertyType** = Ays [Classify] [Property] [Type] (polymorphic registry)

---

## 3. DATA FLOW: Complete Journey

### 3.1 Initialization (Page Load)

```
checklist-modern.html
  ↓ loads <script> files in order:
    1. SETTINGS_DEFAULTS.js (default values)
    2. ITEM_DEFINITIONS.js (all items for all rooms/services)
    3. AysPropertyType.js (polymorphic type registry)
    4. PROPERTY_CONFIG.js (current user settings)
    5. AysChecklistFormFactory.js (room/service generator)
    6. Room.js (base class)
    7. Kitchen.js, Bedroom.js, Laundry.js, LivingArea.js (room subclasses)
    8. PropertyService.js (base service class)
    9. PropertyCarpetService.js, PropertyWindowService.js, etc. (service subclasses)
    10. AysRoomOrchestrator.js (room UI manager)
    11. PropertyServiceOrchestrator.js (service UI manager)
    12. AysDisclosureRoomCard.js (card renderer)
    13. AysItemCheckbox.js (checkbox renderer)
    14. AysServiceToggleRenderer.js (toggle renderer)
    15. AysQuoteEnvelope.js (serializer)
    16. checklist-script.js (initialization & event handlers)
  ↓
checklist-script.js runs:
  1. Checklist.init() ← CRITICAL: initializes everything
  2. Loads PROPERTY_CONFIG from localStorage
  3. Calls AysChecklistFormFactory.generate(CHECKLIST_CONFIG)
  4. Factory creates Room instances + wraps in AysRoomOrchestrator
  5. Each orchestrator creates AysDisclosureRoomCard
  6. Card renders items as AysItemCheckbox instances
  7. All DOM nodes appended to #rooms-container
  8. Event handlers bound (checkbox change, etc.)
  9. Calls AysServiceToggleRenderer.render()
  10. Service toggles appear in #service-toggles-container
```

### 3.2 User Changes Property Type

```
User selects "commercial_gym" in Settings
  ↓
PROPERTY_CONFIG.setPropertyType('commercial_gym')
  ↓
AysPropertyType.getType('commercial_gym') returns config
  ↓
Factory regenerates CHECKLIST_CONFIG
  ↓
AysChecklistFormFactory.regenerate(newConfig)
  ↓
  1. Clear #rooms-container
  2. Create NEW Shower instances (not Bedroom)
  3. Create NEW LockerRoom instances
  4. Create NEW Toilet instances
  5. Create NEW Lunchroom instances
  6. Wrap each in AysRoomOrchestrator
  7. Render all cards to DOM
  8. Bind events
  ↓
AysServiceToggleRenderer.render()
  ↓
  1. Get available services for 'commercial_gym'
  2. Return: ['windows'] (no carpet, no gardening for gym)
  3. Render ONLY windows toggle
```

### 3.3 User Toggles a Service (e.g., Windows Cleaning)

```
User checks "Include Windows Cleaning" toggle
  ↓
Toggle change event fires
  ↓
checklist-script.js handler:
  1. Save toggle state: localStorage['checklist_include_windows_cleaning'] = true
  2. Update PROPERTY_CONFIG
  3. Regenerate CHECKLIST_CONFIG
  4. AysChecklistFormFactory.regenerate(newConfig)
  5. New config includes PropertyWindowService instance
  6. Factory creates PropertyWindowService
  7. Wraps in PropertyServiceOrchestrator
  8. Renders disclosure card to DOM
```

### 3.4 User Selects Carpet Cleaning Parameters

```
User selects "5-room package" in carpet cleaning disclosure
  ↓
Parameter change event fires
  ↓
PropertyServiceOrchestrator.updateParameter('roomCount', 5)
  ↓
PropertyCarpetService.updateParameter('roomCount', 5)
  ↓
PropertyCarpetService.renderItems() re-calculates
  ↓
  1. Looks up ITEM_DEFINITIONS.commercial.carpet_cleaning['base_5_room']
  2. Applies parameter modifications (no stains, no protection, no extras)
  3. Returns updated items array
  4. PropertyServiceOrchestrator updates disclosure card UI
```

### 3.5 User Submits Quote

```
User clicks "Generate Quote" button
  ↓
checklist-script.js handler collects all data:
  1. Get all AysRoomOrchestrator instances
  2. Call serialize() on each
  3. Collect all checked items from all rooms
  4. Get all PropertyServiceOrchestrator instances
  5. Call serialize() on each
  6. Collect special service data
  ↓
Create AysQuoteEnvelope instance
  ↓
  1. setClient(name, email, client_id, population_id)
  2. setAddress(7 address fields)
  3. setService(service_type, booking_date)
  4. setCrew(crew_name, staff_count)
  5. setProperty(numBedrooms, numBathrooms)
  6. addRooms([all orchestrator.serialize() results])
  7. addServices([all service serializations])
  8. Calculate totals (hours, price, tax)
  ↓
AysQuoteEnvelope.serialize()
  ↓
Complete JSON packet with all context
  ↓
Send to backend (email, database, webhook, etc.)
```

---

## 4. FILE ORGANIZATION

### Data Files
```
js/data/
  SETTINGS_DEFAULTS.js          ← Default values for all pricing/settings
  ITEM_DEFINITIONS.js           ← All items for all room types/services
  checklist-config.js           ← CHECKLIST_CONFIG object + builder
```

### Patterns (Logical Containers)
```
js/patterns/
  PropertyService.js            ← Base class for property-wide services
  PropertyCarpetService.js      ← Carpet cleaning service
  PropertyWindowService.js      ← Window cleaning service
  PropertyGardeningService.js   ← Gardening service
  PropertyServiceOrchestrator.js  ← UI manager for services
  AysQuoteEnvelope.js           ← Quote serialization
  AysPropertyType.js            ← Polymorphic type hierarchy
```

### Classes (Room Types)
```
js/classes/
  Room.js                       ← Base room class
  Bedroom.js                    ← Bedroom room type
  Bathroom.js                   ← Bathroom room type
  Kitchen.js                    ← Kitchen room type
  LivingArea.js                 ← Living area room type
  Laundry.js                    ← Laundry room type
```

### Components (UI Rendering)
```
js/components/
  AysDisclosureRoomCard.js      ← Card container (details/summary)
  AysItemCheckbox.js            ← Single checkbox item
  AysRoomOrchestrator.js        ← Room UI manager
  AysServiceToggleRenderer.js   ← Service toggles renderer
  AysChecklistFormFactory.js    ← Factory that generates form
```

### Main App File
```
js/
  checklist-script.js           ← Initialization, event handlers, coordination
  event-worker.js               ← Web worker for offline queue
```

---

## 5. EXTENSIBILITY PATHS

### Add a New Room Type

```javascript
// 1. Create class/classes/GrannyFlat.js
class GrannyFlat extends Room {
  getItems() {
    // Look up ITEM_DEFINITIONS[this.serviceType]['granny_flat'][this.variant]
  }
}

// 2. Add to ITEM_DEFINITIONS.js
const ITEM_DEFINITIONS = {
  residential: {
    granny_flat: {
      studio: [ { itemId, label, hours }, ... ],
      one_bed: [ { itemId, label, hours }, ... ]
    }
  }
}

// 3. Add to AysPropertyType.js
static TYPES = {
  'residential_with_granny_flat': {
    name: 'Residential with Granny Flat',
    rooms: ['Bedroom', 'Bedroom', 'Bathroom', 'Kitchen', 'GrannyFlat'],
    config: { numBedrooms: 2, hasGrannyFlat: true }
  }
}

// 4. Factory automatically generates it (no code change needed!)
```

### Add a New Service Type

```javascript
// 1. Create class js/patterns/PropertyGutterService.js
class PropertyGutterService extends PropertyService {
  getItems() {
    // Look up ITEM_DEFINITIONS.commercial.gutter_cleaning[variant]
  }
  applyParameterModifications(items) {
    // Multiply by linear_meters parameter
  }
}

// 2. Add to ITEM_DEFINITIONS.js
const ITEM_DEFINITIONS = {
  commercial: {
    gutter_cleaning: {
      base_item: { itemId, label, baseHours, priceSetting }
    }
  }
}

// 3. Add to SETTINGS_DEFAULTS.js
include_gutter_cleaning: true,
gutter_base_hour_price: 0,
gutter_per_meter_surcharge: 0,

// 4. Add to AysPropertyType.js
availableServices: ['windows', 'carpet', 'gutter_cleaning']

// 5. Factory automatically includes it in toggles (no code change!)
```

---

## 6. CRITICAL INSIGHTS

### 6.1 Promise-Based Loading

AysServiceToggleRenderer uses `waitForDependency()` pattern:
- Waits up to 5 seconds for ITEM_DEFINITIONS to load
- Non-blocking (yields to browser with `setTimeout(0)`)
- Never silent failures—throws errors if timeout
- Handles slow 4G/3G devices

```javascript
await waitForDependency('ITEM_DEFINITIONS', 5000);
// Only proceeds once ITEM_DEFINITIONS is loaded
```

### 6.2 Settings as Source of Truth

All prices reference SETTINGS keys, not hardcoded values:
```javascript
// IN ITEM_DEFINITIONS:
{ priceSetting: 'window_large_pane_price' }

// AT RUNTIME:
const actualPrice = SETTINGS['window_large_pane_price'] ?? SETTINGS_DEFAULTS['window_large_pane_price'];
```

This allows:
- Users to update prices in Settings tab without code changes
- Prices to evolve over time (inflation, market changes)
- A/B testing different pricing models

### 6.3 Difficulty Multiplier (Settings Decision)

Difficulty is NOT a form choice—it's a Settings decision that:
- Multiplies all base hours
- Adds special items (harder items for hard difficulty)
- Changes price calculations

```javascript
// If PROPERTY_CONFIG.difficulty = 'hard' (1.5x multiplier)
base_hours = 20;
actual_hours = 20 * 1.5 = 30;  // Plus special hard-difficulty items added
```

### 6.4 Room State Management

Each room tracks:
- Which items are checked (itemId → boolean)
- Notes per room
- Custom services added
- Timestamp of last change

All persisted to localStorage and restored on page reload.

### 6.5 Quote Envelope Design

Single responsibility: **wrap and serialize**
- Builds complete JSON packet
- No business logic (pricing, calculation)
- Just shapes data for database
- Backend receives complete context (customer ID, address, items, crew, totals)

---

## 7. WHAT'S BEEN BUILT (Complete Inventory)

### ✅ COMPLETE
- Promise-based ITEM_DEFINITIONS loading
- Settings-driven architecture (property type determines structure)
- AysPropertyType polymorphic registry
- Room base class + 5 room subclasses (Kitchen, Bedroom, Bathroom, LivingArea, Laundry)
- PropertyService base class + 3 service subclasses (Carpet, Window, Gardening)
- AysRoomOrchestrator (room UI manager)
- PropertyServiceOrchestrator (service UI manager)
- AysDisclosureRoomCard (collapsible card component)
- AysItemCheckbox (single checkbox)
- AysChecklistFormFactory (generates form from config)
- AysServiceToggleRenderer (renders conditional toggles)
- AysQuoteEnvelope (serializes complete quote)
- localStorage persistence + restore

### 🟡 IN PROGRESS
- Understanding how all pieces fit together (THIS DOCUMENT)

### 🔴 NOT YET BUILT
- Settings UI components (size inputs, dropdowns, etc.)
- Backend integration (send quotes to database)
- Supervisor time tracking UI
- Quote preview/confirmation UI
- Admin dashboard/analytics

---

## 8. KEY TAKEAWAYS

1. **Everything extends from SOLID principles** - No arbitrary code, every class has one job
2. **Polymorphism is the core pattern** - property_type determines EVERYTHING
3. **Factory generates form dynamically** - No hardcoding 700+ lines of HTML
4. **Settings drives structure, Form drives content** - Two different boundaries
5. **Orchestrators manage state** - Each room/service owns its UI state
6. **Promise-based initialization** - Handles slow networks gracefully
7. **Single JSON packet carries all context** - Database receives complete information
8. **Extensibility via inheritance** - New room/service types just extend base classes
9. **Settings are the source of truth** - Prices, toggles, difficulty all in one place
10. **localStorage enables offline** - User can work without internet, sync when online

---

**This document is the complete mental model of the system.**
**All code reads/writes should reference this architecture.**
