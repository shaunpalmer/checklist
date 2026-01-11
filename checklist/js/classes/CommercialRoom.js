/**
 * CommercialRoom Base Class - Shared helpers for commercial room types
 * Handles ITEM_DEFINITIONS lookup for commercial categories that store items as objects.
 */

class CommercialRoom extends Room {
  /**
   * Get items from a commercial category in ITEM_DEFINITIONS.
   * @param {string} categoryKey - e.g., 'rubbish', 'offices'
   * @param {Array<string>} [allowedKeys] - Optional subset of item keys
   * @returns {Array<Object>} Items for the category
   */
  getItemsFromCategory(categoryKey, allowedKeys = null) {
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const serviceData = ITEM_DEFINITIONS[this.serviceType];
    if (!serviceData) {
      console.warn(`No data for service type: ${this.serviceType}`);
      return [];
    }

    const categoryData = serviceData[categoryKey];
    if (!categoryData) {
      console.warn(`No ${categoryKey} data for service type: ${this.serviceType}`);
      return [];
    }

    if (Array.isArray(categoryData)) {
      return categoryData;
    }

    if (typeof categoryData === 'object') {
      const entries = Object.entries(categoryData);
      const filtered = allowedKeys
        ? entries.filter(([key]) => allowedKeys.includes(key))
        : entries;

      return filtered.map(([, item]) => item);
    }

    return [];
  }
}
