# AYS Offline Quotes — IndexedDB Specification

> **Version:** 2.0  
> **Last Updated:** 2026-02-01  
> **Status:** Revised specification (supersedes v1.0 single-snapshot approach)

---

## Part 1: Technical Specification

### 1.1 Purpose

Provide a reliable, offline-first **multi-draft system** for field quoting. Support multiple quotes per day with full CRUD operations. Quotes must survive app restarts, phone power loss, and connectivity gaps.

### 1.2 Design Principles

- **Multiple drafts**: Support 5+ quotes per day, each as a separate record
- **CRUD operations**: Create, Read, Update, Delete individual drafts
- **Granular updates**: Change one field without rewriting entire record
- **Human-readable listing**: Identify drafts by customer name/address, not "Draft 1"
- **Offline-first**: All operations work without connectivity
- **Quiet resume**: Auto-load last active draft on app start

### 1.3 Technology Stack

| Component | Technology |
|-----------|------------|
| Storage | IndexedDB (native browser API) |
| Runtime | Native JavaScript (no external libraries) |
| Data Format | JSON (text only, no photos/blobs) |
| Worker | Dedicated Web Worker for sync queue |

---

## Part 2: Database Schema

### 2.1 Database: `ays_quotes`

#### Object Store: `drafts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `draftId` | string | ✓ (keyPath) | UUID, unique identifier |
| `createdAt` | ISO timestamp | ✓ | When draft was created |
| `updatedAt` | ISO timestamp | ✓ | Last modification time |
| `syncStatus` | enum | ✓ | `draft` / `syncing` / `synced` / `error` |
| `syncedAt` | ISO timestamp | | When successfully synced |
| `serverQuoteId` | string | | ID returned from server |

**Customer Fields (for list display):**

| Field | Type | Description |
|-------|------|-------------|
| `customerFirstName` | string | First name |
| `customerLastName` | string | Last name |
| `address` | string | Property address |
| `phone` | string | Contact phone |
| `email` | string | Contact email |

**Settings Fields (structural choices):**

| Field | Type | Description |
|-------|------|-------------|
| `serviceType` | string | `end-of-tenancy` / `residential` / `commercial` |
| `propertyType` | string | `residential` / `office` / `gym` / `warehouse` |
| `propertyConfig` | object | Bedrooms, bathrooms, showers, difficulty, etc. |

**Payload (form state):**

| Field | Type | Description |
|-------|------|-------------|
| `payload` | object | Complete form state (see 2.2) |

**Indexes:**

| Index | Field | Purpose |
|-------|-------|---------|
| `by_updated` | `updatedAt` | Sort by recent |
| `by_status` | `syncStatus` | Find unsynced drafts |
| `by_created` | `createdAt` | Sort by creation date |

#### Object Store: `meta`

| Key | Value | Description |
|-----|-------|-------------|
| `activeDraftId` | string | Currently active draft |
| `lastSyncAttempt` | timestamp | When sync was last tried |

### 2.2 Payload Structure

The `payload` field contains all form-level state:

```javascript
{
  // Checkbox states (item ID → checked)
  progress: {
    "item-kitchen-sink-01": true,
    "item-kitchen-oven-01": false,
    // ... all 218+ items
  },
  
  // Variant dropdown selections
  variantSelections: {
    "checkbox-id": "selected-variant"
  },
  
  // Custom items discovered during walk-through
  customItems: [
    {
      id: "custom-001",
      description: "Extra oven cleaning",
      hours: 1.5,
      charge: 75
    }
  ],
  
  // Per-item notes
  notes: {
    "item-kitchen-oven-01": "Heavy carbon buildup, needs soaking"
  },
  
  // Quote calculation results
  calculated: {
    totalHours: 12.5,
    staffRequired: 2,
    quoteAmount: 450
  }
}
```

---

## Part 3: CRUD Operations

### 3.1 Create Draft

```javascript
async function createDraft(customerInfo = {}) {
  const draft = {
    draftId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'draft',
    
    // Customer info (can be partial, updated later)
    customerFirstName: customerInfo.firstName || '',
    customerLastName: customerInfo.lastName || '',
    address: customerInfo.address || '',
    phone: customerInfo.phone || '',
    email: customerInfo.email || '',
    
    // Settings (defaults, user configures)
    serviceType: 'end-of-tenancy',
    propertyType: 'residential',
    propertyConfig: {},
    
    // Empty payload (populated as user works)
    payload: {
      progress: {},
      variantSelections: {},
      customItems: [],
      notes: {},
      calculated: {}
    }
  };
  
  await db.drafts.add(draft);
  await setActiveDraft(draft.draftId);
  return draft;
}
```

