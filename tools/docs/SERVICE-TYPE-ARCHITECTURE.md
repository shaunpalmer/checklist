# Service Type Architecture: Cascading Room Definitions & Multi-Select Variants

**Document Date**: January 3, 2026  
**Purpose**: Explain how Service Type → Room Types → Variants → Multi-Select Features cascade  
**Critical Concept**: Why we need OOP + multi-select for room configuration (not just dropdowns)  
**Status**: Architecture Definition (BEFORE TEMPLATES)

---

## The Cascade Chain (Why This Matters)

```
SERVICE TYPE (user selects)
  ↓ (determines)
AVAILABLE ROOM TYPES
  ↓ (each room has)
VARIANTS (dropdown choices)
  ├─ Single Toilet / Family Bathroom / Ensuite
  ├─ Compact Kitchen / Full Kitchen / Commercial Kitchen
  └─ etc.
  ↓ (variant selection enables)
MULTI-SELECT SUB-FEATURES (context-dependent)
  ├─ Bathroom variants have different fixture options
  ├─ Commercial variants have different equipment options
  ├─ Location (city vs. regional) affects available options
  └─ Service type determines which options apply
  ↓ (Settings object captures all choices)
FACTORY (reads entire Settings hierarchy)
  Generates items based on ServiceType + RoomType + Variant + SubFeatures
```

**Why this hierarchy is mandatory:**
- A Single Toilet doesn't need "clean double shower" as an option
- Commercial kitchens need "clean commercial hood," not residential items
- Rural properties don't need "clean city apartment chimney"
- Each layer constrains what options make sense at the next layer

**This is why templates alone fail**: Templates are static. Settings are dynamic and hierarchical.

---

## 1️⃣ SERVICE TYPE (Top Level)

User selects cleaning service type. This cascades everything below.

### Service Types & Their Room Universe

#### 🏠 END OF TENANCY (EOT)
**Use Case**: Empty property, deep clean before handover  
**Available Room Types**:
- Bedrooms (N) → Variants: Master / Guest / Ensuite
- Bathrooms (N) → Variants: Family Bathroom / Ensuite / Single Toilet
- Kitchen → Variants: Compact / Full / Galley
- Living Room
- Hallway / Stairs / Landing
- WC (Separate toilet)

**Multi-Select Enabled For**:
- Bathrooms (fixtures)
- Kitchen (appliances)
- Special areas (garage, shed, laundry)

**Example Settings Object**:
```json
{
  "serviceType": "EOT",
  "propertyConfig": { "bedrooms": 3, "bathrooms": 2 },
  "roomVariants": {
    "bedroom_1": "master",
    "bedroom_2": "guest",
    "bedroom_3": "guest",
    "bathroom_1": "ensuite",
    "bathroom_2": "family_bathroom",
    "kitchen": "full"
  },
  "roomSubFeatures": {
    "bathroom_1": ["double_shower", "bath", "bidet"],
    "bathroom_2": ["single_shower", "bath"],
    "kitchen": ["oven_single", "dishwasher"]
  }
}
```

---

#### 🏡 RESIDENTIAL
**Use Case**: Occupied home, regular cleaning  
**Available Room Types**:
- Bedrooms (N) → Variants: Master / Guest / Child's Room / Nursery
- Bathrooms (N) → Variants: Family Bathroom / Ensuite / Single Toilet
- Kitchen → Variants: Compact / Full / Galley / Kitchen + Scullery
- Living Room / Dining Room
- Hallway / Stairs / Landing
- Laundry Room
- WC (Separate toilet)

**Multi-Select Enabled For**:
- Bedrooms (special requests: change linens, vacuum under furniture)
- Bathrooms (fixtures)
- Kitchen (appliances)
- Special (laundry setup)

**Example Settings Object**:
```json
{
  "serviceType": "RESIDENTIAL",
  "propertyConfig": { "bedrooms": 4, "bathrooms": 2, "hasLaundry": true },
  "roomVariants": {
    "bedroom_1": "master",
    "bedroom_2": "guest",
    "bedroom_3": "child_room",
    "bedroom_4": "nursery",
    "bathroom_1": "family_bathroom",
    "bathroom_2": "ensuite",
    "kitchen": "full",
    "laundry": "laundry_room"
  },
  "roomSubFeatures": {
    "bedroom_1": ["change_linens", "vacuum_under_bed"],
    "bedroom_4": ["no_change_linens"],
    "bathroom_1": ["double_shower", "bath"],
    "kitchen": ["oven_double", "dishwasher", "rangehood"],
    "laundry": ["wash_linens", "hang_dry"]
  }
}
```

