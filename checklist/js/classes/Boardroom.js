/**
 * Boardroom Class - Commercial boardroom/conference room
 */

class Boardroom extends CommercialRoom {
  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const offices = serviceDefs && serviceDefs.offices;
    if (!offices) return [];

    if (offices.boardroom) return [offices.boardroom];

    const all = Object.values(offices);
    return all.filter(item => {
      const itemId = String(item && item.itemId ? item.itemId : '');
      const label = String(item && item.label ? item.label : '');
      return itemId.includes('boardroom') || /boardroom|conference/i.test(label);
    });
  }
}
