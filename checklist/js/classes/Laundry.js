/**
 * Laundry Class - Extends Room
 * Handles laundry-specific item retrieval from ITEM_DEFINITIONS
 */

class Laundry extends Room {
  /**
   * Override getItems() to fetch laundry items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['laundry'][variant]
   * @returns {Array<Object>} Laundry items for this service type and variant
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

    // Look up laundry variants
    const laundryData = serviceData.laundry;
    if (!laundryData) {
      console.warn(`No laundry data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up specific variant (e.g., 'basic', 'with_tub', 'with_washer')
    const variantItems = laundryData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for laundry variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
