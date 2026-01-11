/**
 * TradeWorkshop Class - Commercial trade/workshop items
 */

class TradeWorkshop extends CommercialRoom {
  /**
   * Override getItems() to fetch trade/workshop items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['trade']
   * @returns {Array<Object>} Trade/workshop items
   */
  getItems() {
    return this.getItemsFromCategory('trade');
  }
}
