/**
 * Room Base Class - Abstract base for all room types
 * Handles item retrieval, modification, normalization, and rendering
 * 
 * Architecture:
 * - Each room type (Bedroom, Bathroom, etc.) extends this base
 * - Constructor accepts config with roomId, roomType, serviceType, variant, number, subFeatures, metadata
 * - getItems() is abstract - subclasses override to fetch from ITEM_DEFINITIONS
 * - renderItems() orchestrates: getItems() → applySubFeatureModifications() → normalizeItemIds()
 * - serialize() formats for quotes/export (line items with labor hours, material hours)
 */

class Room {
  /**
   * Constructor for Room
   * @param {Object} config - Configuration object
   * @param {string} config.roomId - Unique identifier for this room instance (e.g., "bed_001")
   * @param {string} config.roomType - Type of room (bedroom, bathroom, kitchen, laundry, living_area)
   * @param {string} config.serviceType - Service type: 'eot', 'residential', 'commercial'
   * @param {string} config.variant - Room variant (e.g., 'master', 'ensuite', 'island')
   * @param {number} config.number - Sequence number (1-based) if multiple same-type rooms
   * @param {Object} config.subFeatures - Sub-features that modify base items (e.g., {walk_in_closet: true, double_shower: true})
   * @param {Object} config.metadata - Optional metadata (label, emoji, notes)
   */
  constructor(config) {
    if (!config.roomId || !config.roomType || !config.serviceType || !config.variant) {
      throw new Error('Room requires: roomId, roomType, serviceType, variant');
    }

    this.roomId = config.roomId;
    this.roomType = config.roomType;
    this.serviceType = config.serviceType;
    this.variant = config.variant;
    this.number = config.number || 1;
    this.subFeatures = config.subFeatures || {};
    this.metadata = config.metadata || {};
    
    // Item state tracking (for checkboxes, progress)
    this.itemState = new Map(); // itemId -> {checked: boolean, notes: string}
  }

  /**
   * Abstract method - subclasses MUST override
   * Returns base items for this room type/variant/service
   * Should look up from ITEM_DEFINITIONS[serviceType][roomType][variant]
   * @returns {Array<Object>} Array of item objects with {itemId, task, laborHours, materialHours}
   */
  getItems() {
    throw new Error(`getItems() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Apply sub-feature modifications to base items
   * Sub-features add/modify items or change labor/material hours
   * @param {Array<Object>} baseItems - Items from getItems()
   * @returns {Array<Object>} Modified items array
   */
  applySubFeatureModifications(baseItems) {
    if (!baseItems || baseItems.length === 0) {
      return baseItems;
    }

    let modifiedItems = JSON.parse(JSON.stringify(baseItems)); // Deep clone

    // Iterate through sub-features and apply modifications
    // This is a placeholder - actual modifications depend on subFeatureModifiers config
    // Example: if (this.subFeatures.walk_in_closet) { add organizing items, increase labor hours }
    
    for (const [featureName, isEnabled] of Object.entries(this.subFeatures)) {
      if (isEnabled && typeof isEnabled === 'boolean') {
        // Here you would apply feature-specific modifications
        // For now, this is a hook for SUBFEATURE_MODIFIERS.js to integrate
        modifiedItems = this._applyFeatureModifier(featureName, modifiedItems);
      }
    }

    return modifiedItems;
  }

  /**
   * Internal helper to apply individual feature modifier
   * @private
   * @param {string} featureName - Name of feature (e.g., walk_in_closet)
   * @param {Array<Object>} items - Current items array
   * @returns {Array<Object>} Modified items
   */
  _applyFeatureModifier(featureName, items) {
    // Placeholder - will integrate with SUBFEATURE_MODIFIERS.js
    // For now, return items unchanged
    // Examples of what would happen here:
    // - walk_in_closet: adds organizing items, increases labor
    // - double_shower: adds second shower items
    // - island: adds island-specific items
    return items;
  }

  /**
   * Normalize item IDs to include room context
   * Transforms: "bed_res_master_1_hang_clothes" (from ITEM_DEFINITIONS)
   * Into: "room_bed_001_bed_res_master_1_hang_clothes" (with room number)
   * @param {Array<Object>} items - Items array from applySubFeatureModifications()
   * @returns {Array<Object>} Items with normalized, globally-unique IDs
   */
  normalizeItemIds(items) {
    if (!items || items.length === 0) {
      return items;
    }

    return items.map((item, index) => ({
      ...item,
      itemId: `room_${this.roomType}_${String(this.number).padStart(3, '0')}_${item.itemId || `item_${index}`}`,
      roomId: this.roomId, // Add room context to each item
      sequenceInRoom: index + 1 // Track order within room
    }));
  }

  /**
   * Main public method to render items for this room
   * Orchestrates: getItems() → applySubFeatureModifications() → normalizeItemIds()
   * @returns {Array<Object>} Final items ready for display/calculation
   */
  renderItems() {
    const baseItems = this.getItems();
    const modifiedItems = this.applySubFeatureModifications(baseItems);
    const normalizedItems = this.normalizeItemIds(modifiedItems);
    return normalizedItems;
  }

  /**
   * Calculate total hours (labor + material) for all items in this room
   * @returns {Object} {totalLaborHours, totalMaterialHours, totalHours}
   */
  calculateTotalHours() {
    const items = this.renderItems();
    let totalLaborHours = 0;
    let totalMaterialHours = 0;

    items.forEach(item => {
      // Skip unchecked items? Or include all? Check itemState
      if (!this.itemState.has(item.itemId) || !this.itemState.get(item.itemId).checked) {
        totalLaborHours += item.laborHours || 0;
        totalMaterialHours += item.materialHours || 0;
      }
    });

    return {
      totalLaborHours,
      totalMaterialHours,
      totalHours: totalLaborHours + totalMaterialHours
    };
  }

  /**
   * Mark an item as checked/unchecked
   * @param {string} itemId - Item ID
   * @param {boolean} checked - Is it checked?
   * @param {string} notes - Optional notes
   */
  setItemState(itemId, checked, notes = '') {
    this.itemState.set(itemId, { checked, notes });
  }

  /**
   * Get item state for specific item
   * @param {string} itemId - Item ID
   * @returns {Object} {checked: boolean, notes: string} or null if not found
   */
  getItemState(itemId) {
    return this.itemState.get(itemId) || null;
  }

  /**
   * Serialize this room to a structured quote format
   * For integration with quote generation, export, etc.
   * @returns {Object} Structured room data with metadata and line items
   */
  serialize() {
    const items = this.renderItems();
    const hours = this.calculateTotalHours();

    return {
      roomId: this.roomId,
      roomType: this.roomType,
      serviceType: this.serviceType,
      variant: this.variant,
      number: this.number,
      metadata: this.metadata,
      items: items,
      summary: {
        itemCount: items.length,
        laborHours: hours.totalLaborHours,
        materialHours: hours.totalMaterialHours,
        totalHours: hours.totalHours
      }
    };
  }

  /**
   * Get a summary string for UI display
   * @returns {string} Display text like "Master Bedroom #1 (EOT)"
   */
  getSummary() {
    const variantLabel = this.variant.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const serviceLabel = this.serviceType.toUpperCase();
    return `${variantLabel} #${this.number} (${serviceLabel})`;
  }
}