---

#### 🏢 COMMERCIAL - LIGHT
**Use Case**: Small offices, lunch rooms, bathrooms in commercial buildings  
**Available Room Types**:
- Office / Meeting Room → Variants: Small / Medium / Large
- Bathroom → Variants: Single Stall / Multi Stall / Accessible
- Lunch Room / Kitchenette → Variants: Basic / Full
- Hallway / Common Areas
- Lobby / Reception

**Multi-Select Enabled For** (DIFFERENT from EOT/Residential):
- Bathrooms (commercial fixtures, sanitizers, paper towel dispensers)
- Lunch Rooms (commercial appliances, sanitization)
- Offices (special surfaces, equipment)

**Example Settings Object**:
```json
{
  "serviceType": "COMMERCIAL_LIGHT",
  "propertyConfig": { 
    "floors": 2, 
    "offices": 8, 
    "bathrooms": 3,
    "hasLunchRoom": true 
  },
  "roomVariants": {
    "office_1": "small",
    "office_2": "small",
    "office_3": "medium",
    "office_4": "medium",
    "office_5": "medium",
    "office_6": "large",
    "office_7": "large",
    "office_8": "large",
    "bathroom_1": "multi_stall",
    "bathroom_2": "single_stall",
    "bathroom_3": "accessible",
    "lunch_room": "full"
  },
  "roomSubFeatures": {
    "bathroom_1": ["commercial_sanitizer", "paper_dispenser", "soap_dispenser"],
    "bathroom_3": ["ada_compliant_grab_bars", "accessible_sink"],
    "lunch_room": ["commercial_range", "3_compartment_sink", "commercial_fridge"]
  }
}
```

---

## 2️⃣ ROOM TYPES (Second Level)

For each Service Type, certain room types are available. Each room type has variants.

### Example: BATHROOM (varies by service type)

#### EOT Bathroom
**Available Variants**:
1. **Family Bathroom** (1.5 hrs)
   - Multi-select options:
     - Shower type: "Single shower" / "Double shower" / "Bath only" / "Bath + Shower"
     - Fixtures: "Heated towel rail" / "Bidet" / "Double vanity"
   - Example selection: ["double_shower", "bath", "heated_towel_rail"]

2. **Ensuite** (2.0 hrs)
   - Multi-select options:
     - Shower type: "Double shower" / "Rainfall shower" / "Jacuzzi tub"
     - Fixtures: "Heated towel rail" / "Double vanity" / "Bidet" / "Heated floor"
   - Example selection: ["double_shower", "double_vanity", "heated_towel_rail"]

3. **Single Toilet** (0.5 hrs)
   - Multi-select options: NONE (minimal fixtures)
   - Items are fixed

#### Residential Bathroom
**Available Variants** (SAME names, DIFFERENT item counts):
1. **Family Bathroom** (1.0 hrs)
   - Multi-select options: SAME as EOT but with fewer items
   - Example: ["double_shower", "bath"]

2. **Ensuite** (1.5 hrs)
   - Multi-select options: SAME as EOT
   - Example: ["double_shower", "double_vanity"]

3. **Single Toilet** (0.25 hrs)
   - Multi-select options: NONE
   - Items fixed (minimal)

#### Commercial Bathroom
**Available Variants** (COMPLETELY DIFFERENT):
1. **Single Stall** (1.0 hrs)
   - Multi-select options:
     - Sanitizer type: "Automatic hand sanitizer" / "Manual dispenser"
     - Paper: "Paper towel dispenser" / "Hand dryer" / "Both"
   - Example: ["automatic_sanitizer", "paper_dispenser"]

2. **Multi Stall** (2.0 hrs)
   - Multi-select options: SAME + "Stall count"
   - Example: ["automatic_sanitizer", "paper_dispenser", "4_stalls"]

3. **Accessible** (1.5 hrs)
   - Multi-select options:
     - Accessibility features: "Grab bars" / "Accessible sink" / "Accessible toilet"
     - Sanitizer: "Accessible hand sanitizer mount"
   - Example: ["grab_bars", "accessible_sink", "accessible_sanitizer"]

