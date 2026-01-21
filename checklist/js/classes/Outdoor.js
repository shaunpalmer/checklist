/**
 * Outdoor Class - Outdoor items
 */

class Outdoor extends Room {
  /**
   * Override getItems() to fetch outdoor items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['outdoor'][variant]
   * @returns {Array<Object>} Outdoor items
   */
  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const serviceData = ITEM_DEFINITIONS[this.serviceType];
    if (!serviceData) {
      console.warn(`No data for service type: ${this.serviceType}`);
      return [];
    }

    const outdoorData = serviceData.outdoor;
    if (!outdoorData) {
      console.warn(`No outdoor data for service type: ${this.serviceType}`);
      return [];
    }

    const variantItems = outdoorData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for outdoor variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
