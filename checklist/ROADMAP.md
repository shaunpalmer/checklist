# 🎯 Next Session Roadmap

## What We Have Ready

✅ **Complete Architecture** - Full system designed for 4 user portals  
✅ **PHP Blueprint** - Classes, interfaces, JSON packets documented  
✅ **Data Attributes Started** - Critical surcharge items updated with pricing  
✅ **Dropdown Template** - Windows and Carpets ready for variant selection  
✅ **Progress Tracking** - PROGRESS.md + PHP-IMPLEMENTATION.md for reference  

---

## Session 1 Priorities (Next Meeting)

### 1️⃣ Implement Phase 1: Data Attributes (1-2 hours)
**Target**: Complete data attributes on ALL 130+ checklist items

**What to do**:
- Bathrooms 1-4: Add `data-item-id`, `data-hours`, `data-role="admin"` (hidden from public)
- Bedrooms 1-4: Same as bathrooms + time estimates
- Living Room, Entryway, Laundry: Basic attributes
- Deep Cleaning: Already started (oven $150, windows variants, drawers $50)
- Special Requests: Already started (carpet variants $52-145, garage $100)

**Tools**: 
- Use multi_replace_string_in_file for batches of 5-10 items
- Reference PHP-IMPLEMENTATION.md for attribute naming

### 2️⃣ Implement Phase 2: Dropdown Styling (30 mins)
**Target**: Make Windows + Carpet dropdowns visible and functional

**What to do**:
- Create `.variant-dropdown` CSS styles (hidden by default, show on parent checked)
- Add jQuery handler: When parent checkbox checked → show dropdown
- Store selected variant in `data-selected-variant` attribute
- Calculate price multiplier based on selection

**Code Pattern**:
```javascript
$('.checklist-item input[type="checkbox"]').on('change', function() {
  const $parent = $(this).closest('.checklist-item');
  const $dropdown = $parent.find('.variant-dropdown');
  if ($(this).is(':checked')) {
    $dropdown.slideDown(200); // Smooth reveal
  } else {
    $dropdown.slideUp(200);
  }
});
```

### 3️⃣ Implement Phase 3: Settings Panel (1 hour)
**Target**: Create admin-only Settings tab in HTML

**What to do**:
- Add new `data-service="settings"` tab
- Create settings form (as documented in PHP-IMPLEMENTATION.md)
- Add inputs for surcharge prices (Oven, Windows, Carpet, etc.)
- Link to wp_options (placeholder for now)
- Style with same design system

**Key Settings**:
```
surcharge_single_oven: $150
surcharge_windows: $65 (base)
surcharge_carpet: $52 (base)
surcharge_drawers: $50
base_hourly_rate: $50
premium_hourly_rate: $75
staff_threshold_hours: 7
```

### 4️⃣ Implement Phase 4: Role Classes (30 mins)
**Target**: Add role visibility CSS

**What to do**:
- Add CSS for `.view-public`, `.view-supervisor`, `.view-admin`, `.view-property-manager`
- Hide pricing from public/supervisor views: `[data-role="admin"] { display: none; }`
- Hide settings tab from non-admins
- Add role selector dropdown for testing (temporary)

---

## Next 3 Sessions Plan

**Session 2**: 
- Finish Phase 1 (all data attributes complete)
- Phase 2 + 3 (dropdowns + settings tab)

**Session 3**:
- Phase 4 (role-based visibility)
- Phase 5 (PHP integration - read wp_options)
- Test all 4 portals with role switcher

**Session 4**:
- Photo integration
- PDF export with pricing
- Final polish + testing

---

## Critical Files to Know

| File | Purpose | Status |
|------|---------|--------|
| `checklist-modern.html` | Main interface (1561 lines) | ✅ Ready for more attributes |
| `css/checklist-variables.css` | Design system (97 lines) | ✅ Complete |
| `css/checklist-style.css` | Styling (607 lines) | 📝 Need `.variant-dropdown` CSS |
| `js/checklist-script.js` | Interactions (330 lines) | 📝 Need dropdown handlers |
| `ARCHITECTURE.md` | System blueprint | ✅ Reference document |
| `PHP-IMPLEMENTATION.md` | PHP classes + schemas | ✅ Reference document |
| `PROGRESS.md` | Implementation checklist | ✅ Update as you go |

---

## Data Attributes Already Added

### Kitchen
- Drawers/Pantry: `$50` (basic)

### Deep Cleaning  
- Oven: `$150` (deep, 1.5 hrs)
- Windows: Dropdown variants `$65-110` (2-4 br)
- Drawers: `$50` (1 hr)

### Special Requests
- Carpet: Dropdown variants `$52-145` (1-7 rooms)
- Garage: `$100` (2 hrs, deep)

**Total Data Attributes Ready**: 6 items  
**Still Needed**: 125+ items

---

## Quick Reference: Data Attribute Template

```html
<label class="checklist-item"
  data-item-id="room-task"              <!-- Unique ID -->
  data-room="kitchen|bath|bed"          <!-- Room -->
  data-category="basic|intermediate|deep|surcharge"
  data-hours="1.5"                      <!-- Labor hours -->
  data-base-charge="150"                <!-- Base price (surcharges only) -->
  data-labor-cost="75"                  <!-- Labor portion -->
  data-material-cost="75"               <!-- Supply portion -->
  data-service-code="OC(S)"             <!-- Invoice code -->
  data-settings-key="surcharge_single_oven"  <!-- PHP setting link -->
  data-difficulty="basic"               <!-- Time/cost tier -->
>
  <input type="checkbox" id="task-id" name="room" />
  <span class="checkbox-custom"></span>
  <span class="item-label">Task Name - $Price</span>
</label>
```

---

## Testing Checklist for Next Session

- [ ] Open HTML in browser
- [ ] Click kitchen drawers → Should show $50
- [ ] Click windows variant → Should show dropdown
- [ ] Select window type → Should update price
- [ ] Click carpet → Should show room count dropdown
- [ ] All animations smooth (200ms 'swing')
- [ ] Hover states working (gray text + shadow)
- [ ] localStorage persisting across page reloads

---

## Pro Tips for You 🚀

1. **Batch your replacements**: Group 5-10 similar items together using `multi_replace_string_in_file` instead of single edits
2. **Copy existing patterns**: Use kitchen drawer as template for all basic items
3. **Dropdowns early**: Implement dropdown CSS/JS once, reuse for all variants
4. **Test frequently**: After each 10-15 item batch, refresh browser and verify
5. **Settings tab last**: It's optional until PHP is connected, focus on data attributes first

---

## Session End State (Recommended)

By end of next session:
- ✅ All 130 checklist items have data attributes
- ✅ Windows + Carpet dropdowns visible + selectable
- ✅ Settings tab created (styling only)
- ✅ Role CSS structure in place (no functionality yet)
- ✅ Updated PROGRESS.md with completion marks

That puts you 50% done and ready for PHP integration in session 3! 🎉

---

**Created**: After 5+ hour discovery session  
**User**: Fresh 6-8 hrs sleep, ready to execute  
**Confidence**: High - architecture proven, execution clear  
**Next Action**: Start with Phase 1, batch the easy items first
