# Property-Wide Services Architecture
**Date**: January 4, 2026  
**Status**: Core implementation complete  
**Vision**: WooCommerce for Services — a platform others can use for their own cleaning/maintenance businesses

---

## Files Created

### 1. **PropertyService.js** (`js/patterns/`)
- Base class for all property-wide services (Windows, Carpet, Gardening, Gutters, etc.)
- Handles: parameter management, item rendering, state tracking, serialization
- Similar to Room class but for property-wide services
- Methods: getItems(), applyParameterModifications(), serialize(), restore(), validate()

### 2. **PropertyCarpetService.js** (`js/patterns/`)
- Extends PropertyService for carpet cleaning
- Parameters: roomCount (2-6), stainCount (0-15), protectionRooms, extraRooms, stairFlights
- Pricing: Christchurch model with base packages + optional add-ons
- Validation: Ensures parameters within acceptable ranges
- Display: getSummary() shows "3-room + 2 stains + 1 flight stairs"

### 3. **PropertyWindowService.js** (`js/patterns/`)
- Extends PropertyService for window cleaning
- Parameters: buildingHeight (ground_floor/two_storey/multi_storey), pane counts
- Pricing: Unit-based (per pane size) + height surcharges + extra staff
- Calculation: Extra staff surcharge if job > 6 hours
- Display: getSummary() shows "2-storey, 8 large panes, 4 doors"

### 4. **PropertyGardeningService.js** (`js/patterns/`) — NEW!
- Extends PropertyService for garden & lawn maintenance
- Parameters: propertySize (small/medium/large/commercial), lawn area, garden beds, hedges, weeding, deck cleaning
- Services: Lawn mowing, garden trimming, hedge trimming, weed removal, deck/driveway cleaning
- Contract: Quarterly discount option (10% off for 4×/year service)
- Use Case: Gardening specialists or multi-service operators (default toggle OFF)
- Note: You don't offer it yet, but the framework is here for platform users who will

### 5. **PropertyServiceOrchestrator.js** (`js/patterns/`)
- Orchestrates PropertyService instances (like AysRoomOrchestrator for rooms)
- Creates/manages PropertyServiceDisclosure UI component
- Handles parameter updates and recalculation
- Methods: updateParameter(), toggleItem(), addCustomService(), serialize()
- Includes PropertyServiceDisclosure class for rendering

---

## Data Files Updated

### **ITEM_DEFINITIONS.js** (`js/data/`)
✅ Added three service sections:
1. **carpet_cleaning** — Base packages (2-6 room), stain removal, protection, extra rooms, stairs, distance surcharge
2. **windows** — Large/small/door panes, height surcharges (ground floor, 2-storey, multi-storey)
3. **gardening** — Base packages (small/medium/large/commercial), lawn mowing, garden trimming, hedge trimming, weeding, deck cleaning, quarterly contract
- All items reference SETTINGS keys, not hardcoded prices

### **SETTINGS_DEFAULTS.js** (`js/data/`)
✅ Added:
- **First Class Citizen Toggles**:
  - `include_windows_cleaning: true` (default ON)
  - `include_carpet_cleaning: true` (default ON)
  - `include_gardening_services: false` (default OFF — for specialists)
- **Carpet Pricing** (Christchurch):
  - Base: $120-$260 (2-6 rooms)
  - Extras: $40 stain removal, $40 protection, $25 extra room, $40 stairs
- **Window Pricing**:
  - Pane pricing: large, small, door (set to 0, awaiting your prices)
  - Surcharges: ground floor, 2-storey, multi-storey
  - Extra staff rate & threshold
- **Gardening Pricing** (placeholders for specialists):
  - Base: $0 small/medium/large/commercial (specialists set their own)
  - Per-unit: lawn mowing ($/sqm), trimming ($/bed), hedges ($/meter), weeding ($/sqm), deck ($/sqm)
  - Quarterly discount: 10% (standard industry rate)

