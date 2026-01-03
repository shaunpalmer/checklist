# Component Naming Audit & Rename Roadmap

**Date**: January 3, 2026  
**Purpose**: Identify all current classes/components and map to new `Ays[Function][Object][Type]` convention  
**Status**: Ready for implementation (applies AYS family naming)

---

## Current State → Target State Mapping

### EXISTING COMPONENTS

| Current Name | Location | Current Issue | Target Name | Function | Object | Type | Notes |
|---|---|---|---|---|---|---|---|
| **AysDisclosureCard** | `components/AysDisclosureCard.js` | ✅ Has "Ays" prefix, but "DisclosureCard" is generic | **AysRoomDisclosureCard** | Display | Room | Disclosure Card | Renamed to clarify it's specifically for rendering rooms |
| **AysListItemCheckbox** | `components/AysListItemCheckbox.js` | ✅ Has "Ays" prefix, but "ListItem" is vague | **AysItemCheckbox** | Check | Item | Checkbox | Shorter, clearer—it's a checklist item that is a checkbox |
| **AysRoomSection** | `components/AysRoomSection.js` | ✅ Has "Ays" prefix, purpose is clear | **AysRoomSection** | Render | Room | Section | Keep as-is (good naming) |
| **ChecklistPageGenerator** | `generators/checklistPageGenerator.js` | ❌ No "Ays" prefix, too generic ("Page"?) | **AysChecklistFormFactory** | Generate | Checklist Form | Factory | Clarity: generates form from config; Factory is the OOP type |
| **Envelope** | `patterns/Envelope.js` | ⚠️ No "Ays" prefix (pattern library) | **AysQuoteEnvelope** | Package | Quote | Envelope | Clarifies it's for quoting, wraps the complete payload |

---

### SETTINGS UI COMPONENTS (NOT YET BUILT)

These need to be built with correct naming from day 1:

| Target Name | Function | Object | Type | Purpose | Status |
|---|---|---|---|---|---|
| **AysServiceTypeDropdown** | Select | Service Type | Dropdown | Choose EOT / Residential / Commercial | To Build |
| **AysPropertySizeInput** | Configure | Property Size | Number Input | Set bedrooms, bathrooms count | To Build |
| **AysRoomVariantDropdown** | Select | Room Variant | Dropdown | Master vs. Guest; Ensuite vs. Family | To Build |
| **AysSubFeaturesMultiselect** | Select | Sub-Features | Multiselect | Double shower, heated floor, walk-in closet | To Build |
| **AysDifficultyDropdown** | Select | Difficulty | Dropdown | Easy / Standard / Hard | To Build |
| **AysStaffThresholdInput** | Configure | Staff Threshold | Number Input | Hours per person | To Build |
| **AysStaffCalculatorDisplay** | Display | Staff Count | Calculation Card | Real-time "You need X staff" feedback | To Build |
| **AysLocationDropdown** | Select | Location | Dropdown | City / Regional / Rural | To Build |

---

### ADDITIONAL FORM UI COMPONENTS (NOT YET BUILT)

| Target Name | Function | Object | Type | Purpose | Status |
|---|---|---|---|---|---|
| **AysRoomNotesTextarea** | Input | Room Notes | Textarea | Notes specific to entire room | To Build |
| **AysItemNotesTextarea** | Input | Item Notes | Textarea | Notes specific to one item | To Build |
| **AysCustomItemForm** | Create | Custom Item | Form Card | Add discovered custom items | To Build |
| **AysCustomItemNameInput** | Input | Custom Item Name | Text Input | Name the custom item | To Build |
| **AysCustomItemHoursInput** | Input | Custom Item Hours | Number Input | Estimate hours for custom item | To Build |
| **AysCustomItemAddButton** | Action | Custom Item | Button | Submit new custom item | To Build |
| **AysMicrophoneButton** | Record | Voice Notes | Button | Record notes via microphone | To Build |

---

### QUOTE/EXPORT UI COMPONENTS (NOT YET BUILT)

