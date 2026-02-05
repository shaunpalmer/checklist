/**
 * TradeWorkshop Class - Trade/workshop areas
 */

class TradeWorkshop extends CommercialRoom {
  getItems() {
    return this.getItemsFromCategory('trade');
  }
}
