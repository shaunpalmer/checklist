/**
 * PropertyGardeningService.js - Garden & Lawn Maintenance as Property-Wide Service
 * 
 * Popular service offering in cleaning/maintenance industry.
 * Services include: lawn mowing, garden trimming, hedge trimming, weeding, deck cleaning, etc.
 * 
 * NOTE: Default toggle is OFF (most users won't offer this).
 * Gardening specialists or multi-service operators can enable and configure.
 * 
 * User Form Choices (Small Choices):
 * 1. Property size (small, medium, large, commercial)
 * 2. Lawn mowing (optional, parameterized by sqm)
 * 3. Garden trimming (optional, parameterized by bed count or sqm)
 * 4. Hedge trimming (optional, parameterized by linear meters)
 * 5. Weed removal (optional, parameterized by area)
 * 6. Deck/driveway cleaning (optional, parameterized by sqm)
 * 
 * Not in form (Structural/Settings):
 * - Whether gardening is included (toggle in Settings, default OFF)
 * - Service type (gardening is always the same)
 * 
 * Pricing Model:
 * - Base packages by property size (residential small/medium/large, commercial)
 * - Optional add-ons (specialization surcharges)
 * - Parameter-based (sqm, linear meters, bed count)
 * - Usually seasonal or quarterly contracts
 */

class PropertyGardeningService extends PropertyService {
  /**
   * Constructor for PropertyGardeningService
   * @param {Object} config - Configuration object
   * @param {string} config.propertySize - 'small', 'medium', 'large', 'commercial'
   * @param {number} config.lawnArea - Square meters of lawn
   * @param {number} config.gardenBeds - Number of garden beds
   * @param {number} config.hedgeLinearMeters - Linear meters of hedges
   */
  constructor(config = {}) {
    super({
      serviceId: 'gardening_services',
      serviceType: 'gardening',
      variant: 'standard',
      metadata: {
        label: 'Garden & Lawn Maintenance',
        emoji: '🌱',
        description: 'Professional gardening and outdoor maintenance service'
      },
      ...config
    });

    // User parameters for form choices (small choices)
    this.parameters = {
      propertySize: config.propertySize || 'medium',         // Size tier
      lawnArea: config.lawnArea || 0,                        // Square meters
      gardenBeds: config.gardenBeds || 0,                    // Number of beds
      hedgeLinearMeters: config.hedgeLinearMeters || 0,      // Linear meters of hedges
      weedingArea: config.weedingArea || 0,                  // Square meters to weed
      deckDrivewayArea: config.deckDrivewayArea || 0,        // Square meters to clean
      isQuarterly: config.isQuarterly || false               // Quarterly contract?
    };
  }

  /**
   * Get base items from ITEM_DEFINITIONS
   * Returns services for this property size + optional add-ons
   * @returns {Array<Object>} Base items for gardening service
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const serviceData = ITEM_DEFINITIONS.commercial?.gardening;
    if (!serviceData) {
      console.warn('No gardening data in ITEM_DEFINITIONS');
      return [];
    }

    // Start with base package for property size
    const sizeKey = `base_${this.parameters.propertySize}`;
    const baseItem = serviceData[sizeKey];

    const items = [];
    if (baseItem) {
      items.push({ ...baseItem });
    }

    // Add optional services based on parameters
    if (this.parameters.lawnArea > 0) {
      const mowItem = serviceData.lawn_mowing;
      if (mowItem) {
        items.push({
          ...mowItem,
          label: `Lawn mowing (${this.parameters.lawnArea} sqm)`,
          itemId: `${mowItem.itemId}_${this.parameters.lawnArea}`
        });
      }
    }

    if (this.parameters.gardenBeds > 0) {
      const trimItem = serviceData.garden_trimming;
      if (trimItem) {
        items.push({
          ...trimItem,
          label: `Garden trimming (${this.parameters.gardenBeds} beds)`,
          itemId: `${trimItem.itemId}_${this.parameters.gardenBeds}`
        });
      }
    }

    if (this.parameters.hedgeLinearMeters > 0) {
      const hedgeItem = serviceData.hedge_trimming;
      if (hedgeItem) {
        items.push({
          ...hedgeItem,
          label: `Hedge trimming (${this.parameters.hedgeLinearMeters}m)`,
          itemId: `${hedgeItem.itemId}_${this.parameters.hedgeLinearMeters}`
        });
      }
    }

    if (this.parameters.weedingArea > 0) {
      const weedItem = serviceData.weed_removal;
      if (weedItem) {
        items.push({
          ...weedItem,
          label: `Weed removal (${this.parameters.weedingArea} sqm)`,
          itemId: `${weedItem.itemId}_${this.parameters.weedingArea}`
        });
      }
    }

    if (this.parameters.deckDrivewayArea > 0) {
      const deckItem = serviceData.deck_driveway_clean;
      if (deckItem) {
        items.push({
          ...deckItem,
          label: `Deck/driveway cleaning (${this.parameters.deckDrivewayArea} sqm)`,
          itemId: `${deckItem.itemId}_${this.parameters.deckDrivewayArea}`
        });
      }
    }

    // Quarterly contract surcharge (typically 10% discount)
    if (this.parameters.isQuarterly) {
      const quarterlyItem = serviceData.quarterly_contract_discount;
      if (quarterlyItem) {
        items.push({ ...quarterlyItem });
      }
    }

    return items;
  }

  /**
   * Apply parameter modifications to items
   * Multiply parameterized items (lawn sqm, hedge meters, etc.)
   * @param {Array<Object>} baseItems - Items from getItems()
   * @returns {Array<Object>} Modified items with counts applied
   */
  applyParameterModifications(baseItems) {
    if (!baseItems || baseItems.length === 0) {
      return baseItems;
    }

    return baseItems.map(item => {
      const modified = { ...item };

      if (item.parameterized === true && item.parameter && item.baseHours) {
        const paramName = this._mapParameterName(item.parameter);
        const paramValue = this.parameters[paramName];

        if (paramValue && paramValue > 0) {
          // Multiply hours by parameter value
          // For area-based: hours per sqm × area
          // For linear: hours per meter × meters
          modified.hours = item.baseHours * paramValue;
        }
      }

      return modified;
    });
  }

