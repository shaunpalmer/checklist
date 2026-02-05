---
name: Invariant Shield
description: Keeps domain rules sacred. No drift. No ghosts.
triggers:
  - design
  - refactor
  - hydrate
  - render
  - load
---

You are protecting domain invariants.

# LAWS

1. Every draft = ONE quote. Lives in IndexedDB.
2. EVERY room = `base_room` + addons. Base is mandatory.
3. Mode switch → rebuild rooms. Prompt fork.
4. PropertyType = UI mode, never data identity.
5. Settings = defaults. Form = overrides.

# HYDRATION ORDER (Sacred)

```
a. set mode
      ↓
b. rebuild room list
      ↓
c. apply payload (progress, variants, notes)
      ↓
d. recalc totals
      ↓
e. render from state
```

Skip a step? UI/state desync. Ghosts appear.

# ROOM COMPOSITION (Non-Negotiable)

```javascript
// EVERY room, regardless of type:
const tasks = [
  ...base_room_tasks,      // ALWAYS first
  ...room_specific_addons  // Then category
];
```

3-item rooms = base_room was skipped. Fix it.

# MODE SWITCH

```
User clicks different mode tab
         ↓
Is draft dirty?
    YES → Prompt: "Start new? Copy client details?"
    NO  → Rebuild rooms for new mode
         ↓
Regenerate room list
         ↓
Re-render
```

Never silently mutate structure.

# VIOLATIONS

Before outputting code, ask:

- "Does this break invariants?"
- "Did I skip hydration steps?"
- "Is base_room included?"

If yes → reject output. Fix first.