### 3.2 Read Draft(s)

```javascript
// Get single draft by ID
async function getDraft(draftId) {
  return await db.drafts.get(draftId);
}

// List all drafts (for Admin panel)
async function listDrafts() {
  return await db.drafts
    .orderBy('updatedAt')
    .reverse()
    .toArray();
}

// Get active draft
async function getActiveDraft() {
  const meta = await db.meta.get('activeDraftId');
  if (!meta?.value) return null;
  return await getDraft(meta.value);
}
```

### 3.3 Update Draft

```javascript
// Update specific fields (not entire record)
async function updateDraft(draftId, updates) {
  const draft = await getDraft(draftId);
  if (!draft) throw new Error('Draft not found');
  
  // Merge updates
  const updated = {
    ...draft,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await db.drafts.put(updated);
  return updated;
}

// Update just customer info
async function updateCustomerInfo(draftId, customerInfo) {
  return await updateDraft(draftId, {
    customerFirstName: customerInfo.firstName,
    customerLastName: customerInfo.lastName,
    address: customerInfo.address,
    phone: customerInfo.phone,
    email: customerInfo.email
  });
}

// Update just one checkbox
async function updateProgress(draftId, itemId, checked) {
  const draft = await getDraft(draftId);
  draft.payload.progress[itemId] = checked;
  draft.updatedAt = new Date().toISOString();
  await db.drafts.put(draft);
}

// Update settings (triggers form regeneration)
async function updateSettings(draftId, settings) {
  return await updateDraft(draftId, {
    serviceType: settings.serviceType,
    propertyType: settings.propertyType,
    propertyConfig: settings.propertyConfig
  });
}
```

### 3.4 Delete Draft

```javascript
async function deleteDraft(draftId) {
  await db.drafts.delete(draftId);
  
  // If deleted draft was active, clear active
  const meta = await db.meta.get('activeDraftId');
  if (meta?.value === draftId) {
    await db.meta.delete('activeDraftId');
  }
}
```

### 3.5 Switch Active Draft

```javascript
async function setActiveDraft(draftId) {
  await db.meta.put({ key: 'activeDraftId', value: draftId });
}
```

---

## Part 4: Autosave Strategy

### 4.1 When to Save

| Trigger | What Saves | Debounce |
|---------|------------|----------|
| Checkbox change | `payload.progress[itemId]` | 500ms |
| Variant selection | `payload.variantSelections[id]` | 500ms |
| Note added | `payload.notes[itemId]` | 1000ms |
| Custom item added | `payload.customItems` | Immediate |
| Customer field changed | Customer fields | 1000ms |
| Settings changed | Settings fields | Immediate |
| `visibilitychange` | Full record | Immediate |
| `pagehide` | Full record | Immediate |

### 4.2 Granular vs Full Save

**Granular (preferred):** Update just the changed field
```javascript
// User checks one box
updateProgress(activeDraftId, 'item-kitchen-01', true);
```

**Full (on navigation/background):** Save entire current state
```javascript
// App going to background
updateDraft(activeDraftId, buildCurrentState());
```

---

## Part 5: Sync Behaviour

### 5.1 Sync Triggers

- App start (if online)
- Network reconnect (`online` event)
- Manual "Sync Now" from Admin
- Periodic retry (5-15 min interval)

### 5.2 Sync Flow

```javascript
async function syncDraft(draftId) {
  const draft = await getDraft(draftId);
  if (draft.syncStatus === 'synced') return;
  
  await updateDraft(draftId, { syncStatus: 'syncing' });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
    
    if (response.ok) {
      const result = await response.json();
      await updateDraft(draftId, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverQuoteId: result.quoteId
      });
    } else {
      await updateDraft(draftId, { syncStatus: 'error' });
    }
  } catch (e) {
    await updateDraft(draftId, { syncStatus: 'error' });
  }
}

async function syncAllPending() {
  const drafts = await listDrafts();
  const pending = drafts.filter(d => 
    d.syncStatus === 'draft' || d.syncStatus === 'error'
  );
  
  for (const draft of pending) {
    await syncDraft(draft.draftId);
  }
}
```

---

## Part 6: Retention & Cleanup

