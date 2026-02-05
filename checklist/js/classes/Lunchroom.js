/**
 * Lunchroom Class - Commercial lunchroom/kitchenette
 */

class Lunchroom extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('lunchroom');
  }
}
