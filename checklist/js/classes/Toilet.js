/**
 * Toilet Class - Commercial toilet block items
 */

class Toilet extends Room {
  /**
   * Override getItems() to fetch toilet items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['toilets']
   * @returns {Array<Object>} Toilet items
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

    const toiletData = serviceData.toilets;
    if (!toiletData) {
      console.warn(`No toilet data for service type: ${this.serviceType}`);
      return [];
    }

    if (Array.isArray(toiletData)) {
      return toiletData;
    }

    return Object.values(toiletData);
  }
}
