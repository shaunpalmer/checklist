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
