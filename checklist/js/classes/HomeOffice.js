/**
 * HomeOffice Class - Home office items
 */

class HomeOffice extends Room {
  /**
   * Override getItems() to fetch home office items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['home_office'][variant]
   * @returns {Array<Object>} Home office items
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

    const officeData = serviceData.home_office;
    if (!officeData) {
      console.warn(`No home office data for service type: ${this.serviceType}`);
      return [];
    }

    const variantItems = officeData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for home office variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
