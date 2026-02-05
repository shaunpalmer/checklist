# Skill: ays-checklist.drafts

> **Purpose:** Checklist-specific draft storage, lifecycle, and CRUD rules.

---

## When to Use

Trigger this skill when:

- Working with quote/draft storage in the Checklist app
- Implementing "Manage Quotes" functionality
- Handling draft list, load, save, delete

---

## Database Schema

### Database: `ays_quotes`

### Object Store: `drafts`

```javascript
{
  draftId: string,           // UUID, primary key
  createdAt: ISO timestamp,
  updatedAt: ISO timestamp,
  syncStatus: 'draft' | 'syncing' | 'synced' | 'error',
  syncedAt: ISO timestamp | null,
  
  // Customer (for list display)
  customerFirstName: string,
  customerLastName: string,
  address: string,
  phone: string,
  email: string,
  
  // Settings (structural)
  serviceType: 'end-of-tenancy' | 'residential' | 'commercial',
  propertyType: string,
  propertyConfig: object,  // bedrooms, bathrooms, etc.
  
  // Form state
  snapshot: {
    progress: {},           // itemId → checked
    variantSelections: {},  // checkboxId → variant
    customItems: [],
    notes: {},
    rooms: []               // generated room list
  }
}
```

### Object Store: `meta`

```javascript
{
  key: 'activeDraftId',
  value: string  // UUID of current draft
}
```

---

## CRUD Operations

### Create

```javascript
async function createDraft(serviceType, customerInfo = {}) {
  const draft = {
    draftId: crypto.randomUUID(),
    serviceType,
    syncStatus: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...customerInfo,
    snapshot: buildInitialSnapshot(serviceType)
  };
  
  await db.drafts.add(draft);
  await setActiveDraft(draft.draftId);
  return draft;
}
```

### Read

```javascript
async function getDraft(draftId) {
  return await db.drafts.get(draftId);
}

async function listDrafts() {
  return await db.drafts.orderBy('updatedAt').reverse().toArray();
}

async function getActiveDraft() {
  const meta = await db.meta.get('activeDraftId');
  if (!meta) return null;
  return await getDraft(meta.value);
}
```

### Update

```javascript
async function updateDraft(draftId, changes) {
  const draft = await getDraft(draftId);
  draft.updatedAt = new Date().toISOString();
  
  // If editing synced draft, revert to draft status
  if (draft.syncStatus === 'synced') {
    draft.syncStatus = 'draft';
  }
  
  Object.assign(draft, changes);
  await db.drafts.put(draft);
}
```

### Delete

```javascript
async function deleteDraft(draftId) {
  await db.drafts.delete(draftId);
  
  // If deleted active draft, clear active
  const meta = await db.meta.get('activeDraftId');
  if (meta?.value === draftId) {
    await db.meta.delete('activeDraftId');
  }
}
```

---

## List Display

Each draft row shows:

```
● Mrs Jones, 42 Paddington Way    EOT    10:42am   draft
  Steve Brown, 7/88 High St       Comm   yesterday synced
  (no name), 15 Creek Rd          Res    2 days    error
```

### Label Logic

```javascript
function getDraftLabel(draft) {
  const name = [draft.customerFirstName, draft.customerLastName]
    .filter(Boolean).join(' ') || '(no name)';
  const address = draft.address || '(no address)';
  return `${name}, ${address}`;
}
```

---

## Hard Rules

### ✅ DO

- Support 50+ drafts without breaking
- Show human-readable labels (name + address)
- Sort by `updatedAt DESC`
- Confirm before deleting unsynced drafts

### ❌ DON'T

- Limit to "3-4 drafts only"
- Use opaque labels like "Draft 1"
- Delete active draft without switching first

---

## Related Skills

- `ays.drafts.lifecycle` — State machine
- `ays-checklist.hydration` — Loading drafts into UI
