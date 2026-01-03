/**
 * PropertyService.js - Base Class for Property-Wide Services
 * 
 * Unlike Room classes (which represent spaces within a property),
 * PropertyService classes represent entire-property service offerings
 * that can be toggled on/off and parameterized by user choices.
 * 
 * Examples:
 * - Window Cleaning (property-wide, not per-room)
 * - Carpet Cleaning (all carpets at once, charged as single service)
 * - Gutter Cleaning (entire house gutters)
 * - Deck Sealing (property-wide service)
 * 
 * Architecture Pattern: Similar to Room, but:
 * - Single instance per service type (not multiple like bedrooms)
 * - Parameterized by user form choices (rooms, stains, panes, etc.)
 * - Generates single-unit line items (not room-based sections)
 * - No variant hierarchy; structure determined by Settings toggle
 * 
 * EXTENSIBILITY (Pluggable Endpoint Pattern):
 * PropertyService is designed as a "plug-in" architecture where new service
 * types can be added by extending this base class. Examples:
 * - PropertyPlumberService (pipe work, fixtures, installation)
 * - PropertyElectricalService (outlet installation, wiring, inspections)
 * - PropertyBuilderService (general repairs, renovations, quotes)
 * - PropertyGutterService (cleaning, repairs, replacement)
 * - PropertyHVACService (maintenance, filters, system checks)
 * Each service type extends PropertyService, defines own parameters,
 * adds to ITEM_DEFINITIONS, adds Settings toggle, and factory instantiates
 * it when enabled. This allows Ays to serve any service operator.
 * 
 * Lifecycle:
 * 1. Settings: include_windows_cleaning: true/false (structural)
 * 2. Factory creates instance if enabled
 * 3. Orchestrator manages disclosure/UI
 * 4. User enters parameters in form (rooms, stains, panes, etc.)
 * 5. Service recalculates items based on parameters
 * 6. Serialize for quote submission
 */

class PropertyService {
  /**
   * Constructor for PropertyService
   * @param {Object} config - Configuration object
   * @param {string} config.serviceId - Unique identifier (e.g., 'windows_cleaning', 'carpet_cleaning')
   * @param {string} config.serviceType - Service category (windows, carpet_cleaning, gutters, etc.)
   * @param {string} config.variant - Optional variant (e.g., 'standard', 'premium')
   * @param {Object} config.parameters - User-supplied parameters (rooms, stains, panes, etc.)
   * @param {Object} config.metadata - Display metadata (label, emoji, description)
   */
  constructor(config) {
    if (!config.serviceId || !config.serviceType) {
      throw new Error('PropertyService requires: serviceId, serviceType');
    }

    this.serviceId = config.serviceId;        // e.g., 'windows_cleaning'
    this.serviceType = config.serviceType;    // e.g., 'windows'
    this.variant = config.variant || 'standard';
    this.metadata = config.metadata || {
      label: config.serviceType,
      emoji: '🔧',
      description: 'Property-wide service'
    };

    // User parameters (from form input)
    // e.g., {rooms: 3, stains: 2, stairs: 1}
    this.parameters = config.parameters || {};

    // Item state (checked, notes, custom services)
    this.itemState = new Map();            // itemId → {checked: boolean, notes: string}
    this.checkedItems = [];                // Array of checked item objects
    this.customServices = [];               // Array of user-added custom services
    this.notes = '';                        // General notes for this service
  }

