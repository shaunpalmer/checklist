# Quick Start: Next Session (5 Min Read)

## TL;DR

✅ **Data attributes designed** - Copy/paste pattern for all items  
✅ **Dropdowns working** - Windows & Carpet variants ready  
✅ **PHP classes documented** - Classes, interfaces, JSON packets done  
✅ **Roadmap clear** - 4 phases, 4 hours total  

**Open this in next session**:
1. ROADMAP.md - Step-by-step instructions
2. checklist-modern.html - Add attributes to remaining items
3. Terminal - Test in browser after each batch

---

## Data Attribute Copy-Paste Template

```html
<!-- BASIC ITEM (no surcharge) -->
<label class="checklist-item" 
  data-item-id="room-task"
  data-room="kitchen|bath|bed|living|entryway|laundry"
  data-category="basic|intermediate|deep"
  data-hours="0.5">
  <input type="checkbox" id="unique-id" name="room" />
  <span class="checkbox-custom"></span>
  <span class="item-label">Task Name</span>
</label>

<!-- SURCHARGE ITEM (fixed price) -->
<label class="checklist-item"
  data-item-id="room-task"
  data-room="special"
  data-category="surcharge"
  data-hours="1.5"
  data-base-charge="150"
  data-labor-cost="75"
  data-material-cost="75"
  data-service-code="OC(S)"
  data-settings-key="surcharge_single_oven"
  data-difficulty="deep">
  <input type="checkbox" id="unique-id" name="room" />
  <span class="checkbox-custom"></span>
  <span class="item-label">Task Name - $150</span>
</label>

<!-- VARIANT ITEM (dropdown) -->
<label class="checklist-item"
  data-item-id="room-task"
  data-room="special"
  data-category="variant"
  data-variant-type="dropdown"
  data-options-key="window_variants"
  data-hours="2"
  data-base-charge="65"
  data-service-code="WIN"
  data-settings-key="surcharge_windows">
  <input type="checkbox" id="unique-id" name="room" />
  <span class="checkbox-custom"></span>
  <span class="item-label">Task Name (select below)</span>
  <select style="display: none;" data-options-select="window_variants">
    <option value="">Choose...</option>
    <option value="2br">2BR - $65</option>
    <option value="3br">3BR - $85</option>
  </select>
</label>
```

---

## Batching Strategy (Most Efficient)

### Batch 1: Bathrooms 1-4 (10 items × 4)
- Same structure for each bathroom
- Just change IDs and room number
- Use find/replace with regex

### Batch 2: Bedrooms 1-4 (5 items × 4)  
- Even simpler than bathrooms
- Consistent time estimates

### Batch 3: Living Room (7 items)
- Single batch, straightforward

### Batch 4: Kitchen (8 items)
- Already did drawers, just need the others

### Batch 5: Entryway (5 items)
- Quick batch

### Batch 6: Laundry (8 items)
- Two sections, consistent pattern

**Total**: ~60 items in 6 batches = 30-45 minutes with multi_replace

### Advanced: Deep Cleaning (12 items)
- Already did oven, windows, drawers
- Just 9 more: fridge, microwave, etc.

### Advanced: Special Requests (5 items)
- Already did carpet, garage
- Just 3 more: laundry, iron, other

---

## Service Codes Reference

```
OC(S)  = Oven Clean (Single)
OC(D)  = Oven Clean (Double)
WIN    = Windows
CARP   = Carpet
DRAW   = Drawers
KDRAW  = Kitchen Drawers
GAR    = Garage
FRI    = Fridge (internal)
MIC    = Microwave (internal)
WAD    = Washer/Dryer
LAUN   = Laundry Service
FOLD   = Clothing Fold
IRON   = Ironing Service
```

---

## Session 1 Checklist

- [ ] Open checklist-modern.html
- [ ] Open ROADMAP.md (side-by-side)
- [ ] Phase 1: Bathrooms batch (20 mins)
- [ ] Phase 1: Bedrooms batch (15 mins)
- [ ] Phase 1: Living/Entry/Laundry (15 mins)
- [ ] Phase 1: Remaining Kitchen items (10 mins)
- [ ] Test in browser → All checkmarks showing
- [ ] Phase 2: Add CSS for .variant-dropdown (15 mins)
- [ ] Phase 3: Create Settings tab (30 mins)
- [ ] Phase 4: Add role-based CSS (20 mins)
- [ ] Final browser test of all 4 sections

**Total Time**: 3-4 hours, well-organized

---

## Portal Tests (After implementation)

Test each portal sees correct info:

**Public Portal**:
- [ ] See checklist items
- [ ] See photos
- [ ] NO pricing
- [ ] NO settings

**Supervisor Portal**:
- [ ] See checklist + times
- [ ] See photos + notes
- [ ] NO pricing
- [ ] NO settings

**Admin Portal**:
- [ ] See everything
- [ ] See pricing
- [ ] See settings
- [ ] Can modify prices

**Property Manager Portal**:
- [ ] See checklist
- [ ] See before/after photos
- [ ] NO pricing
- [ ] NO settings

---

## Files to Ignore (Already Done)

✅ checklist-variables.css  
✅ checklist-style.css  
✅ checklist-script.js  
✅ ARCHITECTURE.md  
✅ PHP-IMPLEMENTATION.md  

Just focus on:
- [ ] checklist-modern.html (add attributes)
- [ ] checklist-style.css (add .variant-dropdown CSS)
- [ ] checklist-script.js (add dropdown handlers)

---

## One-Hour Mini-Session Option

If short on time:

1. **Just do Bathrooms batch** (20 mins)
2. **Test in browser** (10 mins)
3. **Do Bedrooms batch** (15 mins)
4. **Review ROADMAP for next time** (15 mins)

This counts as "Phase 1 started" and you can pick up where you left off next session.

---

## Browser Dev Tools Tip

After each batch:
1. Open DevTools (F12)
2. Inspector → Find checklist item
3. Check `data-item-id` attribute exists
4. Check `data-base-charge` populated (if surcharge)
5. Refresh page → Check localStorage working

Takes 30 seconds, catches bugs early.

---

## References While Coding

Have these open in tabs:
1. ROADMAP.md (instructions)
2. checklist-modern.html (editor)
3. Browser (preview)
4. DevTools (debug)

---

## If You Get Stuck

Common issues:

**"Attribute not showing in DevTools"**
- Check spelling: `data-item-id` not `data-itemid`
- Reload browser (Ctrl+Shift+R)

**"Prices not showing"**
- Need to add price in `<span>` AND `data-base-charge`
- Example: `- $150` in label, `data-base-charge="150"` in data

**"Dropdown not working"**
- That's Phase 2 (CSS + JavaScript)
- For Phase 1, just add the HTML structure

---

## Success Looks Like

After Phase 1:
```html
<label class="checklist-item" 
  data-item-id="bath1-sink"
  data-room="bathrooms"
  data-category="basic"
  data-hours="0.25">
  <input type="checkbox" id="bath1-sink" />
  ...
</label>
```

All 130+ items look like this. Done! ✅

---

**Next Session Est. Start**: [Your schedule]  
**Est. Completion Time**: 3-4 hours  
**Result**: 50% of MVP complete  
**Then**: PHP integration in Session 2

You've got this! 🚀
