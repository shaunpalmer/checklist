# Phase 2.1 Quick Reference: Grid Layout Consolidation

**Status**: 0 of 9 grids replaced  
**Estimated Time**: 20 minutes (parallel execution)  
**Target File**: `checklist-modern.html`

---

## The 9 Grids to Replace

### Grid 1: Client Details (Line 1846)
**Pattern**: 3-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-top: var(--space-md);">
```
**New**:
```html
<div class="grid grid-3col gap-md mt-md">
```

---

### Grid 2: Quote Address Fields (Line 1873)
**Pattern**: 2-column, wide-left ratio (2fr 1fr)  
**Current**:
```html
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
```
**New**:
```html
<div class="grid grid-2col-wide-left gap-md">
```

---

### Grid 3: Room Toggles (Line 1884)
**Pattern**: 4-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--space-md);">
```
**New**:
```html
<div class="grid grid-4col gap-md">
```

---

### Grid 4: Service & Booking Section (Line 1920)
**Pattern**: 2-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col gap-lg mb-lg">
```

---

### Grid 5: Service Type & Notes (Line 1950)
**Pattern**: 2-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col gap-lg">
```

---

### Grid 6: Quote Pricing (Line 2015)
**Pattern**: 2-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col gap-lg">
```

---

### Grid 7: Pricing Adjustments (Line 2106)
**Pattern**: 2-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col gap-lg">
```

---

### Grid 8: Total Calculation (Line 2143)
**Pattern**: 2-column layout  
**Current**:
```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col gap-lg">
```

---

### Grid 9: Quote History Display (Line 2182)
**Pattern**: 2-column, wide-left ratio (2fr 1fr)  
**Current**:
```html
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
```
**New**:
```html
<div class="grid grid-2col-wide-left gap-lg">
```

---

## Execution Checklist

- [ ] Grid 1 (1846): 3-column client details
- [ ] Grid 2 (1873): 2fr/1fr address fields
- [ ] Grid 3 (1884): 4-column room toggles
- [ ] Grid 4 (1920): 2-column service & booking
- [ ] Grid 5 (1950): 2-column service & notes
- [ ] Grid 6 (2015): 2-column pricing
- [ ] Grid 7 (2106): 2-column adjustments
- [ ] Grid 8 (2143): 2-column totals
- [ ] Grid 9 (2182): 2fr/1fr history

## Testing Checklist

After replacements:
- [ ] Desktop layout: grids render 2+ columns
- [ ] Tablet (800px): grids collapse to 2 columns max
- [ ] Mobile (600px): grids collapse to 1 column
- [ ] All gaps/margins intact
- [ ] No visual regressions in replaced sections

## Commit Message

```
feat: Phase 2.1 - Grid layout consolidation (all 9 grids)

Replace 9 inline grid style attributes with semantic CSS utility classes:
- grid-3col, grid-4col (Grids 1 & 3)
- grid-2col, grid-2col-wide-left (Grids 2, 4-8, 9)
- gap-md, gap-lg spacing utilities
- mt-md, mb-lg margin utilities

Responsive breakpoints maintained (600px, 800px, 1024px).
No visual regressions.
```

---

## CSS Utility Reference

| Class | Purpose |
|-------|---------|
| `.grid` | Base grid display |
| `.grid-2col` | 2 equal columns (1fr 1fr) |
| `.grid-3col` | 3 equal columns (1fr 1fr 1fr) |
| `.grid-4col` | 4 equal columns (1fr 1fr 1fr 1fr) |
| `.grid-2col-wide-left` | 2 columns, left 2x wider (2fr 1fr) |
| `.gap-md` | Medium gap (var(--space-md)) |
| `.gap-lg` | Large gap (var(--space-lg)) |
| `.mt-md` | Margin-top medium |
| `.mb-lg` | Margin-bottom large |

---

**Ready to execute**. Use `multi_replace_string_in_file` in batches of 3-4 grids, or individual `replace_string_in_file` calls with exact context.
