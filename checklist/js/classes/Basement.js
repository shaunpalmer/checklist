/**
 * Basement Class - Basement items
 */

class Basement extends Room {
  /**
   * Override getItems() to fetch basement items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['basement'][variant]
   * @returns {Array<Object>} Basement items
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

    const basementData = serviceData.basement;
    if (!basementData) {
      console.warn(`No basement data for service type: ${this.serviceType}`);
      return [];
    }

    const variantItems = basementData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for basement variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