### 6.1 Policy

| Condition | Action |
|-----------|--------|
| Synced drafts | Delete 14 days after `syncedAt` |
| Unsynced drafts | Delete 30 days after `updatedAt` |

### 6.2 Cleanup Logic

```javascript
async function cleanupOldDrafts() {
  const now = Date.now();
  const SYNCED_TTL = 14 * 24 * 60 * 60 * 1000;   // 14 days
  const UNSYNCED_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  const drafts = await listDrafts();
  
  for (const draft of drafts) {
    const age = draft.syncStatus === 'synced'
      ? now - new Date(draft.syncedAt).getTime()
      : now - new Date(draft.updatedAt).getTime();
    
    const ttl = draft.syncStatus === 'synced' ? SYNCED_TTL : UNSYNCED_TTL;
    
    if (age > ttl) {
      await deleteDraft(draft.draftId);
    }
  }
}
```

---

## Part 7: Admin Panel UI

### 7.1 Draft List Display

```
┌─────────────────────────────────────────────────────────────────┐
│ Quote Drafts (This Device)                                      │
├─────────────────────────────────────────────────────────────────┤
│ ● Mrs Jones, 42 Paddington Way          EOT     10:42am  draft  │
│   Steve Brown, 7/88 High St             Comm    yesterday synced│
│   (no name), 15 Creek Rd                Res     2 days    error │
├─────────────────────────────────────────────────────────────────┤
│ [+ New Quote]                              [Sync All]  [Cleanup]│
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 List Item Actions

| Action | Effect |
|--------|--------|
| Click row | Open that draft, set as active |
| Delete | Remove draft (confirm if unsynced) |
| Sync | Force sync this draft |

### 7.3 Display Label Logic

```javascript
function getDraftLabel(draft) {
  const name = [draft.customerFirstName, draft.customerLastName]
    .filter(Boolean).join(' ') || '(no name)';
  const address = draft.address || '(no address)';
  const service = {
    'end-of-tenancy': 'EOT',
    'residential': 'Res',
    'commercial': 'Comm'
  }[draft.serviceType] || draft.serviceType;
  
  return `${name}, ${address} — ${service}`;
}
```

---

## Part 8: Resume Behaviour

### 8.1 On App Start

```javascript
async function resumeOnStart() {
  const active = await getActiveDraft();
  
  if (active) {
    loadDraftIntoForm(active);
    showToast(`Resumed: ${getDraftLabel(active)}`);
  } else {
    // No active draft — show empty state or prompt
  }
}
```

### 8.2 UX Rules

- Auto-resume is silent (no modal)
- Small toast confirms which quote was loaded
- User can switch drafts in Admin any time

---

## Part 9: Current vs Required Implementation

### 9.1 What Exists (v1.0 — Crash Recovery)

| Feature | Status | Notes |
|---------|--------|-------|
| Single snapshot (`id="latest"`) | ✓ | Overwrites on each save |
| localStorage fallback | ✓ | Quick restore |
| Event queue (sync) | ✓ | Separate from drafts |
| Sync status UI | ✓ | Works |

### 9.2 What's Needed (v2.0 — Multi-Draft CRUD)

| Feature | Status | Priority |
|---------|--------|----------|
| `drafts` object store | ✗ TODO | HIGH |
| Multiple draft records | ✗ TODO | HIGH |
| CRUD functions | ✗ TODO | HIGH |
| `meta.activeDraftId` | ✗ TODO | HIGH |
| Admin draft list panel | ✗ TODO | HIGH |
| Granular field updates | ✗ TODO | MEDIUM |
| Auto-cleanup (14/30 day) | ✗ TODO | MEDIUM |
| Draft switching UI | ✗ TODO | MEDIUM |

### 9.3 Migration Path

1. Create new `ays_quotes` database with `drafts` store
2. Migrate existing `"latest"` snapshot to first draft record
3. Implement CRUD functions
4. Add Admin panel UI
5. Wire autosave to update active draft
6. Implement cleanup job

---

## Part 10: Design Rationale

### 10.1 Why Multiple Records (Not One Blob)?

- **Real-world use**: 5+ quotes per day is normal
- **CRUD support**: Update one field, not rewrite everything
- **List/switch**: Can't list or switch with a single blob
- **Sync granularity**: Sync one quote, not all-or-nothing

### 10.2 Why Customer Fields at Top Level?

- **List display**: Don't parse payload to show "Mrs Jones"
- **Query efficiency**: Index by customer name if needed
- **Human relevance**: "Draft 3" means nothing; "Mrs Jones, Paddington" means everything

### 10.3 Why Settings Separate from Payload?

Settings = structural choices (determines what form generates)
Payload = form state (what user checks/unchecks)

If settings change, form must regenerate. Payload is just checkbox states within that structure.

### 10.4 Why 14/30 Day Cleanup?

- **14 days (synced)**: Data is on server; local is just convenience
- **30 days (unsynced)**: Dead lead, not worth recovering
- **Automatic**: User shouldn't manage cleanup manually

---

## Appendix: Summary of Changes from v1.0

| Aspect | v1.0 (Current) | v2.0 (Required) |
|--------|----------------|-----------------|
| Storage model | Single blob | Multiple records |
| Draft ID | `"latest"` (hardcoded) | UUID per draft |
| Multiple quotes | ✗ Overwrites | ✓ Separate records |
| Update granularity | Full overwrite | Field-level update |
| List drafts | ✗ Can't | ✓ Query all |
| Switch drafts | ✗ Can't | ✓ Set active |
| Delete draft | ✗ Can't | ✓ By ID |
| Customer display | N/A | Name + address |
| Cleanup | Manual | Auto 14/30 days |

---

## Appendix: Settings Tab Implementation Plan

### Current Settings Tab Structure

The Settings area uses a sub-tab navigation system within the main Settings service tab.

**Location:** `checklist-modern.html` lines 2136-2160 (tab buttons), 2162-2570 (tab content panels)

**Architecture:**
```
Main Tabs (service-tabs)
├── End of Tenancy
├── Residential  
├── Commercial
├── Custom Service
├── 💰 Quotes (output)
└── ⚙️ Settings ← Contains sub-tabs below
    ├── 🏠 Property (config)
    ├── 💵 Pricing
    ├── ⚡ Production Rate
    ├── 🔧 Surcharges
    ├── 🎯 Services
    ├── ⚙️ System
    └── 📋 Manage Quotes ← NEW (to be added)
