# Settings Area Integration: Production Rate Component

**Purpose**: Update the settings form to include production rate configuration  
**Component**: AysProductionRateSettings (ready to integrate)  
**Status**: Specification + Component Ready (test at test-production-rate-component.html)

---

## Current Settings Flow

```
Current (Domestic Only):
┌─ Service Type (EOT, Residential) ─────────┐
│                                           │
│ → Room/Bathroom/Bedroom counts            │
│                                           │
│ → Property address                        │
│                                           │
│ → Client details                          │
│                                           │
│ → Generate form with items                │
└───────────────────────────────────────────┘
```

---

## Updated Settings Flow (With Commercial)

```
New (Domestic + Commercial):

If SERVICE TYPE = Domestic (EOT or Residential):
┌─────────────────────────────────────┐
│ Service Type (EOT / Residential)    │
│                                     │
│ Room Counts (bedrooms, bathrooms)   │
│                                     │
│ Address & Client                    │
│                                     │
│ [Production Rate: Standard for EOT] │ ← Default, no config needed
│                                     │
│ → Generate form                     │
└─────────────────────────────────────┘

If SERVICE TYPE = Commercial:
┌─────────────────────────────────────────┐
│ Commercial Classification              │
│ (Light or Heavy)                        │
│                                         │
│ ◆ PRODUCTION RATE SETTINGS ◆            │ ← NEW: AysProductionRateSettings
│ • Light default: 400 sq ft/hr           │
│ • Heavy default: 330 sq ft/hr           │
│ • User can customize per classification │
│ • Saves to localStorage                 │
│                                         │
│ Property Size (sq ft or sq m)           │
│                                         │
│ Room Selection                          │
│ (Based on classification)               │
│                                         │
│ Address & Client                        │
│                                         │
│ → Generate form with labor estimates    │
└─────────────────────────────────────────┘
```

---

## Settings Component Integration

### HTML Structure

```html
<div class="settings-form">
    <!-- SERVICE TYPE SELECTOR -->
    <fieldset class="form-section">
        <legend>Service Type</legend>
        <label>
            <input type="radio" name="service_type" value="eot" /> End of Tenancy (EOT)
        </label>
        <label>
            <input type="radio" name="service_type" value="residential" /> Residential
        </label>
        <label>
            <input type="radio" name="service_type" value="commercial" /> Commercial
        </label>
    </fieldset>

    <!-- DOMESTIC ONLY SECTION -->
    <div id="domestic-settings" class="conditional-section" style="display: none;">
        <!-- Room counts, address, etc. -->
    </div>

    <!-- COMMERCIAL ONLY SECTION -->
    <div id="commercial-settings" class="conditional-section" style="display: none;">
        
        <!-- Classification -->
        <fieldset class="form-section">
            <legend>Commercial Classification</legend>
            <label>
                <input type="radio" name="commercial_classification" value="light" 
                       onchange="showProductionRateComponent('light')" /> 
                Light Commercial (offices, small warehouse)
            </label>
            <label>
                <input type="radio" name="commercial_classification" value="heavy" 
                       onchange="showProductionRateComponent('heavy')" /> 
                Heavy Commercial (shopping mall, multi-level)
            </label>
        </fieldset>

        <!-- PRODUCTION RATE COMPONENT (Inserted Here) -->
        <div id="production-rate-component-container"></div>

        <!-- Property Size -->
        <fieldset class="form-section">
            <legend>Property Size</legend>
            <div class="input-group">
                <input type="number" id="property_size" placeholder="5000" min="100" />
                <select id="property_unit">
                    <option value="sq_ft">square feet</option>
                    <option value="sq_m">square meters</option>
                </select>
            </div>
        </fieldset>

        <!-- Room Selection (Dynamic based on classification) -->
        <div id="room-selection-container"></div>

    </div>

    <!-- SHARED SECTIONS (Address, Client) -->
    <fieldset class="form-section">
        <legend>Client & Address</legend>
        <!-- Address fields -->
        <!-- Client fields -->
    </fieldset>

    <!-- SUBMIT -->
    <button class="submit-button">Generate Checklist</button>
</div>
```

### JavaScript Integration

