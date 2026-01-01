# PHP Implementation Roadmap

## Portal Architecture

The checklist serves **4 distinct user portals**, all from the same HTML source:

### 1. **Client Portal** (Public/Shared Link)
- **Access**: Client receives unique token link
- **Sees**: ✅ Completed items, photos, service date, signature
- **Cannot**: Edit, see pricing, see times
- **Purpose**: Proof of service, accountability, photo documentation

### 2. **Supervisor Portal** (Field Operations)
- **Access**: WordPress login - Role: `supervisor`
- **Sees**: ✅ Full checklist, time tracking, photos, notes
- **Cannot**: See pricing, access settings, generate quotes
- **Purpose**: Track progress in field, real-time updates

### 3. **Admin/Owner Portal** (Full Control)
- **Access**: WordPress login - Role: `administrator`
- **Sees**: ✅ Everything - checklist, times, pricing, settings
- **Can**: Generate quotes, adjust pricing, view analytics
- **Purpose**: Business operations, invoicing, cost analysis

### 4. **Property Manager Portal** (NEW - Client-Facing)
- **Access**: WordPress login - Role: `property_manager` (custom)
- **Sees**: ✅ Checklist, photos, can compare before/after
- **Cannot**: Edit, see internal costs
- **Purpose**: Landlord/property manager accountability

---

## Data Attributes Structure

### Core Attributes (Every Item)
```html
data-room="kitchen"              <!-- Room identifier -->
data-category="deep-clean"       <!-- Task type -->
data-item-id="kitchen-sinks"     <!-- Unique ID for tracking -->
```

### Labor & Time (For Calculations)
```html
data-hours="4"                   <!-- Fixed hours -->
data-min-hours="1.25"            <!-- Variable min -->
data-max-hours="2"               <!-- Variable max -->
data-hours-threshold="7"         <!-- Staff threshold -->
```

### Pricing (Database-Linked)
```html
data-base-charge="150"           <!-- Base price (oven single) -->
data-labor-cost="27"             <!-- Labor portion -->
data-material-cost="19.57"       <!-- Material/supplies portion -->
data-service-code="OC(S)"        <!-- Invoice tracking code -->
data-settings-key="surcharge_single_oven"  <!-- Link to PHP settings -->
```

### Variants & Dropdowns
```html
data-variant-type="dropdown"     <!-- Has selection options -->
data-options-key="window_variants"  <!-- Links to PHP dropdown list -->
data-price-key="window_prices"   <!-- Links to pricing data -->
```

### Role-Based Visibility
```html
data-role="admin"                <!-- Minimum role: admin|supervisor|public -->
data-role-hide="public,supervisor"  <!-- Hide from these roles -->
```

---

## PHP Classes & Structure (Recommended)

### `classes/ChecklistItem.php`
```php
<?php
class ChecklistItem {
    public $id;
    public $room;
    public $category;
    public $label;
    public $hours;
    public $base_charge;
    public $labor_cost;
    public $material_cost;
    public $settings_key;
    
    public function __construct($attributes) {
        $this->id = $attributes['data-item-id'] ?? '';
        $this->room = $attributes['data-room'] ?? '';
        $this->category = $attributes['data-category'] ?? '';
        $this->hours = floatval($attributes['data-hours'] ?? 0);
        $this->base_charge = floatval($attributes['data-base-charge'] ?? 0);
        $this->settings_key = $attributes['data-settings-key'] ?? '';
    }
    
    public function get_current_price() {
        // Read from wp_options if settings_key exists
        if ($this->settings_key) {
            return get_option($this->settings_key, $this->base_charge);
        }
        return $this->base_charge;
    }
}
?>
```

### `classes/ChecklistQuote.php`
```php
<?php
class ChecklistQuote {
    public $items = [];
    public $staff_count = 1;
    public $total_hours = 0;
    public $total_cost = 0;
    
    public function add_item($checklist_item) {
        $this->items[] = $checklist_item;
        $this->total_hours += $checklist_item->hours;
    }
    
    public function calculate_total() {
        $this->total_cost = 0;
        foreach ($this->items as $item) {
            $this->total_cost += $item->get_current_price();
        }
        
        // Apply staff multiplier if hours > 7
        if ($this->total_hours > 7 && $this->staff_count > 1) {
            $this->total_cost *= 1.25; // 25% premium for additional staff
        }
        
        return $this->total_cost;
    }
}
?>
```

### `classes/ChecklistPortal.php`
```php
<?php
class ChecklistPortal {
    private $user_role;
    private $checklist_html;
    
    public function __construct($checklist_html) {
        $current_user = wp_get_current_user();
        $this->user_role = $current_user->roles[0] ?? 'guest';
        $this->checklist_html = $checklist_html;
    }
    
    public function render() {
        // Add role classes to wrapper
        $wrapper_class = "view-{$this->user_role}";
        
        // Filter HTML based on role
        return $this->apply_role_filters();
    }
    
    private function apply_role_filters() {
        // Remove items with data-role-hide containing current role
        // Show only items with data-role <= current role level
        // Apply CSS classes for visibility
    }
}
?>
```

---

## Settings Panel (WordPress)

