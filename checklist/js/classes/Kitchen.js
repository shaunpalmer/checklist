/**
 * Kitchen Class - Extends Room
 * Handles kitchen-specific item retrieval from ITEM_DEFINITIONS
 */

class Kitchen extends Room {
  /**
   * Override getItems() to fetch kitchen items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['kitchen'][variant]
   * @returns {Array<Object>} Kitchen items for this service type and variant
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

    // Look up kitchen variants
    const kitchenData = serviceData.kitchen;
    if (!kitchenData) {
      console.warn(`No kitchen data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up specific variant (e.g., 'standard', 'island', 'modern_open')
    const variantItems = kitchenData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for kitchen variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