  /**
   * Abstract method - subclasses MUST override
   * Returns base items for this service based on parameters
   * @returns {Array<Object>} Array of item objects with {itemId, label, hours, price}
   */
  getItems() {
    throw new Error(`getItems() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Apply parameter modifications to base items
   * For example: if parameters.rooms = 3, multiply base item hours by 3
   * Or: if parameters.stains = 5, add 5 stain items to the list
   * @param {Array<Object>} baseItems - Items from getItems()
   * @returns {Array<Object>} Modified items array
   */
  applyParameterModifications(baseItems) {
    if (!baseItems || baseItems.length === 0) {
      return baseItems;
    }

    let modifiedItems = [...baseItems];

    // Subclasses override to apply specific parameter logic
    // Example: Carpet service multiplies hours by room count
    // Example: Window service adds items based on pane count

    return modifiedItems;
  }

  /**
   * Render items with parameters applied
   * This is the main method: getItems → applyParameterModifications → normalize
   * @returns {Array<Object>} Final rendered items ready for form/quote
   */
  renderItems() {
    const baseItems = this.getItems();
    const modifiedItems = this.applyParameterModifications(baseItems);

    return modifiedItems;
  }

  /**
   * Add a custom service discovered during walk-through
   * @param {Object} customService - {label, hours, price, notes}
   */
  addCustomService(customService) {
    if (!customService.label) {
      throw new Error('Custom service requires at least a label');
    }

    const service = {
      itemId: `custom_${Date.now()}`,
      label: customService.label,
      category: 'custom_service',
      hours: customService.hours || 0,
      price: customService.price || 0,
      notes: customService.notes || '',
      isCustom: true
    };

    this.customServices.push(service);
    return service;
  }

  /**
   * Get all items including custom services
   * @returns {Array<Object>} All items + custom services
   */
  getAllItems() {
    return [...this.renderItems(), ...this.customServices];
  }

  /**
   * Get items that are checked
   * @returns {Array<Object>} Checked items only
   */
  getCheckedItems() {
    const allItems = this.getAllItems();
    return allItems.filter(item => {
      const state = this.itemState.get(item.itemId);
      return state && state.checked === true;
    });
  }

  /**
   * Mark an item as checked/unchecked
   * @param {string} itemId - Item ID to toggle
   * @param {boolean} checked - Check state
   * @param {string} notes - Optional notes for this item
   */
  setItemState(itemId, checked, notes = '') {
    if (!this.itemState.has(itemId)) {
      this.itemState.set(itemId, { checked: false, notes: '' });
    }

    const state = this.itemState.get(itemId);
    state.checked = checked;
    state.notes = notes;
  }

  /**
   * Get total hours (sum of all checked items)
   * @returns {number} Total hours
   */
  getTotalHours() {
    const checked = this.getCheckedItems();
    return checked.reduce((sum, item) => sum + (item.hours || 0), 0);
  }

  /**
   * Get total cost (sum of all checked items)
   * Note: This is simplified. Real implementation uses SETTINGS[priceSetting]
   * @returns {number} Total cost
   */
  getTotalCost() {
    const checked = this.getCheckedItems();
    return checked.reduce((sum, item) => {
      // If item has priceSetting, resolve from SETTINGS
      if (item.priceSetting && typeof SETTINGS !== 'undefined') {
        return sum + (SETTINGS[item.priceSetting] ?? 0);
      }
      // Otherwise use direct price
      return sum + (item.price ?? 0);
    }, 0);
  }

  /**
   * Serialize service for quote/export
   * Returns clean JSON representation
   * @returns {Object} Serialized service data
   */
  serialize() {
    const checkedItems = this.getCheckedItems();

    return {
      serviceId: this.serviceId,
      serviceType: this.serviceType,
      variant: this.variant,
      metadata: this.metadata,
      parameters: this.parameters,
      checkedItems: checkedItems.map(item => ({
        itemId: item.itemId,
        label: item.label,
        hours: item.hours,
        price: item.price,
        notes: this.itemState.get(item.itemId)?.notes || ''
      })),
      customServices: this.customServices,
      totalHours: this.getTotalHours(),
      totalCost: this.getTotalCost(),
      notes: this.notes
    };
  }

  /**
   * Restore state from serialized data
   * Used when loading a saved quote
   * @param {Object} data - Serialized service data from serialize()
   */
  restoreState(data) {
    if (!data) return;

    this.parameters = data.parameters || {};
    this.notes = data.notes || '';

    // Restore item check states
    if (data.checkedItems && Array.isArray(data.checkedItems)) {
      data.checkedItems.forEach(item => {
        this.setItemState(item.itemId, true, item.notes);
      });
    }

    // Restore custom services
    if (data.customServices && Array.isArray(data.customServices)) {
      this.customServices = data.customServices;
    }
  }

  /**
   * Update a parameter and recalculate
   * Called when user changes "rooms: 3" to "rooms: 4" on form
   * @param {string} paramName - Parameter name (e.g., 'rooms', 'stains')
   * @param {any} value - New value
   */
  updateParameter(paramName, value) {
    this.parameters[paramName] = value;
    // Note: Orchestrator listens to this and recalculates/re-renders
  }

  /**
   * Get display label for this service
   * @returns {string} Human-readable label
   */
  getLabel() {
    return this.metadata.label || this.serviceType;
  }

  /**
   * Get emoji for this service (for UI display)
   * @returns {string} Emoji character
   */
  getEmoji() {
    return this.metadata.emoji || '🔧';
  }
}

// Export for use in orchestrator and factory
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropertyService;
}
