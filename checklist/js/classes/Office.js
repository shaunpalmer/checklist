/**
 * Office Class - Extends Room
 * Handles office-specific item retrieval from ITEM_DEFINITIONS
 */

class Office extends Room {
  /**
   * Override getItems() to fetch office items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['office'] or ['offices']
   * @returns {Array<Object>} Office items for this service type and variant
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

    const roomKey = this.roomType?.toLowerCase();
    const roomData = serviceData[roomKey] || serviceData[`${roomKey}s`];
    if (!roomData) {
      console.warn(`No office data for service type: ${this.serviceType}`);
      return [];
    }

    if (Array.isArray(roomData)) {
      return roomData;
    }

    const variantItems = roomData[this.variant] || roomData.default;
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for office variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
