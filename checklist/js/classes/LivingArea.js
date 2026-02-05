/**
 * LivingArea Class - Extends Room
 * Handles living area-specific item retrieval from ITEM_DEFINITIONS
 * Living areas include lounge, dining, entryway, and other common spaces
 */

class LivingArea extends Room {
  /**
   * Override getItems() to fetch living area items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['living'] or ITEM_DEFINITIONS[serviceType]['living_area'][variant]
   * Handles both flat objects (EOT uses 'living') and variant-based arrays
   * @returns {Array<Object>} Living area items for this service type and variant
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

    // Look up living area data - EOT uses 'living', others may use 'living_area'
    const livingAreaData = serviceData.living || serviceData.living_area || serviceData.lounge || serviceData.dining;
    if (!livingAreaData) {
      console.warn(`No living area data for service type: ${this.serviceType}`);
      return [];
    }

    // Try variant first (e.g., 'lounge', 'dining')
    const variantData = livingAreaData[this.variant];
    if (variantData) {
      return normalizeToArray(variantData);
    }

    // EOT definitions are flat objects - convert to array
    return normalizeToArray(livingAreaData);
  }
}
