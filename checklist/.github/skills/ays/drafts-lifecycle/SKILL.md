# Skill: ays.drafts.lifecycle

> **Purpose:** Define the draft state machine and valid transitions.

---

## When to Use

Trigger this skill when:

- Working with draft CRUD operations
- Implementing sync behaviour
- Managing draft status
- Handling draft cleanup

---

## Draft States

```
┌──────────┐
│  draft   │ ← New/editing (not sent)
└────┬─────┘
     │ User clicks "Send" or "Sync"
     ▼
┌──────────┐
│ syncing  │ ← In-flight to server
└────┬─────┘
     │ Success / Failure
     ▼
┌──────────┐     ┌──────────┐
│  synced  │ or  │  error   │
└──────────┘     └────┬─────┘
                      │ Retry
                      ▼
                ┌──────────┐
                │ syncing  │
                └──────────┘
```

## Status Definitions

| Status | Meaning | UI Indicator |
|--------|---------|--------------|
| `draft` | New or modified, not synced | 🟡 Amber |
| `syncing` | Sync in progress | 🔵 Blue |
| `synced` | Successfully sent to server | 🟢 Green |
| `error` | Sync failed, needs retry | 🔴 Red |

---

## Valid Transitions

```javascript
const VALID_TRANSITIONS = {
  'draft':   ['syncing'],
  'syncing': ['synced', 'error'],
  'synced':  ['draft'],  // If user edits synced draft
  'error':   ['syncing', 'draft']  // Retry or edit
};
```

---

## Draft Operations

### Create

```javascript
function createDraft(serviceType) {
  return {
    draftId: generateUUID(),
    serviceType: serviceType,
    syncStatus: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    snapshot: buildInitialSnapshot(serviceType)
  };
}
```

### Update

```javascript
function updateDraft(draftId, changes) {
  const draft = await getDraft(draftId);
  
  // If synced draft is edited, revert to draft status
  if (draft.syncStatus === 'synced') {
    draft.syncStatus = 'draft';
  }
  
  draft.updatedAt = new Date().toISOString();
  Object.assign(draft, changes);
  
  await saveDraft(draft);
}
```

### Delete

```javascript
function deleteDraft(draftId) {
  const draft = await getDraft(draftId);
  
  // Warn if unsynced
  if (draft.syncStatus !== 'synced') {
    if (!confirmDelete()) return;
  }
  
  await removeDraft(draftId);
}
```

---

## Hard Rules

### ✅ DO

- Track `createdAt` and `updatedAt` separately
- Reset status to `draft` when editing synced draft
- Confirm before deleting unsynced drafts
- Support 10+ drafts without performance issues

### ❌ DON'T

- Delete synced drafts immediately (keep 14 days)
- Allow invalid state transitions
- Lose drafts on mode switch (create new instead)

---

## Related Skills

- `ays.persistence.rules` — When/how to save
- `ays-checklist.drafts` — Checklist-specific draft rules