| Target Name | Function | Object | Type | Purpose | Status |
|---|---|---|---|---|---|
| **AysTotalsDisplay** | Display | Quote Totals | Summary Card | Total hours, price, items checked | To Build |
| **AysQuoteGenerateButton** | Action | Quote | Button | Submit and generate quote | To Build |
| **AysQuotePreviewCard** | Display | Quote Preview | Card | Show quote before submit | To Build |
| **AysExportFormatDropdown** | Select | Export Format | Dropdown | PDF / JSON / Email, etc. | To Build |

---

### COMPLEX/COMPOSITE COMPONENTS (Multi-Part UI)

These are combinations that appear on the page. Each part is a component, but they work together:

| Composite Name | Parts | Purpose | Example |
|---|---|---|---|
| **AysPropertyConfigForm** | AysPropertySizeInput (beds), AysPropertySizeInput (baths), AysPropertySizeInput (kitchens), AysLocationDropdown | Settings: user configures property dimensions | "3 bedrooms, 2 bathrooms, urban Auckland" |
| **AysRoomVariantConfigSection** | AysRoomVariantDropdown (per room), AysSubFeaturesMultiselect (per room variant) | Settings: user specifies what type each room is | "Bedroom 1: Master with walk-in closet; Bathroom 1: Ensuite with double shower" |
| **AysDifficultyConfigCard** | AysDifficultyDropdown, AysStaffThresholdInput, AysStaffCalculatorDisplay | Settings: user sets difficulty and sees real-time staff impact | "Difficulty: Hard → Need 3 staff (15 hours ÷ 5/person)" |
| **AysCustomItemDiscoveryForm** | AysCustomItemNameInput, AysCustomItemHoursInput, AysCustomItemAddButton | Form: user adds discovered items during walk | "Found extra shower → Add 'Clean extra shower (2 hours)'" |
| **AysItemRowWithNotes** | AysItemCheckbox, AysItemNotesTextarea | Form: user checks item and adds notes | "Dust ceiling [✓] — Notes: Fragile, use soft brush" |
| **AysRoomWithMicrophone** | AysRoomSection, AysMicrophoneButton | Form: user can add voice notes to room | "Master Bedroom [details] [🎤 Record notes]" |
| **AysOvenConfigCombo** | AysOvenCountDropdown (1x, 2x, 3x single/double), AysOvenTypeMultiselect | Settings: user selects oven count AND configuration | User sees: "1 × Single oven" or "2 × Double ovens" + features (like in screenshot) |

---

## The Oven Selector Example (From Screenshot)

This composite component needs a proper name:

```
What User Sees:
┌─────────────────────────────────┐
│ Choose oven...                  │
│ 1 × Single oven                 │
│ 2 × Single ovens                │
│ 3 × Single ovens                │
│ ... up to 8 × Single ovens      │
│ 1 × Double oven                 │
│ 2 × Double ovens                │
│ ... up to 4 × Double ovens      │
└─────────────────────────────────┘
```

This is actually a **composite**:
- **Oven count selector** (Dropdown)
- **Oven type selector** (Single vs. Double)
- **Features for that oven type** (hidden multiselect that appears based on selection)

**Current name**: Unknown (probably hardcoded or part of generic "settings")

