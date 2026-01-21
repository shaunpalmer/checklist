/**
 * Entryway Class - Entryway/Hallway/Circulation items
 */

class Entryway extends Room {
  /**
   * Override getItems() to fetch entryway items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['entryway'][variant]
   * @returns {Array<Object>} Entryway items
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

    const entrywayData = serviceData.entryway;
    if (!entrywayData) {
      console.warn(`No entryway data for service type: ${this.serviceType}`);
      return [];
    }

    const variantItems = entrywayData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for entryway variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