```

**Tab switching controlled by:** `checklist-script.js` → `initSettingsTabs()` (lines 97-149)

**CSS:** `.settings-tab-content { display: none }` / `.settings-tab-content.is-active { display: block }`

### New Tab: 📋 Manage Quotes

**Purpose:** List, switch, create, and delete quote records stored in IndexedDB.

**Tab Button (add to navigation bar):**
```html
<button class="settings-tab-button" data-tab="manage-quotes" style="padding: 12px 16px; border: none; background: none; cursor: pointer; font-weight: 600; color: var(--color-secondary); border-bottom: 3px solid transparent; margin-bottom: -2px;">
  📋 Manage Quotes
</button>
```

**Tab Content Panel:**
```html
<div class="settings-tab-content" data-tab="manage-quotes">
  <div style="border: 1px solid var(--color-border); border-radius: 4px; padding: var(--space-lg); margin-bottom: var(--space-lg);">
    <h3 style="color: var(--color-secondary); margin-bottom: var(--space-md);">📋 Manage Quotes</h3>
    <p style="color: var(--color-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-md);">
      Quotes saved on this device. Select a quote to continue working, or start a new one.
    </p>
    
    <!-- Quote List Container -->
    <div id="quote-list-container" style="margin-bottom: var(--space-lg);">
      <!-- Populated by JavaScript -->
      <p style="color: var(--color-secondary); font-style: italic;">Loading quotes...</p>
    </div>
    
    <!-- Action Buttons -->
    <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
      <button type="button" id="btn-new-quote" class="btn btn-primary">
        ➕ New Quote
      </button>
      <button type="button" id="btn-sync-all-quotes" class="btn btn-secondary">
        🔄 Sync All
      </button>
    </div>
  </div>
</div>
```

### Quote List Item Template

Each quote in the list uses `<details><summary>` for native expand/collapse:

```html
<details class="quote-edit-panel" data-draft-id="uuid-here">
  <summary class="quote-row">
    <input type="checkbox" class="quote-select" />
    <span class="quote-indicator">●</span>
    <span class="quote-label">Mrs Jones, 42 Paddington Way</span>
    <span class="quote-service">EOT</span>
    <span class="status-badge" data-status="draft">draft</span>
    <span class="quote-time">10:42am</span>
  </summary>
  
  <div class="quote-edit-fields">
    <!-- Customer Details Form (see below) -->
  </div>
