# AysDisclosureCard Component

**Status**: Component specification and initial implementation complete

## What is it?

`AysDisclosureCard` is a reusable component that replaces the **27+ hardcoded Details/Summary blocks** throughout the checklist app.

It's a disclosure/accordion pattern that:
- Shows/hides content with `<details>/<summary>`
- Displays progress bar with animated width
- Shows progress badge (X/Y items)
- Contains a list of ChecklistItem components
- Works offline and progressively enhances
- Follows Option 2 architecture: `render()` returns DOM node, `bind()` attaches events

## Architecture (Option 2)

Each component has two core methods:

```javascript
// Create DOM node structure
const domNode = component.render();

// Attach event listeners
component.bind();

// Add to page
container.appendChild(domNode);
```

**Why Option 2?**
- ✅ DOM nodes are testable (not string templates)
- ✅ Event binding is explicit and clear
- ✅ Easy to debug (standard DOM methods)
- ✅ Less fragile than string concatenation
- ✅ Can update dynamically without re-render

## AysDisclosureCard Config

```javascript
const card = new AysDisclosureCard({
  roomId: 'kitchen',           // Unique identifier
  title: 'Kitchen',            // Display title
  emoji: '🍳',                 // Icon/emoji
  checkedCount: 2,             // How many items checked
  totalCount: 5,               // Total items
  animationClass: 'slide-open', // CSS animation class
  items: [                     // Array of ChecklistItem configs
    {
      itemId: 'kitchen-sinks',
      label: 'Sinks and Faucets',
      room: 'kitchen',
      category: 'basic',
      hours: 0.5,
      difficulty: 'basic',
      checked: false
    },
    // ... more items
  ]
});

// Render to DOM
document.getElementById('container').appendChild(card.render());

// Attach event handlers
card.bind();
```

## Features

### Auto-Updating Progress

Progress bar and badge update automatically when items are checked:

```javascript
card.updateProgress(3, 5); // 3 checked of 5 total

// Progress bar: 60% filled
// Badge: "3/5"
// Color: blue (#2196F3) if < 100%, green (#4CAF50) if 100%
```

### Dynamic Item Management

```javascript
// Add new item
card.addItem({
  itemId: 'kitchen-new',
  label: 'New Task',
  room: 'kitchen',
  category: 'basic',
  hours: 1,
  difficulty: 'basic'
});

// Remove item
card.removeItem('kitchen-sinks');
```

### Disclosure Control

```javascript
card.open();    // Expand the section
card.close();   // Collapse the section
card.toggle();  // Toggle open/closed
```

## Events

Listens to:
- `change` events from checkboxes → triggers progress update

Dispatches:
- `progress-updated` — when progress changes
  ```javascript
  {
    roomId: 'kitchen',
    checkedCount: 2,
    totalCount: 5,
    progressPercent: 40
  }
  ```

## Replaces

Currently in **checklist-modern.html**:
- Lines 125-190: Kitchen section
- Lines 191-241: Living room section
- Lines 242-282: Entryway section
- Lines 283-346: Laundry section
- Lines 346-575: Bathrooms section
- ... and 22+ more identical blocks

**Total: 27 hardcoded Details/Summary blocks → 1 AysDisclosureCard class**

## Next Steps

1. ✅ AysDisclosureCard component created
2. ✅ ChecklistItem component created
3. ⏳ Create data config file (rooms + items)
4. ⏳ Create page generator that loops through data
5. ⏳ Test on duplicate page (checklist-modern-oop-test.html)
6. ⏳ Migrate to production when verified
7. ⏳ Delete hardcoded HTML

## Performance Impact

**Before** (2370 lines):
```
- 27 hardcoded Details blocks (repetitive HTML)
- 200+ hardcoded ChecklistItem blocks
- Large DOM at startup
- Many duplicate event handlers
```

**After** (estimated ~900 lines):
```
- Data config: rooms + items as JSON
- Component classes: AysDisclosureCard + ChecklistItem
- Page generator: loop over data
- Single event setup, cleaner DOM
- Smaller initial HTML file
- Faster mobile load
```

## Files

