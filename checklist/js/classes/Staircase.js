/**
 * Staircase Class - Stairs/flight items (stored under commercial.utility)
 */

class Staircase extends CommercialRoom {
  getItems() {
    const items = this.getItemsFromCategory('utility');
    if (!items || items.length === 0) return [];

    return items.filter(item => {
      const itemId = String(item && item.itemId ? item.itemId : '');
      const label = String(item && item.label ? item.label : '');
      return itemId.includes('stair') || /stair/i.test(label);
    });
  }
}
