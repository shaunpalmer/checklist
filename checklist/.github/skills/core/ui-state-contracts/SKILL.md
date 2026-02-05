# Skill: core.ui-state.contracts

> **Purpose:** Force consistent UI/state relationships — UI reflects state, never defines it.

---

## When to Use

Trigger this skill when:

- Working with tabs, toggles, or mode switching
- Implementing form state management
- Handling hydration (loading saved data into UI)
- Managing visibility or active states

---

## Core Principle

```
┌─────────────────────────────────────────────────────┐
│  STATE is the source of truth                       │
│  UI is a REFLECTION of state                        │
│  UI events TRIGGER state changes                    │
│  State changes CAUSE UI updates                     │
└─────────────────────────────────────────────────────┘

     USER ACTION
          │
          ▼
    ┌──────────┐
    │  EVENT   │  (click, input, change)
    └──────────┘
          │
          ▼
    ┌──────────┐
    │  STATE   │  (update the source of truth)
    └──────────┘
          │
          ▼
    ┌──────────┐
    │   UI     │  (re-render to reflect state)
    └──────────┘
```

---

## Hard Rules

### ✅ DO

1. **State owns truth**
   ```javascript
   // State is the authority
   let activeTab = 'residential';  // SOURCE OF TRUTH
   
   // UI reflects state
   function renderTabs() {
     tabs.forEach(tab => {
       tab.classList.toggle('active', tab.dataset.tab === activeTab);
     });
   }
   ```

2. **Events update state, then UI**
   ```javascript
   tab.addEventListener('click', () => {
     activeTab = tab.dataset.tab;  // Update state FIRST
     renderTabs();                  // Then update UI
     persistState();                // Then persist
   });
   ```

3. **Hydration updates BOTH state and UI**
   ```javascript
   function loadDraft(draft) {
     // 1. Update internal state
     activeTab = draft.serviceType;
     formData = draft.snapshot;
     
     // 2. Update ALL UI elements
     renderTabs();
     renderForm();
     renderLabels();
   }
   ```

### ❌ DON'T

1. **Don't let UI define state**
   ```javascript
   // ❌ Bad: reading state FROM UI
   const activeTab = document.querySelector('.tab.active').dataset.tab;
   
   // ✅ Good: UI reflects state variable
   const activeTab = this.state.activeTab;
   ```

2. **Don't update UI without updating state**
   ```javascript
   // ❌ Bad: cosmetic-only change
   tab.classList.add('active');  // UI changed, state not updated
   
   // ✅ Good: state-driven change
   this.state.activeTab = 'commercial';
   this.renderTabs();
   ```

3. **Don't update state without updating UI**
   ```javascript
   // ❌ Bad: state changed, UI stale
   this.serviceType = 'commercial';  // State updated
   // ... but tabs still show 'residential' as active
   
   // ✅ Good: state + UI in sync
   this.serviceType = 'commercial';
   this.renderServiceTabs();
   ```

---

## Hydration Contract

When loading saved data into the UI, ALL of these must happen:

```javascript
function hydrateFromDraft(draft) {
  // 1. SET INTERNAL STATE
  this.activeDraftId = draft.id;
  this.serviceType = draft.serviceType;
  this.propertyType = draft.propertyType;
  this.formData = draft.snapshot;
  
  // 2. UPDATE UI CONTROLS
  this.renderServiceTabs();      // Correct tab highlighted
  this.renderPropertyDropdown(); // Correct option selected
  this.renderRoomList();         // Correct rooms generated
  this.renderFormFields();       // Correct values filled
  this.renderProgressBars();     // Correct progress shown
  
  // 3. UPDATE LABELS (if mode-dependent)
  this.updateRoomLabels();       // "Office" not "Bedroom"
  this.updateCounterLabels();    // "Offices: 5" not "Bedrooms: 3"
}
```

---

## Mode Switching Contract

When switching modes (e.g., residential → commercial):

```javascript
function switchServiceType(newType) {
  const oldType = this.serviceType;
  
  // 1. Check if structure changes
  if (this.isStructuralChange(oldType, newType)) {
    // Prompt user: "Create new draft?" or "Convert?"
    return this.promptModeSwitch(oldType, newType);
  }
  
  // 2. Update state
  this.serviceType = newType;
  
  // 3. Regenerate dependent structures
  this.regenerateRoomList();
  
  // 4. Update ALL UI
  this.renderServiceTabs();
  this.renderRoomList();
  this.updateLabels();
  
  // 5. Persist
  this.saveSnapshot();
}
```

---

## Anti-Patterns

| Bad | Why | Do Instead |
|-----|-----|------------|
| `$('.tab').addClass('active')` | UI-first, state ignored | Update state, then render |
| Reading active state from DOM | DOM is not source of truth | Read from state variable |
| "Patch UI labels only" | Cosmetic fix, state wrong | Fix state, then UI |
| Partial hydration | UI/state desync | Hydrate completely |

---

## Quick Checklist

When implementing UI state changes:

- [ ] Is state updated BEFORE UI?
- [ ] Are ALL related UI elements updated?
- [ ] Is the change persisted?
- [ ] On reload, will state + UI match?
- [ ] On hydration, are both state AND UI updated?

---

## Related Skills

- `ays.quotes.hydration` — Full draft hydration contract
- `core.patch-discipline` — One change at a time
