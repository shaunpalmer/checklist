# Settings vs. Form Choices: Where Decisions Are Made

**Document Date**: January 3, 2026  
**Purpose**: Define the boundary between Settings (structural) and Form (item-level) decisions  
**Critical**: This determines the entire architecture of the system  
**Status**: Foundational architecture decision

---

## The Core Distinction

### Settings: Big Structural Choices
**These change the SCOPE and STRUCTURE of the entire quote.**

They determine:
- Which rooms exist and how many
- Which room types and variants are present
- How many of a particular feature/fixture exists
- The scale and complexity of the job itself

**They CANNOT be changed on the form.** Why? Because changing them would require regenerating the entire item list and restructuring the quote.

**Example: Gym with 15 Showers**
```
Setting: "This is a commercial gym"
Setting: "Number of showers: 15"

Result: Items generated for "gym_shower_01" through "gym_shower_15"
        (15 separate shower sections, each with its own cleaning items)

On Form: User checks/unchecks items within each shower section
On Form: User notes special conditions for each shower
On Form: User CANNOT change "15 showers" to "12 showers" - that's structural
```

The 15 showers are **hard-coded into the form structure** by Settings. You can't add/remove them with a checkbox.

---

### Form Choices: Small Item-Level Decisions
**These are decisions users make WITHIN the structure that Settings defined.**

They determine:
- Which specific tasks/items apply to THIS property visit
- Special notes or conditions for specific items
- Custom services discovered during walk-through
- Time adjustments or difficulty overrides

**They CAN be changed on the form.** Why? Because checking/unchecking an item doesn't restructure the quote—it just includes/excludes that specific task.

**Example: Master Bedroom Dust Ceiling**
```
Form Choice: User sees "Dust ceiling" item for master bedroom
Form Choice: User checks or unchecks it
Form Choice: User adds note "Ceiling has water damage, need special care"

Result: Checkbox state affects the quote total
Result: Note is included in the job description
Result: User CAN toggle this choice on and off dynamically
```

The dust ceiling is **already in the form** (because Settings included it). User just decides if it applies.

---

## Examples: Categorizing Decisions

### SETTINGS Examples (Big Structural Choices)

| Decision | Why Settings | Impact |
|----------|-------------|--------|
| **Bathroom type: Ensuite vs. Family vs. Shell block** | Different rooms have different items. A shell block bathroom (bare walls/floor) vs. a finished ensuite are completely different scopes. | Generates different item lists. Can't toggle between on form. |
| **Number of showers in gym** | 1 shower needs 10 items. 15 showers need 150 items. That's a fundamental scope difference. | Entire form structure changes. Different room sections created. |
| **Number of ovens: 1 × Single vs. 2 × Double** | Each oven is a distinct fixture needing separate items. 1 oven ≠ 2 ovens (doubles the work). | Creates separate oven sections in kitchen. Each oven has its own item list. |
| **Kitchen island: Yes or No** | A kitchen with island has different items (clean around island, under island, etc.) than without. | Adds/modifies items in kitchen section. |
| **Number of bedrooms** | 3 bedrooms vs. 5 bedrooms = different form structure | Three separate bedroom sections vs. five. Different total items. |
| **Flooring type: Carpet vs. Hardwood** | Different cleaning tasks. Carpet cleaning ≠ hardwood cleaning. | Replaces items, not just toggles. |
| **Difficulty level: Easy vs. Medium vs. Hard** | Same bathroom, different condition = different hours and different items. Easy bathroom (20 min toilet) vs. Hard bathroom (45 min toilet). Affects production rate and staffing. | Changes base hours for items. May add special items (stain removal, odor treatment). Affects quote and crew size. |
| **Commercial vs. Residential vs. EOT** | Each has completely different item lists. | Entire form changes. |

### FORM Examples (Small Item-Level Choices)

| Choice | Why Form | Impact |
|--------|----------|--------|
| **"Dust ceiling" checkbox** | Item is in the form. User decides if it applies. | Includes/excludes this 0.5-hour task. |
| **Notes on specific room** | "Ceiling has water damage, needs extra care" | Notes attached to room, affects job description. |
| **Custom service discovered** | During walk-through, user finds extra work needed | Add custom item with custom hours/charge. |
| **"Clean inside oven" checkbox** | Item is in the form for the oven that exists. | User decides if it applies THIS visit. |
| **Notes on specific item** | "Windows particularly dirty, double time" | Affects that specific item's scope. |
| **Difficulty override** | Item is marked "easy" but user knows it's "hard" THIS time | Can adjust on form. |

### THE GRAY ZONE: Oven Decision

