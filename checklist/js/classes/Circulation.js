/**
 * Circulation Class - Commercial hallways, corridors, entries
 */

class Circulation extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('circulation');
  }
}
