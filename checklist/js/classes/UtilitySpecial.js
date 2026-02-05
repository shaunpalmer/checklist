/**
 * UtilitySpecial Class
 * Definition-backed room for utility & special rooms (EOT: utility_special).
 */

class UtilitySpecial extends CommercialRoom {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'utility_special',
      variant: config.variant || 'standard'
    });
  }

  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const utilityDefs = serviceDefs && serviceDefs.utility_special;

    if (utilityDefs && typeof utilityDefs === 'object' && !Array.isArray(utilityDefs)) {
      const variantKey = this.variant || 'standard';
      const variantItems = utilityDefs[variantKey];
      if (Array.isArray(variantItems)) {
        return variantItems;
      }
    }

    return this.getItemsFromCategory('utility_special');
  }
}
