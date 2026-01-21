/**
 * SalesFloor Class - Commercial sales floor items
 */

class SalesFloor extends CommercialRoom {
  /**
   * Override getItems() to fetch sales floor items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['sales_floor']
   * @returns {Array<Object>} Sales floor items
   */
  getItems() {
    return this.getItemsFromCategory('sales_floor');
  }
}
