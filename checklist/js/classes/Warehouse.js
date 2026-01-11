/**
 * Warehouse Class - Commercial warehouse items
 */

class Warehouse extends CommercialRoom {
  /**
   * Override getItems() to fetch warehouse items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['warehouse']
   * @returns {Array<Object>} Warehouse items
   */
  getItems() {
    return this.getItemsFromCategory('warehouse');
  }
}
