/**
 * RubbishHandling Class - Commercial rubbish handling items
 */

class RubbishHandling extends CommercialRoom {
  /**
   * Override getItems() to fetch rubbish items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['rubbish']
   * @returns {Array<Object>} Rubbish handling items
   */
  getItems() {
    return this.getItemsFromCategory('rubbish');
  }
}
