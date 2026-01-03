# AYS Component Naming Convention

**Date**: January 3, 2026  
**Purpose**: Establish canonical naming for all UI components in the checklist system  
**Principle**: OOP hierarchy—the final word always describes the "type" (what is it?)  

---

## The Pattern

```
Ays[Function][Object][Type]
 │     │        │      │
 │     │        │      └─ What type of UI element? (Dropdown, Checkbox, Textarea, Card, Button, etc.)
 │     │        └───────── What is it for? (Room, Item, Notes, Service, Difficulty, etc.)
 │     └────────────────── What does it do? (Select, Filter, Input, Display, etc.)
 └────────────────────────── Family prefix (AYS = this component system)
```

---

## Why This Matters

**OOP Principle: "Is it an Apple or an Orange?"**

In object-oriented design, the final noun describes the **type**:

```
class Fruit { }
class Apple extends Fruit { }      // ← Apple is the TYPE
class Orange extends Fruit { }     // ← Orange is the TYPE

class Component { }
class Dropdown extends Component { }   // ← Dropdown is the TYPE
class Checkbox extends Component { }   // ← Checkbox is the TYPE
class Textarea extends Component { }   // ← Textarea is the TYPE
```

**So component names work the same way:**

- `AysItemCheckbox` — an Item selector that is a **Checkbox**
- `AysRoomSelectDropdown` — a Room selector that is a **Dropdown**
- `AysNotesTextarea` — a Notes input that is a **Textarea**

The final word is always the **category/type** of UI element.

---

## Component Inventory (Checklist System)

### Settings UI Components

These appear in the Settings tab (user configures property before generating form).

| Component Name | Function | Object | Type | Purpose |
|---|---|---|---|---|
| **AysServiceTypeDropdown** | Select | Service Type | Dropdown | Choose EOT / Residential / Commercial |
| **AysPropertySizeInput** | Configure | Property Size | Number Input | Set bedrooms, bathrooms, kitchens |
| **AysRoomVariantDropdown** | Select | Room Variant | Dropdown | Master vs. Guest; Ensuite vs. Family |
| **AysSubFeaturesMultiselect** | Select | Sub-Features | Multiselect | Double shower, heated floor, walk-in closet, etc. |
| **AysDifficultyDropdown** | Select | Difficulty | Dropdown | Easy / Standard / Hard |
| **AysStaffThresholdInput** | Configure | Staff Threshold | Number Input | Hours per person |
| **AysStaffCalculatorDisplay** | Display | Staff Count | Calculation Card | Real-time "You need X staff" feedback |
| **AysLocationDropdown** | Select | Location | Dropdown | City / Regional / Rural (affects items) |

### Form UI Components

These appear in the Checklist form (user walks property and checks items).

| Component Name | Function | Object | Type | Purpose |
|---|---|---|---|---|
| **AysRoomSection** | Render | Room | Disclosure Card | Collapsible room container (details/summary) |
| **AysItemCheckbox** | Check | Item | Checkbox Row | Individual checklist item with metadata |
| **AysRoomNotesTextarea** | Input | Room Notes | Textarea | Notes specific to entire room |
| **AysItemNotesTextarea** | Input | Item Notes | Textarea | Notes specific to one item |
| **AysCustomItemForm** | Create | Custom Item | Form Card | Add discovered custom items |
| **AysCustomItemInput** | Input | Custom Item Name | Text Input | Name the custom item |
| **AysCustomItemHoursInput** | Input | Custom Item Hours | Number Input | Estimate hours for custom item |
| **AysCustomItemAddButton** | Action | Custom Item | Button | Submit new custom item |
| **AysMicrophoneButton** | Record | Voice Notes | Button with Audio | Record notes via microphone |

### Quote/Export UI Components

These appear when generating or exporting quotes.

| Component Name | Function | Object | Type | Purpose |
|---|---|---|---|---|
| **AysTotalsDisplay** | Display | Quote Totals | Summary Card | Total hours, price, items checked |
| **AysQuoteGenerateButton** | Action | Quote | Button | Submit and generate quote |
| **AysQuotePreviewCard** | Display | Quote Preview | Card | Show quote before submit |
| **AysExportFormatDropdown** | Select | Export Format | Dropdown | PDF / JSON / Email, etc. |

