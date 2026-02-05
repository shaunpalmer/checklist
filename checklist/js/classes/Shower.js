/**
 * Shower Class - Commercial shower items
 */

class Shower extends CommercialRoom {
  /**
   * Override getItems() to fetch shower items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['shower']
   * @returns {Array<Object>} Shower items
   */
  getItems() {
    return this.getItemsFromCategory('shower');
  }
}
