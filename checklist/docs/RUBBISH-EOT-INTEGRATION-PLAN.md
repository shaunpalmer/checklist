# Integration Plan — Rubbish Add-on Form + End-of-Tenancy vs Residential Task Separation

## Goal

Integrate the new **Rubbish Removal booking HTML** into the existing checklist/booking project, including conditional **Hoarding / Skip** logic, and fix the **End-of-Tenancy vs Residential** issue by ensuring each job type renders the correct, non-ambiguous task list.

---

## Part A — Integrate "Rubbish Taken Away" Add-on UI

### A1) Decide how it plugs into the current flow

Pick one:

* **Inline add-on** inside existing booking/quote flow (recommended): shows "Rubbish removal?" toggle + dynamic fields.
* **Separate booking page** that feeds into the same quote object/state.

**Outcome:** the user can add rubbish removal during a clean booking without breaking the existing UX.

### A2) Data model (state) for rubbish removal

Add a single object in your quote/session model, e.g.

* `rubbish.enabled: boolean`
* `rubbish.loads: number` (trailer loads)
* `rubbish.type: string` (household / greenwaste / construction etc)
* `rubbish.location: string` (driveway / backyard etc)
* `rubbish.access: string` (easy / stairs / long carry etc)
* `rubbish.timeWindow: string`
* `rubbish.hoarding: boolean` (derived OR explicit)
* `rubbish.skipRequired: boolean` (derived)
* `rubbish.notes: string` (optional)

### A3) Business rules (UI + pricing triggers)

Implement as explicit rules so it can't drift:

* If `loads >= 3` (or "over two loads"), **show hoarding block** (and/or skip options).
* If hoarding is selected OR loads exceed threshold:
  * show **skip/bin options**
  * show **extra labour/time warning**
  * optionally request **photos** (future enhancement)

**Important:** treat "hoarding block" as a *conditional module*, not a separate page.

### A4) Incorporation steps (mechanical)

* Drop the HTML into the project as a component/partial (avoid copy-paste into one giant file).
* Namespaces for IDs/classes so it doesn't collide with existing checklist elements.
* Wire events:
  * toggle on/off
  * loads dropdown change -> show/hide hoarding block
  * persist values into quote/session state
* Ensure validation only applies when `rubbish.enabled === true`.

### A5) Acceptance criteria

* Toggle off: rubbish UI hidden, no required fields, quote unaffected.
* Toggle on: required fields validated.
* Loads <= 2: hoarding block hidden.
* Loads >= threshold: hoarding block appears reliably.
* Refresh/reload restores the correct UI state from stored quote.

---

## Part B — Fix End-of-Tenancy vs Residential Task Lists

### B1) Make job type identity "hard", not implied

Your project must treat these as **different job types**, not a single list with modifiers.

Add/confirm a single definitive field:

* `jobType: 'RESIDENTIAL_FURNISHED' | 'EOT_EMPTY'` (or similar)

### B2) Two separate task sources (non-negotiable)

Implement one of these approaches:

**Option 1 (recommended): Tag-based filtering from one master list**

* Maintain one master task library.
* Each task has explicit tags:
  * `scope: ['RESIDENTIAL', 'EOT']`
  * `assumption: ['BUILT_IN', 'MOVABLE']`
* Render list by filter:
  * EOT -> include BUILT_IN, exclude MOVABLE
  * Residential -> include BUILT_IN + MOVABLE as appropriate

**Option 2: Two curated lists**

* Maintain separate lists per job type.
* Higher maintenance, but simplest mentally.

### B3) UI: show assumptions at the top of each checklist

At the top of the checklist panel, render a short "Assumptions" block:

* Residential: "Furnished / occupied - cleaning around belongings."
* EOT: "Empty property - built-in fixtures only; no movable items."

This prevents staff and models from blending tasks.

### B4) Acceptance criteria

