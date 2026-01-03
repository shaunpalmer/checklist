/**
 * LivingArea Class - Extends Room
 * Handles living area-specific item retrieval from ITEM_DEFINITIONS
 * Living areas include lounge, dining, entryway, and other common spaces
 */

class LivingArea extends Room {
  /**
   * Override getItems() to fetch living area items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['living_area'][variant]
   * @returns {Array<Object>} Living area items for this service type and variant
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists and has the required data
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }

    // Look up service type section (eot, residential, commercial)
    const serviceData = ITEM_DEFINITIONS[this.serviceType];
    if (!serviceData) {
      console.warn(`No data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up living area variants (may be stored as 'living_area' or separate types)
    const livingAreaData = serviceData.living_area || serviceData.lounge || serviceData.dining;
    if (!livingAreaData) {
      console.warn(`No living area data for service type: ${this.serviceType}`);
      return [];
    }

    // Look up specific variant (e.g., 'lounge', 'dining', 'entryway')
    const variantItems = livingAreaData[this.variant];
    if (!variantItems || variantItems.length === 0) {
      console.warn(`No items for living area variant: ${this.variant} in ${this.serviceType}`);
      return [];
    }

    return variantItems;
  }
}
