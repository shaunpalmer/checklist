# Cleaning Checklist - Project Progress & Checklist

## Current Status: Architecture Phase Complete ✅

---

## Recent Updates

- ✅ Factory now stores rendered disclosure elements and safely resolves them during progress/reset calculations (prevents undefined card element lookups).
- ✅ Settings-driven structure is now the primary flow: `ITEM_DEFINITIONS` + `AysPropertyType` → `CHECKLIST_CONFIG` → `AysChecklistFormFactory` cards.
- ✅ EOT scaffolding added (new `eot` definitions and `eot_residential` property type).
- ✅ Commercial Toilet room prototype added and wired into script loading order.

**Rolling notes & active backlog**: see [AGENT-MEMORY.md](AGENT-MEMORY.md).

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

## Folder Structure (VERIFIED ✅)

```
c:\xampp\htdocs\checklist\checklist\
├── checklist-modern.html                 ✅ Main interface
├── css/
│   ├── checklist-variables.css           ✅ Design tokens
│   └── checklist-style.css               ✅ UI styling
├── js/
│   ├── checklist-script.js               ✅ App init + events
│   ├── data/
│   │   ├── ITEM_DEFINITIONS.js           ✅ Canonical item catalog
│   │   └── checklist-config.js           ✅ Builds CHECKLIST_CONFIG from Settings
│   ├── generators/
│   │   └── AysChecklistFormFactory.js    ✅ Renders disclosure cards, supports regenerate()
│   ├── patterns/
│   │   ├── AysPropertyType.js            ✅ Polymorphic property type registry
│   │   └── PropertyService.js            ✅ Base class for property-wide services
│   └── classes/                          ✅ Room prototypes (Room, CommercialRoom, etc.)
└── docs/
  ├── AGENT-MEMORY.md                   📍 Rolling notes + backlog
  └── PROGRESS.md                       📍 This file
```

---

## Current Architecture (Snapshot)

**Principle**: Settings decide structure; Form captures state.

**Assembly line**:
1. `ITEM_DEFINITIONS` provides the item catalog (rooms + services).
2. `AysPropertyType.TYPES` defines which rooms/services exist for a property type.
3. `checklist-config.js` builds a settings-derived `CHECKLIST_CONFIG`.
4. `AysChecklistFormFactory` converts config → rendered disclosure cards.

---

## Legacy Notes (HTML/Data-Attributes Phase)

The sections below are from the earlier data-attributes approach. They’re preserved for reference, but the current direction is **definition-driven + object-driven** (see `AGENT-MEMORY.md`).

---

## HTML Structure Assessment ✅

### Current Strengths
- ✅ **Semantic HTML** - `<details>/<summary>` for accordions
- ✅ **Data attributes** - Items ready for custom metadata
- ✅ **Wrapper div** - `<div class="checklist-wrapper">` ready for role classes
- ✅ **Service tabs** - `data-service` attributes for filtering
- ✅ **Meta fields** - Crew name, date (foundation for time tracking)
- ✅ **Modular CSS** - Variables file for easy role-based styling

### Ready for Role Implementation
- 📝 Need to add: `data-*` attributes on ALL checklist items
- 📝 Need to add: Role classes to wrapper (`.view-customer`, `.view-admin`)
- 📝 Need to add: Time picker inputs (start/finish)
- 📝 Need to add: Quote mode toggle (admin only)
- 📝 Need to add: Settings panel (admin only)

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
- [ ] Add time picker inputs (`flatpickr` time mode)
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
✅ Same HTML serves all three user types (DRY principle)  
✅ Role-based visibility via CSS + PHP conditionals  
✅ Data attributes carry pricing/metadata (future-proof for WordPress)  
✅ localStorage for offline capability  
✅ Progressive enhancement (works without JS)  

### Styling & Animation
✅ 200ms jQuery animation on accordion expand/collapse  
✅ CSS variables for universal hover state styling  
✅ Gray text + text-shadow for hover contrast across all backgrounds  
✅ Custom tab styling with smooth ID-based animations  

### Accessibility
✅ Semantic HTML (details/summary)  
✅ Proper touch targets (44px minimum)  
✅ Keyboard navigable (native browser support)  
✅ Screen reader friendly  

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

1. **Add time picker inputs** to meta fields (`flatpickr`)
2. **Populate Deep Cleaning section** with full data attributes
3. **Create role-based CSS file** (`role-based.css`)
4. **Create PHP wrapper template** for WordPress integration
5. **Test all three views** (customer/supervisor/admin)

---

## Files to Create (Phase 2+)

```
checklist/
├── includes/
│   ├── role-detection.php       ← Detect WordPress user role
│   ├── quote-calculator.php     ← Calculate totals from data-*
│   └── customer-summary.php     ← Customer-only view template
├── css/
│   └── role-based.css           ← Admin/supervisor/customer styling
├── js/
│   ├── quote-mode.js            ← Quote toggle & calculation
│   ├── time-tracking.js         ← Start/finish time logic
│   └── admin-panel.js           ← Settings panel interactions
└── templates/
    ├── admin-view.php           ← Full checklist for admin
    ├── supervisor-view.php      ← Field ops view
    └── customer-view.php        ← Public proof-of-service
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
