/**
 * Boardroom Class - Commercial boardroom items
 */

class Boardroom extends CommercialRoom {
  /**
   * Override getItems() to fetch boardroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['offices']
   * @returns {Array<Object>} Boardroom items
   */
  getItems() {
    return this.getItemsFromCategory('offices', ['boardroom']);
  }
}
