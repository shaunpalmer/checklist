/**
 * Office Class - Commercial office items
 */

class Office extends CommercialRoom {
  /**
   * Override getItems() to fetch office items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['offices']
   * @returns {Array<Object>} Office items
   */
  getItems() {
    return this.getItemsFromCategory('offices', ['private_office', 'open_plan_desk']);
  }
}