### Database Options to Create
```php
// In wp_options table
'surcharge_single_oven' => 150.00
'surcharge_double_oven' => 200.00
'surcharge_windows' => 26.00  // per pane
'surcharge_carpet_per_room' => 52.00
'base_hourly_rate' => 50.00
'premium_hourly_rate' => 75.00  // for deep clean
'staff_threshold_hours' => 7
'staff_multiplier' => 1.25
```

### Admin Settings Form (HTML)
```html
<form id="checklist-settings">
  <h2>Pricing Settings</h2>
  
  <fieldset>
    <legend>Surcharges</legend>
    <label>
      Single Oven: $
      <input type="number" name="surcharge_single_oven" 
             data-settings-key="surcharge_single_oven" 
             value="150" step="5" />
    </label>
    <label>
      Double Oven: $
      <input type="number" name="surcharge_double_oven" 
             data-settings-key="surcharge_double_oven" 
             value="200" step="5" />
    </label>
  </fieldset>
  
  <fieldset>
    <legend>Hourly Rates</legend>
    <label>
      Base Rate ($/hr): $
      <input type="number" name="base_hourly_rate" 
             data-settings-key="base_hourly_rate" 
             value="50" step="1" />
    </label>
    <label>
      Premium Rate - Deep Clean ($/hr): $
      <input type="number" name="premium_hourly_rate" 
             data-settings-key="premium_hourly_rate" 
             value="75" step="1" />
    </label>
  </fieldset>
  
  <button type="submit">Save Settings</button>
</form>
```

### AJAX Endpoint
```php
// wp-admin/admin-ajax.php?action=save_checklist_settings
add_action('wp_ajax_save_checklist_settings', function() {
    check_ajax_referer('checklist_nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Unauthorized');
    }
    
    foreach ($_POST['settings'] as $key => $value) {
        update_option($key, sanitize_text_field($value));
    }
    
    wp_send_json_success('Settings saved');
});
```

---

## JSON Packet Structure (For API/Storage)

```json
{
  "checklist": {
    "id": 12345,
    "service_type": "end-of-tenancy",
    "property": {
      "address": "123 Main St",
      "bedrooms": 3,
      "bathrooms": 2
    },
    "crew": {
      "name": "John's Cleaning Team",
      "staff_count": 2
    },
    "timeline": {
      "start_time": "09:00",
      "finish_time": "17:30",
      "actual_hours": 8.5,
      "estimated_hours": 8.0
    },
    "items": [
      {
        "id": "kitchen-sinks",
        "room": "kitchen",
        "category": "basic",
        "checked": true,
        "hours": 0.5,
        "notes": "Found mold behind tap"
      },
      {
        "id": "kitchen-drawers",
        "room": "kitchen",
        "category": "surcharge",
        "checked": true,
        "hours": 1,
        "charge_amount": 50,
        "settings_key": "surcharge_drawers"
      }
    ],
    "quote": {
      "subtotal_labor": 400.00,
      "subtotal_surcharges": 175.00,
      "staff_multiplier": 1.25,
      "total": 718.75,
      "currency": "AUD",
      "generated_at": "2026-01-01T03:30:00Z"
    },
    "photos": [
      {
        "id": "photo_1",
        "room": "kitchen",
        "url": "/uploads/checklist/12345/photo_1.jpg",
        "timestamp": "2026-01-01T09:15:00Z"
      }
    ]
  }
}
```

---

## Implementation Phases

### Phase 1: Data Attributes (IN PROGRESS)
- [ ] Add to Deep Cleaning items
- [ ] Add to Windows variants
- [ ] Add to Carpet variants
- [ ] Add to Surcharge items

### Phase 2: Dropdowns & Variants
- [ ] Windows dropdown (2BR, 3BR, 4BR, etc.)
- [ ] Carpet dropdown (1-7 rooms)
- [ ] Multi-select for bundles

### Phase 3: PHP Classes
- [ ] Create ChecklistItem class
- [ ] Create ChecklistQuote class
- [ ] Create ChecklistPortal class

### Phase 4: Settings Panel
- [ ] Create admin settings form
- [ ] Wire to wp_options
- [ ] AJAX save endpoint

### Phase 5: Portal Integration
- [ ] Implement role detection
- [ ] Filter HTML per role
- [ ] Apply CSS visibility classes
- [ ] Test all 4 portals

### Phase 6: Photo Integration
- [ ] Add photo upload fields
- [ ] Store in wp_media
- [ ] Link to checklist items
- [ ] Display in portals

---

## Security Checklist

- [ ] Verify user role on EVERY PHP endpoint
- [ ] Sanitize all form inputs
- [ ] Use nonces for AJAX calls
- [ ] Never trust client-side calculations
- [ ] Encrypt customer portal tokens
- [ ] Log all quote generation
- [ ] Validate photo uploads

---

## Database Schema (Optional - Future)

```sql
CREATE TABLE checklist_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  checklist_id INT,
  item_id VARCHAR(255),
  room VARCHAR(100),
  category VARCHAR(100),
  checked BOOLEAN,
  hours DECIMAL(5,2),
  charge_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE checklist_quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  checklist_id INT,
  total_labor DECIMAL(10,2),
  total_surcharges DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  staff_count INT,
  created_at TIMESTAMP,
  sent_to_email VARCHAR(255)
);
```

---

**Status**: Ready for implementation  
**Next Session**: Start with Phase 1 data attributes + update HTML  
**Priority**: Windows and Carpet dropdowns (most variable pricing)
