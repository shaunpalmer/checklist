---
name: AysListItemCheckbox
family: Ays
description: Checkbox list item component - renders individual selectable items with toggle action
category: form-control
version: 1.0.0
---

# AysListItemCheckbox

**Component Name**: `AysListItemCheckbox`  
**Family**: Ays (collection of reusable UI components)  
**Purpose**: Render an individual checkbox list item with metadata support  
**Pattern**: Option 2 - Component factory returning DOM nodes

## Description

AysListItemCheckbox is a single-responsibility component that renders a checkbox-based list item. It's part of the Ays family and focuses on:

- **Form**: Checkbox input with custom styling
- **Function**: Toggle/select action for list items
- **Data**: Item metadata (category, hours, difficulty)

The component intentionally avoids styling/color naming - that's handled by CSS classes applied by the parent container.

## API

### Constructor

```javascript
const item = new AysListItemCheckbox({
  itemId: 'kitchen-sinks',           // unique identifier
  label: 'Sinks and Faucets',        // display text
  room: 'kitchen',                   // parent room/group
  category: 'basic',                 // task category
  hours: 0.5,                        // estimated hours
  difficulty: 'basic',               // difficulty level
  checked: false                     // initial state (optional)
});
```

### Methods

#### `render()` → HTMLElement
Returns DOM node (not string). Creates the complete checkbox item structure.

```javascript
const element = item.render();
container.appendChild(element);
```

**Returns**: `<label>` element with:
- `<input type="checkbox">` - the interactive element
- `<span class="checkbox-custom">` - styled checkbox pseudo-element
- `<span class="item-label">` - display text

**Data Attributes**:
- `data-item-id` - unique item identifier
- `data-room` - parent room/section
- `data-category` - task category
- `data-hours` - estimated effort
- `data-difficulty` - difficulty level

#### `bind()` → void
Attach event listeners. Must be called after `render()`.

```javascript
item.render();
item.bind();  // Attaches change listener
```

**Events Dispatched**:
- `item-changed` - Custom event fired when checkbox state changes
  ```javascript
  {
    detail: {
      itemId: 'kitchen-sinks',
      checked: true,
      room: 'kitchen'
    }
  }
  ```

#### `setChecked(boolean)` → void
Update checkbox state programmatically.

```javascript
item.setChecked(true);
```

#### `isChecked()` → boolean
Get current checkbox state.

```javascript
if (item.isChecked()) {
  console.log('Item is checked');
}
```

#### `getMetadata()` → Object
Retrieve all item configuration.

```javascript
const meta = item.getMetadata();
// Returns: { itemId, label, room, category, hours, difficulty }
```

#### `setLabel(string)` → void
Update display text dynamically.

```javascript
item.setLabel('Updated label text');
```

#### `getElement()` → HTMLElement
Get the rendered DOM element.

```javascript
const domElement = item.getElement();
```

## Usage Examples

### Basic Usage

```javascript
const item = new AysListItemCheckbox({
  itemId: 'task-1',
  label: 'Complete task',
  room: 'living-room',
  category: 'basic',
  hours: 0.5
});

document.getElementById('list').appendChild(item.render());
item.bind();
```

### In AysDisclosureCard

```javascript
const card = new AysDisclosureCard({
  roomId: 'kitchen',
  title: '🍳 Kitchen',
  items: [
    { itemId: 'k1', label: 'Sinks', category: 'basic', hours: 0.5 },
    { itemId: 'k2', label: 'Floors', category: 'basic', hours: 0.5 }
  ]
});

// AysDisclosureCard automatically creates AysListItemCheckbox instances
```

### Listening to Changes

```javascript
item.bind();
item.getElement().addEventListener('item-changed', (e) => {
  console.log(`${e.detail.itemId} is now ${e.detail.checked ? 'checked' : 'unchecked'}`);
});
```

### Batch Operations

```javascript
const items = [
  { itemId: 'a', label: 'Item A', category: 'basic', hours: 0.5 },
  { itemId: 'b', label: 'Item B', category: 'basic', hours: 0.5 },
  { itemId: 'c', label: 'Item C', category: 'basic', hours: 0.5 }
];

const container = document.getElementById('list');
items.forEach(config => {
  const item = new AysListItemCheckbox(config);
  container.appendChild(item.render());
  item.bind();
});
```

## Configuration Options

| Option | Type | Default | Required | Purpose |
|--------|------|---------|----------|---------|
| `itemId` | string | `item-{timestamp}` | No | Unique identifier for the item |
| `label` | string | 'Untitled Item' | No | Display text for the item |
| `room` | string | 'unknown' | No | Parent room/group identifier |
| `category` | string | 'basic' | No | Task category classification |
| `hours` | number | 0.5 | No | Estimated time in hours |
| `difficulty` | string | 'basic' | No | Difficulty level (basic, intermediate, deep) |
| `checked` | boolean | false | No | Initial checkbox state |

## Architecture Notes

### Design Pattern
- **Type**: Component Factory (Option 2)
- **Returns**: DOM nodes (not HTML strings)
- **Lifecycle**: `constructor` → `render()` → `bind()`
- **No side effects** - All state managed internally
- **Events**: Dispatches custom events for parent tracking

### Integration Points
- **Used by**: AysDisclosureCard (for rendering list items)
- **Paired with**: CSS class `checklist-item` for styling
- **Replaces**: 200+ hardcoded `<label class="checklist-item">` blocks

### What This Component Does NOT Handle
- Styling/colors (handled by CSS)
- Progress tracking (parent's responsibility)
- State persistence (handled by parent container)
- Grouping/sections (handled by AysDisclosureCard)

## Styling

The component applies these CSS classes:
- `checklist-item` - main wrapper label
- `checkbox-custom` - styled checkbox replacement
- `item-label` - display text span

Parent stylesheets define the visual appearance. Example:

```css
.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checklist-item input[type="checkbox"] {
  cursor: pointer;
}

.checkbox-custom {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 3px;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires: ES6 JavaScript support
- No external dependencies

## Changelog

### v1.0.0 (2026-01-02)
- Initial release
- Checkbox rendering with metadata support
- Event dispatching for parent tracking
- Full CRUD methods (get/set/check state)

## See Also

- [AysDisclosureCard](./AysDisclosureCard.md) - Parent component for grouping items
- [ChecklistPageGenerator](../generators/checklistPageGenerator.md) - Generates cards/items from config
