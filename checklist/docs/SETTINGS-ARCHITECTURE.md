# Settings Tab Architecture - Source of Truth

## Philosophy
**NO hardcoded defaults in JavaScript code.** Everything is configured in the Settings tab HTML, read by JavaScript, and persisted to localStorage.

## Current Tab Structure

```
🏠 Property (SOURCE OF TRUTH)
  ├─ Property Type selector
  ├─ Residential parameters (bedrooms, bathrooms)
  ├─ Office parameters (floors, offices per floor)
  ├─ Gym parameters (showers)
  ├─ Warehouse parameters (docks, admin offices)
  └─ Regenerate button + auto-regen note

💵 Pricing
  ├─ Base hourly rate
  ├─ Premium hourly rate
  ├─ Tax rate
  └─ Multiple staff premium

⚡ Production Rate
  ├─ Light commercial rate
  ├─ Heavy commercial rate
  └─ Configuration UI components

🔧 Surcharges
  ├─ Single oven clean
  ├─ Double oven clean
  ├─ Carpet clean (base)
  ├─ Drawer/pantry clean
  └─ Garage clean

🎯 Services (Conditional toggles)
  ├─ Service toggles container (populated by AysServiceToggleRenderer)
  └─ API configuration section (advanced)

⚙️ System
  ├─ Customer ID configuration
  │   ├─ Customer ID prefix
  │   └─ Auto-generate IDs toggle
  └─ System options
      ├─ Staff threshold (hours)
      └─ Currency selector
```

## How to Add New Settings

### Pattern 1: Simple Input Field

```html
<!-- In appropriate TAB content div -->
<div class="meta-field">
  <label for="setting-my-option">My Option:</label>
  <input type="number" id="setting-my-option" value="100" step="5" min="0" />
</div>
```

**Then in JavaScript (checklist-script.js):**
```javascript
// In Checklist.init() or wherever settings are read:
const myOptionInput = document.getElementById('setting-my-option');
const myOptionValue = myOptionInput?.value || 100;

// Save to localStorage
localStorage.setItem('checklist_my_option', myOptionValue);

// Restore from localStorage on page load
const saved = localStorage.getItem('checklist_my_option');
if (saved && myOptionInput) myOptionInput.value = saved;
```

### Pattern 2: Dropdown/Select (Like Property Type)

```html
<div class="meta-field">
  <label for="setting-my-dropdown">My Dropdown:</label>
  <select id="setting-my-dropdown">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</div>
```

**Then in JavaScript:**
```javascript
const myDropdown = document.getElementById('setting-my-dropdown');
const selectedValue = myDropdown?.value || 'option1';

// Add change listener for auto-save
myDropdown?.addEventListener('change', function() {
  localStorage.setItem('checklist_my_dropdown', this.value);
  // Trigger any necessary regeneration
});
```

### Pattern 3: Conditional Parameters (Like Property Type)

```html
<!-- Main selector -->
<div class="meta-field">
  <label for="setting-category">Category:</label>
  <select id="setting-category" style="...">
    <option value="typeA">Type A</option>
    <option value="typeB">Type B</option>
  </select>
</div>

<!-- Parameters for Type A (hidden initially) -->
<div id="params-type-a" style="display: none;">
  <div class="meta-field">
    <label for="setting-param-a1">Parameter A1:</label>
    <input type="number" id="setting-param-a1" value="10" />
  </div>
</div>

<!-- Parameters for Type B (hidden initially) -->
<div id="params-type-b" style="display: none;">
  <div class="meta-field">
    <label for="setting-param-b1">Parameter B1:</label>
    <input type="number" id="setting-param-b1" value="20" />
  </div>
</div>
```

**Then in JavaScript:**
```javascript
const categorySelect = document.getElementById('setting-category');

function updateParamVisibility() {
  const selected = categorySelect?.value || 'typeA';
  document.getElementById('params-type-a').style.display = 
    selected === 'typeA' ? 'block' : 'none';
  document.getElementById('params-type-b').style.display = 
    selected === 'typeB' ? 'block' : 'none';
}

// Call on page load
updateParamVisibility();

// Call on change
categorySelect?.addEventListener('change', updateParamVisibility);
```

## Current Settings → Code Flow

### Property Configuration (Property Tab)
**HTML inputs:**
- `#setting-property-type` → select
- `#setting-num-bedrooms` → input
- `#setting-num-bathrooms` → input
- `#setting-num-offices` → input
- `#setting-office-floors` → input
- `#setting-offices-per-floor` → input
- `#setting-num-showers` → input
- `#setting-num-loading-docks` → input
- `#setting-num-admin-offices` → input

