# 📊 Data Structure Reference

## Attribute Inventory (Current State)

### Items with Full Data Attributes (6)
| Item | Room | Category | Price | Code | Hours | Status |
|------|------|----------|-------|------|-------|--------|
| Oven (inside) | deep-clean | oven | $150 | OC(S) | 1.5 | ✅ |
| Windows | deep-clean | windows | variant | WIN | 2.0 | ✅ |
| Drawers (deep) | deep-clean | drawers | $50 | DRAW | 1.0 | ✅ |
| Kitchen Drawers | kitchen | drawer | $50 | KDRAW | 1.0 | ✅ |
| Carpet Clean | special | carpet | variant | CARP | 1.5 | ✅ |
| Garage | special | garage | $100 | GAR | 2.0 | ✅ |

### Items with Partial Attributes (0)
None - all implemented items complete

### Items Still Needing Attributes (125)
- Bathrooms 1-4: 40 items
- Bedrooms 1-4: 20 items
- Kitchen: 8 items (minus 1 done = 7)
- Living Room: 7 items
- Entryway: 5 items
- Laundry Room: 8 items
- Deep Cleaning: 9 items (minus 3 done = 6)
- Special Requests: 3 items (minus 2 done = 1)
- Residential Service: 44 items

---

## Role-Based Visibility (PLANNED)

```
┌─────────────────┬──────────┬────────────┬────────┬──────────────┐
│ Content         │ Public   │ Supervisor │ Admin  │ Prop Manager │
├─────────────────┼──────────┼────────────┼────────┼──────────────┤
│ Checklist Items │    ✅    │     ✅     │   ✅   │      ✅      │
│ Photos          │    ✅    │     ✅     │   ✅   │      ✅      │
│ Time Tracking   │    ❌    │     ✅     │   ✅   │      ❌      │
│ Notes           │    ❌    │     ✅     │   ✅   │      ❌      │
│ Pricing         │    ❌    │     ❌     │   ✅   │      ❌      │
│ Settings Panel  │    ❌    │     ❌     │   ✅   │      ❌      │
│ Staff Count     │    ❌    │     ✅     │   ✅   │      ❌      │
│ Variants        │    ✅    │     ✅     │   ✅   │      ✅      │
└─────────────────┴──────────┴────────────┴────────┴──────────────┘
```

**CSS Implementation**:
```css
/* Hide pricing from non-admin roles */
.view-public [data-role="admin"],
.view-supervisor [data-role="admin"],
.view-property-manager [data-role="admin"] {
  display: none;
}

/* Show settings only to admin */
#settings-tab {
  display: none; /* Hidden by default */
}
.view-admin #settings-tab {
  display: block;
}
```

---

## Pricing Model (LOCKED)

### Fixed Surcharges
```javascript
const SURCHARGES = {
  'surcharge_single_oven': 150.00,     // OC(S)
  'surcharge_double_oven': 200.00,     // OC(D)
  'surcharge_drawers': 50.00,          // DRAW, KDRAW
  'surcharge_garage': 100.00,          // GAR
}
```

### Variants (Dropdown-Based)
```javascript
const VARIANTS = {
  'window_variants': {
    '2br': { price: 65, hours: 2.0 },
    '3br': { price: 85, hours: 2.0 },
    '4br': { price: 110, hours: 2.0 },
    '2story': { price: 40, hours: 1.0 },  // Add-on
  },
  'carpet_variants': {
    '1-2': { price: 52, hours: 1.5 },
    '3-4': { price: 80, hours: 2.0 },
    '5-6': { price: 110, hours: 2.5 },
    '7plus': { price: 145, hours: 3.0 },
  }
}
```

### Hourly Rates (Base + Premium)
```javascript
const RATES = {
  'base_hourly_rate': 50.00,      // Standard
  'premium_hourly_rate': 75.00,   // Deep cleaning tasks
  'staff_threshold_hours': 7,      // 2+ staff needed
  'staff_multiplier': 1.25,        // +25% for extra staff
}
```

### Cost Breakdown Example
```
Task: Oven (Single)
├── Base Charge: $150.00
├── Labor Cost: $75.00
├── Material Cost: $75.00
├── Service Code: OC(S)
├── Difficulty: deep (premium rate applies if labor-tracked)
└── Settings Key: surcharge_single_oven (can override in admin panel)

Task: Windows (3BR)
├── Base Charge: $85.00 (from variant dropdown)
├── Hours: 2.0
├── Service Code: WIN
├── Difficulty: intermediate
└── Settings Key: surcharge_windows (base value, variant multiplies)
```

---

## JSON Packet Structure (Example)

