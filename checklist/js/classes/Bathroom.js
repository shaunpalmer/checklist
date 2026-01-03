/**
 * Bathroom Class - Extends Room
 * Handles bathroom-specific item retrieval from ITEM_DEFINITIONS
 */

class Bathroom extends Room {
  /**
   * Override getItems() to fetch bathroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['bathroom'][variant]
   * @returns {Array<Object>} Bathroom items for this service type and variant
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

    // Look up bathroom variants
    const bathroomData = serviceData.bathroom;
    if (!bathroomData) {
      console.warn(`No bathroom data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up specific variant (e.g., 'single_shower', 'double_combo', 'ensuite')
    const variantItems = bathroomData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for bathroom variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
