/**
 * LoadingDock Class - Commercial loading dock areas
 */

class LoadingDock extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('loading_dock');
  }
}