  /**
   * Map ITEM_DEFINITIONS parameter to internal parameter name
   * @param {string} parameterKey - Parameter from ITEM_DEFINITIONS
   * @returns {string} Internal parameter name
   * @private
   */
  _mapParameterName(parameterKey) {
    const mapping = {
      'lawn_area_sqm': 'lawnArea',
      'garden_bed_count': 'gardenBeds',
      'hedge_linear_meters': 'hedgeLinearMeters',
      'weed_area_sqm': 'weedingArea',
      'deck_driveway_sqm': 'deckDrivewayArea'
    };
    return mapping[parameterKey] || parameterKey;
  }

  /**
   * Validate parameters before rendering
   * @returns {Object} Validation result {valid: boolean, errors: string[]}
   */
  validateParameters() {
    const errors = [];

    const validSizes = ['small', 'medium', 'large', 'commercial'];
    if (!validSizes.includes(this.parameters.propertySize)) {
      errors.push('Property size must be: small, medium, large, or commercial');
    }

    if (this.parameters.lawnArea < 0 || this.parameters.lawnArea > 50000) {
      errors.push('Lawn area must be 0-50,000 sqm');
    }

    if (this.parameters.gardenBeds < 0 || this.parameters.gardenBeds > 500) {
      errors.push('Garden beds must be 0-500');
    }

    if (this.parameters.hedgeLinearMeters < 0 || this.parameters.hedgeLinearMeters > 10000) {
      errors.push('Hedge length must be 0-10,000m');
    }

    if (this.parameters.weedingArea < 0 || this.parameters.weedingArea > 50000) {
      errors.push('Weeding area must be 0-50,000 sqm');
    }

    if (this.parameters.deckDrivewayArea < 0 || this.parameters.deckDrivewayArea > 10000) {
      errors.push('Deck/driveway area must be 0-10,000 sqm');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get total hours with parameterized multipliers applied
   * @returns {number} Total hours
   */
  getTotalHours() {
    const validation = this.validateParameters();
    if (!validation.valid) {
      console.warn('Invalid parameters:', validation.errors);
      return 0;
    }

    const items = this.renderItems();
    const checked = this.getCheckedItems();
    let totalHours = checked.reduce((sum, item) => sum + (item.hours || 0), 0);

    // Apply quarterly discount to hours if applicable
    if (this.parameters.isQuarterly) {
      totalHours *= 0.9; // 10% discount
    }

    return totalHours;
  }

  /**
   * Get summary display for this service
   * @returns {string} Summary text
   */
  getSummary() {
    const parts = [`${this._getSizeLabel()} property`];

    if (this.parameters.lawnArea > 0) {
      parts.push(`${this.parameters.lawnArea} sqm mow`);
    }

    if (this.parameters.gardenBeds > 0) {
      parts.push(`${this.parameters.gardenBeds} beds`);
    }

    if (this.parameters.hedgeLinearMeters > 0) {
      parts.push(`${this.parameters.hedgeLinearMeters}m hedge`);
    }

    if (this.parameters.weedingArea > 0) {
      parts.push(`weed ${this.parameters.weedingArea} sqm`);
    }

    if (this.parameters.deckDrivewayArea > 0) {
      parts.push(`clean ${this.parameters.deckDrivewayArea} sqm`);
    }

    if (this.parameters.isQuarterly) {
      parts.push('(quarterly contract)');
    }

    return parts.join(' + ');
  }

  /**
   * Get human-readable label for property size
   * @returns {string} Size label
   * @private
   */
  _getSizeLabel() {
    const labels = {
      'small': 'Small',
      'medium': 'Medium',
      'large': 'Large',
      'commercial': 'Commercial'
    };
    return labels[this.parameters.propertySize] || this.parameters.propertySize;
  }

  /**
   * Get available property sizes
   * Used in form to populate size selector
   * @returns {Array<Object>} Available size options
   */
  static getAvailableSizes() {
    return [
      {
        value: 'small',
        label: 'Small property',
        description: 'Residential small (< 500 sqm outdoor)',
        estimate: '30-60 min'
      },
      {
        value: 'medium',
        label: 'Medium property',
        description: 'Residential medium (500-1500 sqm outdoor)',
        estimate: '1-2 hours'
      },
      {
        value: 'large',
        label: 'Large property',
        description: 'Residential large (1500+ sqm outdoor)',
        estimate: '2-4 hours'
      },
      {
        value: 'commercial',
        label: 'Commercial property',
        description: 'Commercial outdoor space (custom estimate)',
        estimate: 'Variable'
      }
    ];
  }

  /**
   * Get quarterly contract info
   * @returns {Object} Contract details
   */
  static getQuarterlyContractInfo() {
    return {
      discount: 0.10,              // 10% discount
      frequency: 'quarterly',      // 4 times per year
      benefit: 'Regular maintenance at reduced cost',
      note: 'Typically March, June, Sept, Dec for lawns'
    };
  }
}

// Export for use in factory and orchestrator
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropertyGardeningService;
}