---

### Key Insight: Same Room Type, Different Universes

**Bathroom in EOT**:
- 20-30 items (thorough clean, empty property)
- Multi-selects for shower type, fixture upgrades
- Focus: dust, descale, deep clean

**Bathroom in Residential**:
- 12-18 items (regular clean, occupied)
- Multi-selects for fixture options (similar to EOT)
- Focus: sanitize, wipe, maintain

**Bathroom in Commercial**:
- 15-20 items (sanitation + compliance)
- Multi-selects for commercial equipment, accessibility
- Focus: sanitize, restock, accessible maintenance

**Same room name. Completely different item definitions.**

---

## 3️⃣ VARIANTS (Third Level)

Each room type has variants. Each variant has optional multi-select features.

### Generic Variant Structure

```
Variant: {
  id: "bathroom_ensuite",
  label: "Ensuite",
  applicableServiceTypes: ["EOT", "Residential"],
  baseHours: 2.0,  // EOT; differs by service type
  multiSelectOptions: {
    showerType: [
      { id: "single_shower", label: "Single shower", hours: 0 },
      { id: "double_shower", label: "Double shower", hours: 0.5 },
      { id: "rainfall_shower", label: "Rainfall shower", hours: 0.75 }
    ],
    fixtures: [
      { id: "heated_towel_rail", label: "Heated towel rail", hours: 0.25 },
      { id: "double_vanity", label: "Double vanity", hours: 0.5 },
      { id: "bidet", label: "Bidet", hours: 0.25 }
    ]
  }
}
```

### Why Multi-Select (Not Single Select)?

A bathroom can have:
- Double shower AND heated towel rail AND bidet
- All these affect cleaning time and items
- Single dropdown forces false choice ("pick ONE feature")
- Multi-select accurately captures reality: "this ensuite has [double shower] + [heated floor] + [double vanity]"

Each selected feature can add items:
- "Double shower" → adds "clean inside shower enclosure doors"
- "Heated floor" → adds "clean heating element vents"
- "Double vanity" → adds "clean two basins + mirrors"

---

## 4️⃣ LOCATION CONTEXT (Cross-Cutting)

Some multi-select options depend on **location**, not just room type.

### Example: Different Cities, Different Cleaning Needs

#### 🌙 Urban (Auckland, Wellington)
**Extra multi-select options appear for**:
- Bathrooms: "Clean soot from city air" (fireplace damage)
- Windows: "Clean city pollution residue"
- Kitchen: "Clean grease from city air pollution"

#### 🏞️ Coastal (Blenheim, Nelson)
**Extra multi-select options appear for**:
- Bathrooms: "Descale salt deposits"
- Windows: "Clean salt spray residue"
- All areas: "Clean sand/grit"

#### 🌲 Rural
**Extra multi-select options appear for**:
- Bathrooms: "Remove spider webs (more prevalent)"
- Kitchen: "Remove cooking grease buildup"
- Exterior: "Clean bird droppings"

**In Settings, this means**:
```json
{
  "location": "Auckland",
  "roomSubFeatures": {
    "bathroom_1": ["...", "clean_soot_from_air"],
    "windows": ["clean_city_pollution"],
    "kitchen": ["clean_grease_from_air"]
  }
}
```

---

## 5️⃣ SETTINGS OBJECT (Captures Everything)

The complete Settings object is what the Factory reads to generate items.

```javascript
class QuoteSettings {
  constructor() {
    // Layer 1: Service Type
    this.serviceType = "EOT";  // or "RESIDENTIAL" or "COMMERCIAL_LIGHT"
    
    // Layer 2: Property Config
    this.propertyConfig = {
      bedrooms: 3,
      bathrooms: 2,
      hasLaundry: false,
      hasGarage: true
    };
    
    // Layer 3: Room Variants (dropdown choices per room)
    this.roomVariants = {
      "bedroom_1": "master",
      "bedroom_2": "guest",
      "bedroom_3": "guest",
      "bathroom_1": "ensuite",
      "bathroom_2": "family_bathroom",
      "kitchen": "full",
      "garage": "single_car"
    };
    
    // Layer 4: Room Sub-Features (multi-select choices per room)
    this.roomSubFeatures = {
      "bathroom_1": ["double_shower", "double_vanity", "heated_towel_rail"],
      "bathroom_2": ["single_shower", "bath"],
      "kitchen": ["oven_single", "dishwasher"],
      "garage": ["concrete_floor", "oil_stains"]
    };
    
    // Layer 5: Location Context
    this.location = "Auckland";
    
    // Layer 6: Checked Items (form state)
    this.checkedItems = new Map();  // itemId → { checked: boolean, notes: string }
  }
  
  // Factory will read this object to generate correct items
  toJSON() {
    return {
      serviceType: this.serviceType,
      propertyConfig: this.propertyConfig,
      roomVariants: this.roomVariants,
      roomSubFeatures: this.roomSubFeatures,
      location: this.location,
      checkedItems: Array.from(this.checkedItems)
    };
  }
}
```

