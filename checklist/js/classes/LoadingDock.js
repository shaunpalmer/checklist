/**
 * LoadingDock Class - Commercial loading dock items
 */

class LoadingDock extends CommercialRoom {
  /**
   * Override getItems() to fetch loading dock items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['loading_dock']
   * @returns {Array<Object>} Loading dock items
   */
  getItems() {
    return this.getItemsFromCategory('loading_dock');
  }
}
