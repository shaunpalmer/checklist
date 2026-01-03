/**
 * PropertyWindowService.js - Window Cleaning as Property-Wide Service
 * 
 * Commercial window cleaning model:
 * - Unit-based pricing (per pane size: large, small, door)
 * - Height surcharges (ground floor, 2-storey, multi-storey)
 * - Extra staff surcharge for large jobs (> 6 hours typically)
 * - Covers inside + outside cleaning
 * 
 * User Form Choices (Small Choices):
 * 1. Select building height (ground floor, 2-storey, multi-storey)
 * 2. Count large panes (optional)
 * 3. Count small panes (optional)
 * 4. Count door panes (optional)
 * 
 * Not in form (Structural/Settings):
 * - Whether window cleaning is included (toggle in Settings)
 * - Service type (window cleaning is always the same)
 */

class PropertyWindowService extends PropertyService {
  /**
   * Constructor for PropertyWindowService
   * @param {Object} config - Configuration object
   * @param {string} config.buildingHeight - 'ground_floor', 'two_storey', 'multi_storey'
   * @param {number} config.largePaneCount - Number of large panes
   * @param {number} config.smallPaneCount - Number of small panes
   * @param {number} config.doorPaneCount - Number of door panes
   */
  constructor(config = {}) {
    super({
      serviceId: 'windows_cleaning',
      serviceType: 'windows',
      variant: 'standard',
      metadata: {
        label: 'Window Cleaning',
        emoji: '🪟',
        description: 'Professional window cleaning service (inside + outside)'
      },
      ...config
    });

    // User parameters for form choices (small choices)
    this.parameters = {
      buildingHeight: config.buildingHeight || 'ground_floor',  // Height tier selection
      largePaneCount: config.largePaneCount || 0,               // Number of large panes
      smallPaneCount: config.smallPaneCount || 0,               // Number of small panes
      doorPaneCount: config.doorPaneCount || 0                  // Number of door panes
    };
  }

  /**
   * Get base items from ITEM_DEFINITIONS
   * Returns pane pricing items + height surcharge + extra staff surcharge if needed
   * @returns {Array<Object>} Base items (panes + surcharges)
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const serviceData = ITEM_DEFINITIONS.commercial?.windows;
    if (!serviceData) {
      console.warn('No window cleaning data in ITEM_DEFINITIONS');
      return [];
    }

    const items = [];

    // Add pane items if count > 0
    if (this.parameters.largePaneCount > 0) {
      const largeItem = serviceData.large_pane;
      if (largeItem) {
        items.push({
          ...largeItem,
          label: `Large window panes (${this.parameters.largePaneCount} × $${SETTINGS?.[largeItem.priceSetting] ?? 0})`,
          itemId: `${largeItem.itemId}_${this.parameters.largePaneCount}`
        });
      }
    }

    if (this.parameters.smallPaneCount > 0) {
      const smallItem = serviceData.small_pane;
      if (smallItem) {
        items.push({
          ...smallItem,
          label: `Small window panes (${this.parameters.smallPaneCount} × $${SETTINGS?.[smallItem.priceSetting] ?? 0})`,
          itemId: `${smallItem.itemId}_${this.parameters.smallPaneCount}`
        });
      }
    }

    if (this.parameters.doorPaneCount > 0) {
      const doorItem = serviceData.door_pane;
      if (doorItem) {
        items.push({
          ...doorItem,
          label: `Glass doors/panels (${this.parameters.doorPaneCount} × $${SETTINGS?.[doorItem.priceSetting] ?? 0})`,
          itemId: `${doorItem.itemId}_${this.parameters.doorPaneCount}`
        });
      }
    }

    // Add height surcharge (always, based on building height selection)
    const heightKey = this._getHeightKey();
    const heightItem = serviceData[heightKey];
    if (heightItem) {
      items.push({ ...heightItem });
    }

    return items;
  }

  /**
   * Get the height surcharge item key based on building height parameter
   * @returns {string} Item key (ground_floor, two_storey, multi_storey)
   * @private
   */
  _getHeightKey() {
    switch (this.parameters.buildingHeight) {
      case 'two_storey':
        return 'two_storey';
      case 'multi_storey':
        return 'multi_storey';
      case 'ground_floor':
      default:
        return 'ground_floor';
    }
  }

