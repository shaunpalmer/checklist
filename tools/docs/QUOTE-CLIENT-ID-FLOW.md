# Quote → Client ID → Invoice Flow

## Problem Statement
Quote system needs to:
1. ✅ Capture client information 
2. ✅ Attach **population_ID** (address reference)
3. ✅ Include both in JSON packet
4. ✅ Pass through to Invoice system without conflict
5. ✅ Validate ID is included before database storage

---

## Database Structure Reference

### `wp_avs_population` Table
```
population_id (PRIMARY KEY, UNSIGNED)
├── address_line1 (varchar 190)
├── address_line2 (varchar 190) [nullable]
├── suburb (varchar 120) [nullable]
├── city (varchar 120)
├── region (varchar 120) [nullable]
├── postcode (varchar 20) [nullable]
└── country (varchar 120)
```

### `wp_avs_clients` Table (Referenced from your system)
```
client_id (PRIMARY KEY)
├── name
├── email (UNIQUE)
├── phone
├── population_id (FOREIGN KEY → wp_avs_population)
└── status (Active/Archived)
```

### `wp_avs_invoices` Table (Target)
```
invoice_id (PRIMARY KEY)
├── quote_id (FOREIGN KEY → wp_avs_quotes)
├── client_id (FOREIGN KEY → wp_avs_clients)
├── population_id (FOREIGN KEY → wp_avs_population) ← CRITICAL for address
├── total_amount
├── created_at
└── status
```

---

## JSON Packet Structure (Envelope Pattern)

### What Gets Sent: Full Data Envelope

```json
{
  "envelope": {
    "id": "Q-ABC123XYZ",
    "type": "quote",
    "version": "1.0",
    "timestamp": "2026-01-01T09:30:00Z"
  },
  
  "client": {
    "client_id": 42,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "(555) 123-4567",
    "population_id": 1847
  },
  
  "address": {
    "population_id": 1847,
    "address_line1": "15 Spurks Ave",
    "address_line2": null,
    "suburb": "Canterbury",
    "city": "Christchurch",
    "region": "Canterbury",
    "postcode": "8042",
    "country": "New Zealand"
  },
  
  "service": {
    "service_type": "end-of-tenancy",
    "service_code": "EOT",
    "booking_date": "2026-01-15"
  },
  
  "quote": {
    "quote_id": "Q-ABC123XYZ",
    "items_count": 18,
    "estimated_hours": 8.5,
    "base_cost": 425.00,
    "surcharges": 235.00,
    "subtotal": 660.00,
    "tax_rate": 15,
    "tax_amount": 99.00,
    "total": 759.00,
    "currency": "NZD",
    "generated_at": "2026-01-01T09:30:00Z"
  },
  
  "items": [
    {
      "id": "kitchen-sinks",
      "room": "kitchen",
      "label": "Sinks and Faucets",
      "checked": true,
      "hours": 0.5,
      "base_cost": 25.00
    },
    {
      "id": "deep-oven",
      "room": "deep-cleaning",
      "label": "Oven (deep clean)",
      "checked": true,
      "charge_amount": 150.00,
      "service_code": "OC(S)"
    }
  ],
  
  "crew": {
    "crew_name": "John's Cleaning",
    "supervisor": "John",
    "staff_count": 2
  },
  
  "status": {
    "generated": true,
    "sent": false,
    "accepted": false,
    "invoiced": false
  }
}
```

---

## Data Flow Diagram

```
QUOTE TAB
┌──────────────────────┐
│ User searches client │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ API: /api/clients/search             │
│ Returns: client_id, population_id    │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ Auto-fill form:                      │
│ • client_id                          │
│ • name, email, phone                 │
│ • population_id                      │
│ • address_line1...country            │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ Calculate Quote                      │
│ Generate: quote_id, totals           │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ Build JSON Packet                    │
│ ✅ Include: population_id            │
│ ✅ Include: Full address from DB     │
│ ✅ Include: client_id                │
└──────────┬───────────────────────────┘
           │
           ↓ (Send Email/SMS/Later/Link)
┌──────────────────────────────────────┐
│ Store Quote to DB                    │
│ INSERT wp_avs_quotes:                │
│ • quote_id                           │
│ • client_id      ← CRITICAL          │
│ • population_id  ← CRITICAL          │
│ • total_amount                       │
│ • json_data      ← Full packet       │
└──────────┬───────────────────────────┘
           │
           ↓
INVOICE TAB (Later)
┌──────────────────────────────────────┐
│ Retrieve Quote by ID                 │
│ (population_id already in DB)        │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ Create Invoice                       │
│ Link:                                │
│ • quote_id → wp_avs_quotes           │
│ • client_id → wp_avs_clients         │
│ • population_id → wp_avs_population  │
│           (gets full address)        │
└──────────────────────────────────────┘
```