---

## Naming Rules (Canonical)

### Rule 1: Always Start with "Ays"

```javascript
✅ AysItemCheckbox
❌ ItemCheckbox
❌ CheckboxItem
```

This identifies it as part of the AYS family. Namespace collision prevention.

---

### Rule 2: Function + Object + Type (Left to Right)

```javascript
✅ AysSubFeaturesMultiselect
   ├─ Function: Select sub-features
   ├─ Object: Sub-Features (what are we selecting?)
   └─ Type: Multiselect (how is it selected?)

❌ AysMultiselectSubFeatures (type comes first—wrong order)
❌ SubFeaturesAysMultiselect (Ays not at start—wrong)
❌ AysSelectFeatures (too vague, missing object/type clarity)
```

---

### Rule 3: The Type Word is Always Last

The **final word** describes the UI element category. Always.

```javascript
✅ AysRoomVariantDropdown        ← Type: Dropdown
✅ AysNotesTextarea               ← Type: Textarea
✅ AysItemCheckbox                ← Type: Checkbox
✅ AysStaffCalculatorDisplay      ← Type: Display/Card
✅ AysCustomItemAddButton         ← Type: Button
✅ AysMicrophoneButton            ← Type: Button (with audio)
✅ AysQuotePreviewCard            ← Type: Card
```

Never end with Function or Object. **Type is always last.**

---

### Rule 4: Use Specific Type Words

Don't be vague about the UI type.

```javascript
✅ AysItemCheckbox               ← Clear: it's a checkbox
❌ AysItemControl                ← Vague: control could be anything
❌ AysItemComponent              ← Vague: component could be anything

✅ AysRoomSelectDropdown         ← Clear: it's a dropdown
❌ AysRoomSelect                 ← Missing type: is it a dropdown? Buttons? Radio?
❌ AysRoomSelection              ← Missing type clarity

✅ AysNotesTextarea              ← Clear: it's a textarea
❌ AysNotesInput                 ← Missing type: is it a text input? Textarea? Something else?
```

---

### Rule 5: Object Describes the Data/Purpose

The middle part should clearly state **what** the component is for.

```javascript
✅ AysSubFeaturesMultiselect     ← Clear: it's for sub-features
❌ AysMultiselectA               ← Missing object clarity

✅ AysStaffThresholdInput        ← Clear: it's for staff threshold
❌ AysNumberInput                ← Missing object: which number?

✅ AysDifficultyDropdown         ← Clear: it's for difficulty selection
❌ AysPropertyDropdown           ← Too broad: could be location, size, type, etc.
```

---

## UI Type Categories

### Form/Input Types

```
Dropdown        — Single select from list (e.g., AysServiceTypeDropdown)
Multiselect     — Multiple select from list (e.g., AysSubFeaturesMultiselect)
Checkbox        — Yes/no toggle (e.g., AysItemCheckbox)
Radio           — Single select with visible options (rare in checklist)
TextInput       — Text entry (e.g., AysCustomItemInput)
Textarea        — Multi-line text (e.g., AysNotesTextarea)
NumberInput     — Numeric entry (e.g., AysPropertySizeInput)
Button          — Action trigger (e.g., AysMicrophoneButton)
```

### Container/Display Types

```
Card            — Container with optional styling (e.g., AysQuotePreviewCard)
Display         — Read-only calculation/summary (e.g., AysStaffCalculatorDisplay)
Section         — Major grouping (e.g., AysRoomSection)
Panel           — Secondary grouping (less common in checklist)
Modal           — Overlay dialog (if needed)
```

---

## Real Examples (Checklist System)

### Settings Tab

User sees this UI before generating the form:

```html
<div class="settings-form">
  <label>Service Type</label>
  <AysServiceTypeDropdown />
  
  <label>Property Configuration</label>
  <AysPropertySizeInput label="Bedrooms" />
  <AysPropertySizeInput label="Bathrooms" />
  
  <label>Bedroom 1</label>
  <AysRoomVariantDropdown room="bedroom-1" />
  <AysSubFeaturesMultiselect room="bedroom-1" />
  
  <label>Difficulty</label>
  <AysDifficultyDropdown />
  
  <label>Staff Threshold (hours per person)</label>
  <AysStaffThresholdInput />
  
  <!-- Real-time feedback -->
  <AysStaffCalculatorDisplay />
  
  <AysQuoteGenerateButton />
</div>
```

