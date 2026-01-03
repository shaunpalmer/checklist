# Production Rate: User-Configurable Setting

**Purpose**: Allow business owner to calibrate production rate to their team's actual performance  
**Used By**: Settings phase (before labor calculation), AysChecklistFormFactory (labor estimate)  
**Status**: Specification (critical for accurate quoting)

---

## The Problem with Hard-Coded Rates

**Your measured rate**: 400 sq ft/hour (Light) or 330-340 sq ft/hour (Heavy)

**Reality**: Every team cleans differently.
- Super-fit crew: May achieve 500+ sq ft/hour
- Optimized workflow: May achieve 420-450 sq ft/hour
- Standard crew: 400 sq ft/hour (your baseline)
- New/less experienced: 300-350 sq ft/hour
- Shopping mall with obstacles: 250-300 sq ft/hour

**Solution**: Make production rate a **configurable setting**, not hard-coded.

---

## Settings: Production Rate Configuration

### Where It Lives

```
┌─ SERVICE TYPE ──────────────────┐
│  ⚪ EOT (domestic)              │
│  ⚪ Residential (domestic)       │
│  ⚪ Commercial                   │
│                                 │
│  COMMERCIAL CLASSIFICATION      │
│  ⚪ Light Commercial             │
│  ⚪ Heavy Commercial             │
│                                 │
│  ◆ PRODUCTION RATE SETTINGS ◆   │ ← NEW
│  (Light & Heavy configured      │    separately
│   separately)                   │
│                                 │
│  PROPERTY SIZE                  │
│  [_____] sq ft or sq meters     │
│                                 │
│  ROOM SELECTION                 │
│  (Generated based on settings)  │
│                                 │
│  FORM GENERATION                │
│  (Items + labor estimate)       │
└─────────────────────────────────┘
```

---

## User-Configurable Production Rate

### Form Layout

**For LIGHT COMMERCIAL**:

```
📊 Light Commercial Production Rate

Your team's cleaning speed (for labor estimates):

⚪ Use Standard Rate
   └─ 400 sq feet per hour
   └─ (≈ 37 square meters per hour)
   └─ [Default based on typical crew]

⚪ Custom Rate
   └─ [______] (number)
   └─ Unit: (dropdown) ▼
      • Square feet per hour
      • Square meters per hour
   
   [Save as my default] ☑

Current setting: 400 sq ft/hour
```

**For HEAVY COMMERCIAL**:

```
📊 Heavy Commercial Production Rate

Your team's cleaning speed (for labor estimates):

⚪ Use Standard Rate
   └─ 330 square feet per hour
   └─ (≈ 31 square meters per hour)
   └─ [Default for complex/high-traffic facilities]

⚪ Custom Rate
   └─ [______] (number)
   └─ Unit: (dropdown) ▼
      • Square feet per hour
      • Square meters per hour
   
   [Save as my default] ☑

Current setting: 330 sq ft/hour
```

---

## How It Works

### 1. User Selects Custom Rate

```
User: "Our team is super fit. We do 500 sq ft/hour on Light Commercial."
→ Enters: 500
→ Selects: "Square feet per hour"
→ Clicks: "Save as my default"
```

### 2. System Stores Setting

```javascript
// In localStorage or database:
settings = {
  service_type: 'commercial',
  classification: 'light',
  production_rate: 500,
  production_unit: 'sq_ft_per_hour',
  use_custom_rate: true
}
```

### 3. Labor Calculation Uses Custom Rate

```javascript
// In AysChecklistFormFactory
const productionRate = settings.production_rate; // 500, not 400

const laborHours = (propertySquareFootage / productionRate) * difficultyMultiplier;

// Example:
// 5,000 sq ft property
// = (5,000 / 500) × 1.0
// = 10 hours (not 12.5 hours)
// = More competitive quote
```

### 4. Quote Reflects Custom Rate

```
LABOR ESTIMATE:
Property size: 5,000 sq ft
Production rate: 500 sq ft/hour (your custom rate)
Difficulty multiplier: 1.0x
─────────────────────────
Base labor: 10 hours
Rate: $X per hour
Subtotal: $10X

[vs. standard 400 sq ft/hour = 12.5 hours = $12.5X]
```

---

## Metric Conversion

### Default Labels (Based on Selection)

If user selects "Square meters per hour":

```
📊 Light Commercial Production Rate

⚪ Use Standard Rate
   └─ 37 square meters per hour
   └─ (≈ 400 square feet per hour)

⚪ Custom Rate
   └─ [______] square meters per hour
   └─ [Save as my default] ☑
```

### Automatic Conversion

When storing/calculating:

```javascript
// If user input is in sq meters, convert to sq ft for internal calculation
if (production_unit === 'sq_m_per_hour') {
  internalProductionRate = inputRate × 10.764; // 1 sq m = 10.764 sq ft
}

// Or store both and convert as needed
settings = {
  production_rate_sq_ft: 400,
  production_rate_sq_m: 37.16,  // Calculated (400 / 10.764)
  user_selected_unit: 'sq_ft_per_hour'
}
```

---

## Default Values (Your Measured Rates)

These are the **suggested defaults**, but user can override:

### LIGHT COMMERCIAL Defaults

| Unit | Value | Notes |
|---|---|---|
| Square feet per hour | 400 | Your measured baseline |
| Square meters per hour | 37 | (400 ÷ 10.764) |

### HEAVY COMMERCIAL Defaults

| Unit | Value | Notes |
|---|---|---|
| Square feet per hour | 330 | Your measured (conservative for complex) |
| Square meters per hour | 31 | (330 ÷ 10.764) |

---

## User Scenarios

### Scenario 1: Optimized Crew