**Scenario: User sets property as "4 bedrooms, kitchen with 1 oven"**

Settings says: Kitchen has 1 oven.  
Form has items for: 1 oven.

**Now user opens form and says: "Wait, actually there are 2 ovens."**

**Option A (Settings would be right):**
- Stop, go back to Settings
- Change kitchen to "2 ovens"
- Form regenerates with items for both ovens
- User continues

**Option B (Form would be right):**
- Add custom service: "Clean 2nd oven"
- But now form is inconsistent—where's the 2nd oven section?

**Decision: The BOUNDARY depends on complexity.**

**If it's a new room section:**
- Oven count affects the room structure → Settings
- Double oven kitchen is one kitchen with 2 ovens (modify room definition)
- But generating as Settings means: regenerate form, lose current progress

**If it's within an existing room:**
- "I forgot to mention there's a 2nd oven" → Custom service on form
- Not ideal, but preserves current progress

**Real-world approach:**
1. During discovery (before form), user describes property → Settings locked in
2. During walk-through, user finds extra work → Custom service on form
3. User changes their mind about property type → Back to Settings (restart form)

---

## Critical Example: Difficulty as a Settings Control

### The Problem: Same Task, Different Hours

**Scenario: Cleaning a toilet**

- **Easy toilet** (residential, well-maintained): 20 minutes
  - Standard wipe, sanitize, quick
  - Standard difficulty: "low"

- **Medium toilet** (commercial, moderate use): 35-40 minutes
  - More thorough cleaning, higher sanitization standards
  - Medium difficulty: "medium"

- **Difficult toilet** (gym/industrial, heavy use, stains): 45-60+ minutes
  - Stain removal, special cleaning products, extended sanitization
  - Difficulty: "high"

**You can't hardcode one value.** The same item "Clean toilet" has completely different hours depending on the property type and condition.

### Solution: Difficulty Modifier in Settings

**Settings includes:**
```javascript
const settings = {
  serviceType: 'commercial',
  propertyType: 'residential_home',  // or 'gym', 'office', 'medical'
  difficulty: 'standard',             // or 'easy', 'hard'
  
  // Difficulty modifies base hours
  // residential with 'standard' difficulty: toilet = 0.33 hours (20 min)
  // gym with 'hard' difficulty: toilet = 0.75 hours (45 min)
}
```

### How Difficulty Affects Item Generation

**Factory reads Settings.difficulty:**

```javascript
generateRoom(roomConfig) {
  // Get base items
  const baseItems = this.getBaseItems(
    roomConfig.serviceType,
    roomConfig.roomType,
    roomConfig.variant
  );
  
  // APPLY DIFFICULTY MODIFIER
  const difficultyMultiplier = this.getDifficultyMultiplier(this.settings.difficulty);
  // Example: 'hard' = 1.5x, 'standard' = 1.0x, 'easy' = 0.75x
  
  let items = baseItems.map(item => ({
    ...item,
    hours: item.baseHours * difficultyMultiplier,
    difficulty: this.settings.difficulty
  }));
  
  // May also ADD items for high difficulty
  // e.g., if difficulty === 'hard', add special items:
  if (this.settings.difficulty === 'hard') {
    items.push({
      itemId: 'bath_stain_removal',
      label: 'Stain removal and odor treatment',
      hours: 1.0,
      difficulty: 'high',
      category: 'special_features'
    });
  }
  
  return items;
}
```

### Example: Residential Bathroom (Easy vs. Hard)

**Settings: Residential, Easy Difficulty**
```javascript
{
  serviceType: 'residential',
  difficulty: 'easy'  // Well-maintained property
}
```

**Form generates items:**
```
☐ Clean tiles and grout - 1.0 hour
☐ Clean toilet - 0.33 hour (20 min)
☐ Clean sink - 0.25 hour (15 min)
☐ Clean shower - 0.75 hour
Total: ~2.3 hours per bathroom
```

**Settings: Residential, Hard Difficulty**
```javascript
{
  serviceType: 'residential',
  difficulty: 'hard'  // Poorly maintained, heavy staining
}
```

**Form generates items:**
```
☐ Clean tiles and grout - 1.5 hours (1.0 × 1.5 multiplier)
☐ Clean toilet - 0.75 hour (0.33 × 2.25 multiplier + stain removal)
☐ Clean sink - 0.5 hour (0.25 × 2.0 multiplier + buildup removal)
☐ Clean shower - 1.5 hours (0.75 × 2.0 multiplier)
☐ Stain removal and odor treatment - 1.0 hour (ADDED for hard)
Total: ~5.25 hours per bathroom
```

