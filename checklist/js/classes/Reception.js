/**
 * Reception Class - Extends Room
 * Handles reception-specific item retrieval from ITEM_DEFINITIONS
 */

class Reception extends Room {
  /**
   * Override getItems() to fetch reception items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['reception']
   * @returns {Array<Object>} Reception items for this service type and variant
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

    const roomData = serviceData.reception;
    if (!roomData) {
      console.warn(`No reception data for service type: ${this.serviceType}`);
      return [];
    }

    if (Array.isArray(roomData)) {
      return roomData;
    }

    const variantItems = roomData[this.variant] || roomData.default;
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for reception variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
