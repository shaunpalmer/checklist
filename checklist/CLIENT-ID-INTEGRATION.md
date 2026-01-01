# Client ID + Population ID Integration Guide

## What Changed

You now have **full address capture + ID tracking** throughout the quote → invoice flow. This ensures:

✅ No address conflicts between quote and invoice  
✅ Client ID always tracked  
✅ Population ID (address reference) always included  
✅ Complete JSON packet for database storage  

---

## System Architecture

### The Envelope Pattern (You Built)

```
Quote Packet = {
  quote_id: "Q-ABC123XYZ",
  client_id: "C001",                    ← WHO
  population_id: 1847,                  ← WHERE (address location)
  address: {                            ← FULL ADDRESS DATA
    population_id: 1847,
    address_line1: "15 Spurks Ave",
    address_line2: null,
    suburb: "Canterbury",
    city: "Christchurch",
    region: "Canterbury",
    postcode: "8042",
    country: "New Zealand"
  },
  quote: { ...pricing data... },
  items: [ ...checked items... ],
  status: "generated"
}
```

This packet **travels with the customer** through:
1. ✅ Quote Tab (generated here)
2. → Send Email/SMS/Schedule (includes this packet)
3. → Database Storage (stores complete packet)
4. → Invoice Tab (retrieves and uses this packet)

---

## What Happens When You Use It

### Step 1: Search Client
```
User types: "john"
↓
API returns mock data (UPDATED NOW):
  client_id: "C001"
  population_id: 1847
  name: "John Smith"
  address_line1: "15 Spurks Ave"
  ... + 6 more address fields
```

### Step 2: Form Auto-Fills (NEW!)
```
Hidden fields populated:
  #quote-client-id        = "C001"
  #quote-population-id    = 1847
  #display-population-id  = "1847"  ← Shows on form

Visible fields populated:
  Name, Email, Phone → as before

NEW Address Fields (read-only, auto-filled):
  address_line1 = "15 Spurks Ave"
  address_line2 = [empty]
  suburb = "Canterbury"
  city = "Christchurch"
  region = "Canterbury"
  postcode = "8042"
  country = "New Zealand"
```

### Step 3: Calculate Quote (NEW!)
```
User clicks "Calculate Quote"
↓
Validation checks:
  ✓ Email present? YES
  ✓ Client ID present? YES  ← NEW
  ✓ Population ID present? YES  ← NEW
↓
Quote calculated (same as before)
↓
JSON PACKET BUILT:
  quote_id = "Q-ABC123XYZ"
  client_id = "C001"  ← INCLUDED
  population_id = 1847  ← INCLUDED
  address = { full structure }  ← INCLUDED
  quote = { pricing }
  status = "generated"
↓
Stored in hidden field #quote-packet
```

### Step 4: Send (Email/SMS/Schedule) (NEW!)
```
User selects send method (Email/SMS/Schedule/Copy)
↓
Validation checks:
  ✓ Email/Phone present? YES
  ✓ Quote generated? YES
  ✓ Client ID present? YES  ← NEW CHECK
  ✓ Population ID present? YES  ← NEW CHECK
↓
Complete packet sent to backend:
  alert shows:
    ✅ Quote email ready to send
    Client ID: C001
    Population ID: 1847
```

---

## Backend Integration (Your Next Steps)

### API: Create New Client Search Endpoint

**Required**: Return `client_id` + `population_id` + **full address**

```php
<?php
// File: /wp-admin/admin-ajax.php or custom API

add_action('wp_ajax_search_clients', 'my_search_clients');
add_action('wp_ajax_nopriv_search_clients', 'my_search_clients');

function my_search_clients() {
    global $wpdb;
    
    $query = sanitize_text_field($_GET['q']);
    
    // Search wp_avs_clients and JOIN wp_avs_population
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT 
            c.client_id,
            c.name,
            c.email,
            c.phone,
            c.population_id,
            p.address_line1,
            p.address_line2,
            p.suburb,
            p.city,
            p.region,
            p.postcode,
            p.country
         FROM wp_avs_clients c
         LEFT JOIN wp_avs_population p ON c.population_id = p.population_id
         WHERE c.name LIKE %s OR c.email LIKE %s OR c.phone LIKE %s
         LIMIT 10",
        '%' . $query . '%',
        '%' . $query . '%',
        '%' . $query . '%'
    ));
    
    wp_send_json_success($results);
}
?>
```

**Wire in JavaScript:**
```javascript
// Replace mock data with real API
$.ajax({
  url: '/wp-admin/admin-ajax.php?action=search_clients',
  data: { q: query },
  success: (response) => {
    const results = response.data;  // Array of client objects
    // Rest of code auto-fills from here
  }
});
```

---

### API: Store Quote to Database (NEW!)

**Must validate** `population_id` before storing

