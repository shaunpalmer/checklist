/**
 * Office Class - Commercial offices
 */

class Office extends CommercialRoom {
  /**
   * Fetch office items from ITEM_DEFINITIONS.
   * Uses ITEM_DEFINITIONS[serviceType].offices (or ITEM_DEFINITIONS.commercial.offices).
   */
  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const offices = serviceDefs && serviceDefs.offices;
    if (!offices) return [];

    const variant = (this.variant || '').toLowerCase();
    const variantKeyMap = {
      private: 'private_office',
      open_plan: 'open_plan_desk',
      boardroom: 'boardroom',
      hot_desk: 'open_plan_desk'
    };

    const variantKey = variantKeyMap[variant];
    if (variantKey && offices[variantKey]) {
      return [offices[variantKey]];
    }

    // Default: return office-only items (exclude rooms represented elsewhere)
    return Object.entries(offices)
      .filter(([key]) => key !== 'reception' && key !== 'boardroom')
      .map(([, value]) => value);
  }
}
