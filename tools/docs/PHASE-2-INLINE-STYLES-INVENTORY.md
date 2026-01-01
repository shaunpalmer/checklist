# Phase 2: CSS Consolidation - Inline Styles Inventory

**Date:** January 2, 2026  
**Branch:** sprint/ui-enhancements-2026-01-02  
**Goal:** Replace inline `style="..."` with semantic CSS utility classes

---

## Summary

**Total inline styles found:** ~100+ instances  
**Major patterns:**
- 9 grid layouts (inline `display: grid`)
- 40+ section headings with margin/padding/color
- 20+ form/metadata fields with margins
- 15+ price display divs with styling
- Various textarea/select styles

---

## Grid Layouts (HIGHEST PRIORITY)

These are the cleanest wins—direct 1:1 replacements with new utility classes.

### 1. Quotes Tab Custom Items Header (Line 1846)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-top: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-3col gap-md mt-md">
```

### 2. Quotes Tab - Invoice Items (Line 1873)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-2col-wide-left gap-md">
```

### 3. Quotes Tab - Room Toggles (Line 1884)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-4col gap-md">
```

### 4. Settings Tab - Pricing Grid (Line 1920)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-lg);">

<!-- AFTER -->
<div class="grid grid-2col gap-lg mb-lg">
```

### 5. Settings Tab - Surcharge Window Grid (Line 1950)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-lg);">

<!-- AFTER -->
<div class="grid grid-2col gap-md mb-lg">
```

### 6. Settings Tab - Other Surcharges (Line 2015)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: var(--space-lg);">

<!-- AFTER -->
<div class="grid grid-4col gap-sm mb-lg">
<!-- Note: gap: 8px = gap-sm (which is var(--space-sm) = 8px) -->
```

### 7. Settings Tab - Service Configuration (Line 2106)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-2col gap-md">
```

### 8. Settings Tab - Linked Services (Line 2143)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-2col gap-md">
```

### 9. Settings Tab - Final Grid (Line 2182)
```html
<!-- BEFORE -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">

<!-- AFTER -->
<div class="grid grid-2col gap-md">
```

---

## Section Headings (HIGH PRIORITY)

Pattern: `h4` tags with repeated margin/padding/color styling  
**All instances:** Bathrooms 1-4, Bedrooms 1-4, Kitchen sections, Laundry

```html
<!-- PATTERN (appears ~20+ times) -->
<h4 style="margin-top: var(--space-lg); padding: 0 0 var(--space-md) 0; color: var(--color-secondary); font-size: var(--font-size-sm);">

<!-- SOLUTION: Create .section-heading utility class -->
<h4 class="section-heading">
```

**New CSS class to add:**
```css
.section-heading {
  margin-top: var(--space-lg);
  padding-bottom: var(--space-md);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

/* First occurrence (no top margin) */
.section-heading:first-of-type {
  margin-top: 0;
}
```

**Instances:**
- Line 292: "Laundry Sink & Taps"
- Line 317: "Cabinets & Shelving"
- Line 355: "Bathroom 1"
- Line 410: "Bathroom 2"
- Line 465: "Bathroom 3"
- Line 520: "Bathroom 4"
- Line 588: "Bedroom 1"
- Line 618: "Bedroom 2"
- Line 648: "Bedroom 3"
- Line 678: "Bedroom 4"
- (And more in Residential/Commercial tabs)

---

## Form & Metadata Fields (MEDIUM PRIORITY)

Pattern: `.meta-field` with `margin-bottom: var(--space-lg)` or `margin-top: var(--space-lg)`

```html
<!-- BEFORE -->
<div class="meta-field" style="margin-top: var(--space-lg);">
<div class="meta-field" style="margin-bottom: var(--space-lg);">

<!-- AFTER -->
<div class="meta-field mt-lg">
<div class="meta-field mb-lg">
```

**Instances:** ~15+ across Quotes and Settings tabs

---

## Price Display Divs (MEDIUM PRIORITY)

Pattern: Price labels with hardcoded styling

```html
<!-- BEFORE -->
<div id="carpet-price-eot" style="margin-top: 8px; font-weight: bold; color: var(--color-accent);">Price: --</div>

<!-- SOLUTION: Create .price-label utility -->
<div id="carpet-price-eot" class="price-label">Price: --</div>
```

**New CSS class to add:**
```css
.price-label {
  margin-top: var(--space-xs);  /* 8px = var(--space-xs) */
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}
```

**Instances:** ~6 across EOT, Residential, Commercial tabs (carpet-price-*, windows-price-*)

---

## Textarea & Select Elements (LOW PRIORITY)

These have functional inline styles that can be converted to classes:

```html
<!-- BEFORE -->
<select style="display: none;" data-options-select="oven_variants" class="variant-dropdown">

<!-- AFTER -->
<select class="variant-dropdown hidden-select" data-options-select="oven_variants">

<!-- New CSS -->
.hidden-select { display: none; }
```

**Textarea min-height:**
```html
<!-- BEFORE -->
<textarea style="min-height: 100px;"></textarea>
<textarea style="min-height: 80px;"></textarea>

<!-- AFTER -->
<textarea class="textarea-large"></textarea>
<textarea class="textarea-medium"></textarea>

<!-- New CSS -->
.textarea-large { min-height: 100px; }
.textarea-medium { min-height: 80px; }
```

---

## Summary: Classes to Add to CSS

```css
/* Section Heading */
.section-heading {
  margin-top: var(--space-lg);
  padding-bottom: var(--space-md);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.section-heading:first-of-type {
  margin-top: 0;
}

/* Price Label */
.price-label {
  margin-top: var(--space-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

/* Hidden Elements */
.hidden-select {
  display: none;
}

/* Textarea Sizes */
.textarea-large { min-height: 100px; }
.textarea-medium { min-height: 80px; }

/* Descriptive Text (common pattern) */
.text-hint {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}
```

---

## Replacement Order (Risk-Managed)

1. **Phase 2.1 — Grid Layouts (9 instances)**
   - Lowest risk (pure layout)
   - Test responsive behavior on mobile
   - Commit after Quotes tab complete

2. **Phase 2.2 — Section Headings (20+ instances)**
   - Add `.section-heading` class
   - Replace all h4 styles
   - Test visual consistency

3. **Phase 2.3 — Meta Fields & Spacing (15+ instances)**
   - Use `.mt-*` and `.mb-*` utilities
   - Form/settings sections
   - Commit by tab (EOT, Residential, Commercial, Settings)

4. **Phase 2.4 — Price Labels & Special Cases (6+ instances)**
   - Add `.price-label` class
   - Form elements (`.hidden-select`, `.textarea-*`)
   - Final polish

---

## Testing Checklist After Each Phase

- [ ] Grid layouts wrap correctly on mobile (600px viewport)
- [ ] Grid spacing looks consistent at tablet (800px)
- [ ] Grid fills desktop width at 1024px+
- [ ] Section headings have correct spacing/alignment
- [ ] Form fields are properly padded
- [ ] Price labels display with correct color/weight
- [ ] No visual regressions in browser DevTools
- [ ] Print view still looks good (Settings → Print)

---

## Estimated Effort

- Phase 2.1 (Grid): **15 minutes** — 9 replacements, low risk
- Phase 2.2 (Headings): **20 minutes** — 20+ replacements, medium risk
- Phase 2.3 (Fields): **20 minutes** — 15+ replacements, low risk
- Phase 2.4 (Special): **10 minutes** — 6+ replacements, low risk

**Total: ~65 minutes for full Phase 2**

---

## Next Step

Ready to start Phase 2.1 (Grid Layouts)?
