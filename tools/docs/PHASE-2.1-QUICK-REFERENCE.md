# Phase 2.1: Grid Layouts - Quick Reference

**Status:** Ready to execute  
**Estimated Time:** 20 minutes (4 parallel replacements per pass)  
**Risk:** LOW (pure layout, no DOM changes)

---

## The 9 Grid Replacements

### Grid 1: Line 1846 (Quotes Tab - Custom Items Header)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); margin-top: var(--space-md);">
AFTER:  <div class="grid grid-3col gap-md mt-md">
```

### Grid 2: Line 1873 (Quotes Tab - Invoice Items)
```html
BEFORE: <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
AFTER:  <div class="grid grid-2col-wide-left gap-md">
```

### Grid 3: Line 1884 (Quotes Tab - Room Toggles)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: var(--space-md);">
AFTER:  <div class="grid grid-4col gap-md">
```

### Grid 4: Line 1920 (Settings Tab - Pricing Grid)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-lg);">
AFTER:  <div class="grid grid-2col gap-lg mb-lg">
```

### Grid 5: Line 1950 (Settings Tab - Window Pricing)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-lg);">
AFTER:  <div class="grid grid-2col gap-md mb-lg">
```

### Grid 6: Line 2015 (Settings Tab - Other Surcharges)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; margin-bottom: var(--space-lg);">
AFTER:  <div class="grid grid-4col gap-sm mb-lg">
```

### Grid 7: Line 2106 (Settings Tab - Service Config)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
AFTER:  <div class="grid grid-2col gap-md">
```

### Grid 8: Line 2143 (Settings Tab - Linked Services)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
AFTER:  <div class="grid grid-2col gap-md">
```

### Grid 9: Line 2182 (Settings Tab - Final Grid)
```html
BEFORE: <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
AFTER:  <div class="grid grid-2col gap-md">
```

---

## Testing After Completion

1. **Mobile (600px):** Grids should collapse to single column gracefully
2. **Tablet (800px):** Multi-column grids display with proper spacing
3. **Desktop (1024px+):** Full multi-column layouts render correctly
4. **No visual regressions:** Compare before/after side-by-side in DevTools

---

## Commit Message

```
feat: Phase 2.1 - Consolidate 9 grid layouts from inline to CSS classes

- Replace inline display: grid styles with .grid utility classes
- 9 instances: grid-2col, grid-3col, grid-4col, grid-2col-wide-left
- Add spacing utilities: gap-md, gap-lg, gap-sm, mb-lg, mt-md
- Test responsive behavior on mobile/tablet/desktop

No functional changes, pure CSS consolidation.
```

---

## Execute Order

Use `multi_replace_string_in_file` to do 4 replacements per batch:
- **Batch 1:** Grids 1-4
- **Batch 2:** Grids 5-9

Total: 2 tool calls, test in browser, commit.
