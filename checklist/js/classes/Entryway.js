/**
 * Entryway Class
 * Definition-backed room for entryways / hallways.
 */

class Entryway extends CommercialRoom {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'entryway',
      variant: config.variant || 'standard'
    });
  }

  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const entrywayDefs = serviceDefs && serviceDefs.entryway;

    if (entrywayDefs && typeof entrywayDefs === 'object' && !Array.isArray(entrywayDefs)) {
      const variantKey = this.variant || 'standard';
      const variantItems = entrywayDefs[variantKey];
      if (Array.isArray(variantItems)) {
        return variantItems;
      }
    }

    return this.getItemsFromCategory('entryway');
  }
}
