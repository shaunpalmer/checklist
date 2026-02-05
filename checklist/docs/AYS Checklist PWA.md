# AYS Checklist PWA – Drafts, Persistence, Room Composition & Floor Defaults

## Goal

Ensure a quote/checklist can be created **offline**, survive phone sleep/battery loss, be **re-opened and edited (CRUD)** later, and reliably render the correct room/task structure (Residential / End-of-Tenancy / Commercial) with **consistent “base room” composition**.

---

## Key Principles

1. **One quote = one draft** (device-local). Drafts are not “modes”.
2. **Modes are templates/views** that control how a draft renders: `end_of_tenancy | residential | commercial`.
3. **Single source of truth**: the active draft’s stored payload controls the UI.
4. **Composition beats inheritance at runtime**: every room must include `base_room` task-set.
5. **Admin/Settings = structural defaults**, **Form = per-job/per-room overrides**.

---

## Definitions

* **Draft**: A local, editable quote-in-progress stored in IndexedDB.
* **Snapshot**: A point-in-time serialized state of a draft.
* **Hydration**: Loading a snapshot/draft and restoring UI + derived calculations.
* **Task Set**: A named collection of tasks (e.g., `base_room`, `office_addons`).

---

## Persistence Model

### Two Save Paths

**Path A — Manual/Workflow Snapshot (Envelope):**

* Trigger: calculate / save / sync
* Action: build envelope (factory pattern), compute totals, store snapshot, queue sync to worker.

**Path B — Autosave (Continuous Draft State):**

* Trigger: state changes (debounced)
* Action: persist draft to IndexedDB frequently.

### Autosave Frequency (Best Practice)

* Replace “every 250ms” with:

  * **Debounce 800–1500ms** after last change
  * **Flush on**: `visibilitychange`, `pagehide`, `beforeunload` (best effort)
  * **Immediate save** on “critical” changes: mode switch, room counts, client details

### Retention

* Keep drafts until they are:

  * **Synced & archived**, then delete after **14 days** (configurable)
  * Or **stale (no activity)** for **30 days**, then delete (configurable)

---

## Draft CRUD Requirements

### Draft List (Manage Quotes)

* Must show **all local drafts** (not limited to 3–4)
* Sort: `lastUpdated DESC`
* Grouping: optional by `mode` (EOT / Residential / Commercial)

### Actions

* **Create**: New draft (choose mode)
* **Read**: Open draft (hydrate into editor)
* **Update**: Edit any field (client/site details, room selections, tasks)
* **Delete**: Remove draft
* **Duplicate** (optional): clone draft to new ID

### Status

* `draft` | `ready_to_send` | `sent` | `synced` | `archived`
* “Ready” rules enforced only when attempting to send/sync.

---

## Mode Switching Rules (Tabs)

Tabs represent **mode templates**, not separate drafts.

### When user clicks a mode tab

* If **active draft mode == clicked mode**: render normally.
* If **active draft mode != clicked mode**:

  * If draft is **clean/empty**: allow switch mode (rebuild + hydrate)
  * If draft is **dirty (has meaningful data)**: prompt:

    * “Start a new quote in Commercial?”
    * Optional checkbox: “Copy client details (name/phone/address)”.

### Hard Boundary

Switching mode on a dirty draft must not silently mutate a draft into nonsense.

---

## UI/Workflow: Client Details Must Be Visible Up Front

### Problem

Client details currently live behind “Quotes”, causing confusion (“draft ready” when it isn’t).

### Requirement

Add a **Client & Site strip** at the top of the main editor (all modes):

* Name (optional until send)
* Phone (optional until send)
* Address (optional until send)
* Date (default today)

Quotes tab becomes “Manage drafts + sync state”, not “where you enter basics.”

---

## Room/Task System: Composition Spec

### Task Registry

Maintain named task sets:

* `base_room`
* `bedroom_addons`
* `bathroom_addons`
* `kitchen_addons`
* `office_addons`
* `hallway_addons`
* `eot_addons` (mode-specific)
* etc.

### Room Kind vs Label

Store stable keys:

* `roomKind`: `bedroom | bathroom | kitchen | living | laundry | hallway | office | ...`
  UI label changes by mode:
* Commercial: display “Office 1” (roomKind `office`)
* Residential: display “Bedroom 1” (roomKind `bedroom`)

### Composition Rule

All room render output must be produced by one function:

* `getRoomTasks({ mode, roomKind, propertyType })`

**Order:**

1. Start with `base_room`
2. Merge `roomKind_addons`
3. Merge `mode_addons` (EOT / commercial rules)
4. Dedupe by task ID
5. Render

### Hydration Order (Critical)

When opening a draft:

1. Load draft payload
2. Set `mode`
3. Rebuild room structure for that mode
4. Apply stored per-room selections/task states
5. Recalculate derived totals
6. Update UI badges/progress bars

---

## Floor Type Defaults: Settings vs Form

### Intent

* **Settings** should define **default floor types by room category** (structural).
* **Form** should allow per-room override during quoting (tactical).

### Settings Screen

“Floor Type Defaults (Optional)”

* Bedroom default: Carpet/Lino/Tile/Wood/Concrete/Other
* Bathrooms default: …
* Living areas default: …
* Hallways default: …
* Warehouse default: …
* Button: “Apply defaults”

### Form Behaviour

* Each room shows “Floors (select type)” with a dropdown.
* On initial render, if room has no floor type:

  * prefill from settings default for that category
* “Apply to…” menu:

  * Apply to this room type
  * Apply to all rooms

### Data Contracts

* The floor dropdown must always have options.
* The options list is global and loaded once; defaults are separate.

### Known Failure Mode to Fix

If dropdown shows “Choose…” and no options:

* options array not injected / not loaded / wrong selector / wrong scope
* fix by:

  * ensure options are bound before hydration
  * ensure `select` is populated before setting selected value

---

## Search

Search must query **all local drafts** in IndexedDB, not only the active one.
Filters:

* name, phone, address
* mode
* status

---

## Acceptance Criteria

1. Create a draft, fill 70–100 clicks, close phone/browser, reopen: **state restored**.
2. Can open any draft from Manage Quotes and **hydrate UI correctly**.
3. Mode tab click on dirty draft prompts to start new (optional copy client details).
4. Commercial mode shows **Office** rooms (not Bedrooms) without refresh.
5. Bedroom/Office rooms always include base tasks (not “3-item rooms”).
6. Floor type dropdowns always contain options; defaults apply correctly.
7. Draft list supports at least **50 local drafts** without breaking.

---

## Implementation Notes (Non-Functional)

* Prefer IndexedDB for drafts; LocalStorage only for tiny flags.
* Debounce autosave; do not write every 250ms.
* Keep draft schema versioned: `schemaVersion` with migration hooks.

---

## Open Decisions (To Lock In)

1. Mode tab behaviour:

   * A) Always start new quote when switching mode
   * B) Prompt only when draft is dirty
2. “Copy client details” default:

   * off by default, or remember last choice


