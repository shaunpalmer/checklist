# Skill: ays.mode-switching.contract

> **Purpose:** Define rules for switching between service types/modes without data corruption.

---

## When to Use

Trigger this skill when:

- User switches tabs (EOT / Residential / Commercial)
- Implementing mode/type selection
- Handling structural changes to drafts

---

## Core Principle

**Mode changes that alter structure require explicit handling.**

```
Cosmetic change → Same structure, different labels → OK to switch
Structural change → Different rooms/fields → Requires new draft or migration
```

---

## Change Types

### Cosmetic (Safe to Switch)

- Changing labels ("Bedroom" → "Office")
- Changing display order
- Toggling visibility of optional sections

### Structural (Dangerous)

- Changing room list composition
- Changing available task sets
- Changing required fields

---

## Structural Change Matrix

| From | To | Change Type | Action |
|------|-----|-------------|--------|
| Residential | EOT | Cosmetic | Switch OK, add EOT tasks |
| Residential | Commercial | **Structural** | Prompt: New draft |
| Commercial | Residential | **Structural** | Prompt: New draft |
| EOT | Residential | Cosmetic | Switch OK, remove EOT tasks |
| EOT | Commercial | **Structural** | Prompt: New draft |

---

## Mode Switch Flow

```javascript
function handleModeSwitch(currentMode, newMode) {
  // 1. Determine if structural change
  const isStructural = isStructuralChange(currentMode, newMode);
  
  if (!isStructural) {
    // Safe: just update mode and re-render
    this.serviceType = newMode;
    this.regenerateLabels();
    this.save();
    return;
  }
  
  // 2. Check if current draft has meaningful data
  const isDirty = this.hasMeaningfulData();
  
  if (!isDirty) {
    // Empty draft: safe to convert
    this.serviceType = newMode;
    this.regenerateRooms();
    this.save();
    return;
  }
  
  // 3. Structural change with dirty draft: PROMPT
  this.showModeSwitchPrompt({
    message: `Start a new ${newMode} quote?`,
    options: [
      { label: 'Start New', action: () => this.createNewDraft(newMode) },
      { label: 'Copy Client Details', action: () => this.createNewDraft(newMode, { copyClient: true }) },
      { label: 'Cancel', action: () => {} }
    ]
  });
}
```

---

## Hard Rules

### ✅ DO

- Detect structural vs cosmetic changes
- Prompt before structural changes on dirty drafts
- Offer "Copy client details" option
- Save current draft before switching

### ❌ DON'T

- Silently mutate draft structure
- Lose user data on mode switch
- Allow bedrooms in commercial mode
- Allow offices in residential mode

---

## Anti-Patterns

| Bad | Why | Do Instead |
|-----|-----|------------|
| Switch mode, keep old rooms | Data corruption | Regenerate room list |
| Convert draft silently | Data loss risk | Prompt user |
| Show "Office" in residential | Wrong mode | Check serviceType before rendering |

---

## Related Skills

- `core.ui-state.contracts` — UI reflects state
- `ays.drafts.lifecycle` — Draft state machine
- `ays-checklist.room-composition` — Room generation rules