### Complete Checklist Submission
```json
{
  "checklist": {
    "id": 12345,
    "service_type": "end-of-tenancy",
    "property": {
      "address": "123 Main St, City",
      "bedrooms": 3,
      "bathrooms": 2,
      "sq_ft": 1800,
      "property_type": "house"
    },
    "crew": {
      "name": "John & Sarah",
      "staff_count": 2,
      "supervisor": "John",
      "team_id": "team-001"
    },
    "timeline": {
      "date": "2026-01-15",
      "start_time": "09:00",
      "finish_time": "17:30",
      "actual_hours": 8.5,
      "estimated_hours": 8.0,
      "variance": "+0.5 hrs"
    },
    "items_checked": [
      {
        "id": "bath1-sink",
        "room": "bathrooms",
        "category": "basic",
        "label": "Sinks and Faucets",
        "checked": true,
        "timestamp": "2026-01-15T09:15:00Z",
        "hours": 0.25,
        "notes": null
      },
      {
        "id": "deep-oven",
        "room": "deep-cleaning",
        "category": "oven",
        "label": "Oven (inside)",
        "checked": true,
        "timestamp": "2026-01-15T14:30:00Z",
        "hours": 1.5,
        "charge_amount": 150,
        "service_code": "OC(S)",
        "notes": "Heavy buildup, required extended cleaning"
      },
      {
        "id": "deep-windows",
        "room": "deep-cleaning",
        "category": "windows",
        "label": "Windows",
        "checked": true,
        "timestamp": "2026-01-15T15:45:00Z",
        "variant_selected": "3br",
        "charge_amount": 85,
        "service_code": "WIN",
        "notes": null
      }
    ],
    "photos": [
      {
        "id": "photo_001",
        "room": "kitchen",
        "category": "before",
        "filename": "checklist-12345-kitchen-before-001.jpg",
        "url": "/uploads/checklist/12345/photo_001.jpg",
        "timestamp": "2026-01-15T09:00:00Z",
        "size_mb": 2.5
      },
      {
        "id": "photo_002",
        "room": "kitchen",
        "category": "after",
        "filename": "checklist-12345-kitchen-after-001.jpg",
        "url": "/uploads/checklist/12345/photo_002.jpg",
        "timestamp": "2026-01-15T10:30:00Z",
        "size_mb": 2.8
      }
    ],
    "quote": {
      "subtotal_labor": 400.00,
      "subtotal_surcharges": 235.00,      // 150+85
      "subtotal_hourly": 400.00,          // 8hrs × $50
      "staff_multiplier": 1.25,
      "subtotal_after_staff": 500.00,
      "tax_rate": 0.10,
      "tax_amount": 73.50,
      "total": 808.50,
      "currency": "AUD",
      "generated_at": "2026-01-15T18:00:00Z",
      "valid_until": "2026-01-22"
    },
    "signature": {
      "supervisor": "John Doe",
      "supervisor_timestamp": "2026-01-15T17:45:00Z",
      "client": "Jane Smith",
      "client_timestamp": "2026-01-15T17:50:00Z",
      "notes": "Property cleaned to satisfaction"
    },
    "metadata": {
      "created_at": "2026-01-15T09:00:00Z",
      "updated_at": "2026-01-15T17:50:00Z",
      "app_version": "1.0.0",
      "device": "iPad",
      "os": "iOS 17"
    }
  }
}
```

---

## WordPress Plugin Integration (Future)

### Custom Post Type
```php
register_post_type('cleaning_checklist', array(
  'labels' => array('name' => 'Cleaning Checklists'),
  'public' => false,
  'show_in_rest' => true,
  'supports' => array('title', 'editor', 'custom-fields'),
  'capability_type' => 'post'
));
```

### Meta Box (Settings Panel)
```php
add_meta_box(
  'checklist_pricing',
  'Pricing Settings',
  'render_pricing_metabox',
  'cleaning_checklist'
);
```

### Roles Required
```php
// Add custom role if needed
add_role('property_manager', 'Property Manager', array(
  'read' => true,
  'read_cleaning_checklist' => true,
  'edit_cleaning_checklist' => false,
));
```

---

## Testing Data (Copy-Paste Ready)

### Test Window Variant Selection
```html
<label class="checklist-item" data-item-id="test-windows" ...>
  <input type="checkbox" />
  <select data-options-select="window_variants">
    <option value="2br">2BR - $65</option>    <!-- Select this -->
    <option value="3br">3BR - $85</option>
    <option value="4br">4BR - $110</option>
  </select>
</label>
```

Expected result: Check box → dropdown appears → select option → price updates

### Test Price Display
```
Expected (Admin view):
  ✅ Oven (inside) - $150
  ✅ Windows (select type) - from $65
  ✅ Garage - $100

Expected (Supervisor view):
  ✅ Oven (inside)
  ❌ No price shown

Expected (Public view):
  ✅ Oven (inside)
  ❌ No price shown
```

---

## Implementation Checklist by Phase

### Phase 1: Data Attributes ⬜
- [ ] Bath 1-4 (40 items)
- [ ] Bed 1-4 (20 items)
- [ ] Remaining Kitchen (7 items)
- [ ] Living Room (7 items)
- [ ] Entryway (5 items)
- [ ] Laundry (8 items)
- [ ] Remaining Deep Clean (6 items)
- [ ] Remaining Special (1 item)
- [ ] Residential (44 items) - later
- **Total**: 138 items → ✅ All have data-item-id, room, category, hours

### Phase 2: Dropdown Styling ⬜
- [ ] CSS `.variant-dropdown` rules
- [ ] Show/hide on parent checkbox
- [ ] Smooth slide animation (200ms)
- [ ] Hover states

### Phase 3: Settings Tab ⬜
- [ ] Create HTML structure
- [ ] Add all surcharge inputs
- [ ] Add hourly rate inputs
- [ ] Style to match design system
- [ ] Test form submission

### Phase 4: Role-Based CSS ⬜
- [ ] `.view-admin` class rules
- [ ] `.view-supervisor` class rules
- [ ] `.view-public` class rules
- [ ] `.view-property-manager` class rules
- [ ] Hide pricing from non-admin
- [ ] Hide settings from non-admin

### Phase 5: PHP Integration ⬜
- [ ] Read wp_options (pricing)
- [ ] Detect user role
- [ ] Apply role-based wrapper class
- [ ] Calculate quotes from checked items
- [ ] Save checklists to database

### Phase 6: Photo Integration ⬜
- [ ] Add photo upload fields
- [ ] Media library integration
- [ ] Before/after gallery
- [ ] Mobile photo support

---

**Last Updated**: End of documentation session  
**Next Review**: Before Phase 1 implementation
