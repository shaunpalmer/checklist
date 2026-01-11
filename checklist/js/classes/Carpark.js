/**
 * Carpark Class - Commercial carpark items
 */

class Carpark extends CommercialRoom {
  /**
   * Override getItems() to fetch carpark items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['carpark']
   * @returns {Array<Object>} Carpark items
   */
  getItems() {
    return this.getItemsFromCategory('carpark');
  }
}
