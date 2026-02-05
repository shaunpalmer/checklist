# Skill: ays-checklist.room-composition

> **Purpose:** Define deterministic room generation rules — stop the "3-item rooms" bug.

---

## When to Use

Trigger this skill when:

- Generating room lists
- Working with task composition
- Debugging "rooms have wrong items"
- Implementing mode-specific room behaviour

---

## Core Principle

**Every room = base_room + category_addons**

```
Room output = base_room_tasks + room_specific_tasks
```

This is COMPOSITION, not just inheritance.

---

## Task Registry

Named task sets that can be composed:

| Task Set | Contents |
|----------|----------|
| `base_room` | Dust surfaces, vacuum floors, empty bins, clean windows |
| `bedroom_addons` | Change bedding, clean under bed, wardrobe interior |
| `bathroom_addons` | Clean toilet, clean shower/tub, clean mirrors |
| `kitchen_addons` | Clean appliances, degrease surfaces, clean sink |
| `office_addons` | Wipe desks, clean monitors, organize cables |
| `eot_addons` | Deep clean skirting, inside cupboards, wall marks |

---

## Room Generation Rule

```javascript
function getRoomTasks(mode, roomKind, propertyType) {
  const tasks = [];
  
  // 1. ALWAYS start with base_room
  tasks.push(...taskRegistry.base_room);
  
  // 2. Add room-specific addons
  const addonKey = `${roomKind}_addons`;
  if (taskRegistry[addonKey]) {
    tasks.push(...taskRegistry[addonKey]);
  }
  
  // 3. Add mode-specific addons
  if (mode === 'end_of_tenancy') {
    tasks.push(...taskRegistry.eot_addons);
  }
  
  // 4. Dedupe by task ID
  return dedupeById(tasks);
}
```

---

## Mode → Room Mapping

### Residential Mode

| Room Kind | Display Label |
|-----------|---------------|
| `bedroom` | Bedroom 1, Bedroom 2... |
| `bathroom` | Bathroom 1... |
| `kitchen` | Kitchen |
| `living` | Living Room |
| `laundry` | Laundry |

### Commercial Mode

| Room Kind | Display Label |
|-----------|---------------|
| `office` | Office 1, Office 2... |
| `bathroom` | Bathroom 1... |
| `kitchen` | Kitchen/Kitchenette |
| `reception` | Reception |
| `boardroom` | Boardroom |
| `warehouse` | Warehouse |

---

## Critical Rule: Mode Determines Room Set

```javascript
function generateRooms(serviceType, propertyConfig) {
  if (serviceType === 'commercial') {
    // Use OFFICE rooms, not BEDROOM
    return generateCommercialRooms(propertyConfig);
  } else {
    // Residential or EOT
    return generateResidentialRooms(propertyConfig);
  }
}
```

---

## The "3-Item Room" Bug

### Symptom

Rooms render with only 3 items instead of 15+.

### Root Cause

`base_room` tasks not being composed with room-specific tasks.

### Fix

ALWAYS compose:

```javascript
// ❌ Bad: only room-specific tasks
const tasks = taskRegistry.bedroom_addons;  // 3 items

// ✅ Good: base + specific
const tasks = [
  ...taskRegistry.base_room,      // 12 items
  ...taskRegistry.bedroom_addons  // 3 items
];  // 15 items total
```

---

## Hard Rules

### ✅ DO

- Always include `base_room` in every room
- Map `serviceType` to correct room kinds
- Dedupe tasks by ID after composition
- Regenerate rooms when `serviceType` changes

### ❌ DON'T

- Show bedrooms in commercial mode
- Show offices in residential mode
- Skip `base_room` composition
- Assume rooms are pre-composed

---

## Anti-Patterns

| Bad | Why | Do Instead |
|-----|-----|------------|
| `bedroom` in commercial | Wrong room type | Use `office` |
| 3-item rooms | Missing base_room | Compose base + addons |
| Hardcoded room list | Can't adapt to config | Generate from config |
| Same rooms all modes | Ignores serviceType | Check mode first |

---

## Related Skills

- `ays-checklist.hydration` — Room regeneration on load
- `ays.mode-switching.contract` — Mode change rules
