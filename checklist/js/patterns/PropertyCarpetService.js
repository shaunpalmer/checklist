/**
 * PropertyCarpetService.js - Carpet Cleaning as Property-Wide Service
 * 
 * Christchurch pricing model:
 * - Base pricing determined by room count (2-6 rooms)
 * - Optional extras: stain removal, protection, extra rooms, stairs
 * - Distance surcharge if > 12km from CBD
 * - Vacuuming included (free, worth $40)
 * 
 * User Form Choices (Small Choices):
 * 1. Select base package (2, 3, 4, 5, or 6 room)
 * 2. Add stains (optional, up to 15)
 * 3. Add carpet protection rooms (optional)
 * 4. Add extra rooms (optional)
 * 5. Add stairs (optional, by flight count)
 * 6. Add distance surcharge (conditional, if > 12km)
 * 
 * Not in form (Structural/Settings):
 * - Whether carpet cleaning is included (toggle in Settings)
 * - Service type (carpet cleaning is always the same)
 */

class PropertyCarpetService extends PropertyService {
  /**
   * Constructor for PropertyCarpetService
   * @param {Object} config - Configuration object
   * @param {number} config.roomCount - Base package room count (2-6, default 3)
   */
  constructor(config = {}) {
    super({
      serviceId: 'carpet_cleaning',
      serviceType: 'carpet_cleaning',
      variant: 'standard',
      metadata: {
        label: 'Carpet Cleaning',
        emoji: '🧹',
        description: 'Professional carpet cleaning service'
      },
      ...config
    });

    // User parameters for form choices (small choices)
    this.parameters = {
      roomCount: config.roomCount || 3,           // 2-6 rooms (user selects base package)
      stainCount: config.stainCount || 0,         // 0-15 stains (optional add-on)
      protectionRooms: config.protectionRooms || 0,  // Rooms for protection treatment
      extraRooms: config.extraRooms || 0,         // Rooms beyond base package
      stairFlights: config.stairFlights || 0,     // Flights of stairs
      hasDistanceSurcharge: config.hasDistanceSurcharge || false  // Outside 12km?
    };
  }

  /**
   * Get base items from ITEM_DEFINITIONS
   * Selects the correct base package based on room count parameter
   * @returns {Array<Object>} Base items for this room count
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const serviceData = ITEM_DEFINITIONS.commercial?.carpet_cleaning;
    if (!serviceData) {
      console.warn('No carpet cleaning data in ITEM_DEFINITIONS');
      return [];
    }

    // Determine which base package based on room count
    const roomCount = this.parameters.roomCount || 3;
    const baseKey = `base_${roomCount}_room`;
    const baseItem = serviceData[baseKey];

    if (!baseItem) {
      console.warn(`No base package for ${roomCount} rooms`);
      return [];
    }

    // Start with base item
    const items = [{ ...baseItem }];

    // Add optional extras based on parameters
    if (this.parameters.stainCount > 0) {
      const stainItem = serviceData.stain_removal;
      if (stainItem) {
        items.push({
          ...stainItem,
          label: `Stain removal (${this.parameters.stainCount} stains)`,
          itemId: `${stainItem.itemId}_${this.parameters.stainCount}`
        });
      }
    }

    if (this.parameters.protectionRooms > 0) {
      const protectionItem = serviceData.carpet_protection;
      if (protectionItem) {
        items.push({
          ...protectionItem,
          label: `Carpet protection (${this.parameters.protectionRooms} rooms)`,
          itemId: `${protectionItem.itemId}_${this.parameters.protectionRooms}`
        });
      }
    }

    if (this.parameters.extraRooms > 0) {
      const extraItem = serviceData.extra_room;
      if (extraItem) {
        items.push({
          ...extraItem,
          label: `Extra room (${this.parameters.extraRooms} additional)`,
          itemId: `${extraItem.itemId}_${this.parameters.extraRooms}`
        });
      }
    }

    if (this.parameters.stairFlights > 0) {
      const stairItem = serviceData.stairs;
      if (stairItem) {
        items.push({
          ...stairItem,
          label: `Stairs (${this.parameters.stairFlights} flights)`,
          itemId: `${stairItem.itemId}_${this.parameters.stairFlights}`
        });
      }
    }

    if (this.parameters.hasDistanceSurcharge) {
      const surchargeItem = serviceData.distance_surcharge;
      if (surchargeItem) {
        items.push({ ...surchargeItem });
      }
    }

    return items;
  }

  /**
   * Apply parameter modifications to items
   * For parameterized items, multiply by the parameter count
   * @param {Array<Object>} baseItems - Items from getItems()
   * @returns {Array<Object>} Modified items with counts applied
   */
  applyParameterModifications(baseItems) {
    if (!baseItems || baseItems.length === 0) {
      return baseItems;
    }

    return baseItems.map(item => {
      // Clone to avoid mutating original
      const modified = { ...item };

      // For parameterized items, apply multiplier based on count
      if (item.parameterized === true) {
        const paramName = item.parameter;
        const paramValue = this.parameters[paramName];

        if (paramValue && paramValue > 0 && item.baseHours) {
          // Multiply hours by parameter value
          modified.hours = item.baseHours * paramValue;
        }
      }

      return modified;
    });
  }