### Form Tab

User sees this UI after generating the form:

```html
<div class="checklist-form">
  <AysRoomSection roomId="bedroom-1">
    <AysItemCheckbox itemId="bed_eot_master_001_..." />
    <AysItemCheckbox itemId="bed_eot_master_002_..." />
    <AysRoomNotesTextarea roomId="bedroom-1" />
  </AysRoomSection>
  
  <AysRoomSection roomId="bathroom-1">
    <AysItemCheckbox itemId="bath_eot_ensuite_001_..." />
    <AysItemCheckbox itemId="bath_eot_ensuite_002_..." />
    <AysRoomNotesTextarea roomId="bathroom-1" />
  </AysRoomSection>
  
  <!-- Discovery -->
  <AysCustomItemForm>
    <AysCustomItemInput />
    <AysCustomItemHoursInput />
    <AysCustomItemAddButton />
  </AysCustomItemForm>
  
  <!-- Voice notes -->
  <AysMicrophoneButton />
  
  <!-- Submit -->
  <AysQuoteGenerateButton />
</div>
```

### Quote Preview

```html
<div class="quote-preview">
  <AysTotalsDisplay />
  <AysQuotePreviewCard />
  <AysExportFormatDropdown />
  <AysQuoteGenerateButton />
</div>
```

---

## Component Class Template

When writing a new component, follow this structure:

```javascript
/**
 * AysItemCheckbox
 * 
 * A single checklist item with checkbox, label, and optional metadata.
 * Part of the AYS component family.
 * 
 * Props:
 *   - itemId (string): Deterministic item identifier
 *   - label (string): Display label
 *   - hours (number): Estimated hours
 *   - checked (boolean): Current state
 *   - onCheck (function): Callback when toggled
 *   - notes (string): Optional user notes
 *   - onNotesChange (function): Callback when notes change
 */
class AysItemCheckbox {
  constructor(config) {
    this.itemId = config.itemId;
    this.label = config.label;
    this.hours = config.hours;
    this.checked = config.checked || false;
    this.notes = config.notes || '';
    
    this.onCheck = config.onCheck || (() => {});
    this.onNotesChange = config.onNotesChange || (() => {});
  }
  
  render() {
    // Return DOM node
  }
  
  bind() {
    // Attach event listeners
  }
}

export default AysItemCheckbox;
```

---

## Migration Guide (If Renaming Existing Components)

If renaming existing components:

- `AysDisclosureCard` → `AysRoomSection` (clearer purpose)
- `AysListItemCheckbox` → `AysItemCheckbox` (shorter, clearer)
- New: `AysStaffCalculatorDisplay` (real-time staff count feedback)
- New: `AysSubFeaturesMultiselect` (settings UI for features)
- New: `AysDifficultyDropdown` (settings UI for difficulty)
- New: `AysQuoteGenerateButton` (submit action)

---

## Why This Matters

1. **Clarity**: Any developer reading `AysSubFeaturesMultiselect` immediately knows:
   - It's part of the AYS system
   - It's for selecting sub-features
   - It's a multiselect UI component

2. **Consistency**: All components follow the same pattern
   - No guessing if it's "ItemCheckbox" or "CheckboxItem"
   - No confusion about whether it's a dropdown or button

3. **OOP Principle**: The final word is the category (type)
   - Reflects inheritance hierarchy
   - Makes code organization clear

4. **Search/Navigation**: Easier to find components
   - All "Dropdown" components end with "Dropdown"
   - All "Checkbox" components end with "Checkbox"
   - IDE autocomplete becomes powerful

---

## Enforcement

Going forward:

- ✅ All new components must follow `Ays[Function][Object][Type]`
- ✅ Component names must end with a UI type (Dropdown, Checkbox, Textarea, Card, Button, Display, Section)
- ✅ Type must never be vague ("Control", "Component", "Element")
- ✅ Ays must always come first
- ✅ Document the purpose in JSDoc comments