**JavaScript reads these:**
```javascript
// In DOMContentLoaded:
function getPropertyConfigFromForms() {
  const propertyType = document.getElementById('setting-property-type').value;
  const params = {
    numBedrooms: parseInt(document.getElementById('setting-num-bedrooms').value),
    numBathrooms: parseInt(document.getElementById('setting-num-bathrooms').value),
    // etc.
  };
  return { propertyType, params };
}

// Apply to PROPERTY_CONFIG
PROPERTY_CONFIG.setPropertyType(propertyType, params);

// Factory generates checklist
window.checklistGenerator.generate(CHECKLIST_CONFIG);

// Save to localStorage
localStorage.setItem('checklist_property_config', JSON.stringify({
  property_type: propertyType,
  params: params
}));
```

**On reload:**
```javascript
// Restore from localStorage
const saved = localStorage.getItem('checklist_property_config');
if (saved) {
  // Apply to form inputs
  const config = JSON.parse(saved);
  document.getElementById('setting-property-type').value = config.property_type;
  document.getElementById('setting-num-bedrooms').value = config.params.numBedrooms;
  // etc.
  
  // Generate with saved config
}
```

### Service Toggles (Services Tab)
**Flow:**
1. Settings → Property Type set (e.g., "commercial_gym")
2. AysServiceToggleRenderer reads PROPERTY_CONFIG.property_type
3. Gets available services: AysPropertyType.getAvailableServices('commercial_gym')
4. Loops through ITEM_DEFINITIONS for each service
5. Renders toggles in `#service-toggles-container`
6. On toggle change → saves to localStorage `checklist_[service]_included`

### Pricing/Production Rate/Surcharges (Other Tabs)
**Pattern:**
- HTML inputs defined in tabs
- JavaScript reads on page load
- Saved to localStorage with `checklist_[setting_name]`
- Loaded on page reload
- Used by factory/calculator/pricing engine

## localStorage Keys

```
checklist_property_config       // Property type + size params
checklist_settings             // General settings (from applySettingsToUI)
checklist_[service]_included   // Service toggles (windows, carpet, gardening)
checklist_my_setting           // Any new setting you add
```

## Testing New Settings

1. **Add HTML input in Settings tab**
2. **Read from form in JavaScript** (DOMContentLoaded)
3. **Save to localStorage** (before leaving page)
4. **Restore from localStorage** (on next page load)
5. **Test in Chrome DevTools**:
   - Open DevTools → Application → Local Storage
   - Verify your setting is saved
   - Clear localStorage → reload → verify default appears
   - Change setting → reload → verify saved value restored

## Future Settings to Add

When you need to add more configuration:

1. **Find the appropriate TAB** (or create new tab)
2. **Add HTML input in that tab** (follow Pattern 1, 2, or 3 above)
3. **Add JavaScript to read/save** (follow the localStorage pattern)
4. **Add to initialization logic** if it affects checklist generation
5. **Test with localStorage DevTools**

## Key Rules

✅ **DO:**
- Define settings in HTML tabs
- Read settings from form inputs
- Save to localStorage
- Restore from localStorage on page load
- Use `#setting-xxx` ID naming convention
- Document your new setting here

❌ **DON'T:**
- Hardcode defaults in JavaScript code (use HTML `value` attribute instead)
- Read from SETTINGS_DEFAULTS.js for UI values (use form inputs)
- Skip localStorage persistence (user expects their choices to survive reload)
- Forget to add restoration logic

## Example: Adding "Enable Night Mode" Setting

### Step 1: Add HTML to appropriate tab (let's say System tab)
```html
<div class="meta-field">
  <label for="setting-night-mode">
    <input type="checkbox" id="setting-night-mode" />
    Enable Night Mode
  </label>
</div>
```

### Step 2: Read and save in JavaScript
```javascript
const nightModeCheckbox = document.getElementById('setting-night-mode');

// On change: save to localStorage
nightModeCheckbox?.addEventListener('change', function() {
  localStorage.setItem('checklist_night_mode', this.checked ? '1' : '0');
  applyNightMode(this.checked);
});

// On page load: restore
const savedNightMode = localStorage.getItem('checklist_night_mode') === '1';
if (nightModeCheckbox) {
  nightModeCheckbox.checked = savedNightMode;
  applyNightMode(savedNightMode);
}

function applyNightMode(enabled) {
  if (enabled) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }
}
```

### Step 3: Test
- Load page → toggle checkbox
- Check DevTools → localStorage → see `checklist_night_mode: "1"`
- Reload page → checkbox is still checked ✓
- Clear localStorage → reload → checkbox is unchecked ✓

## Summary

**Settings tab = Source of Truth**

Everything the user configures in Settings:
- Lives in HTML form inputs
- Is read by JavaScript
- Is saved to localStorage
- Is restored on page reload
- Drives all downstream behavior (factory, toggles, pricing, etc.)

**No hardcoded defaults in code. Ever.**
