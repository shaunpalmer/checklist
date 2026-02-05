/**
 * Laundry Class - Extends Room
 * Handles laundry-specific item retrieval from ITEM_DEFINITIONS
 */

class Laundry extends Room {
  /**
   * Override getItems() to fetch laundry items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['laundry'] or ITEM_DEFINITIONS[serviceType]['laundry'][variant]
   * Handles both flat objects (EOT) and variant-based arrays
   * @returns {Array<Object>} Laundry items for this service type and variant
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists and has the required data
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    const normalizeToArray = (def) => {
      if (!def) return [];
      if (Array.isArray(def)) return def;
      if (typeof def === 'object') return Object.values(def);
      return [];
    };

    // Look up service type section (eot, residential, commercial)
    const serviceData = ITEM_DEFINITIONS[this.serviceType];
    if (!serviceData) {
      console.warn(`No data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up laundry data
    const laundryData = serviceData.laundry;
    if (!laundryData) {
      console.warn(`No laundry data for service type: ${this.serviceType}`);
      return [];
    }

    // Try variant first (e.g., 'basic', 'with_tub', 'with_washer')
    const variantData = laundryData[this.variant];
    if (variantData) {
      return normalizeToArray(variantData);
    }

    // EOT definitions are flat objects - convert to array
    return normalizeToArray(laundryData);
  }
}
