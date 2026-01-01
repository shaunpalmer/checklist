# Mobile Resilience: Web Worker + IndexedDB Queue (Implementation Playbook)

This is an implementation-ready process for capturing mobile interactions (taps, checkboxes, dictation transcripts) safely under poor connectivity.

Goals:
- No lost taps (durable queue)
- No UI blocking (main thread stays light)
- Clean JSON delivery to backend once connectivity allows

This repo already contains the core primitives:
- Worker: `checklist/js/event-worker.js`
- Main thread bridge: `Checklist.enqueueEvent()` + `Checklist.flushEventQueue()` in `checklist/js/checklist-script.js`
- Snapshot durability: IndexedDB `snapshots` store + localStorage fallback key `checklist_snapshot_latest`

---

## 1) Why Web Workers here

Mobile browsers share one main thread for:
- input (tap/scroll)
- layout/paint
- JS execution

If you do heavy logic (dedupe, storage, retry loops) on the main thread, you risk:
- dropped taps (user perceives “it didn’t register”)
- UI stalls

A dedicated worker lets you:
- write to IndexedDB asynchronously
- batch/flush events without blocking UI

---

## 2) High-level architecture

Main thread (UI)
- captures intent (click/tap/checkbox/dictation result)
- posts minimal messages to worker
- renders a simple sync status (“Saved locally”, “Offline (queued)”, “Synced”)

Worker (background)
- normalizes event
- assigns `event_id`
- persists to IndexedDB `events`
- retries + backoff
- flushes as JSON envelopes to backend

Sync triggers
- `online` event → flush
- periodic flush while online (small cadence; repo uses 10s)
- `pagehide` → save snapshot + flush best-effort

---

## 3) Event flow (step-by-step)

1. User performs action (e.g. checks an item, taps a phone CTA, finishes dictation)
2. Main thread calls a single function:

```js
Checklist.enqueueEvent({
  type: 'phone_tap',
  ts: new Date().toISOString(),
  context: { page: location.pathname, serviceType: Checklist.getActiveServiceType() },
  payload: { number: '+6422...', source: 'cta_primary' }
});
```

3. Main thread posts `{ op: 'capture', event }` to the worker
4. Worker persists the record into IndexedDB (`events` store)
5. When online, main thread calls `{ op: 'flush', online: true }` (also triggered periodically)
6. Worker builds a JSON envelope and POSTs to your endpoint
7. On success, worker marks events as delivered (`delivered_at`)
8. On failure, worker schedules retry with exponential backoff (`next_attempt_at`)

---

## 4) Storage strategy (what to store where)

### 4.1 IndexedDB (primary; async)

Use IndexedDB for durable event queues.
This repo’s worker already uses:
- DB: `checklist_event_queue`
- Store: `events` (keyPath: `event_id`)
- Store: `snapshots` (keyPath: `id`, with a `latest` record)

Event record shape (current repo implementation):

```json
{
  "event_id": "evt_...",
  "type": "room_packet",
  "ts": "2026-01-01T10:00:00.000Z",
  "context": {"page": "/checklist-modern.html", "serviceType": "commercial"},
  "payload": {"item_id": "kitchen-oven", "selected": true},
  "fingerprint": "room_packet|/checklist-modern.html|kitchen-oven",
  "delivered_at": null,
  "attempts": 0,
  "next_attempt_at": "2026-01-01T10:00:00.000Z"
}
```

### 4.2 localStorage (small fallback; synchronous)

Use localStorage only as a best-effort fallback for restoring the UI quickly if the worker isn’t ready.
In this repo:
- snapshot fallback key: `checklist_snapshot_latest`

Rule:
- Always write fallback snapshot on main thread (`saveSnapshot()`)
- Worker persists the authoritative snapshot to IndexedDB (`save_snapshot`)

---

## 5) JSON envelope format (batch delivery)

The worker currently sends:

```json
{
  "meta": {
    "schema": 1,
    "created_at": "2026-01-01T10:00:00.000Z"
  },
  "events": [
    {
      "event_id": "evt_...",
      "type": "phone_tap",
      "ts": "2026-01-01T10:00:01.000Z",
      "context": {"page": "/..."},
      "payload": {"number": "+6422..."},
      "fingerprint": "phone_tap|/..|"
    }
  ]
}
```

Backend contract recommendation:
- Return either:
  - `{ "delivered_event_ids": ["evt_1", "evt_2"] }` (preferred)
  - or a plain `200 OK` (worker will mark all in-batch as delivered)

---

## 6) Cooldown & de-dupe logic (implementation-ready)

Problem:
- mobile users can tap repeatedly (or double-tap)
- you do not want 30 identical analytics events or backend writes

Mechanism:
- derive a stable `fingerprint` for each event
- within a cooldown window (e.g. 5 minutes), treat repeats as one intent

Recommended fingerprint inputs:
- `type`
- `context.page` (or stable page key)
- stable payload identifiers (e.g. `item_id`, `number`, `field_key`)

This repo already computes a fingerprint in the worker:
- `computeFingerprint(entry)` uses `type + page + item_id`

To implement cooldown-dedupe in the worker (outline):
- before `idbPut(record)`, query the latest undelivered event by `fingerprint`
- if it exists and `now - last.ts <= cooldownMs`:
  - either drop the new event, or
  - merge: increment a `repeat_count` and update `ts` (your choice)

Keep it simple:
- drop duplicates for analytics-like events (`phone_tap`)
- keep all events for state transitions (checkbox toggles) unless you can safely merge

---

## 7) Retry/backoff rules (already implemented)

Worker behaviour (current):
- failed flush increments `attempts`
- schedules `next_attempt_at = now + backoffMs(attempts)`
- uses exponential backoff with jitter

Operational recommendation:
- cap batch size (repo default `limit=50`)
- flush periodically only while online (repo uses 10s)

---

## 8) Voice input add-on (mic buttons) and offline event capture

Your UI already supports mic buttons (progressive enhancement):
- identity fields replace values
- notes fields append values
- no audio is stored; transcript only

Offline integration rule:
- treat transcripts as interaction events

Example payload:

```js
Checklist.enqueueEvent({
  type: 'dictation_result',
  ts: new Date().toISOString(),
  context: { page: location.pathname },
  payload: {
    field_key: 'quote-client-name',
    mode: 'replace',
    value_delta: 'John Smith'
  }
});
```

---

## 9) Custom items: store snapshots for offline consistency

When rendering quote/checklist items sourced from a mutable catalog (e.g. `wp_ays_items`), store a snapshot into the checklist/quote packet so that offline work remains consistent even if the catalog changes later.

Snapshot fields:
- `item_id`
- `hash` (if available)
- `description` (label)
- `details` (public description)

Rendering pattern (mobile-friendly, CSS-only):

```html
<details class="item-details">
  <summary>Details</summary>
  <div class="item-details__body">(render `details` here)</div>
</details>
```

---

## 10) Implementation checkpoints (what “done” looks like)

- UI never blocks on network (events always `postMessage` to worker)
- Every interaction is durable (exists in IndexedDB `events` quickly)
- Offline state shows “Offline (queued)”
- Going online triggers flush and “Synced” updates
- Backend receives envelope JSON and can acknowledge delivered IDs
- Snapshot restore works even after refresh (worker `load_snapshot` + localStorage fallback)
