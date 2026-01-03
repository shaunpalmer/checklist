/**
 * Bedroom Class - Extends Room
 * Handles bedroom-specific item retrieval from ITEM_DEFINITIONS
 */

class Bedroom extends Room {
  /**
   * Override getItems() to fetch bedroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['bedroom'][variant]
   * @returns {Array<Object>} Bedroom items for this service type and variant
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists and has the required data
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    // Look up service type section (eot, residential, commercial)
    const serviceData = ITEM_DEFINITIONS[this.serviceType];
    if (!serviceData) {
      console.warn(`No data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up bedroom variants
    const bedroomData = serviceData.bedroom;
    if (!bedroomData) {
      console.warn(`No bedroom data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up specific variant (e.g., 'master', 'single', 'guest')
    const variantItems = bedroomData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for bedroom variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