---

## 6️⃣ How Factory Reads Settings to Generate Items

```javascript
class ChecklistFactory {
  constructor(settings) {
    this.settings = settings;  // Complete Settings object
  }
  
  generateRooms() {
    const rooms = [];
    
    // For each configured room in propertyConfig
    for (let i = 1; i <= this.settings.propertyConfig.bedrooms; i++) {
      const variant = this.settings.roomVariants[`bedroom_${i}`];
      const subFeatures = this.settings.roomSubFeatures[`bedroom_${i}`] || [];
      
      // Create room with variant + sub-features
      const room = new Bedroom(
        this.settings.serviceType,
        variant,
        subFeatures,
        this.settings.location
      );
      
      rooms.push(room);
    }
    
    // Same for bathrooms, kitchen, etc.
    // Factory reads Settings → creates rooms with correct variant + features
    
    return rooms;
  }
}
```

---

## 7️⃣ Form Controls (Reflect Settings Hierarchy)

### At Settings Tab (User Adjusts Choices)

```
Service Type: [dropdown: EOT / RESIDENTIAL / COMMERCIAL]

Room Configuration:
  ☑ Bedrooms: [3]
  ☑ Bathrooms: [2]
  ☑ Has Laundry: [checkbox]
  
Room Variants (per room):
  Bedroom 1: [Master ▼]
  Bedroom 2: [Guest ▼]
  Bedroom 3: [Guest ▼]
  Bathroom 1: [Ensuite ▼]
  Bathroom 2: [Family Bathroom ▼]
  Kitchen: [Full ▼]
  
Room Sub-Features (multi-select per room):
  Bathroom 1 Features:
    ☑ Double shower
    ☑ Double vanity
    ☑ Heated towel rail
    
  Bathroom 2 Features:
    ☑ Single shower
    ☑ Bath
    
  Kitchen Features:
    ☑ Single oven
    ☑ Dishwasher
```

### Form Updates When Settings Change

1. User changes service type → available room types change
2. User adds bathroom → bathroom variant dropdown appears
3. User selects bathroom variant "Ensuite" → multi-select features appear (shower type, fixtures)
4. User selects sub-features → Factory regenerates items
5. Checked item state persists (by itemId)

---

## Summary: Why This Hierarchy Is Mandatory

| Level | Controls | Example |
|-------|----------|---------|
| **Service Type** | Available room types | EOT excludes laundry; Residential includes it |
| **Property Config** | How many of each room | 3 bedrooms, 2 bathrooms |
| **Room Variants** | Specific room configuration | "Bathroom 1 is Ensuite" vs "Bathroom 2 is Family" |
| **Sub-Features** | Specific features within variant | "Ensuite has double shower + heated floor" |
| **Location** | Context-specific options | "Auckland" enables city-air cleaning |

**Without this hierarchy**, you end up with:
- 50 hardcoded conditionals
- Templates that don't match reality
- Users can't represent their property accurately
- Pricing becomes guesswork

**With this hierarchy**, you have:
- Clean Settings object that Factory can read
- User can adjust any layer, form adapts
- Items generated correctly for any combination
- Pricing is automatic and accurate

---

## Next Steps

1. **Define all Service Type → Room Type → Variant → Sub-Feature mappings** (domain knowledge capture)
2. **Create ROOM_DEFINITIONS.md** mapping this hierarchy to actual room classes
3. **Design Settings UI** (Settings tab that controls all these layers)
4. **Implement Factory** (reads Settings, generates rooms + items)
5. **Build ITEM_TEMPLATES.md** (actual items for each combination)

**Currently**: We're at step 1 (understanding the hierarchy). Don't proceed to steps 2-5 until the domain is fully mapped.