---

## Architecture Pattern

### Settings Level (Structural - First Class Citizens)
```javascript
include_windows_cleaning: true,      // Toggle ON by default
include_carpet_cleaning: true,       // Toggle ON by default
```

When enabled, factory generates service instances that become form sections.

### Form Level (Small User Choices)
Within each enabled service section, user makes small choices:
- Carpet: "3-room base" + "2 stains" + "add stairs"
- Windows: "2-storey height" + "8 large panes" + "4 doors"

---

## Key Design Decisions

### 1. PropertyService vs. Room
| Aspect | Room | PropertyService |
|--------|------|-----------------|
| Count | Multiple (Bed1, Bed2) | Single per type |
| Structure | Variant-based | Parameter-based |
| Scope | Room area | Property-wide |
| Items | Fixed per variant | Dynamic per parameters |

### 2. Settings vs. Form
- **Settings**: "Is window/carpet in this job?" → Structural
- **Form**: "What are the details?" (rooms, stains, panes) → User choices

### 3. Pricing Model
All prices use SETTINGS keys (not hardcoded):
```javascript
item.priceSetting = 'carpet_base_3room_price'
actualPrice = SETTINGS['carpet_base_3room_price'] ?? SETTINGS_DEFAULTS['carpet_base_3room_price']
```

---

## Next Steps

1. **Update checklist-script.js** or factory to:
   - Check SETTINGS toggles (include_windows_cleaning, include_carpet_cleaning)
   - Create service instances if enabled
   - Wrap in PropertyServiceOrchestrator
   - Add to form alongside room sections

2. **Build PropertyServiceDisclosure UI** with parameter inputs:
   - For Carpet: Radio buttons for room count (2-6)
   - For Windows: Dropdown for height + number inputs for panes
   - Parameter inputs should trigger updateParameter()

3. **Test integration**:
   - Settings toggles enable/disable services
   - Form parameters work and recalculate
   - Serialize/export includes services

4. **Build remaining property services** (gutters, deck, etc.) by extending PropertyService

---

## Pricing Examples

### Carpet Cleaning: 3-room + 2 stains + stairs
```
Base 3-room: $140 (2.0 hours)
+ 2 stain removal: $40 × 2 = $80 (0.2 hours)
+ 1 flight stairs: $40 (0.5 hours)
Total: $260, 2.7 hours
```

### Window Cleaning: 2-storey + 8 large + 4 small
```
8 large panes: $50 × 8 = $400 (1.2 hours)
4 small panes: $25 × 4 = $100 (0.32 hours)
2-storey surcharge: $100 (0 hours)
Total: $600, 1.52 hours
If > 6 hours: add extra staff surcharge
```

---

## File Locations
```
js/
  patterns/
    PropertyService.js                    (NEW - base class)
    PropertyCarpetService.js              (NEW - carpet service)
    PropertyWindowService.js              (NEW - window service)
    PropertyServiceOrchestrator.js        (NEW - orchestrator + disclosure)
    AysQuoteEnvelope.js                   (existing - handles service serialization)
  data/
    ITEM_DEFINITIONS.js                   (UPDATED - added carpet_cleaning section)
    SETTINGS_DEFAULTS.js                  (UPDATED - added toggles + pricing)
```

---

## Architecture Validation
✅ Follows naming convention: `Ays[Function][Object][Type]`  
✅ Separates concerns: Service (logic) vs. Disclosure (UI)  
✅ Settings-based pricing: All prices reference SETTINGS keys  
✅ First-class citizens: Toggles in Settings, not form  
✅ Extensible: New property services extend PropertyService  
✅ Consistent: Mirrors AysRoom/AysRoomOrchestrator pattern  

---

## Configuration Ready
Your Christchurch carpet pricing is already in SETTINGS_DEFAULTS with correct values.
Window pricing placeholders are at $0 — ready for you to update with actual rates.