**The user doesn't toggle difficulty on the form.** It's a Settings decision made BEFORE they visit the property:

```
Inspector: "OK, I'm visiting a gym today. That's structurally commercial.
            It's been used heavily, so difficulty is 'hard'.
            Let me set Settings accordingly."

Settings locked: serviceType: 'commercial', difficulty: 'hard', showers: 15

Form generated with 15 shower sections, each item multiplied by 'hard' factor

Inspector on-site: Checks/unchecks items, adds notes
                   (form structure is locked, but user still makes item choices)
```

---

### Why Difficulty is Settings, Not Form

| Question | Settings? | Form? | Why |
|----------|-----------|-------|-----|
| "Is this toilet hard to clean?" | ✓ **YES** | ✗ NO | Affects base hours for ALL toilets in quote. Must be known before generation. |
| "Does THIS toilet have stains?" | ✓ **YES** | ✓ MAYBE | If predictable (gym = hard), Settings. If discovered during walk, note on form. |
| "Should I check this toilet item?" | ✗ NO | ✓ **YES** | Form choice: does this particular toilet need cleaning? |
| "How long should this toilet take?" | ✓ **YES** | ✗ NO | Difficulty determines hours. Form just decides if item applies. |

---

### Staffing Impact of Difficulty

**Why this matters operationally:**

```
Easy bathroom: 2.3 hours × $40/hour = $92 per bathroom
Hard bathroom: 5.25 hours × $40/hour = $210 per bathroom

2-bathroom residential:
  Easy: 4.6 hours total (1 person, < 1 day)
  Hard: 10.5 hours total (2 people, or 1 person 1.5 days)

Staffing assignment DEPENDS on difficulty known in Settings.
```

If difficulty isn't in Settings, you can't schedule crews properly. It MUST be a Settings decision.

---

## Settings UI Labels: Educating Users About Difficulty

When building the Settings UI, labels must explain **what difficulty means operationally:**

**Not enough:**
```html
<label>Difficulty Level</label>
<select>
  <option>Easy</option>
  <option>Standard</option>
  <option>Hard</option>
</select>
```

**Better (educates the user):**
```html
<label>Property Condition Difficulty</label>
<select>
  <option>Easy - Well-maintained, quick turnover (0.75x hours)</option>
  <option>Standard - Normal cleaning, average condition (1.0x hours)</option>
  <option>Hard - Heavy soiling, stains, odors (1.5x+ hours)</option>
</select>
<p class="help-text">Higher difficulty = longer hours = more staff required</p>
```

**Why?** Users in the industry understand the implications:
- "Oh, difficulty is 'hard'? That means hours are multiplied by 1.5."
- "If total hours exceed the staff threshold, I need more people."
- "That changes my crew allocation and profitability."

---

## Dynamic Staff Display: Real-Time Impact Visualization

**Critical Feature:** When settings change, **show the user immediately how many staff they'll need.**

### The Problem: Silent Impact

User changes difficulty from "standard" to "hard":
```
Before: difficulty = standard (1.0x)
After:  difficulty = hard (1.5x)

Total hours: 10 × 1.5 = 15 hours
Staff needed: ceil(15 / 7) = 3 people

User has NO IDEA this means 3 people now!
They just see a dropdown change. The impact is hidden.
```

### The Solution: Dynamic Staff Display in Settings

**Settings form includes real-time calculation feedback:**

```html
<div class="settings-section">
  <h3>Job Parameters</h3>
  
  <div class="setting-field">
    <label>Property Condition Difficulty</label>
    <select id="difficulty-selector" onchange="updateStaffDisplay()">
      <option value="easy">Easy (0.75x hours)</option>
      <option value="standard" selected>Standard (1.0x hours)</option>
      <option value="hard">Hard (1.5x hours)</option>
    </select>
  </div>
  
  <div class="setting-field">
    <label>Staff Threshold (hours per person)</label>
    <input type="number" id="staff-threshold" value="7" step="0.5" 
           onchange="updateStaffDisplay()" />
  </div>
  
  <!-- DYNAMIC DISPLAY: Shows calculated result in real-time -->
  <div class="calculation-display" id="staff-display" 
       style="background: #f0f8ff; padding: 12px; border-radius: 4px; 
              border-left: 4px solid #0066cc; margin-top: 12px;">
    <p>
      <strong>📊 Staff Required:</strong> 
      <span id="staff-count" style="font-size: 1.2em; font-weight: bold; color: #0066cc;">
        2
      </span>
      <span id="staff-label"> staff members</span>
    </p>
    <small style="color: #666;" id="staff-explanation">
      Based on estimated 10 hours @ 1.0x difficulty ÷ 7 hrs/person
    </small>
  </div>
</div>
```