</details>
```

### Status Color Scheme

| Status | Color | CSS Variable | Meaning |
|--------|-------|--------------|---------|
| `synced` | 🟢 Green | `--status-synced: #22c55e` | Saved to server |
| `draft` | 🟡 Amber | `--status-draft: #f59e0b` | New/unsynced |
| `syncing` | 🔵 Blue | `--status-syncing: #3b82f6` | In progress |
| `error` | 🔴 Red | `--status-error: #ef4444` | Problem, retry |
| Danger BG | Red wash | `--status-danger-bg: rgba(239,68,68,0.1)` | Delete warning |

**CSS for status badges:**

```css
.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}
.status-badge[data-status="synced"] { background: var(--status-synced); }
.status-badge[data-status="draft"] { background: var(--status-draft); }
.status-badge[data-status="syncing"] { background: var(--status-syncing); }
.status-badge[data-status="error"] { background: var(--status-error); }
```

### Customer Details Form (Inline Edit)

When `<details>` opens, show editable customer fields:

```html
<div class="quote-edit-fields">
  <div class="edit-section">
    <h4>👤 Client Details</h4>
    <div class="field-grid">
      <div class="field-row">
        <label for="edit-first-name">First Name</label>
        <div class="input-with-mic">
          <input type="text" id="edit-first-name" placeholder="First name" />
          <button type="button" class="mic-btn" aria-label="Voice input">🎤</button>
        </div>
      </div>
      <div class="field-row">
        <label for="edit-last-name">Last Name</label>
        <div class="input-with-mic">
          <input type="text" id="edit-last-name" placeholder="Last name" />
          <button type="button" class="mic-btn" aria-label="Voice input">🎤</button>
        </div>
      </div>
      <div class="field-row">
        <label for="edit-email">Email</label>
        <input type="email" id="edit-email" placeholder="email@example.com" />
      </div>
      <div class="field-row">
        <label for="edit-phone">Phone</label>
        <input type="tel" id="edit-phone" placeholder="(555) 123-4567" />
      </div>
    </div>
  </div>
  
  <details class="edit-section-collapsible">
    <summary>📍 Property Address</summary>
    <div class="field-grid">
      <div class="field-row full-width">
        <label for="edit-address1">Address Line 1</label>
        <div class="input-with-mic">
          <input type="text" id="edit-address1" placeholder="Street address" />
          <button type="button" class="mic-btn" aria-label="Voice input">🎤</button>
        </div>
      </div>
      <div class="field-row full-width">
        <label for="edit-address2">Address Line 2</label>
        <input type="text" id="edit-address2" placeholder="Apt, Suite, etc." />
      </div>
      <div class="field-row">
        <label for="edit-suburb">Suburb</label>
        <input type="text" id="edit-suburb" placeholder="Suburb" />
      </div>
      <div class="field-row">
        <label for="edit-city">City</label>
        <input type="text" id="edit-city" placeholder="City" />
      </div>
      <div class="field-row">
        <label for="edit-region">Region</label>
        <input type="text" id="edit-region" placeholder="Region/State" />
      </div>
      <div class="field-row">
        <label for="edit-postcode">Postcode</label>
        <input type="text" id="edit-postcode" placeholder="Postcode" />
      </div>
    </div>
  </details>
  
  <div class="edit-actions">
    <button type="button" class="btn btn-primary btn-save">💾 Save</button>
    <button type="button" class="btn btn-secondary btn-sync">🔄 Sync Now</button>
    <button type="button" class="btn btn-danger btn-delete">🗑️ Delete</button>
  </div>
  
  <!-- Inline warning (appears when needed) -->
  <div class="inline-warning" style="display: none;">
    ⚠️ You have unsaved changes
  </div>
</div>
```

### CSS Grid Layout for Edit Form

