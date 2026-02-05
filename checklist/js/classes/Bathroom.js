/**
 * Bathroom Class - Extends Room
 * Handles bathroom-specific item retrieval from ITEM_DEFINITIONS
 */

class Bathroom extends Room {
  /**
   * Override getItems() to fetch bathroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['bathroom'] or ITEM_DEFINITIONS[serviceType]['bathroom'][variant]
   * Handles both flat objects (EOT) and variant-based arrays
   * @returns {Array<Object>} Bathroom items for this service type and variant
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

    // Look up bathroom data
    const bathroomData = serviceData.bathroom;
    if (!bathroomData) {
      console.warn(`No bathroom data for service type: ${this.serviceType}`);
      return [];
    }

    // Try variant first (e.g., 'single_shower', 'double_combo', 'ensuite')
    const variantData = bathroomData[this.variant];
    if (variantData) {
      return normalizeToArray(variantData);
    }

    // EOT definitions are flat objects - convert to array
    return normalizeToArray(bathroomData);
  }
}
