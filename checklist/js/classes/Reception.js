/**
 * Reception Class - Commercial reception/front desk
 */

class Reception extends CommercialRoom {
  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const offices = serviceDefs && serviceDefs.offices;
    if (!offices) return [];

    if (offices.reception) return [offices.reception];

    const all = Object.values(offices);
    return all.filter(item => {
      const itemId = String(item && item.itemId ? item.itemId : '');
      const label = String(item && item.label ? item.label : '');
      return itemId.includes('reception') || /reception/i.test(label);
    });
  }
}