### JavaScript Logic: Calculate & Display

```javascript
function updateStaffDisplay() {
  // Read current settings
  const difficulty = document.getElementById('difficulty-selector').value;
  const staffThreshold = parseFloat(document.getElementById('staff-threshold').value) || 7;
  
  // Get base hours from current checklist items
  const baseHours = calculateCheckedItemsHours(); 
  // (Sum of all checked items' hours)
  
  // Apply difficulty multiplier
  const difficultyMultiplier = {
    'easy': 0.75,
    'standard': 1.0,
    'hard': 1.5
  }[difficulty] || 1.0;
  
  const totalHours = baseHours * difficultyMultiplier;
  
  // Calculate staff needed
  const staffCount = Math.max(1, Math.ceil(totalHours / staffThreshold));
  
  // Update display - show calculated number
  document.getElementById('staff-count').textContent = staffCount;
  
  // Update label (singular vs. plural)
  document.getElementById('staff-label').textContent = 
    staffCount === 1 ? 'staff member' : 'staff members';
  
  // Update explanation to show the math
  const explanation = 
    `${baseHours.toFixed(1)} hours (base) × ${difficultyMultiplier}x ` +
    `(${difficulty}) = ${totalHours.toFixed(1)} hours ÷ ${staffThreshold} hrs/person = ` +
    `${staffCount} staff`;
  document.getElementById('staff-explanation').textContent = explanation;
  
  // Change color based on staff count (visual feedback)
  const staffDisplay = document.getElementById('staff-display');
  if (staffCount === 1) {
    staffDisplay.style.borderLeftColor = '#00aa00'; // Green: 1 person (easy)
  } else if (staffCount === 2) {
    staffDisplay.style.borderLeftColor = '#0066cc'; // Blue: 2 people (normal)
  } else if (staffCount <= 4) {
    staffDisplay.style.borderLeftColor = '#ff9900'; // Orange: 3-4 people (medium crew)
  } else {
    staffDisplay.style.borderLeftColor = '#cc0000'; // Red: 5+ people (large crew)
  }
}

// Update display on page load
document.addEventListener('DOMContentLoaded', updateStaffDisplay);

// Update whenever items are checked/unchecked
document.addEventListener('item-checked', updateStaffDisplay);
document.addEventListener('item-unchecked', updateStaffDisplay);

// Update whenever settings change
document.getElementById('difficulty-selector').addEventListener('change', updateStaffDisplay);
document.getElementById('staff-threshold').addEventListener('change', updateStaffDisplay);
```

### Real-World Example: Owner Decision Flow

**Scenario 1: House cleaning job**
```
Owner sets:
  Difficulty: Standard
  Staff Threshold: 7 hrs/person
  
Checklist has 10 hours of items checked
Multiplier: 1.0x
Total hours: 10
Staff needed: ceil(10 / 7) = 2 people

Display shows: "📊 Staff Required: 2 staff members"
Owner thinks: "Two people, about 5 hours each. Good."
```

**Scenario 2: Owner realizes property is dirtier**
```
Owner changes difficulty to: Hard

UI recalculates automatically:
Total hours: 10 × 1.5 = 15
Staff needed: ceil(15 / 7) = 3 people

Display CHANGES to: "📊 Staff Required: 3 staff members"
(Color changes from blue to orange)

Owner SEES THIS and says: "Oh! It's actually 3 people now? 
That changes my pricing and crew scheduling."
```

**Scenario 3: Gym job discovered**
```
Owner sets:
  Difficulty: Hard
  Staff Threshold: 5 hrs/person (commercial setting)
  
Checklist items: 45 hours (15 showers × 3 hours each)
Multiplier: 1.5x (hard)
Total hours: 45 × 1.5 = 67.5 hours
Staff needed: ceil(67.5 / 5) = 14 people

Display shows: "📊 Staff Required: 14 staff members"
(Color is RED - large crew warning)

Owner sees "14 staff" and thinks: 
"Wow, 14 people for this job! That's a significant crew. 
Let me verify the estimate is correct."
```

### Why This Matters

1. **Immediate feedback** - Users don't calculate manually; they see impact instantly
2. **Prevents surprises** - Owner discovers scope before generating quote
3. **Educates** - Shows relationship: difficulty → hours → staff → crew cost
4. **Influences decisions** - Owner might:
   - Double-check if difficulty is correct
   - Adjust staff threshold based on efficiency
   - Reconsider pricing strategy
   - Decide whether to subcontract