```css
/* ============================================================================
   QUOTE PANEL - Details/Summary Pattern
   Native HTML, works without JS, animates beautifully
   ============================================================================ */

:root {
  /* Status Colors */
  --status-synced: #22c55e;
  --status-draft: #f59e0b;
  --status-syncing: #3b82f6;
  --status-error: #ef4444;
  --status-danger-bg: rgba(239, 68, 68, 0.1);
}

/* ─────────────────────────────────────────────────────────────
   Quote Panel Container
   ───────────────────────────────────────────────────────────── */
.quote-panel {
  border: 2px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: var(--space-sm);
  background: var(--color-white);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.15s ease;
}

/* Status-based border colors */
.quote-panel[data-status="synced"] { border-color: var(--status-synced); }
.quote-panel[data-status="draft"] { border-color: var(--status-draft); }
.quote-panel[data-status="syncing"] { border-color: var(--status-syncing); }
.quote-panel[data-status="error"] { border-color: var(--status-error); }

/* Hover state */
.quote-panel:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quote-panel:hover:not([open]) {
  background: var(--color-light);
}

/* Open state - subtle glow matching status */
.quote-panel[open] {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quote-panel[open][data-status="draft"] {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
}

.quote-panel[open][data-status="error"] {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.quote-panel[open][data-status="synced"] {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
}

/* Active quote indicator */
.quote-panel.is-active {
  border-left-width: 4px;
  background: rgba(var(--color-accent-rgb), 0.03);
}

/* ─────────────────────────────────────────────────────────────
   Quote Summary Row (the clickable header)
   ───────────────────────────────────────────────────────────── */
.quote-summary {
  display: grid;
  grid-template-columns: auto auto 1fr auto auto auto;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-md);
  cursor: pointer;
  list-style: none;
  transition: background 0.15s ease;
  border-radius: 6px;
}

/* Remove default arrow */
.quote-summary::-webkit-details-marker { display: none; }
.quote-summary::marker { display: none; }

/* Hover on summary */
.quote-summary:hover {
  background: var(--color-light);
}

.quote-panel[open] .quote-summary {
  border-bottom: 1px solid var(--color-border);
  border-radius: 6px 6px 0 0;
  background: var(--color-light);
}

/* Custom chevron - replaces ugly default arrow */
.quote-chevron {
  font-size: 12px;
  color: var(--color-secondary);
  transition: transform 0.2s ease;
}

.quote-panel[open] .quote-chevron {
  transform: rotate(90deg);
}

/* Active indicator bullet */
.quote-indicator {
  font-size: 10px;
  color: var(--color-secondary);
  opacity: 0.3;
}

.quote-panel.is-active .quote-indicator {
  color: var(--color-accent);
  opacity: 1;
}

/* Quote label (customer name + address) */
.quote-label {
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Service type badge */
.quote-service {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  padding: 2px 8px;
  background: var(--color-light);
  border-radius: 4px;
}

/* Time stamp */
.quote-time {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
}

/* ─────────────────────────────────────────────────────────────
   Status Badge
   ───────────────────────────────────────────────────────────── */
.status-badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge[data-status="synced"] { background: var(--status-synced); }
.status-badge[data-status="draft"] { background: var(--status-draft); }
.status-badge[data-status="syncing"] { background: var(--status-syncing); }
.status-badge[data-status="error"] { background: var(--status-error); }

/* ─────────────────────────────────────────────────────────────
   Quote Content (the expandable form)
   Animated with max-height + opacity for smooth open/close
   ───────────────────────────────────────────────────────────── */
.quote-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  padding: 0 var(--space-md);
  transition: 
    max-height 0.2s ease,
    opacity 0.2s ease,
    padding 0.2s ease;
}

.quote-panel[open] .quote-content {
  max-height: 800px;
  opacity: 1;
  padding: var(--space-md);
}

/* ─────────────────────────────────────────────────────────────
   Edit Form Fields
   ───────────────────────────────────────────────────────────── */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row.full-width {
  grid-column: 1 / -1;
}

.field-row label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-secondary);
}

.field-row input,
.field-row select {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-row input:hover,
.field-row select:hover {
  border-color: var(--color-secondary);
}

.field-row input:focus,
.field-row select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.15);
}

/* Input with microphone button */
.input-with-mic {
  display: flex;
  gap: 4px;
}

.input-with-mic input {
  flex: 1;
}

.mic-btn {
  padding: 10px 12px;
  background: var(--color-light);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.mic-btn:hover {
  background: var(--color-white);
  border-color: var(--color-secondary);
}

.mic-btn:active {
  background: var(--status-error);
  color: white;
}

/* ─────────────────────────────────────────────────────────────
   Nested Details (Address section, collapsible)
   ───────────────────────────────────────────────────────────── */
.edit-section-collapsible {
  margin-top: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  transition: border-color 0.15s ease;
}

.edit-section-collapsible:hover {
  border-color: var(--color-secondary);
}

.edit-section-collapsible summary {
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  font-weight: 600;
  color: var(--color-secondary);
  list-style: none;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: background 0.15s ease;
}

.edit-section-collapsible summary::-webkit-details-marker { display: none; }

.edit-section-collapsible summary:hover {
  background: var(--color-light);
}

.edit-section-collapsible summary::after {
  content: '▸';
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s ease;
}

.edit-section-collapsible[open] summary::after {
  transform: rotate(90deg);
}

.edit-section-collapsible[open] summary {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-light);
}

.edit-section-collapsible > .field-grid {
  padding: var(--space-md);
}

/* ─────────────────────────────────────────────────────────────
   Edit Actions Row
   ───────────────────────────────────────────────────────────── */
.edit-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.edit-actions .btn {
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.edit-actions .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-actions .btn:active {
  transform: translateY(0);
}

.btn-danger {
  background: var(--status-error);
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #dc2626;
}

/* ─────────────────────────────────────────────────────────────
   Inline Warning (no ugly alerts)
   ───────────────────────────────────────────────────────────── */
.inline-warning {
  background: var(--status-danger-bg);
  border-left: 3px solid var(--status-error);
  padding: 10px 14px;
  margin-top: var(--space-sm);
  font-size: 13px;
  color: var(--status-error);
  border-radius: 0 6px 6px 0;
  animation: fadeIn 0.2s ease;
}

/* ─────────────────────────────────────────────────────────────
   Delete Confirmation (inline expand)
   ───────────────────────────────────────────────────────────── */
.delete-confirm {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--status-danger-bg);
  border-radius: 6px;
  animation: fadeIn 0.2s ease;
}

.delete-confirm .confirm-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

/* ─────────────────────────────────────────────────────────────
   Toast System (using details for expand)
   ───────────────────────────────────────────────────────────── */
#toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

#toast-container > * {
  pointer-events: auto;
}

.toast {
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: toastIn 0.3s ease;
  min-width: 220px;
}

.toast:hover {
  transform: scale(1.02);
}

.toast-success { background: var(--status-synced); }
.toast-error { background: var(--status-error); }
.toast-warning { background: var(--status-draft); }
.toast-info { background: var(--status-syncing); }

/* Toast with expandable details */
.toast details {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.toast details summary {
  font-size: 12px;
  opacity: 0.8;
  cursor: pointer;
  list-style: none;
}

.toast details summary::-webkit-details-marker { display: none; }

.toast details summary:hover {
  opacity: 1;
}

.toast details summary::after {
  content: ' ▸';
  font-size: 10px;
}

.toast details[open] summary::after {
  content: ' ▾';
}

.toast .toast-detail-content {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.9;
}

/* ─────────────────────────────────────────────────────────────
   Animations
   ───────────────────────────────────────────────────────────── */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

/* ─────────────────────────────────────────────────────────────
   Fallback: Works without JS (graceful degradation)
   ───────────────────────────────────────────────────────────── */
@supports not (max-height: 0) {
  .quote-content {
    max-height: none;
    opacity: 1;
    padding: var(--space-md);
  }
}
```

