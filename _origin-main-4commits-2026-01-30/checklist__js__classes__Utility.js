/**
 * Utility Class - Commercial utility room items
 */

class Utility extends CommercialRoom {
  /**
   * Override getItems() to fetch utility items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['utility']
   * @returns {Array<Object>} Utility room items
   */
  getItems() {
    return this.getItemsFromCategory('utility', ['utility_room']);
  }
}