5. **Builds confidence** - Owner knows the system calculated staffing, not guessing

### Where to Display

**Primary: Settings Form**
- Always visible when settings are open
- Updates in real-time as user adjusts
- Right after "Staff Threshold" input for context

**Secondary: Quote Preview**
```
Before user clicks "Generate Quote":
"This job will require: 3 staff members"
```

**Tertiary: Job Summary Card**
```
Top of form display:
"🏢 House | 📊 2 staff | ⏱️ 15 hours | 💰 $600"
```

### Implementation Checklist

When building Settings form:
- [ ] Add `onchange="updateStaffDisplay()"` to difficulty dropdown
- [ ] Add `onchange="updateStaffDisplay()"` to staff threshold input
- [ ] Create `#staff-display` div with calculation output
- [ ] Implement `calculateCheckedItemsHours()` to sum checked items
- [ ] Implement `updateStaffDisplay()` function with all logic
- [ ] Call on DOMContentLoaded to show initial calculation
- [ ] Call when items are checked/unchecked (listen to events)
- [ ] Call when settings change
- [ ] Color-code display (green=1, blue=2, orange=3-4, red=5+)
- [ ] Show detailed calculation breakdown (helps user understand math)
- [ ] Update singular/plural label ("staff member" vs. "staff members")
- [ ] Test with various hour totals and difficulty levels

---

## The Staff Threshold Mechanism (from checklist-modern.html)

You're right—there IS a threshold mechanism in the existing system. It's in Settings:

```html
<label for="setting-staff-threshold">Staff Threshold (hours)</label>
<input type="number" id="setting-staff-threshold" value="7" step="0.5" min="0" />
<p>Jobs over this duration require multiple staff</p>
```

### How It Works

**Algorithm (from checklist-script.js):**

```javascript
const staffThreshold = 7;  // Default setting
const totalHours = 12;     // Sum of all checked items

// Calculate how many staff needed
const staffCount = Math.ceil(totalHours / staffThreshold);
// Result: ceil(12 / 7) = 2 staff members required
```

**Examples:**

| Total Hours | Threshold | Staff Count | Meaning |
|-------------|-----------|-------------|---------|
| 5 hours | 7 | 1 person | Solo job, fits in < 1 day |
| 12 hours | 7 | 2 people | Need 2-person crew |
| 22 hours | 7 | 4 people | Large crew needed |
| 25 hours | 10 | 3 people | Different threshold = different staffing |

### Why This is a Settings Decision

