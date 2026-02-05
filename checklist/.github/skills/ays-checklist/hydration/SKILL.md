# Skill: ays-checklist.hydration

> **Purpose:** Define the full contract for loading a draft into the Checklist UI.

---

## When to Use

Trigger this skill when:

- Loading a saved draft
- Switching between drafts
- Implementing "Load Quote" functionality
- Debugging "draft loads but UI is wrong"

---

## Hydration Contract

Loading a draft MUST perform ALL of these steps:

```javascript
async function loadDraft(draftId) {
  // 1. SET ACTIVE DRAFT
  await setActiveDraft(draftId);
  const draft = await getDraft(draftId);
  
  // 2. UPDATE INTERNAL STATE
  this.activeDraftId = draft.draftId;
  this.serviceType = draft.serviceType;
  this.propertyType = draft.propertyType;
  this.propertyConfig = draft.propertyConfig;
  this.snapshot = draft.snapshot;
  
  // 3. REGENERATE ROOM LIST (based on serviceType)
  this.rooms = generateRooms(draft.serviceType, draft.propertyConfig);
  
  // 4. APPLY STORED SELECTIONS
  this.applyProgress(draft.snapshot.progress);
  this.applyVariants(draft.snapshot.variantSelections);
  this.applyNotes(draft.snapshot.notes);
  
  // 5. UPDATE UI CONTROLS
  this.renderServiceTabs();      // Correct tab highlighted
  this.renderPropertyDropdown(); // Correct option selected
  this.renderRoomList();         // Correct rooms shown
  this.renderFormFields();       // Customer details filled
  
  // 6. UPDATE LABELS (mode-dependent)
  this.updateRoomLabels();       // "Office" not "Bedroom"
  this.updateCounters();         // "Offices: 5" not "Bedrooms: 3"
  
  // 7. UPDATE PROGRESS INDICATORS
  this.updateProgressBars();
  this.updateBadges();
}
```

---

## Checklist: What Must Hydrate

| Component | What Updates | Check |
|-----------|--------------|-------|
| Service tabs | Correct tab `.is-active` | ☐ |
| Property dropdown | Correct option selected | ☐ |
| Room counters | Numbers match config | ☐ |
| Room list | Correct rooms generated | ☐ |
| Room labels | Mode-appropriate names | ☐ |
| Task checkboxes | Checked state restored | ☐ |
| Variant dropdowns | Selections restored | ☐ |
| Customer fields | Name/phone/address filled | ☐ |
| Progress bars | Reflect actual progress | ☐ |

---

## Address Hydration (Specific)

Address can be stored in different locations:

```javascript
function getAddress(snapshot) {
  // Check both possible locations
  return snapshot.address 
      || snapshot.client?.address 
      || {
           line1: snapshot.address_line1,
           line2: snapshot.address_line2,
           city: snapshot.city,
           postcode: snapshot.postcode
         };
}
```

---

## Anti-Patterns

| Bad | Why | Do Instead |
|-----|-----|------------|
| Update state, skip UI | UI shows stale data | Update both |
| Update UI, skip state | State/UI desync | State first, then UI |
| "Patch labels only" | Cosmetic fix, root cause ignored | Full hydration |
| Skip room regeneration | Wrong rooms for mode | Always regenerate |

---

## Failure Modes to Watch

1. **Tab shows wrong mode**
   - State updated but `renderServiceTabs()` not called

2. **Rooms show wrong labels**
   - Rooms generated but `updateRoomLabels()` not called

3. **Checkboxes not restored**
   - Form rendered but `applyProgress()` not called

4. **Customer fields empty**
   - Draft loaded but customer fields not bound to form

---

## Hard Rules

### ✅ DO

- Call ALL hydration steps in order
- Regenerate rooms based on `serviceType`
- Apply stored progress AFTER room generation
- Update ALL UI controls, not just some

### ❌ DON'T

- Assume UI will "figure it out"
- Skip steps because "it usually works"
- Partially hydrate

---

## Related Skills

- `core.ui-state.contracts` — UI reflects state
- `ays-checklist.drafts` — Draft CRUD
- `ays-checklist.room-composition` — Room generation
