# WordPress Leads “Detective” + Custom Services (CRUD-lite)

This doc is a handoff note for moving this `checklist/` folder into your AYS WordPress plugin and wiring it into:

1) **Lead intake** (AYS Leads CPT + optional connectors for WPForms / Gravity / Fluent / CF7)
2) **Custom Services** (create/update custom quote/checklist items in the same UI style and pricing model)

---

## Part A — Lead intake: hybrid “Detective + Adapter” design

### Goal
- In the checklist UI, the **📋 Use Lead Data** button should fill:
  - client name / email / phone
  - address fields
  - optionally booking date + internal notes
- The checklist should *not* care which form plugin produced the lead.

### Architecture summary
- **Server-side (WordPress)**: detect installed lead sources, normalize into a single payload (“LeadEnvelope”), expose via REST.
- **Front-end (checklist)**: call one endpoint (or consume injected `window.__CHECKLIST_LEAD__`) and fill the form.

This avoids DOM-scraping plugins and keeps the checklist portable.

### LeadEnvelope (normalized contract)
Return a single normalized object regardless of source:

```json
{
  "lead_id": "123",
  "source": "ays|wpforms|gravity|fluent|cf7",
  "form_id": "optional",
  "created_at": "2026-01-01T00:00:00Z",
  "client": {
    "name": "shaun palmer",
    "email": "…",
    "phone": "…"
  },
  "address": {
    "population_id": null,
    "address_line1": "…",
    "address_line2": "…",
    "suburb": "…",
    "city": "…",
    "region": "…",
    "postcode": "…",
    "country": "New Zealand"
  },
  "booking": {
    "date": "2025-10-30",
    "time": "07:00"
  },
  "notes": "…",
  "raw": {
    "fields": { "plugin_specific": "…" }
  }
}
```

Notes:
- `population_id` is **internal-only** and should not be displayed publicly.
- `raw` is optional (useful for debugging or migration).

### Front-end integration points (already implemented)
- The checklist already supports:
  - clicking **📋 Use Lead Data** to load lead data from:
    - `window.__CHECKLIST_LEAD__` / `window.__LEAD_DATA__` / `window.LeadData`
    - `localStorage['checklist_lead_data']` (and a couple aliases)
    - URL params (for quick testing)
  - your current CPT meta keys:
    - `ays_name`, `ays_email`, `ays_phone`, `ays_address`, `ays_booking_date`, `ays_booking_time`, `ays_notes`

Implementation lives in the checklist JS:
- `Checklist.getLeadDataBestEffort()`
- `Checklist.applyLeadDataToQuoteForm(lead)`

### Recommended WordPress implementation

#### Option 1 (simplest): inject lead into the page
When rendering the checklist page in WP, print:

```php
<script>
window.__CHECKLIST_LEAD__ = <?php echo wp_json_encode($leadEnvelope); ?>;
</script>
```

Then the user presses **Use Lead Data** and the UI fills.

Pros: fastest
Cons: you decide which lead to inject

#### Option 2 (best): REST endpoints + connector detection
Create a small “connector” plugin (or mu-plugin) that:
- detects available lead sources
- provides endpoints:
  - `GET /wp-json/ays/v1/connectors` → what’s installed + enabled
  - `GET /wp-json/ays/v1/lead/latest` → the latest lead (normalized)
  - `GET /wp-json/ays/v1/lead/{id}` → a specific lead (normalized)

**Pseudo-code skeleton (mu-plugin)**

```php
<?php
/**
 * Plugin Name: AYS Lead Connectors (Skeleton)
 */

add_action('rest_api_init', function () {
  register_rest_route('ays/v1', '/connectors', [
    'methods'  => 'GET',
    'permission_callback' => function () {
      return current_user_can('read');
    },
    'callback' => function () {
      return [
        'ays'     => true,
        'wpforms' => class_exists('WPForms'),
        'gravity' => class_exists('GFAPI'),
        'fluent'  => defined('FLUENTFORM'),
        'cf7'     => defined('WPCF7_VERSION'),
      ];
    }
  ]);

  register_rest_route('ays/v1', '/lead/latest', [
    'methods'  => 'GET',
    'permission_callback' => function () {
      return current_user_can('read');
    },
    'callback' => function () {
      // 1) Prefer AYS Leads CPT (your default)
      // 2) Otherwise use configured connector priority
      // 3) Return LeadEnvelope
      return ays_get_latest_lead_envelope();
    }
  ]);
});
```