### Toast System

**Container (add to page once):**

```html
<div id="toast-container" style="
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
"></div>
```

**Toast with expandable details:**

```html
<div class="toast toast-success">
  <div class="toast-message">✓ Quote saved</div>
  <details class="toast-details">
    <summary>Details</summary>
    <div class="toast-detail-content">
      Mrs Jones, 42 Paddington Way<br>
      Saved at 10:42am
    </div>
  </details>
</div>
```

**Toast CSS:**

```css
.toast {
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: toastIn 0.3s ease;
  min-width: 200px;
}

.toast-success { background: var(--status-synced); }
.toast-error { background: var(--status-error); }
.toast-warning { background: var(--status-draft); }
.toast-info { background: var(--status-syncing); }

.toast-details summary {
  font-size: 12px;
  opacity: 0.8;
  cursor: pointer;
  margin-top: 4px;
}

.toast-detail-content {
  font-size: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}
```

**Toast JavaScript (native, no jQuery):**

```javascript
function showToast(message, options = {}) {
  const {
    type = 'info',
    details = null,
    duration = 3000
  } = options;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let html = `<div class="toast-message">${message}</div>`;
  
  if (details) {
    html += `
      <details class="toast-details">
        <summary>Details</summary>
        <div class="toast-detail-content">${details}</div>
      </details>
    `;
  }
  
  toast.innerHTML = html;
  document.getElementById('toast-container').appendChild(toast);
  
  // Auto-dismiss (unless user is interacting with details)
  const timeoutId = setTimeout(() => dismissToast(toast), duration);
  
  toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  toast.addEventListener('mouseleave', () => {
    setTimeout(() => dismissToast(toast), 1000);
  });
}

function dismissToast(toast) {
  toast.style.animation = 'toastOut 0.3s ease forwards';
  setTimeout(() => toast.remove(), 300);
}
```

