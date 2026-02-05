/**
 * Stockroom Class - Commercial stockroom items
 */

class Stockroom extends CommercialRoom {
  /**
   * Override getItems() to fetch stockroom items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['stockroom']
   * @returns {Array<Object>} Stockroom items
   */
  getItems() {
    return this.getItemsFromCategory('stockroom');
  }
}
