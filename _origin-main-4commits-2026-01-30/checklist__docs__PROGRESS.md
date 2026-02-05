# Cleaning Checklist - Project Progress & Checklist

## Current Status: Architecture Phase Complete Γ£à

---

## Recent Updates

- Γ£à Factory now stores rendered disclosure elements and safely resolves them during progress/reset calculations (prevents undefined card element lookups).  

---

## Project Vision
A **multi-tenant, role-based cleaning checklist system** that adapts to **four user types**:
- **Customers** (Public Token) - View proof of service, photos, signature
- **Supervisors** (WP Role) - Track progress, time, items, notes
- **Admins/Owners** (WP Role) - Full pricing, quotes, settings, analytics
- **Property Managers** (WP Role) - NEW! See checklist, photos, compare before/after

### Portal Architecture
See **PHP-IMPLEMENTATION.md** for complete role-based portal system design.

---

## Folder Structure (VERIFIED Γ£à)

```
c:\xampp\htdocs\quotesTable\checklist\
Γö£ΓöÇΓöÇ checklist-modern.html      Γ£à Main interface (role-agnostic)
Γö£ΓöÇΓöÇ css/
Γöé   Γö£ΓöÇΓöÇ checklist-variables.css Γ£à CSS variables (colors, spacing, hover states)
Γöé   ΓööΓöÇΓöÇ checklist-style.css     Γ£à Styling (responsive, role-based classes ready)
Γö£ΓöÇΓöÇ js/
Γöé   ΓööΓöÇΓöÇ checklist-script.js     Γ£à jQuery interactions, localStorage, animations
Γö£ΓöÇΓöÇ ARCHITECTURE.md             Γ£à Full blueprint for PHP integration
ΓööΓöÇΓöÇ PROGRESS.md                 ≡ƒôì This file - tracking implementation
```

---

## HTML Structure Assessment Γ£à

### Current Strengths
- Γ£à **Semantic HTML** - `<details>/<summary>` for accordions
- Γ£à **Data attributes** - Items ready for custom metadata
- Γ£à **Wrapper div** - `<div class="checklist-wrapper">` ready for role classes
- Γ£à **Service tabs** - `data-service` attributes for filtering
- Γ£à **Meta fields** - Crew name, date (foundation for time tracking)
- Γ£à **Modular CSS** - Variables file for easy role-based styling

### Ready for Role Implementation
- ≡ƒô¥ Need to add: `data-*` attributes on ALL checklist items
- ≡ƒô¥ Need to add: Role classes to wrapper (`.view-customer`, `.view-admin`)
- ≡ƒô¥ Need to add: Time picker inputs (start/finish)
- ≡ƒô¥ Need to add: Quote mode toggle (admin only)
- ≡ƒô¥ Need to add: Settings panel (admin only)

---

## Checklist Items to Complete

### Phase 1: Data Attributes (IN PROGRESS)
- [x] Drawer/Pantry item added with `data-hours`, `data-charge-amount`
- [ ] Deep Cleaning section - add data attributes to all items
- [ ] Oven items - add `data-difficulty="deep"`, `data-charge-amount="75"`
- [ ] Window items - add `data-production-rate`, `data-area-type`
- [ ] All items - add `data-role="admin|supervisor|public"`

### Phase 2: Role-Based CSS (NOT STARTED)
- [ ] Create `css/role-based.css` for admin-only, supervisor-only visibility
- [ ] Add `.view-customer`, `.view-supervisor`, `.view-admin` styles
- [ ] Hide pricing/amounts from customer and supervisor views
- [ ] Show time tracking inputs only for supervisor+
- [ ] Show settings panel only for admin

### Phase 3: PHP Integration (NOT STARTED)
- [ ] Create `includes/role-detection.php` - WordPress user role detection
- [ ] Wrap `checklist-modern.html` in PHP conditional output
- [ ] Add role classes to wrapper based on user
- [ ] Create `includes/quote-calculator.php` - sum checked items

### Phase 4: Admin Features (NOT STARTED)
- [ ] Add time picker inputs (Flatpickr time mode)
- [ ] Add quote mode toggle button
- [ ] Add settings panel with rate inputs
- [ ] Add quote summary calculation display
- [ ] Create quote export function

### Phase 5: Customer Features (NOT STARTED)
- [ ] Create customer view template showing only completed items
- [ ] Add service date display
- [ ] Create PDF proof-of-service generator
- [ ] Email integration for customer notification

---

## Key Decisions Made

### Architecture
Γ£à Same HTML serves all three user types (DRY principle)  
Γ£à Role-based visibility via CSS + PHP conditionals  
Γ£à Data attributes carry pricing/metadata (future-proof for WordPress)  
Γ£à localStorage for offline capability  
Γ£à Progressive enhancement (works without JS)  

### Styling & Animation
Γ£à 200ms jQuery animation on accordion expand/collapse  
Γ£à CSS variables for universal hover state styling  
Γ£à Gray text + text-shadow for hover contrast across all backgrounds  
Γ£à Custom tab styling with smooth ID-based animations  

