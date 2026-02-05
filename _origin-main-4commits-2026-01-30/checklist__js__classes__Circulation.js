/**
 * Circulation Class - Commercial circulation area items
 */

class Circulation extends CommercialRoom {
  /**
   * Override getItems() to fetch circulation items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['circulation']
   * @returns {Array<Object>} Circulation items
   */
  getItems() {
    return this.getItemsFromCategory('circulation');
  }
}