Security note:
- Keep these endpoints authenticated unless you intentionally want public access.
- If you want field crews not logged into WP, use a signed token or a short-lived nonce.

### What the checklist should call (later)
Once WP endpoints exist, update the button handler to:
- call `/wp-json/ays/v1/lead/latest`
- feed response into `applyLeadDataToQuoteForm()`

---

## Part B — Hide `population_id` from public UI

Already done in the checklist UI:
- It’s hidden using a `.dev-only` span so the value can still be present for internal logic.

If you later want “admin-only debug visibility” in WP:
- render the `.dev-only` span only for admins
- or add a CSS rule in admin context to show it

---

## Part C — Custom Services: CRUD-lite that matches the existing app

### Goal
In the **Custom Service** tab, allow the crew/admin to add “custom items” that:
- look like the existing checklist items (checkbox + label)
- include hours + difficulty like existing items
- flow into pricing/quote the same way as the built-in items

### Constraints (keep it simple)
- Must reuse existing styling patterns (`details/summary`, `.checklist-item`, progress badges, existing CSS variables).
- Must reuse existing pricing logic (based on `data-hours`, `data-difficulty`, and checked state).
- Must persist locally (localStorage + event worker snapshot) even without DB.

### Data model
Store custom service definitions as JSON:

```json
{
  "version": 1,
  "updated_at": "2026-01-01T00:00:00Z",
  "services": {
    "custom": {
      "title": "Custom Service",
      "items": [
        {
          "id": "cust_1704067200_ab12",
          "label": "Clean motorhome exterior",
          "category": "extra",
          "difficulty": "basic|deep",
          "hours": 1.5,
          "active": true
        }
      ]
    }
  }
}
```

Suggested storage key:
- `checklist_custom_services`

### CRUD-lite behavior
- **Create**: add a new custom item (label + hours + difficulty + optional category)
- **Update**:
  - edit item label/hours/difficulty
  - edit service title (optional)
- **Read**:
  - render item list in the Custom tab
  - show progress badge like other rooms
- **No hard delete**:
  - “archive” by setting `active: false` so old quotes remain explainable

### UI spec (minimal)
Inside the Custom tab:
1) A small header row:
   - “Custom Service Name” input (optional)
   - “Add item” button
2) A `details` block similar to other rooms:
   - checkboxes for each custom item
   - each item can have a small “edit” affordance (inline) to update label/hours

### Pricing integration
Custom items should render as the same structure as normal items:
- `label.checklist-item` wrapper
- checkbox input with unique `id`
- `data-hours="…"` and `data-difficulty="…"`

That way **all existing quote computations work without special cases**.

### Persistence + syncing
When custom items are created/edited:
- update `localStorage['checklist_custom_services']`
- enqueue an event like:
  - `type: 'custom_item_create' | 'custom_item_update' | 'custom_item_toggle'`
- include item payload and timestamps

This mirrors what you already do for quote packets + snapshots.

### Optional WordPress persistence (later)
If you want Custom Services shared across crew devices:
- add an endpoint `POST /wp-json/ays/v1/custom-services` to save definitions
- apply same “draft vs confirmed” rule:
  - local-first, then sync when online

---

## Suggested next implementation steps

### Leads
1) Create WP connector skeleton (mu-plugin or plugin)
2) Implement AYS Leads CPT connector first
3) Add `/connectors` and `/lead/latest` endpoints
4) Update checklist “Use Lead Data” to hit `/lead/latest` (instead of the current fallback-only behavior)

### Custom Services
1) Define `checklist_custom_services` schema
2) Build Custom tab UI renderer + “Add item” flow
3) Wire into existing progress + pricing (no special-casing)
4) Persist via localStorage + snapshots + enqueue events

---

## Notes on the screenshot / your current lead CPT
From your admin screenshot, your lead meta keys look like:
- `ays_address`
- `ays_booking_date`
- `ays_booking_time`
- `ays_email`
- `ays_name`
- `ays_notes`
- `ays_phone`

The checklist lead normalizer now recognizes these keys.
