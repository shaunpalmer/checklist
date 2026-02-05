/**
 * Utility Class - Commercial utility rooms (storage, mechanical, etc.)
 */

class Utility extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('utility');
  }
}