  /**
   * Validate parameters before rendering
   * Ensures values are within acceptable ranges
   * @returns {Object} Validation result {valid: boolean, errors: string[]}
   */
  validateParameters() {
    const errors = [];

    if (this.parameters.roomCount < 2 || this.parameters.roomCount > 6) {
      errors.push('Room count must be 2-6');
    }

    if (this.parameters.stainCount < 0 || this.parameters.stainCount > 15) {
      errors.push('Stain count must be 0-15 (beyond 15, contact insurance)');
    }

    if (this.parameters.protectionRooms < 0 || this.parameters.protectionRooms > 10) {
      errors.push('Protection rooms must be 0-10');
    }

    if (this.parameters.extraRooms < 0 || this.parameters.extraRooms > 10) {
      errors.push('Extra rooms must be 0-10');
    }

    if (this.parameters.stairFlights < 0 || this.parameters.stairFlights > 20) {
      errors.push('Stair flights must be 0-20');
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

    // Start with base hours
    let totalHours = 0;
    const baseKey = `base_${this.parameters.roomCount}_room`;

    // Add base hours (from SETTINGS if available)
    if (typeof SETTINGS !== 'undefined') {
      const settingKey = `carpet_${baseKey}_hours`;
      totalHours += SETTINGS[settingKey] ?? 0;
    }

    // Add optional extra hours (already parameterized via applyParameterModifications)
    const items = this.renderItems();
    const checked = this.getCheckedItems();
    totalHours += checked.reduce((sum, item) => sum + (item.hours || 0), 0);

    return totalHours;
  }

  /**
   * Get summary display for this service
   * Used in quote preview and form headers
   * @returns {string} Summary text (e.g., "3-room carpet clean + 2 stains + stairs")
   */
  getSummary() {
    const parts = [`${this.parameters.roomCount}-room carpet clean`];

    if (this.parameters.stainCount > 0) {
      parts.push(`${this.parameters.stainCount} stains`);
    }

    if (this.parameters.protectionRooms > 0) {
      parts.push(`${this.parameters.protectionRooms} protected`);
    }

    if (this.parameters.extraRooms > 0) {
      parts.push(`+${this.parameters.extraRooms} rooms`);
    }

    if (this.parameters.stairFlights > 0) {
      parts.push(`+${this.parameters.stairFlights} flights`);
    }

    if (this.parameters.hasDistanceSurcharge) {
      parts.push('(+distance surcharge)');
    }

    return parts.join(' + ');
  }

  /**
   * Get display for base package selection
   * Used in form to show available options
   * @returns {Array<Object>} Available room count options with pricing
   */
  static getAvailablePackages() {
    if (typeof SETTINGS === 'undefined') {
      console.warn('SETTINGS not loaded');
      return [];
    }

    return [
      {
        roomCount: 2,
        label: '2 rooms',
        priceKey: 'carpet_base_2room_price',
        price: SETTINGS['carpet_base_2room_price'] ?? 0
      },
      {
        roomCount: 3,
        label: '3 rooms',
        priceKey: 'carpet_base_3room_price',
        price: SETTINGS['carpet_base_3room_price'] ?? 0
      },
      {
        roomCount: 4,
        label: '4 rooms',
        priceKey: 'carpet_base_4room_price',
        price: SETTINGS['carpet_base_4room_price'] ?? 0
      },
      {
        roomCount: 5,
        label: '5 rooms',
        priceKey: 'carpet_base_5room_price',
        price: SETTINGS['carpet_base_5room_price'] ?? 0
      },
      {
        roomCount: 6,
        label: '6 rooms',
        priceKey: 'carpet_base_6room_price',
        price: SETTINGS['carpet_base_6room_price'] ?? 0
      }
    ];
  }
}

// Export for use in factory and orchestrator
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropertyCarpetService;
}
