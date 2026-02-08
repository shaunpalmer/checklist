# End-of-Tenancy vs Residential Cleaning

## Purpose

This document exists to **remove ambiguity** between two very different job types that are often confused by systems, checklists, and models:

* **Residential (Furnished) Cleaning** — light-to-medium housework in a lived-in home
* **End-of-Tenancy (Empty) Cleaning** — a deep, handover-grade clean of an empty property

They are **not the same job**, even though many surfaces overlap.

---

## The Core Problem We Are Solving

Historically, both job types have been represented by the **same task list**, which causes:

* Residential housework tasks appearing in empty properties
* Deep-clean expectations being implied for standard house cleans
* Models and checklists mixing incompatible assumptions
* Ongoing confusion about scope, pricing, and accountability

This document makes the distinction **explicit and enforceable**.

---

## Design Principle: Base + Overlay (No Duplication)

We use **one shared base task list**, then apply **mode-specific overlays**.

This avoids drift, duplication, and near-identical lists that slowly diverge.

### Base Tasks (Built-In Surfaces)

These apply to **both Residential and End-of-Tenancy**:

* Doors (wipe/clean)
* Door frames, trims, architraves
* Handles & touchpoints
* Light switches, power points, vents
* Skirting boards / baseboards
* Windows & sills (internal)
* Reachable cobweb removal
* Floors (appropriate to surface)

These tasks assume **fixed, built-in elements** only.

---

## Residential Mode (Furnished / Lived-In)

Residential cleaning assumes:

* Furniture and personal items are present
* The goal is **clean and tidy**, not empty-property restoration

### Residential Overlay (Movable-Item Tasks)

These tasks are **only included in Residential mode**:

* Light dusting of reachable furniture surfaces
* Light dusting of decor (where accessible)
* Tidying items into neat stacks (not organising)
* Straightening beds / linens (not full bed-making)
* Vacuuming reachable edges around furniture

We do **not** make beds as a default service.
If requested, that is a **separate instruction and conversation**.

---

## End-of-Tenancy Mode (Empty Property)

End-of-Tenancy cleaning assumes:

* The property is **empty or near-empty**
* The goal is **handover / inspection standard**

### End-of-Tenancy Overlay (Deep Built-In Focus)

These tasks are **only included in End-of-Tenancy mode**:

* Full internal clean of wardrobes, cupboards, shelving
* More detailed edge work on frames and trims
* Spot-washing walls where required
* Deeper attention to built-in fixtures

No movable furniture, decor, or personal-item tasks apply.

---

## Implementation Rule (For Code & Rendering)

Each task carries metadata:

* **scope**: Residential, End-of-Tenancy, or both
* **assumption**: BUILT_IN or MOVABLE

The renderer then becomes simple and reliable:

* **Residential** = BUILT_IN + MOVABLE (where scoped)
* **End-of-Tenancy** = BUILT_IN only (where scoped)

No inference. No guessing. No ambiguity.

---

## Outcome

This approach:

* Stops Residential and End-of-Tenancy from being blended
* Makes intent obvious to humans and systems
* Keeps one source of truth
* Prevents future checklist drift

This document defines the rule set. The UI, checklist, and logic must follow it.

---

## Current State & What Needs to Change

### What's working

The architecture is correct:
- `Room` base class provides `getBaseItems()` — built-in fixture tasks (doors, frames, switches, skirting, windows, etc.)
- Each room subclass calls `getItems()` which looks up `ITEM_DEFINITIONS[serviceType]` — so `'eot'` and `'residential'` already return different data
- `renderItems()` merges base + room-specific items automatically
- The `serviceType` field on each Room instance drives everything — no inference needed

### What's wrong

**1. Residential shows too many base items that won't actually get done**

In a real residential clean, the bedroom is full of furniture. You can't get to all the skirting boards. You're not cleaning the ceiling. You're not inside the wardrobe. You've got 2-3 hours for the whole house — you're vacuuming, emptying bins, wiping the duchess, maybe dusting reachable surfaces.

But `getBaseItems()` currently dumps 10+ built-in fixture tasks into every room regardless of service type. For EOT (empty property, full access) that's correct. For residential (furnished, time-limited), it over-displays.

**2. Residential has no room-specific items at all**

`ITEM_DEFINITIONS.residential` currently only has `all_rooms` (property-wide items). No bedroom, bathroom, kitchen, or living area entries. The actual housework tasks are missing.

**3. EOT duplicates base items**

EOT room definitions each re-list doors, handles, switches, skirting, windows — items that `getBaseItems()` already provides. May show duplicate tasks.

### Steps to fix

**Step 1: Make `getBaseItems()` service-type-aware**

- **EOT**: Full base item list (all built-in fixtures). Empty property = full access.
- **Residential**: Reduced list — floors, light switches, door handles, bins. Skip skirting, ceiling, inside built-ins, wall spot-cleaning.

**Step 2: Add residential room-specific items to `ITEM_DEFINITIONS.residential`**

- **Bedroom**: dust reachable furniture, straighten bed/linens (optional), vacuum, empty bin
- **Bathroom**: toilet, shower/bath, sink/vanity, mirror, mop floor
- **Kitchen**: benchtops, stovetop, sink, appliance fronts, mop floor
- **Living area**: dust reachable surfaces, vacuum, tidy cushions/throws

**Step 3: De-duplicate EOT room definitions**

Remove doors/handles/switches/skirting/windows from each EOT room entry — those come from `getBaseItems()`.

**Step 4: Tag items with scope and assumption metadata**

Add `scope` and `assumption` fields where needed for future filtering.

### Summary

| | Residential (now) | Residential (should be) | EOT (now) | EOT (should be) |
|---|---|---|---|---|
| Base items | All 10+ (too many) | Reduced set (reachable only) | All 10+ (correct) | All 10+ (correct) |
| Room items | None (missing) | Housework tasks per room | Detailed per room (good) | Same, minus base duplicates |
| Total displayed | Over-displays built-ins, under-displays housework | Right-sized for 2-3hr visit | May duplicate base items | Clean, no duplicates |
