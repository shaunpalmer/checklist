/**
 * Reception Class - Commercial reception items
 */

class Reception extends CommercialRoom {
  /**
   * Override getItems() to fetch reception items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['offices']
   * @returns {Array<Object>} Reception items
   */
  getItems() {
    return this.getItemsFromCategory('offices', ['reception']);
  }
}
