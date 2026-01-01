# Cleaning Checklist System - Architecture & PRD

## Executive Summary

A **role-based, multi-mode cleaning checklist system** that serves three distinct user personas:
- **Customers** - View what was completed (accountability)
- **Supervisors** - Track time, mark items complete (field operations)
- **Admins/Owners** - Full control, pricing, quotes, settings (business operations)

The same HTML checklist adapts its appearance and functionality based on user role via **PHP conditionals** and **CSS class toggles**.

---

## System Overview

### Three Viewing Modes

#### 1. **Customer View** (Public/Shared)
- **Access**: Client receives link or embeds on confirmation page
- **Visible**: Completed checklist items only
- **Hidden**: Amounts, times, settings, admin controls
- **Purpose**: Proof of service, accountability, transparency
- **Example**: "✓ Kitchen cleaned, ✓ Bathrooms cleaned, ✓ Floors mopped"

#### 2. **Supervisor View** (Field Operations)
- **Access**: Crew lead/supervisor logged into WordPress
- **Visible**: Full checklist items, time tracking (start/finish)
- **Hidden**: Pricing, surcharges, data amounts, settings
- **Purpose**: Track progress, manage time, communicate with office
- **Example**: Start 9:00am, Finish 5:30pm, mark items complete on tablet/phone

#### 3. **Admin/Quote View** (Office/Owner)
- **Access**: Owner/admin logged into WordPress
- **Visible**: Everything (checklist, times, amounts, settings, quote mode)
- **Hidden**: Nothing (full transparency)
- **Purpose**: Generate quotes, track costs, analyze production rates, manage pricing
- **Example**: "Oven deep clean = $75 surcharge + 1 hour labor, Drawer work = +$50"

---

## Data Architecture

### HTML Data Attributes (Future PHP Integration)

Every checklist item carries metadata for quote calculation and business logic:

```html
<label class="checklist-item" 
  id="kitchen-drawers"
  data-room="kitchen"
  data-category="drawer"
  data-hours="1"
  data-difficulty="deep"
  data-product="degreaser"
  data-area-type="confined"
  data-production-rate="0"
  data-charge-amount="50"
  data-role="admin"
  data-include-in-quote="true">
  
  <input type="checkbox" name="kitchen" />
  <span class="checkbox-custom"></span>
  <span class="item-label">Drawers/Pantry (empty & wipe)</span>
</label>
```

### Attribute Definitions

| Attribute | Example | Purpose | Who Sees |
|-----------|---------|---------|----------|
| `data-room` | `"kitchen"` | Room identifier for grouping | Everyone |
| `data-category` | `"drawer"`, `"deep-clean"` | Task classification | Admin only |
| `data-hours` | `"1"`, `"0.5"` | Labor hours required | Admin/Supervisor |
| `data-difficulty` | `"basic"`, `"deep"` | Labor intensity (affects rate multiplier) | Admin only |
| `data-product` | `"degreaser"`, `"glass-cleaner"` | Consumables used | Admin only |
| `data-area-type` | `"confined"`, `"high"`, `"large"` | Special conditions | Admin only |
| `data-production-rate` | `"400"` | Sq ft/hour for area-based tasks | Admin only |
| `data-charge-amount` | `"50"`, `"75"` | Fixed surcharge in dollars | Admin only |
| `data-role` | `"admin"`, `"supervisor"`, `"public"` | Minimum role to view | PHP controls visibility |
| `data-include-in-quote` | `"true"`, `"false"` | Whether item can be quoted | Admin only |

---

## PHP Implementation - Role-Based Display

### WordPress Integration (PHP)

