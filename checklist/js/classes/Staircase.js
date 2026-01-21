/**
 * Staircase Class - Commercial staircase items
 */

class Staircase extends CommercialRoom {
  /**
   * Override getItems() to fetch staircase items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['utility']
   * @returns {Array<Object>} Staircase items
   */
  getItems() {
    return this.getItemsFromCategory('utility', ['staircase']);
  }
}