**This is a SETTINGS choice because:**
- It determines **crew composition** before the job starts
- It affects **quote profitability** (more staff = higher cost)
- It's **business-dependent** (your company might send 1 person per 8 hours, another might do 6 hours per person)
- It affects **scheduling** (can't just pick staff randomly)

**The threshold varies by:**
- Company efficiency
- Service type (EOT vs. residential vs. commercial)
- Difficulty level
- Geographic location
- Labor cost

**House Quote Examples:**

```
Easy house: 4 hours total
  Threshold: 7 hours/person
  Staff: 1 person (4 < 7)
  
Hard house: 16 hours total
  Threshold: 7 hours/person
  Staff: 3 people (ceil(16/7) = 3)
```

**Gym Quote Examples (why this matters for larger jobs):**

```
Commercial gym, 15 showers, difficulty = 'hard'
  Total hours: 45 hours (difficulty multiplier applied)
  Threshold: 7 hours/person
  Staff: ceil(45 / 7) = 7 people required
  
Same gym, different settings:
  Threshold: 10 hours/person
  Staff: ceil(45 / 10) = 5 people required
  
Different threshold choice = different crew size = different quote
```

### Settings That Control Staffing

From the system, these Settings control the quote when hours exceed threshold:

```javascript
const staffThreshold = 7;                    // Hours per person
const staffMultiplier = 25;                  // Legacy: % premium if over threshold
const staffExtraHourlyRate = 0;             // New: $ per extra person per hour
```

**Logic:**
```javascript
if (totalHours > staffThreshold) {
  // Option A (Preferred): Add another person at hourly rate
  quote += (totalHours * staffExtraHourlyRate * numExtraStaff)
  
  // Option B (Legacy): Apply percentage premium
  quote *= (1 + staffMultiplier / 100)
}
```

---

## Why Context Matters: House vs. Gym

You said it perfectly: "You can't expect to walk and do a gym and have a house setting set up."

### House Quote Settings
```javascript
{
  serviceType: 'residential',
  difficulty: 'standard',              // Normal wear
  staffThreshold: 7,                   // 1 person per 7 hours
  staffExtraHourlyRate: 25,            // Extra staff at $25/hr
}
```

Expected hours: 4-12 hours total  
Expected staff: 1-2 people  
Expected quote: $200-500

### Gym Quote Settings
```javascript
{
  serviceType: 'commercial',
  jobType: 'gym',
  difficulty: 'hard',                  // Heavy use = harder
  showers: 15,
  staffThreshold: 5,                   // 1 person per 5 hours (more efficient for large jobs)
  staffExtraHourlyRate: 35,            // Extra staff at $35/hr (commercial rates higher)
}
```

Expected hours: 40-60 hours total  
Expected staff: 8-12 people  
Expected quote: $3000-5000

### Why They Can't Share Settings

| Element | House | Gym | Why Different |
|---------|-------|-----|---------------|
| **Difficulty** | Easy/Standard | Hard | Gym=heavy use, stains, odors |
| **Multiplier** | 1.0x | 1.5x+ | More thorough needed for commercial |
| **Hours per person** | 7 | 5 | Gym work is slower, more complex |
| **Staff rate** | $25/hr extra | $35/hr extra | Commercial labor costs more |
| **Items per room** | 10-15 | 20-25 | Gym requires deeper cleaning |

If you used house settings for a gym quote, you'd **massively underestimate** hours and staff.

---



**Scenario: Commercial gym quote**

```
CLIENT: "It's a 5,000 sq ft gym. 15 shower stalls."

SETTINGS-TIME DECISION:
  serviceType: 'commercial'
  propertyType: 'gym'
  fixtureCount: {
    showers: 15,
    toilets: 8,
    sinks: 20
  }

FACTORY GENERATES:
  gym_shower_01 (AysRoomSection with shower items)
  gym_shower_02
  gym_shower_03
  ... 
  gym_shower_15
  gym_toilet_group (AysRoomSection with 8 toilet items)
  gym_sink_group (AysRoomSection with 20 sink items)

FORM DISPLAYS:
  15 separate shower sections
  (Each section has ~15 items: walls, fixtures, floors, drain, etc.)
  Total: 225 shower-specific items

USER ON FORM:
  ✓ Can check/uncheck which items apply to each shower
  ✓ Can add notes "Shower 3 has mold, extra care needed"
  ✓ Can mark certain showers as "ready" vs. "needs work"
  ✗ CANNOT add a 16th shower (that's structural)
  ✗ CANNOT reduce to 12 showers (form is generated)
  ✗ CANNOT change "15 showers" with a dropdown
```

**Why can't this be a form choice?**
- If user could toggle "add another shower," the form would need to dynamically regenerate sections
- Each new shower adds ~15 items to the quote
- That's not a small choice—that's a new section with new logic
- It's simpler and cleaner to make that a Settings decision

**If user discovered a 16th shower during walk-through?**
- User adds custom service: "Clean additional shower stall (estimate 15 items, 2 hours)"
- Not ideal, but acceptable for discovery phase

---

## The Ceiling Decision Example

**Scenario: Commercial building quote**

**Client says:** "We have a popcorn ceiling."

**This is SETTINGS because:**
- Popcorn ceiling cleaning ≠ flat ceiling cleaning
- Different techniques, different items
- Affects which items appear in the form
- Can't toggle "popcorn" with a checkbox—either the items exist or they don't

**Settings include:**
```javascript
{
  ceilingType: 'popcorn',  // vs. 'drywall', 'textured', 'tin', etc.
  ceilingHeight: 'standard',  // vs. 'cathedral', 'vaulted'
}
```

**Factory generates different items:**
- Drywall: "Dust ceiling, wipe with cloth"
- Popcorn: "Vacuum ceiling, use soft brush, avoid water damage"

**On the form:**
- User sees items specific to popcorn ceiling
- User checks/unchecks each item
- User adds notes "Popcorn is fragile, extra care"
- But user CANNOT change "popcorn" to "drywall" without restarting

---

## Decision Tree: Settings or Form?

Use this tree to categorize a choice:

```
Does this choice...

1. Change the number of rooms or sections?
   YES → SETTINGS (structure changed)
   NO → Continue to 2

2. Change which item definitions are loaded?
   YES → SETTINGS (different items needed)
   NO → Continue to 3

3. Affect the fundamental scope/scale of the job?
   YES → SETTINGS (structural impact)
   NO → Continue to 4

4. Is it a binary toggle or small variation within the structure?
   YES → FORM (user can check/uncheck)
   NO → Consider if it's too big for form

5. Would changing it mid-form break the consistency?
   YES → SETTINGS (must be locked in)
   NO → FORM (user can toggle)
```

### Decision Tree Examples

**"How many bedrooms?"**
- Changes number of rooms? **YES** → SETTINGS

**"Is bedroom 1 a master or guest?"**
- Changes number of rooms? NO
- Changes which items? **YES** → SETTINGS
  (Master has walk-in closet items; guest doesn't)

**"Dust the ceiling in bedroom 1?"**
- Changes number of rooms? NO
- Changes which items? NO
- Affects scope? NO
- Is it a toggle? **YES** → FORM

**"Does the bathroom have a heated floor?"**
- Changes number of rooms? NO
- Changes which items? **YES** (adds heated floor items) → SETTINGS

**"Is the heated floor in good condition?"**
- Changes number of rooms? NO
- Changes which items? NO
- Affects scope? NO
- Is it a toggle/note? **YES** → FORM
  (User notes "heated floor broken, don't clean" or similar)

---

## How This Flows Into Architecture

### Settings Object (Pre-Form)

```javascript
const settings = {
  // SERVICE & JOB TYPE
  serviceType: 'commercial',        // EOT, residential, commercial
  jobType: 'gym',                   // gym, office, retail, home, etc.
  
  // DIFFICULTY LEVEL (affects production rate & staffing)
  difficulty: 'hard',               // 'easy', 'standard', 'hard'
  // Multiplier: easy = 0.75x, standard = 1.0x, hard = 1.5x+ hours
  // Affects: base hours, special items, crew size, quote total
  
  // PROPERTY SCALE
  propertyConfig: {
    squareFootage: 5000,
    bedrooms: 0,
    bathrooms: 0,
    showers: 15,                    // ← BIG choice: affects entire form
    toilets: 8,                     // ← BIG choice: new section
    sinks: 20,
    kitchens: 1
  },
  
  // KITCHEN FIXTURES (each oven is a separate item/setting)
  fixtureCount: {
    ovens: {
      single: 1,                    // 1 × Single oven (structured, not toggled)
      double: 0
    }
    // If user says "2 × Double ovens", that's 2 separate fixtures
    // Each gets its own item section in the form
  },
  
  // ROOM VARIANTS (what type is each room)
  roomVariants: {
    kitchen_1: 'industrial'         // Affects which items
  },
  
  // STRUCTURAL FEATURES
  roomSubFeatures: {
    kitchen_1: ['6_burner_stove'],  // Affects which items
    showers: ['high_pressure_heads'] // Affects items in all showers
  },
  
  // CEILING TYPE (structural, affects cleaning method and hours)
  structuralFeatures: {
    ceilingType: 'popcorn',         // ← BIG choice: different items
    flooringType: 'linoleum',       // ← BIG choice: different items
    wallType: 'commercial_paint'
  }
};
```

### The Oven Example: Why Fixture Count is Settings

**From the screenshot UI dropdown:**
```
Choose oven...
  1 × Single oven
  2 × Single ovens
  3 × Single ovens
  ... up to 8 × Single ovens
  1 × Double oven
  2 × Double ovens
  3 × Double ovens
  4 × Double ovens
```

This is a **SETTINGS multi-select/dropdown**, not a form choice.

**Why?** Each oven is a **structural fixture**:

**1 × Single oven generates:**
- 1 oven section in kitchen
- ~15 items per oven
- Total: ~15 oven items

**2 × Single ovens generates:**
- 2 separate oven sections in kitchen
- ~15 items each
- Total: ~30 oven items

**1 × Double oven generates:**
- 1 double oven section
- ~20 items (more chambers, more cleaning)
- Total: ~20 oven items

**The form structure changes based on fixture count.** You can't toggle this on the form—it's predetermined in Settings.

**What user CAN do on form:**
- Check/uncheck specific oven items
- Add notes: "Oven 2 heavily soiled, requires extended cleaning"
- Mark items: "Oven 1 very clean, skip deep cleaning"

**What user CANNOT do:**
- Add a 3rd oven (structure already generated)
- Switch to 2 Double ovens (different item set)
- Remove an oven (form is locked)

### Form Choices (During Checklist)

```javascript
// For each room/item generated from Settings:

// User checks/unchecks items
item.checked = true/false;

// User adds notes to items
item.notes = "Oven 2 has burnt-on carbon, needs extended soaking";

// User adds custom services (discovered during walk)
room.addCustomService({
  label: "Deep clean oven interior with special degreaser",
  hours: 2.0,
  charge: 100
});

// User marks room as complete
room.setComplete(true);
```

**Critical:** Settings doesn't change. Form state (checked, notes, custom) is what changes.

---

## In Practice: The Property Discovery Flow

### Phase 1: Property Discovery (SETTINGS)

**Admin or estimator talks to client:**

```
"How many bedrooms? 3
How many bathrooms? 2 
What type of kitchen? Standard with 1 oven
Ensuite bathroom? Yes
Any special features? Walk-in closet in master"

↓ Admin enters into SETTINGS

{
  bedrooms: 3,
  bathrooms: 2,
  roomVariants: { bedroom_1: 'master', bathroom_1: 'ensuite' },
  roomSubFeatures: { bedroom_1: ['walk_in_closet'], kitchen_1: [] }
}

↓ Factory generates form from Settings
```

### Phase 2: Property Walk-Through (FORM)

**Cleaner/estimator on-site:**

```
"Master bedroom dust ceiling? Check ✓
Clean windows? Check ✓
Clean closet? Check ✓
But wait, the closet is REALLY dirty, add note: 'Carpet heavily soiled, may need replacement'"

↓ User toggles items, adds notes

Room.state = {
  items: [
    { itemId: 'bed_001', checked: true, notes: '' },
    { itemId: 'bed_003', checked: true, notes: 'Carpet heavily soiled...' }
  ]
}

↓ User discovers: "Oh, there's also a small ensuite bathroom in bedroom 2!"

"That wasn't in Settings, but I found it. Hmm."
Options:
  A) Stop, restart with new Settings
  B) Add custom service: "Ensuite bathroom cleaning (estimate...)"
     (Not ideal, form is now inconsistent)

→ Usually: Option A (restart is cleaner)
```

### Phase 3: Quote Generation (SETTINGS + FORM)

```
Quote = {
  metadata_from_settings: {
    serviceType, propertyConfig, roomVariants, etc.
  },
  rooms_from_settings: [
    { roomId, items: [...] } (structure defined by Settings)
  ],
  user_choices_from_form: {
    checked_items: [...],
    notes: {...},
    custom_services: [...]
  }
}
```

---

## Summary: Settings vs. Form

| Aspect | Settings | Form |
|--------|----------|------|
| **When** | Pre-form, during discovery | During walk-through/checklist |
| **Who** | Admin/estimator (phone) | Cleaner/inspector (on-site) |
| **Changes** | Rare (start over if it changes) | Frequent (user checks/unchecks) |
| **Affects** | Room structure, item definitions, hours/difficulty | Item state, notes, custom services |
| **Scale** | "How many showers?" "What difficulty?" | "Is this shower item checked?" |
| **Reset** | Restart form | Just undo the change |
| **Examples** | "15 showers in gym", "Difficulty: Hard" | "Shower 3 has mold", "Add extra grout cleaning" |
| **Size** | BIG structural choices | SMALL item-level choices |
| **Affects Staffing** | YES (difficulty determines crew size) | NO (form just captures what user finds) |
| **Locks In Quote** | YES (structure determines total hours) | NO (checked items determine what's quoted) |

---

## Why This Distinction Matters for Code

### Settings Choices Generate Structure
```javascript
// Settings says "15 showers"
factory.generate() → creates 15 AysRoomSection objects
```

### Form Choices Populate State
```javascript
// User checks item #3 in shower #1
rooms[0].items[2].checked = true;
```

**They are fundamentally different operations:**
- Settings → Factory → Structure (one-time)
- Form → User State → Choices (repeated, reversible)

---

## The Gym with Popcorn Ceiling Example

**Full scenario:**

```
SETTINGS:
  serviceType: 'commercial'
  jobType: 'gym'
  showers: 15
  structuralFeatures: {
    ceilingType: 'popcorn'
  }

FACTORY GENERATES:
  gym_shower_01 AysRoomSection
    items: [
      "Vacuum popcorn ceiling (special soft brush)" ← different from drywall
      "Wipe shower walls"
      "Clean fixtures"
      ... 12 more items
    ]
  gym_shower_02 through gym_shower_15 (same structure)

FORM DISPLAYS:
  ✓ 15 shower sections
  ✓ Popcorn ceiling-specific items in each
  ✓ User checks "Vacuum popcorn ceiling" for showers 1, 3, 5, 10, 15
  ✓ User adds note: "Shower 3 ceiling fragile, use extra care"
  ✗ User CANNOT change ceiling to "drywall" (that would change ALL items)
  ✗ User CANNOT remove a shower (that's structural)
```

---

## Next Integration Point

When building ChecklistPageGenerator, use this document to decide:
- Which Settings fields drive room generation?
- Which drive item definition selection?
- Which drive sub-feature modifications?

All other choices belong on the form as checkboxes/notes/custom services.