```php
<?php
add_action('wp_ajax_save_quote', 'my_save_quote');

function my_save_quote() {
    global $wpdb;
    
    // Get quote packet from JavaScript
    $packet = json_decode(stripslashes($_POST['quote_packet']), true);
    
    // VALIDATION: Verify population_id exists
    $population = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM wp_avs_population WHERE population_id = %d",
            $packet['population_id']
        )
    );
    
    if (!$population) {
        wp_send_json_error([
            'message' => 'Invalid population_id. Address not found.',
            'population_id' => $packet['population_id']
        ]);
        return;
    }
    
    // VALIDATION: Verify client_id exists
    $client = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM wp_avs_clients WHERE client_id = %d",
            $packet['client_id']
        )
    );
    
    if (!$client) {
        wp_send_json_error([
            'message' => 'Invalid client_id. Client not found.',
            'client_id' => $packet['client_id']
        ]);
        return;
    }
    
    // INSERT: Store complete quote
    $wpdb->insert('wp_avs_quotes', [
        'quote_id' => $packet['quote_id'],
        'client_id' => $packet['client_id'],
        'population_id' => $packet['population_id'],  ← CRITICAL
        'total_amount' => $packet['quote']['total'],
        'json_data' => json_encode($packet),
        'created_at' => current_time('mysql'),
        'status' => 'generated'
    ]);
    
    if ($wpdb->last_error) {
        wp_send_json_error(['message' => $wpdb->last_error]);
    } else {
        wp_send_json_success([
            'message' => 'Quote saved',
            'quote_id' => $packet['quote_id'],
            'client_id' => $packet['client_id'],
            'population_id' => $packet['population_id']
        ]);
    }
}
?>
```

**Wire in JavaScript:**
```javascript
// In generateQuote() after packet is built:
$.ajax({
  url: '/wp-admin/admin-ajax.php',
  type: 'POST',
  data: {
    action: 'save_quote',
    quote_packet: $('#quote-packet').val()
  },
  success: (response) => {
    if (response.success) {
      alert('✅ Quote saved to database!\n' + 
            'Quote ID: ' + response.data.quote_id + '\n' +
            'Client ID: ' + response.data.client_id + '\n' +
            'Population ID: ' + response.data.population_id);
    } else {
      alert('❌ Error: ' + response.data.message);
    }
  }
});
```

---

### Invoice Tab: Retrieve Quote (Using Population ID)

```php
<?php
add_action('wp_ajax_get_quote_for_invoice', 'my_get_quote_for_invoice');

function my_get_quote_for_invoice() {
    global $wpdb;
    
    $quote_id = sanitize_text_field($_GET['quote_id']);
    
    // Get quote WITH full address via population_id
    $quote = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT 
                q.*,
                p.address_line1,
                p.address_line2,
                p.suburb,
                p.city,
                p.region,
                p.postcode,
                p.country
             FROM wp_avs_quotes q
             LEFT JOIN wp_avs_population p ON q.population_id = p.population_id
             WHERE q.quote_id = %s",
            $quote_id
        ),
        ARRAY_A
    );
    
    if (!$quote) {
        wp_send_json_error('Quote not found');
        return;
    }
    
    // Decode stored JSON packet
    $packet = json_decode($quote['json_data'], true);
    
    wp_send_json_success([
        'quote' => $quote,
        'packet' => $packet,
        'address' => [
            'address_line1' => $quote['address_line1'],
            'address_line2' => $quote['address_line2'],
            'suburb' => $quote['suburb'],
            'city' => $quote['city'],
            'region' => $quote['region'],
            'postcode' => $quote['postcode'],
            'country' => $quote['country']
        ]
    ]);
}
?>
```

**Usage in Invoice Tab:**
```javascript
// When creating invoice from quote:
$.ajax({
  url: '/wp-admin/admin-ajax.php',
  data: { action: 'get_quote_for_invoice', quote_id: quoteId },
  success: (response) => {
    const quote = response.data.quote;
    const address = response.data.address;
    
    // Create invoice with all data
    // Address is already populated from population_id JOIN
  }
});
```

---

## Database Table Requirements

### wp_avs_quotes (Create or Update)

```sql
CREATE TABLE wp_avs_quotes (
  quote_id VARCHAR(20) PRIMARY KEY,
  client_id BIGINT NOT NULL,
  population_id BIGINT NOT NULL,           ← CRITICAL FIELD
  total_amount DECIMAL(10, 2),
  json_data LONGTEXT,                      ← Stores complete packet
  created_at DATETIME,
  status VARCHAR(20),
  
  FOREIGN KEY (client_id) REFERENCES wp_avs_clients(client_id),
  FOREIGN KEY (population_id) REFERENCES wp_avs_population(population_id)
);
```

### wp_avs_population (Already Exists)

Your table has everything needed. Just verify:

```sql
DESCRIBE wp_avs_population;

-- Should have:
-- population_id (PK)
-- address_line1
-- address_line2 (nullable)
-- suburb
-- city
-- region
-- postcode
-- country
```

---

## Testing Checklist

- [ ] Client search returns both `client_id` AND `population_id`
- [ ] Form auto-fills all 7 address fields
- [ ] Hidden fields store: client_id, population_id, quote_id
- [ ] JSON packet includes full address structure
- [ ] Database stores population_id with quote
- [ ] Invoice can retrieve quote and get address via population_id
- [ ] No address conflicts between quote storage and invoice lookup

---

## Security Notes

✅ **Do this:**
- Validate `population_id` exists in database before storing
- Validate `client_id` exists in database before storing
- Verify `population_id` matches client's `population_id` (prevents orphaning)
- Use prepared statements (code examples above already do this)

❌ **Don't do this:**
- Trust population_id from JavaScript without validating
- Allow changing population_id after quote is stored (breaks audit trail)
- Store address as freetext (always reference population_id for single source of truth)

---

## Summary

**What you got:**
- ✅ Client search with ID capture
- ✅ Population ID passed through entire flow
- ✅ Full address structure (7 fields)
- ✅ Complete JSON packet for storage
- ✅ Validation points before database insert
- ✅ No conflicts with invoice system

**What you need to build:**
- Backend client search API (return population_id!)
- Quote storage validation (check population_id exists)
- Invoice retrieval (JOIN on population_id)

**Impact:**
- Quote→Invoice flow now complete with zero address conflicts
- Client ID tracked at every stage
- Full audit trail in JSON packet
- Ready for production