### Accessibility
Γ£à Semantic HTML (details/summary)  
Γ£à Proper touch targets (44px minimum)  
Γ£à Keyboard navigable (native browser support)  
Γ£à Screen reader friendly  

---

## Data Attributes Reference

Every checklist item should eventually have these (add as needed):

```html
<label class="checklist-item"
  data-room="kitchen"           <!-- Room identifier -->
  data-category="drawer"         <!-- Task type -->
  data-hours="1"                 <!-- Labor hours -->
  data-difficulty="basic"        <!-- basic|intermediate|deep -->
  data-charge-amount="50"        <!-- Fixed surcharge -->
  data-production-rate="400"     <!-- Sq ft/hour (if applicable) -->
  data-product="degreaser"       <!-- Consumable used -->
  data-area-type="confined"      <!-- confined|large|high|hazardous -->
  data-role="admin"              <!-- Minimum role to view -->
  data-include-in-quote="true">  <!-- Can be quoted -->
  ...
</label>
```

---

## Next Immediate Steps

1. **Add time picker inputs** to meta fields (Flatpickr)
2. **Populate Deep Cleaning section** with full data attributes
3. **Create role-based CSS file** (`role-based.css`)
4. **Create PHP wrapper template** for WordPress integration
5. **Test all three views** (customer/supervisor/admin)

---

## Files to Create (Phase 2+)

```
checklist/
Γö£ΓöÇΓöÇ includes/
Γöé   Γö£ΓöÇΓöÇ role-detection.php       ΓåÉ Detect WordPress user role
Γöé   Γö£ΓöÇΓöÇ quote-calculator.php     ΓåÉ Calculate totals from data-*
Γöé   ΓööΓöÇΓöÇ customer-summary.php     ΓåÉ Customer-only view template
Γö£ΓöÇΓöÇ css/
Γöé   ΓööΓöÇΓöÇ role-based.css           ΓåÉ Admin/supervisor/customer styling
Γö£ΓöÇΓöÇ js/
Γöé   Γö£ΓöÇΓöÇ quote-mode.js            ΓåÉ Quote toggle & calculation
Γöé   Γö£ΓöÇΓöÇ time-tracking.js         ΓåÉ Start/finish time logic
Γöé   ΓööΓöÇΓöÇ admin-panel.js           ΓåÉ Settings panel interactions
ΓööΓöÇΓöÇ templates/
    Γö£ΓöÇΓöÇ admin-view.php           ΓåÉ Full checklist for admin
    Γö£ΓöÇΓöÇ supervisor-view.php      ΓåÉ Field ops view
    ΓööΓöÇΓöÇ customer-view.php        ΓåÉ Public proof-of-service
```

---

## Testing Checklist (When Ready)

- [ ] Customer view hides all pricing/times
- [ ] Supervisor view shows time inputs, hides pricing
- [ ] Admin view shows everything
- [ ] Quote mode calculates correctly
- [ ] localStorage persists across page reloads
- [ ] Details accordions animate smoothly
- [ ] Print/PDF works for each view
- [ ] Mobile responsive at all breakpoints

---

## Notes & Decisions

**Recent Updates**
- Refactored PropertyServiceDisclosure to build summary and item rows with DOM nodes (no innerHTML) for object-first rendering and safer updates.
- Expanded EndOfTenancyCleaning metadata to include kitchens, entryways, laundry rooms, and property-wide services (vacuum, window cleaning, carpet cleaning).
- Added EOT kitchen item definitions in the object catalog to support generator output.
- Added EOT bedroom item definitions in the object catalog to support generator output.
- Added EOT bathroom item definitions in the object catalog to support generator output.
- Added EOT laundry and living area item definitions in the object catalog to support generator output.
- Added residential bathroom item definitions in the object catalog to support generator output.
- Added residential bedroom, kitchen, living area, and laundry item definitions in the object catalog to support generator output.
- Added EOT entryway, basement, utility/special rooms, home office, outdoor, and property-wide item definitions in the object catalog to support generator output.
- Wired checklist config to use room registry for items and insert property-wide sections when available.
- Added EOT residential property type and a Toilet room class to support generated rooms without hardcoded HTML.

**Why role-based on the same HTML?**
- Single source of truth
- Easier maintenance
- No duplicate code
- Graceful fallback if JS breaks

**Why data attributes?**
- Semantic, standards-based
- Easy for PHP to read via DOM or parse HTML
- Extensible for future features
- Keeps pricing logic separate from UI

**Why 200ms animation timing?**
- Fast enough to feel responsive
- Slow enough to see it's intentional
- Works well on phones (100ms would be too fast, 500ms too slow)

---

## Questions for Next Session

1. Should we add photo upload fields for supervisor?
2. Do we need signature fields (digital sign-off)?
3. Should completed items lock/become read-only?
4. Customer notifications - email or SMS?
5. Multi-property jobs - how to handle?

---

**Last Updated**: 2026-01-01  
**Status**: Ready for Phase 2 (Role-Based CSS & Time Inputs)  
**Owner**: Development Team  
