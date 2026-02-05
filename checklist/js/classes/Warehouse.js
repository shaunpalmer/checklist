/**
 * Warehouse Class - Commercial warehouse floor/areas
 */

class Warehouse extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('warehouse');
  }
}
