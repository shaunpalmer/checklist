/**
 * Kitchen Class - Extends Room
 * Handles kitchen-specific item retrieval from ITEM_DEFINITIONS
 */

class Kitchen extends Room {
  /**
   * Override getItems() to fetch kitchen items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['kitchen'][variant]
   * @returns {Array<Object>} Kitchen items for this service type and variant
   */
  getItems() {
    // Check if ITEM_DEFINITIONS exists and has the required data
    if (typeof ITEM_DEFINITIONS === 'undefined') {
      console.warn('ITEM_DEFINITIONS not loaded - returning empty array');
      return [];
    }




      const serviceDefinitions = ITEM_DEFINITIONS?.[this.serviceType] || null;
      const normalizeToArray = (def) => {
        if (!def) return [];
        if (Array.isArray(def)) return def;
        if (typeof def === 'object') return Object.values(def);
        return [];
      };

      const kitchenDefinitions = serviceDefinitions?.kitchen;

      if (!kitchenDefinitions) {
        console.warn(`No kitchen definitions found for service type: ${this.serviceType}`);
        return [];
      }

      // Variant may either be:
      // - a named array (kitchen.standard)
      // - a named object of categories (kitchen.standard -> { benches: [...], sinks: [...] })
      // - absent, in which case kitchen itself may be an object of categories
      const variantDefinition = kitchenDefinitions?.[this.variant];
      const variantItems = normalizeToArray(variantDefinition);
      if (variantItems.length) return variantItems;

      const kitchenItems = normalizeToArray(kitchenDefinitions);
      if (!kitchenItems.length) {
        console.warn(`No kitchen items found for service type: ${this.serviceType}, variant: ${this.variant}`);
      }
      return kitchenItems;
  }
}