  /**
   * Apply parameter modifications to items
   * Multiplies pane items by their count
   * @param {Array<Object>} baseItems - Items from getItems()
   * @returns {Array<Object>} Modified items with pane counts applied
   */
  applyParameterModifications(baseItems) {
    if (!baseItems || baseItems.length === 0) {
      return baseItems;
    }

    return baseItems.map(item => {
      const modified = { ...item };

      // For parameterized pane items, multiply by pane count
      if (item.parameterized === true && item.parameter) {
        const paramName = this._mapPaneParameterName(item.parameter);
        const paramValue = this.parameters[paramName];

        if (paramValue && paramValue > 0 && item.baseHours) {
          // Multiply hours by pane count
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
  _mapPaneParameterName(parameterKey) {
    const mapping = {
      'number_of_large_panes': 'largePaneCount',
      'number_of_small_panes': 'smallPaneCount',
      'number_of_door_panes': 'doorPaneCount'
    };
    return mapping[parameterKey] || parameterKey;
  }

  /**
   * Calculate extra staff surcharge if job exceeds threshold
   * Large jobs (> 6 hours) may need extra staff
   * @returns {Object} {needsExtraStaff: boolean, extraHours: number, surcharge: number}
   */
  calculateExtraStaffSurcharge() {
    if (typeof SETTINGS === 'undefined') {
      return { needsExtraStaff: false, extraHours: 0, surcharge: 0 };
    }

    const totalHours = this.getTotalHours();
    const threshold = SETTINGS['window_extra_staff_threshold'] ?? 6;
    const rate = SETTINGS['window_extra_staff_rate'] ?? 0;

    if (totalHours > threshold) {
      const extraHours = totalHours - threshold;
      const surcharge = extraHours * rate;
      return {
        needsExtraStaff: true,
        extraHours: extraHours,
        surcharge: surcharge
      };
    }

    return {
      needsExtraStaff: false,
      extraHours: 0,
      surcharge: 0
    };
  }

  /**
   * Validate parameters before rendering
   * @returns {Object} Validation result {valid: boolean, errors: string[]}
   */
  validateParameters() {
    const errors = [];

    const validHeights = ['ground_floor', 'two_storey', 'multi_storey'];
    if (!validHeights.includes(this.parameters.buildingHeight)) {
      errors.push('Building height must be: ground_floor, two_storey, or multi_storey');
    }

    if (this.parameters.largePaneCount < 0 || this.parameters.largePaneCount > 1000) {
      errors.push('Large pane count must be 0-1000');
    }

    if (this.parameters.smallPaneCount < 0 || this.parameters.smallPaneCount > 1000) {
      errors.push('Small pane count must be 0-1000');
    }

    if (this.parameters.doorPaneCount < 0 || this.parameters.doorPaneCount > 100) {
      errors.push('Door pane count must be 0-100');
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
    const baseHours = checked.reduce((sum, item) => sum + (item.hours || 0), 0);

    // Check if extra staff surcharge applies (adds to hours for job estimation)
    const staffSurcharge = this.calculateExtraStaffSurcharge();
    if (staffSurcharge.needsExtraStaff) {
      // Note: Staff hours are tracked separately in cost calculation
      // For scheduling purposes, you might want to add them here
    }

    return baseHours;
  }

  /**
   * Get summary display for this service
   * Used in quote preview and form headers
   * @returns {string} Summary text (e.g., "2-storey, 8 large panes, 12 small panes, 2 doors")
   */
  getSummary() {
    const parts = [this._getHeightLabel()];

    if (this.parameters.largePaneCount > 0) {
      parts.push(`${this.parameters.largePaneCount} large panes`);
    }

    if (this.parameters.smallPaneCount > 0) {
      parts.push(`${this.parameters.smallPaneCount} small panes`);
    }

    if (this.parameters.doorPaneCount > 0) {
      parts.push(`${this.parameters.doorPaneCount} doors`);
    }

    // Add extra staff warning if applicable
    const staffSurcharge = this.calculateExtraStaffSurcharge();
    if (staffSurcharge.needsExtraStaff) {
      parts.push('(+extra staff)');
    }

    return parts.length > 1 ? parts.join(', ') : 'Window cleaning';
  }

  /**
   * Get human-readable label for building height
   * @returns {string} Height label
   * @private
   */
  _getHeightLabel() {
    const labels = {
      'ground_floor': 'Ground floor (1-storey)',
      'two_storey': 'Two-storey building',
      'multi_storey': 'Multi-storey (3+ floors)'
    };
    return labels[this.parameters.buildingHeight] || this.parameters.buildingHeight;
  }

  /**
   * Get available building height options
   * Used in form to populate height selector
   * @returns {Array<Object>} Available height options with descriptions
   */
  static getAvailableHeights() {
    return [
      {
        value: 'ground_floor',
        label: 'Ground floor (1-storey)',
        description: 'Single storey. Standard ladder work.',
        staffCount: 1
      },
      {
        value: 'two_storey',
        label: 'Two-storey building',
        description: 'Two storeys. Equipment rental surcharge.',
        staffCount: 1,
        noteSurcharge: 'May need extra staff if > 6 hours'
      },
      {
        value: 'multi_storey',
        label: 'Multi-storey (3+ floors)',
        description: 'Custom quote. Equipment rental $1000+. Contact for estimate.',
        staffCount: 2,
        requiresManualQuote: true
      }
    ];
  }
}

// Export for use in factory and orchestrator
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropertyWindowService;
}