---

## Implementation Points

### 1. Search API Should Return
```javascript
// /api/clients/search?q=john
{
  "clients": [
    {
      "client_id": 42,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "(555) 123-4567",
      "population_id": 1847,        ← MUST INCLUDE
      "address_line1": "15 Spurks Ave",
      "suburb": "Canterbury",
      "city": "Christchurch",
      "postcode": "8042",
      "country": "New Zealand"
    }
  ]
}
```

### 2. JavaScript Should Store
```javascript
// When client selected:
const selectedClient = {
  client_id: data.client_id,
  population_id: data.population_id,  ← STORE THIS
  name: data.name,
  email: data.email,
  phone: data.phone
};

// When building packet:
const packet = {
  client: {
    client_id: selectedClient.client_id,
    population_id: selectedClient.population_id,  ← PASS THIS
    ...
  },
  address: {
    population_id: selectedClient.population_id,  ← REFERENCE THIS
    address_line1: data.address_line1,
    suburb: data.suburb,
    city: data.city,
    region: data.region,
    postcode: data.postcode,
    country: data.country
  }
}
```

### 3. Database Validation (PHP)
Before inserting into `wp_avs_quotes`:
```php
// Validate population_id exists
$population = $wpdb->get_row(
  $wpdb->prepare(
    "SELECT * FROM wp_avs_population WHERE population_id = %d",
    $quote['population_id']
  )
);

if (!$population) {
  wp_send_json_error([
    'message' => 'Invalid population_id. Address data not found.',
    'population_id' => $quote['population_id']
  ]);
  return;
}

// If valid, proceed with insert
$wpdb->insert('wp_avs_quotes', [
  'quote_id' => $quote['id'],
  'client_id' => $quote['client_id'],
  'population_id' => $quote['population_id'],  ← STORE THIS
  'total_amount' => $quote['total'],
  'json_data' => json_encode($quote_packet),
  'created_at' => current_time('mysql'),
  'status' => 'generated'
]);
```

### 4. Invoice Retrieval (PHP)
```php
// Get quote with full address
$quote = $wpdb->get_row(
  $wpdb->prepare(
    "SELECT q.*, p.* FROM wp_avs_quotes q
     LEFT JOIN wp_avs_population p ON q.population_id = p.population_id
     WHERE q.quote_id = %s",
    $_POST['quote_id']
  ),
  ARRAY_A
);

// Now you have:
// - $quote['client_id']      (link to client)
// - $quote['population_id']  (link to address)
// - $quote['address_line1']  (from JOIN)
// - $quote['suburb'], etc.   (from JOIN)
```

---

## Validation Checklist

Before quote flows to invoice, verify:

- [ ] `client_id` is populated
- [ ] `population_id` is populated
- [ ] `population_id` exists in `wp_avs_population` table
- [ ] Full address data matches `population_id`
- [ ] JSON packet includes both `client_id` AND `population_id`
- [ ] Quote stored to database with both IDs
- [ ] Invoice can retrieve using `population_id` JOIN

---

## Conflict Resolution

**Q: Won't quote address conflict with invoice address?**

**A: No, because:**
- Quote stores address AT TIME OF QUOTE (snapshot in `json_data`)
- Population table stores CURRENT address (linked via `population_id`)
- If address changes after quote:
  - Quote still has historical address in JSON
  - Invoice can use CURRENT address from population table
  - Or use quote's JSON snapshot if needed
  - Both flows have `population_id` to maintain consistency

**Q: What if client changes population_id?**

**A: Handled by:**
- Quote stores `population_id` at time of quote
- If client moves, gets new `population_id`
- Quote still references old address via stored `population_id`
- Invoice can choose:
  - Use quote's `population_id` (address at quote time)
  - Use client's current `population_id` (current address)
  - Store both for audit trail

---

## Summary

**The Envelope Pattern in Action:**

```
Quote → {
  ✅ client_id (WHO)
  ✅ population_id (WHERE - address location)
  ✅ Full address data (DISPLAY DATA)
  ✅ JSON packet (COMPLETE SNAPSHOT)
} → Invoice

✅ No conflicts
✅ Address always linked via population_id
✅ Full address available at every stage
✅ Audit trail preserved in JSON
```