* Selecting "End of Tenancy" never shows tasks that assume occupancy (beds, movable furniture, decor).
* Residential can include housework-style items when appropriate.
* The UI clearly states which mode is active.
* Stored quotes re-open into the correct mode + correct checklist.

---

## Part C — Order of work (so you don't get stuck)

1. **Integrate rubbish module UI** (visual + events, no pricing yet)
2. **Persist rubbish state** into quote/session storage
3. **Implement hoarding threshold behaviour** + validation gates
4. **Implement jobType hard switch** (if not already)
5. **Split task rendering** using Option 1 (tags) or Option 2 (separate lists)
6. **Add assumption banners** (prevents future ambiguity)
7. **Add pricing hooks** (if required) + regression test

---

## Part D — Component Placement & Rationale

### D1) Why this exists

The rubbish booking form was written 2-3 years ago for an earlier project. It fits naturally
into the current checklist/booking system because **end-of-tenancy and rubbish removal go
hand in hand** — when tenants vacate, there is almost always rubbish left behind. It's a
natural add-on to the EOT flow, not a separate service.

The HTML is structurally sound and uses the same `<details>/<summary>` progressive disclosure
pattern the rest of the app already uses. It just needs to be moved into the component
architecture, restyled to match the design system, and wired into the existing state model.

### D2) Where it lives in the codebase

| Item | Location |
|---|---|
| Component JS | `checklist/js/components/AysRubbishBooking.js` (new) |
| Component CSS | `checklist/css/rubbish-booking.css` (new, remapped to design system vars) |
| Original HTML | `checklist/rubbish-booking.html` (archive/reference, no longer loaded) |

**Note:** The existing `RubbishHandling` class (`checklist/js/classes/RubbishHandling.js`)
is a commercial room type for site-level bin clearing. `AysRubbishBooking` is the residential/EOT
booking add-on form — completely different scope. They do not conflict.

### D3) Where it appears in the UI (render order)

Rubbish removal is **not a room**. It's an add-on service that appears after all room sections.
It should render below the room checklist, in the "additional services" zone.

**Render order (top to bottom):**

1. Bedrooms (master, guest, single, etc.)
2. Bathrooms (master, ensuite, single, etc.)
3. Kitchen
4. Living areas (lounge, dining, family)
5. Office / Study
6. Laundry
7. Hallways / Circulation / Stairways / Entrances
8. Garage (when present)
9. Outdoor (when present)
10. Basement (when present)
11. Utility / Special rooms
12. **--- Additional Services ---**
13. **Rubbish Removal** (toggle: "Yes, I need rubbish taken away")
14. Notes / Supplies / Scheduling

**Rationale:** Rubbish is the last thing you deal with on site. You clean the property first,
then handle waste removal. Placing it after all room sections matches the real-world workflow
and keeps it from cluttering the core checklist.

### D4) Styling approach

- Extract inline `<style>` from `rubbish-booking.html` into `checklist/css/rubbish-booking.css`
- Remap all custom properties to existing design system vars from `checklist-variables.css`:
  - `--primary` -> `--color-primary`
  - `--bg` -> `--color-light`
  - `--surface` -> `--color-white`
  - `--border` -> `--color-border`
  - `--radius` -> `--radius-md`
  - `--shadow` -> `--shadow-md`
  - `--toast-speed` -> `--transition-base`
- Keep hoarding accent (`#ffab23`) as a section-specific variable — it's a distinct UI zone
- Dark mode support comes free via the existing `checklist-variables.css` dark mode rules

---

## Decisions (Confirmed)

| Decision | Choice | Status |
|---|---|---|
| Rubbish integration point | Inline add-on after all room sections | Confirmed |
| Hoarding threshold | loads >= 2 | Confirmed |
| Component location | `checklist/js/components/AysRubbishBooking.js` | Confirmed |
| CSS location | `checklist/css/rubbish-booking.css` | Confirmed |
| Task split approach | Option 1: Base + Overlay (tags/filters) | Confirmed |