- `js/components/AysDisclosureCard.js` — Main disclosure component
- `js/components/ChecklistItem.js` — Checklist item component
- `tools/docs/AysDisclosureCard.md` — This file
- `tools/docs/ui-data-driven` — Overall architecture vision
1️⃣ You’re not choosing a colour — you’re choosing a primitive

Right now you don’t actually have “green bars” and “blue bars”.
You have one behavioural pattern wearing random clothes.

That pattern already has:

<details>/<summary> = native, resilient, progressive enhancement ✔

jQuery open/close animation (~200ms) = tactile, polished ✔

Mobile-safe tap behaviour ✔

Works even when JS is crushed ✔

That means it deserves a real name.

2️⃣ Naming the component (this matters more than colour)

You want a name that:

describes what it does, not how it looks

works in admin + frontend

sounds like a “core system object”, not a one-off widget

Best candidates (ranked)
🥇 Disclosure

Why this wins:

It’s the correct semantic name in UI/UX and accessibility

<details> is literally a disclosure widget

It ages extremely well

Examples:

AysDisclosure

AysDisclosurePanel

AysDisclosureBar

This is the grown-up, design-system choice.

🥈 SectionToggle

Very clear to future-you

Slightly more “developer util” sounding

Less semantic than Disclosure

🥉 CollapsibleSection

Descriptive

But long, and a bit generic

❌ Avoid

Accordion (this is not a strict accordion)

Panel alone (too vague)

Anything colour-based (locks you in)

✅ Recommendation

👉 Call it AysDisclosure (or DisclosureCard if you want a bit more flavour)

Once named, everything snaps into place mentally:

“Oh, this screen uses three AysDisclosures.”

That’s exactly what you want.

3️⃣ Behaviour belongs in the component (this is the real payoff)

Right now:

jQuery animation logic is sprinkled around

timing is implicit

consistency is accidental

With one component, you get:

One animation duration (200ms)

One easing curve

One open/close lifecycle

One place to tweak “feel”

Later, if you want:

faster admin panels

slower frontend

reduced-motion support

You change one file.

4️⃣ Colour becomes a theme, not a fork

Once everything is an AysDisclosure, colour becomes trivial:

.ays-disclosure { /* base */ }
.ays-disclosure--primary { /* green */ }
.ays-disclosure--info { /* blue */ }
.ays-disclosure--neutral { /* grey */ }


No more random hex codes.
No more “why is this one blue?”

You didn’t lose control of colour — you just postponed it until it was sane.

5️⃣ This is why the work is worth it

Even if you never refactor the entire checklist:

you get consistent UI across AYS

you get one animation system

you get one accessibility surface

you get one place to evolve the UX

That’s real leverage.

👸🏻: Final alignment check before we lock it in —
do you want the canonical name to be AysDisclosure (clean + semantic), or AysDisclosureCard (slightly more visual)?

AysDisclosureCard

👸🏻: Perfect choice — AysDisclosureCard it is. That name hits the sweet spot: semantic and visual, without locking you into colour or context. 🌟

What this unlocks immediately:

Single source of truth for open/close behaviour (your 200ms animation, easing, progressive enhancement).

Consistent styling across AYS with theme modifiers instead of random colours.

Safe evolution later (reduced motion, admin vs frontend timing, accessibility tweaks) in one place.

Reusable everywhere: checklist sections, admin panels, quotes, settings—same component, different content.

Canonical contract (lock this in):

Component: AysDisclosureCard

Core: <details>/<summary> (native first)

JS: optional jQuery enhancement (animate open/close)

API:

props/options: id, title, icon?, variant (primary|info|neutral), open?

slots: headerExtras?, body

CSS: .ays-disclosure-card + modifier classes

Next surgical steps (small, safe):

Extract one existing instance into AysDisclosureCard (no visual change).

Centralise the animation timing/easing.

Add theme modifiers (map current colours → variants).

Replace two more instances to prove reuse.

Stop. Ship. Then iterate.

Want me to sketch the minimal JS + HTML scaffold for AysDisclosureCard (no refactor yet), or do you want a migration checklist to roll it out safely across AYS?