```php
<?php
/**
 * Cleaning Checklist - Role-Based View Controller
 * 
 * This displays the checklist based on current user role.
 * Handles conditional visibility for customer/supervisor/admin modes.
 */

// Get current user role (WordPress)
$current_user = wp_get_current_user();
$user_role = isset($current_user->roles[0]) ? $current_user->roles[0] : 'guest';

// Determine view mode
$is_admin = current_user_can('manage_options');
$is_supervisor = current_user_can('edit_posts') || in_array($user_role, ['supervisor', 'administrator']);
$is_customer = !is_user_logged_in() || in_array($user_role, ['subscriber']);

// View mode classes (added to body or container)
$view_classes = [];
if ($is_customer) $view_classes[] = 'view-customer';
if ($is_supervisor) $view_classes[] = 'view-supervisor';
if ($is_admin) $view_classes[] = 'view-admin';

?>

<!-- Wrap checklist with role-based classes -->
<div class="checklist-wrapper <?php echo implode(' ', $view_classes); ?>">

  <!-- ============================================
       CUSTOMER VIEW: Show completed items only
       ============================================ -->
  <?php if ($is_customer): ?>
    <div class="customer-summary">
      <h2>Service Completion Report</h2>
      <p>Items completed on <?php echo date('F j, Y'); ?></p>
      <div class="completed-items-summary">
        <!-- JavaScript will populate this -->
      </div>
    </div>
  <?php endif; ?>

  <!-- ============================================
       SUPERVISOR VIEW: Time tracking
       ============================================ -->
  <?php if ($is_supervisor): ?>
    <div class="supervisor-toolbar">
      <div class="time-tracker">
        <label>Start Time:
          <input type="time" id="start-time" class="supervisor-only" />
        </label>
        <label>Finish Time:
          <input type="time" id="finish-time" class="supervisor-only" />
        </label>
        <div id="actual-duration" class="supervisor-only">
          Duration: <span id="duration-display">--:--</span>
        </div>
      </div>
    </div>
  <?php endif; ?>

  <!-- ============================================
       ADMIN VIEW: Settings & Quote Mode
       ============================================ -->
  <?php if ($is_admin): ?>
    <div class="admin-toolbar">
      <button id="toggle-quote-mode" class="btn-quote-mode">
        Quote Mode: OFF
      </button>
      <a href="#" class="btn-settings">⚙ Settings</a>
    </div>

    <!-- Admin-Only Settings Panel -->
    <div id="settings-panel" class="admin-only" style="display:none;">
      <h3>Pricing & Settings</h3>
      <fieldset>
        <legend>Hourly Rates</legend>
        <label>Base Rate ($/hr)
          <input type="number" id="base-rate" value="50" min="0" step="5" />
        </label>
        <label>Premium Rate (Deep Clean, $/hr)
          <input type="number" id="premium-rate" value="75" min="0" step="5" />
        </label>
      </fieldset>
      
      <fieldset>
        <legend>Production Rates</legend>
        <label>Standard Cleaning (sq ft/hr)
          <input type="number" id="production-standard" value="400" min="50" step="50" />
        </label>
        <label>Deep Cleaning (sq ft/hr)
          <input type="number" id="production-deep" value="250" min="50" step="50" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Surcharge Items</legend>
        <label>Oven Deep Clean
          <input type="number" id="surcharge-oven" value="75" min="0" step="5" />
        </label>
        <label>Drawer/Pantry Work
          <input type="number" id="surcharge-drawers" value="50" min="0" step="5" />
        </label>
        <label>Window Cleaning (exterior)
          <input type="number" id="surcharge-windows" value="100" min="0" step="5" />
        </label>
      </fieldset>

      <button id="save-settings" class="btn-primary">Save Settings</button>
    </div>

    <!-- Quote Mode Summary -->
    <div id="quote-summary" class="admin-only quote-mode-hidden">
      <h3>Quote Summary</h3>
      <div class="quote-breakdown">
        <div class="quote-item">
          <span class="label">Base Labor Hours:</span>
          <span class="value" id="quote-base-hours">0</span>
        </div>
        <div class="quote-item">
          <span class="label">Base Labor Cost:</span>
          <span class="value" id="quote-base-cost">$0.00</span>
        </div>
        <div class="quote-item">
          <span class="label">Surcharges:</span>
          <span class="value" id="quote-surcharges">$0.00</span>
        </div>
        <div class="quote-item total">
          <span class="label">Total Quote:</span>
          <span class="value" id="quote-total">$0.00</span>
        </div>
      </div>
      <button id="apply-quote" class="btn-success">Apply This Quote</button>
    </div>
  <?php endif; ?>

  <!-- ============================================
       MAIN CHECKLIST (visible to all, styled by role)
       ============================================ -->
  <div class="checklist-content">
    <!-- Service tabs, meta fields, checklist items, etc. -->
  </div>

</div> <!-- end .checklist-wrapper -->
```

### CSS for Role-Based Visibility

```css
/* Admin-only content - hidden for non-admins */
.admin-only {
  display: none;
}

.view-admin .admin-only {
  display: block;
}

/* Supervisor-only content */
.supervisor-only {
  display: none;
}

.view-supervisor .supervisor-only,
.view-admin .supervisor-only {
  display: block;
}

/* Hide amounts/pricing for non-admin views */
.view-customer [data-charge-amount],
.view-supervisor [data-charge-amount] {
  display: none;
}

/* Quote mode - show item toggles for admin only */
.quote-mode-active .checklist-item::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  background: transparent;
  border: 2px solid var(--color-accent);
  margin-right: var(--space-md);
  cursor: pointer;
}

/* Hide quote summary until admin enables it */
.quote-mode-hidden {
  display: none;
}

.view-admin.quote-active .quote-mode-hidden {
  display: block;
}
```

---

## Features by Mode

### Customer Mode
- ✅ View completed items
- ✅ See service date
- ✅ PDF/print proof of service
- ❌ Cannot edit
- ❌ No pricing visible
- ❌ No time tracking visible

### Supervisor Mode
- ✅ Full checklist access
- ✅ Time tracking (start/finish)
- ✅ Mark items complete
- ✅ Photo uploads
- ✅ Auto-calculate duration
- ❌ Cannot see pricing/amounts
- ❌ Cannot modify settings
- ❌ Cannot generate quotes

### Admin Mode
- ✅ Everything supervisors see
- ✅ Full pricing/surcharge view
- ✅ Quote generation mode
- ✅ Settings panel
- ✅ Production rate analysis
- ✅ Item selection for quotes
- ✅ Time vs. estimate analysis
- ✅ Generate customer summary
- ✅ Cost tracking per job

