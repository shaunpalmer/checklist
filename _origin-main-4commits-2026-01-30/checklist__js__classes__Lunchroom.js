/**
 * Lunchroom Class - Commercial lunchroom items
 */

class Lunchroom extends CommercialRoom {
  /**
   * Override getItems() to fetch lunchroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['lunchroom']
   * @returns {Array<Object>} Lunchroom items
   */
  getItems() {
    return this.getItemsFromCategory('lunchroom');
  }
}
