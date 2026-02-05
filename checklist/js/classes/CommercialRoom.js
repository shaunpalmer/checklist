/**
 * CommercialRoom
 *
 * Base class for commercial room types that pull their items from ITEM_DEFINITIONS.
 * Provides a helper to fetch items by category key (e.g. 'sales_floor', 'stockroom').
 */

class CommercialRoom extends Room {
  /**
   * Get items from a commercial category in ITEM_DEFINITIONS
   * @param {string} categoryKey
   * @param {Array<string>} [allowedKeys]
   * @returns {Array<Object>}
   */
  getItemsFromCategory(categoryKey, allowedKeys = null) {
    if (!categoryKey) return [];
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    if (!serviceDefs) return [];

    const defs = serviceDefs[categoryKey];
    if (!defs) return [];

    if (Array.isArray(defs)) {
      return defs;
    }

    if (typeof defs === 'object') {
      const entries = Object.entries(defs);
      const filtered = allowedKeys
        ? entries.filter(([key]) => allowedKeys.includes(key))
        : entries;

      return filtered.map(([, value]) => value);
    }

    return [];
  }
}
