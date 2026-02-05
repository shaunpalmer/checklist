/**
 * RubbishHandling Class - Commercial rubbish/garbage handling
 */

class RubbishHandling extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('rubbish');
  }
}