### Inline Delete Confirmation (No Modal)

```javascript
function confirmInlineDelete(detailsElement, draftId) {
  const editFields = detailsElement.querySelector('.quote-edit-fields');
  
  // Check if unsynced
  const status = detailsElement.dataset.status;
  if (status !== 'synced') {
    // Show inline warning
    const warning = document.createElement('div');
    warning.className = 'delete-confirm';
    warning.innerHTML = `
      <div class="inline-warning">
        ⚠️ This quote hasn't been synced. Delete anyway?
      </div>
      <div class="confirm-actions">
        <button class="btn btn-danger btn-confirm-delete">Yes, Delete</button>
        <button class="btn btn-secondary btn-cancel-delete">Cancel</button>
      </div>
    `;
    editFields.appendChild(warning);
    
    warning.querySelector('.btn-confirm-delete').onclick = async () => {
      await deleteQuote(draftId);
      detailsElement.remove();
      showToast('Quote deleted', { type: 'success' });
    };
    
    warning.querySelector('.btn-cancel-delete').onclick = () => {
      warning.remove();
    };
  } else {
    // Synced = safe to delete without confirm
    deleteQuote(draftId);
    detailsElement.remove();
    showToast('Quote removed from device', { type: 'success' });
  }
}

### Implementation Steps

#### Phase 1: HTML Structure
1. Add "Manage Quotes" button to Settings tab navigation
2. Add `data-tab="manage-quotes"` content panel
3. Verify tab switches correctly (JS already handles it)

#### Phase 2: IndexedDB Store
1. Create `ays_quotes` database with `drafts` object store
2. Implement CRUD functions in new file: `js/quote-storage.js`
   - `createQuote(customerInfo)`
   - `getQuote(draftId)`
   - `updateQuote(draftId, fields)`
   - `deleteQuote(draftId)`
   - `listQuotes()`
   - `getActiveQuote()`
   - `setActiveQuote(draftId)`

#### Phase 3: UI Wiring
1. On Settings tab → Manage Quotes shown: call `renderQuoteList()`
2. "New Quote" button: create record, set active, switch to form
3. "Open" button: set active, load into form, switch to form
4. "Delete" button: confirm if unsynced, then delete
5. "Sync All" button: attempt sync for all pending quotes

#### Phase 4: Form Integration
1. On app start: load active quote into form (quiet resume)
2. On form change: autosave to active quote record
3. On quote switch: save current, load new, regenerate form if settings differ

#### Phase 5: Cleanup & Polish
1. Implement 14/30 day auto-cleanup
2. Add toast notifications for save/load/sync
3. Handle edge cases (no quotes, sync errors, storage full)

### Files to Modify

| File | Changes |
|------|---------|
| `checklist-modern.html` | Add tab button + content panel |
| `checklist-script.js` | Wire UI events, integrate with storage |
| `js/quote-storage.js` | **NEW** — CRUD functions for IndexedDB |
| `event-worker.js` | May extend or keep separate from event queue |
| `css/checklist-style.css` | Quote list item styles (optional, can use inline) |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Manage Quotes Tab                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [+ New Quote]  [Sync All]                           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ● Mrs Jones, 42 Paddington Way    EOT   10:42 draft │   │
│  │   Steve B, 7/88 High St           Comm  yday  synced│   │
│  │   (no name), 15 Creek Rd          Res   2d    error │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           │ [New]              │ [Open]             │ [Delete]
           ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    quote-storage.js                         │
│  createQuote() │ getQuote() │ updateQuote() │ deleteQuote() │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              IndexedDB: ays_quotes                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ drafts                                               │   │
│  │ ├── { draftId: "abc", customerName: "Mrs Jones"...} │   │
│  │ ├── { draftId: "def", customerName: "Steve B"... }  │   │
│  │ └── { draftId: "ghi", address: "15 Creek Rd"... }   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ meta                                                 │   │
│  │ └── { key: "activeDraftId", value: "abc" }          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```