```javascript
class SettingsForm {
    
    constructor() {
        this.serviceType = null;
        this.commercialClassification = null;
        this.productionRateComponent = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const serviceTypeRadios = document.querySelectorAll('input[name="service_type"]');
        serviceTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleServiceTypeChange(e.target.value));
        });
    }

    handleServiceTypeChange(serviceType) {
        this.serviceType = serviceType;
        
        const domesticSettings = document.getElementById('domestic-settings');
        const commercialSettings = document.getElementById('commercial-settings');
        
        if (serviceType === 'commercial') {
            domesticSettings.style.display = 'none';
            commercialSettings.style.display = 'block';
        } else {
            domesticSettings.style.display = 'block';
            commercialSettings.style.display = 'none';
        }
    }

    showProductionRateComponent(classification) {
        this.commercialClassification = classification;
        
        const container = document.getElementById('production-rate-component-container');
        container.innerHTML = ''; // Clear
        
        this.productionRateComponent = new AysProductionRateSettings({
            classification: classification,
            onSave: (settings) => {
                console.log('Production rate settings updated:', settings);
                this.onProductionRateChange(settings);
            }
        });
        
        container.appendChild(this.productionRateComponent.render());
    }

    onProductionRateChange(settings) {
        // Store in form state
        this.productionRateSettings = settings;
        
        // Could trigger room selection update if needed
        this.updateRoomSelectionOptions();
    }

    getFormData() {
        return {
            service_type: this.serviceType,
            commercial_classification: this.commercialClassification,
            production_rate_settings: this.productionRateComponent?.getSettings(),
            property_size: document.getElementById('property_size').value,
            property_unit: document.getElementById('property_unit').value,
            // ... other fields
        };
    }

    handleSubmit() {
        const formData = this.getFormData();
        console.log('Settings submitted:', formData);
        
        // Pass to factory
        const factory = new AysChecklistFormFactory(formData);
        const form = factory.generate();
        
        // Render form
        document.getElementById('form-container').appendChild(form);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = new SettingsForm();
});
```

---

## Component Features

### AysProductionRateSettings Class

**Inputs**:
- `classification`: 'light' or 'heavy'
- `onSave`: Callback when settings saved

**Methods**:
- `render()`: Returns DOM element
- `getSettings()`: Returns current settings object
- `saveSettings()`: Persists to localStorage
- `loadSettings()`: Loads from localStorage

**Features**:
- ✅ Radio buttons: Standard vs Custom
- ✅ Unit selection: sq ft/hr or sq m/hr
- ✅ Auto-conversion between units
- ✅ Input validation (warns if <100 or >1000)
- ✅ Checkbox: "Save as my default"
- ✅ localStorage persistence
- ✅ Live display of current setting
- ✅ Real-time unit conversion

**Output** (getSettings):
```javascript
{
  classification: 'light',
  use_custom_rate: true,
  production_rate: 450,
  production_unit: 'sq_ft_per_hour',
  timestamp: '2026-01-03T...'
}
```

---

## Test Component

**File**: `test-production-rate-component.html`

**Shows**:
- Side-by-side Light & Heavy components
- Full styling and interaction
- Real-time settings output
- localStorage persistence
- Unit conversion in action

**How to Test**:
1. Open in browser: `checklist/test-production-rate-component.html`
2. Try switching to custom rate
3. Enter custom value (e.g., 450)
4. Change unit to sq meters
5. Check the output (should convert automatically)
6. Check "Save as my default"
7. Click "Apply Production Rate"
8. Refresh page (should load saved value)

---

## Next: Update Settings Page

**When coding the main settings page**:

1. **Import component**:
```html
<script src="js/components/AysProductionRateSettings.js"></script>
```

2. **Detect commercial classification**:
```javascript
const classification = document.querySelector('input[name="commercial_classification"]:checked').value;
```

3. **Create component**:
```javascript
const productionRateComponent = new AysProductionRateSettings({
    classification: classification,
    onSave: (settings) => { /* handle save */ }
});
```

4. **Insert in DOM**:
```javascript
document.getElementById('production-rate-container').appendChild(productionRateComponent.render());
```

5. **Retrieve on submit**:
```javascript
const settings = productionRateComponent.getSettings();
```

---

## Roadmap Update (For Next Section)

After settings integration, roadmap becomes:

```
CURRENT STATE:
✅ Phase 1: Component Renaming (DONE)
✅ Service Type Documentation (EOT, Residential, Commercial)
✅ Commercial Room Definitions
✅ Commercial Item Definitions
✅ Production Rate Specification
✅ AysProductionRateSettings Component (CODED)

NEXT:
⏳ Hour 0.5: Update Settings Page with Production Rate Component
   - Add AysProductionRateSettings to commercial settings
   - Wire up form validation
   - Test localStorage persistence

⏳ Hour 1-3: Build Room Classes & Item Definitions
   - Create ITEM_DEFINITIONS.js (all 3 service types)
   - Create Room.js base class
   - Create Bedroom, Bathroom, Kitchen subclasses
   - Integrate with AysChecklistFormFactory

⏳ Hour 4-6: Warehouse & Industrial Rooms
   - Create Warehouse, Workshop room classes
   - Handle parameterized items (rubbish tins, etc.)
   - Test complex commercial sites

⏳ Hour 7-9: Polish & Edge Cases
   - Settings validation
   - Quote generation with labor estimates
   - Responsive design
   - localStorage state management
```

---

## Summary

✅ **AysProductionRateSettings component created** (ready to test)  
✅ **Test file created** (test-production-rate-component.html)  
✅ **Integration guide provided** (copy-paste ready)  
✅ **Features complete**:
   - Dual classification (Light/Heavy)
   - Custom rates
   - Unit conversion (sq ft ↔ sq m)
   - localStorage persistence
   - Input validation
   - Real-time display

**Next decision**: Update the full settings page to use this component, or proceed directly to Hour 1-3 sprint (ITEM_DEFINITIONS.js + Room classes)?