**New name**: **AysOvenFixtureCombo** or **AysOvenCountTypeDropdown**
- Function: Select oven fixture configuration
- Object: Oven (fixture)
- Type: Combo (because it's multiple selection methods combined)

Or more precisely: **AysOvenFixtureConfigDropdown**
- Function: Configure oven fixtures
- Object: Oven
- Type: Dropdown (the primary UI element, with cascading sub-selects hidden inside)

---

## Renaming Priority (Phased)

### Phase 1 — CRITICAL (Do First)
These block other work.

- [ ] `ChecklistPageGenerator` → `AysChecklistFormFactory` (everywhere it's imported/instantiated)
- [ ] `AysListItemCheckbox` → `AysItemCheckbox` (simpler, clearer)
- [ ] `AysDisclosureCard` → `AysRoomDisclosureCard` (clarifies purpose)
- [ ] `Envelope` → `AysQuoteEnvelope` (adds Ays family prefix)

**Why first?** These are the core components used by the form. Getting their names right prevents confusing new developers.

### Phase 2 — SETTINGS UI (During Sprint 2)
Build these with correct names from the start.

- [ ] Build `AysServiceTypeDropdown`
- [ ] Build `AysPropertySizeInput`
- [ ] Build `AysRoomVariantDropdown`
- [ ] Build `AysSubFeaturesMultiselect`
- [ ] Build `AysDifficultyDropdown`
- [ ] Build `AysStaffCalculatorDisplay`

### Phase 3 — FORM UI (During Sprint 3)
Build these as form components get wired up.

- [ ] Build `AysItemNotesTextarea`
- [ ] Build `AysRoomNotesTextarea`
- [ ] Build `AysCustomItemForm` (and sub-components)
- [ ] Build `AysMicrophoneButton`

### Phase 4 — QUOTE/EXPORT (During Sprint 4+)
Build these for quote export workflow.

- [ ] Build `AysTotalsDisplay`
- [ ] Build `AysQuotePreviewCard`
- [ ] Build `AysQuoteGenerateButton`

---

## File Renaming (Phase 1)

When renaming components, rename both:
1. The file
2. The class inside
3. All imports/exports
4. All instantiations

| Old File | New File | Old Class | New Class |
|---|---|---|---|
| `components/AysDisclosureCard.js` | `components/AysRoomDisclosureCard.js` | `AysDisclosureCard` | `AysRoomDisclosureCard` |
| `components/AysListItemCheckbox.js` | `components/AysItemCheckbox.js` | `AysListItemCheckbox` | `AysItemCheckbox` |
| `generators/checklistPageGenerator.js` | `generators/AysChecklistFormFactory.js` | `ChecklistPageGenerator` | `AysChecklistFormFactory` |
| `patterns/Envelope.js` | `patterns/AysQuoteEnvelope.js` | `Envelope` | `AysQuoteEnvelope` |

---

## Composite Component Strategy

For complex UI patterns (like the oven selector), establish this pattern:

1. **Build small, single-purpose components first**
   - `AysOvenCountInput` — just the count selector
   - `AysOvenTypeRadio` — single vs. double selector
   - `AysOvenFeaturesMultiselect` — features for that oven type

2. **Wrap them in a composite container**
   - `AysOvenFixtureConfigForm` — brings together count + type + features
   - Or simpler: `AysOvenConfigCombo` if it's a single control

3. **Naming rule for composites**: Describe the assembled purpose

```javascript
❌ AysOvenControl          // Too generic
❌ AysOvenSelector         // Missing specificity

✅ AysOvenFixtureConfigForm   // Clear: configuring oven fixtures
✅ AysOvenCountTypeCombo      // Clear: combining count + type selection
```

The final word should still be the primary UI type:
- If it renders as a form: `...Form`
- If it's a single dropdown with cascading logic: `...Dropdown`
- If it's multiple controls together: `...Combo`

---

## Next Steps

1. **Decide**: Do Phase 1 renaming before or after building the 3-hour sprint foundation?
   - *Recommended*: Do 3-hour sprint first (Room classes), THEN do Phase 1 renaming (less disruption)

2. **Create a mapping document** in the code repo showing old→new names (for git history)

3. **Update all imports** in `checklist-script.js` and any other files that use these components

4. **Document in JSDoc** which components are being deprecated and what they should be replaced with

---

## Why This Matters

Right now, a new developer sees:

```javascript
const generator = new ChecklistPageGenerator();  // What does this generate? A page? A form? Unclear.
const card = new AysDisclosureCard();             // What kind of disclosure? For what? Vague.
const item = new AysListItemCheckbox();           // List item? Checklist item? Something else? Ambiguous.
```

After renaming:

```javascript
const factory = new AysChecklistFormFactory();    // Ah, it builds a form from config. Clear.
const roomCard = new AysRoomDisclosureCard();     // Specifically for rooms. Specific.
const checkbox = new AysItemCheckbox();           // Checklist item that is a checkbox. Precise.
```

The difference is massive for maintainability.

