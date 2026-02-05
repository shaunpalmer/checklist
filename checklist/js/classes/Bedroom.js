/**
 * Bedroom Class - Extends Room
 * Handles bedroom-specific item retrieval from ITEM_DEFINITIONS
 */

class Bedroom extends Room {
  /**
   * Override getItems() to fetch bedroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['bedroom'] or ITEM_DEFINITIONS[serviceType]['bedroom'][variant]
   * Handles both flat objects (EOT) and variant-based arrays
   * @returns {Array<Object>} Bedroom items for this service type and variant
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

    // Look up bedroom data
    const bedroomData = serviceData.bedroom;
    if (!bedroomData) {
      console.warn(`No bedroom data for service type: ${this.serviceType}`);
      return [];
    }

    // Try variant first (e.g., 'master', 'single', 'guest')
    const variantData = bedroomData[this.variant];
    if (variantData) {
      return normalizeToArray(variantData);
    }

    // EOT definitions are flat objects - convert to array
    return normalizeToArray(bedroomData);
  }
}