```
User: "We've optimized our process. Light Commercial = 480 sq ft/hour"
Setting: ⚪ Custom Rate → 480 sq ft/hour → Save

Result: Faster quotes, more competitive bids
Labor: (5,000 / 480) × 1.0 = 10.4 hours (vs. 12.5 hours)
```

### Scenario 2: New Team

```
User: "Our team is still learning. Light Commercial = 350 sq ft/hour"
Setting: ⚪ Custom Rate → 350 sq ft/hour → Save

Result: Conservative estimates, buffer for training
Labor: (5,000 / 350) × 1.0 = 14.3 hours (vs. 12.5 hours)
Margin: Extra time/budget for efficiency gains
```

### Scenario 3: Metric-Based Business

```
User: "We measure everything in square meters. Heavy = 30 sq m/hour"
Setting: ⚪ Custom Rate → 30 → Unit: "Square meters per hour" → Save

Result: Works in their native unit
Internal: Converts to 323 sq ft/hour for calculations
Labor: (1,000 sq m / 30 sq m/hour) = 33.3 hours
```

### Scenario 4: Seasonal Variation

```
User: "Summer (more staff): 450 sq ft/hour. Winter (fewer staff): 380 sq ft/hour"
Setting: Could store BOTH and select seasonally, OR use average

Current version: Use single custom rate, user adjusts seasonally
Future version: Seasonal production rates (enhancement)
```

---

## Data Storage

### In Settings Object

```javascript
settings = {
  // Service & classification (existing)
  service_type: 'commercial',
  commercial_classification: 'light',  // or 'heavy'
  
  // Production rate (NEW)
  production_rate: 400,  // User's configured rate
  production_unit: 'sq_ft_per_hour',  // or 'sq_m_per_hour'
  use_custom_rate: true,  // true = use custom, false = use default
  
  // Defaults for reference
  default_production_rate_light: 400,
  default_production_rate_heavy: 330,
  
  // Property size
  property_size: 5000,
  property_unit: 'sq_ft',  // or 'sq_m'
  
  // Calculated values
  labor_hours_base: 12.5,  // (5000 / 400) × 1.0
  difficulty_multiplier: 1.0,
  labor_hours_total: 12.5
}
```

---

## In AysChecklistFormFactory

### Labor Calculation Method

```javascript
class AysChecklistFormFactory {
  
  constructor(config) {
    this.config = config;
    this.settings = config.settings;
  }
  
  /**
   * Calculate labor hours based on property size and production rate
   * @returns {number} Total labor hours
   */
  calculateLaborHours() {
    const propertySize = this.settings.property_size;
    const productionRate = this.settings.production_rate; // User-configured
    const multiplier = this.settings.difficulty_multiplier || 1.0;
    
    const baseHours = propertySize / productionRate;
    const totalHours = baseHours * multiplier;
    
    return totalHours;
  }
  
  /**
   * Generate quote with production rate info
   */
  generateQuoteWithRate() {
    const laborHours = this.calculateLaborHours();
    
    return {
      property_size: this.settings.property_size,
      property_unit: this.settings.property_unit,
      production_rate: this.settings.production_rate,
      production_rate_unit: this.settings.production_unit,
      is_custom_rate: this.settings.use_custom_rate,
      difficulty_multiplier: this.settings.difficulty_multiplier,
      labor_hours: laborHours,
      quote_notes: this.settings.use_custom_rate 
        ? `Based on your production rate: ${this.settings.production_rate} ${this.settings.production_unit}`
        : `Based on standard rate: ${this.settings.production_rate} ${this.settings.production_unit}`
    };
  }
}
```

---

## UI Quote Display

### Show Production Rate Clarity

```
QUOTE SUMMARY
═════════════════════════════════════════

Property Details:
• Size: 5,000 sq ft
• Classification: Light Commercial
• Difficulty: Standard (1.0x)

Labor Calculation:
• Production Rate: 400 sq ft per hour [your setting]
• Estimated Hours: 12.5 hours
• Rate: $75/hour
• Subtotal: $937.50

[Note: This quote assumes your team's average production rate.
 Adjust in Settings if your rate changes. Change Production Rate]

═════════════════════════════════════════
```

---

## Validation Rules

**When user enters custom production rate**:

```javascript
// Validation
if (productionRate < 100) {
  warn("Very low rate (< 100 sq ft/hour). Check your entry?");
}
if (productionRate > 1000) {
  warn("Very high rate (> 1000 sq ft/hour). Check your entry?");
}

// Reasonable range: 250-600 sq ft/hour for most commercial scenarios
// (Below 250 = understaffed or highly specialized)
// (Above 600 = exceptional circumstances)
```

---

## Summary: Why This Matters

| Aspect | Hard-Coded | User-Configurable |
|---|---|---|
| **Flexibility** | Your rate only | Owner's actual rate |
| **Accuracy** | ±20% off for many teams | ±5% for that business |
| **Competitiveness** | One size fits all | Reflects team performance |
| **Growth** | Needs code change | Owner adjusts in settings |
| **Transparency** | Hidden | Visible in quote |
| **Validation** | None | Owner confirms rate |

---

## Next: Hour 1-3 Sprint Implementation

When coding AysChecklistFormFactory:

```javascript
// Instead of:
const BASE_PRODUCTION_RATE = 400; // Hard-coded

// Use:
const productionRate = settings.production_rate || 400; // From settings
```

This single change enables:
- ✅ User customization
- ✅ Accurate labor quotes
- ✅ Competitive edge per business
- ✅ Seasonal adjustments
- ✅ Team performance tracking

**Ready to code ITEM_DEFINITIONS.js + update AysChecklistFormFactory?**

