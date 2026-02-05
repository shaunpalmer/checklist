/**
 * Garage Class - Extends Room
 * Handles garage-specific item retrieval from ITEM_DEFINITIONS
 */

class Garage extends Room {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'garage',
      variant: config.variant || 'standard'
    });
  }

  /**
   * Override getItems() to fetch garage items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['garage']
   * EOT definitions are flat objects, so we convert to array
   * @returns {Array<Object>} Garage items for this service type
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

    // Look up garage data
    const garageData = serviceData.garage;
    if (!garageData) {
      console.warn(`No garage data for service type: ${this.serviceType}`);
      return [];
    }

    // EOT garage is a flat object, convert to array
    // Also check if variant exists (future-proofing)
    const variantData = garageData[this.variant];
    if (variantData) {
      return normalizeToArray(variantData);
    }

    return normalizeToArray(garageData);
  }
}
