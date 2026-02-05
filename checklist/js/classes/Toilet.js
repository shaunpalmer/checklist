/**
 * Toilet Class - Commercial room prototype
 * Pulls items from ITEM_DEFINITIONS via CommercialRoom category lookup.
 */

class Toilet extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('toilets');
  }
}