---

## Quote Mode Workflow

### Admin Quote Generation

```javascript
// jQuery/JS pseudocode for quote mode
$(document).ready(function() {
  
  $('#toggle-quote-mode').on('click', function() {
    const $body = $('body');
    const isActive = $body.hasClass('quote-active');
    
    $body.toggleClass('quote-active');
    $(this).text('Quote Mode: ' + (isActive ? 'OFF' : 'ON'));
    
    // Show/hide quote summary
    $('#quote-summary').toggleClass('quote-mode-hidden');
  });

  // When item checked in quote mode, recalculate
  $('.checklist-item input[type="checkbox"]').on('change', function() {
    if ($('body').hasClass('quote-active')) {
      calculateQuote();
    }
  });

  function calculateQuote() {
    let baseHours = 0;
    let surcharges = 0;
    const baseRate = parseFloat($('#base-rate').val()) || 50;

    // Sum checked items
    $('.checklist-item input:checked').each(function() {
      const $label = $(this).closest('.checklist-item');
      
      // Add hours from data attribute
      const hours = parseFloat($label.data('hours')) || 0;
      baseHours += hours;
      
      // Add surcharge amounts
      const charge = parseFloat($label.data('charge-amount')) || 0;
      surcharges += charge;
    });

    // Calculate costs
    const baseCost = baseHours * baseRate;
    const total = baseCost + surcharges;

    // Update display
    $('#quote-base-hours').text(baseHours.toFixed(1));
    $('#quote-base-cost').text('$' + baseCost.toFixed(2));
    $('#quote-surcharges').text('$' + surcharges.toFixed(2));
    $('#quote-total').text('$' + total.toFixed(2));
  }
});
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│         Checklist Item (HTML with data-*)           │
│  <label data-hours="1" data-charge="$50" ...>       │
└────────────┬────────────────────────────────────────┘
             │
      ┌──────▼──────────────────┐
      │  WordPress User Role?   │
      └──────┬──────────────────┘
             │
    ┌────────┼────────┬────────┐
    │        │        │        │
    ▼        ▼        ▼        ▼
  Guest  Subscriber  Editor  Admin
   (Customer) (Supervisor)    (Admin)
    │        │        │        │
    │        │        │        └──→ Full access
    │        │        └──────→ Time tracking
    │        └──────────→ Basic items
    └──────────────→ Completed items only

         PHP Conditionals
         +
         CSS Classes (.view-customer, .view-admin)
         +
         JavaScript Role-Based Features
```

---

## Implementation Phases

### Phase 1: Foundation (Current)
- ✅ Semantic HTML with `<details>/<summary>`
- ✅ Data attributes on all items
- ✅ CSS variables for styling
- ✅ jQuery smooth animations
- ✅ localStorage persistence
- ✅ Print/PDF functionality

### Phase 2: Role-Based Views (Next)
- Add PHP role detection
- CSS classes per user role
- Hide/show content based on role
- Time tracking inputs

### Phase 3: Quote System
- Quote mode toggle
- Item selection checkboxes
- Quote calculation engine
- Surcharge summation
- Quote export/send to customer

### Phase 4: Admin Panel
- Settings page (rates, surcharges, production rates)
- Job analytics (time vs. estimate)
- Customer notifications
- Photo upload integration

### Phase 5: WordPress Plugin
- Convert to full plugin
- Settings stored in wp_options
- User role integration
- Shortcode for embedding
- Email notifications

---

## API Endpoints (Future PHP Backend)

```php
// POST /wp-admin/admin-ajax.php
// action=save_checklist_progress
$_POST = [
  'checklist_id' => 123,
  'service_type' => 'end-of-tenancy',
  'items' => [ 'kitchen-sinks', 'kitchen-floors' ],
  'start_time' => '09:00',
  'finish_time' => '17:30',
  'notes' => '...'
];

// POST /wp-admin/admin-ajax.php
// action=generate_quote
$_POST = [
  'checklist_id' => 123,
  'included_items' => [ 'kitchen-sinks', 'kitchen-drawers' ],
  'client_name' => 'John Doe',
  'send_to_email' => 'john@example.com'
];
```

---

## Security Considerations

1. **Role-based output**: Always verify user role server-side before showing pricing
2. **AJAX endpoints**: Validate user permissions on every request
3. **Data attributes**: Never trust client-side amounts; calculate on server
4. **Customer links**: Unique tokens, not just user ID (privacy)
5. **Settings panel**: Admin-only capability checks

---

## Summary

This system elegantly scales from a simple checklist (customer view) to a full business tool (admin view) using:
- **Semantic HTML** (progressive enhancement)
- **Data attributes** (metadata for calculation)
- **PHP conditionals** (role-based display)
- **CSS class toggling** (visual separation)
- **jQuery enhancements** (smooth interactions)

The **same HTML source code** serves three different audiences with zero duplication.

---

**Status**: Architecture Complete ✅  
**Next**: Implement role-based PHP views  
**Ready**: For WordPress plugin conversion  
