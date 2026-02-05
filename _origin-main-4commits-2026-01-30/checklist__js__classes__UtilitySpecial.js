/**
 * UtilitySpecial Class - Utility & special rooms items
 */

class UtilitySpecial extends Room {
  /**
   * Override getItems() to fetch utility/special items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['utility_special'][variant]
   * @returns {Array<Object>} Utility/special room items
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

    const utilityData = serviceData.utility_special;
    if (!utilityData) {
      console.warn(`No utility/special data for service type: ${this.serviceType}`);
      return [];
    }

    const variantItems = utilityData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for utility/special variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
