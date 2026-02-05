/**
 * LockerRoom Class - Commercial locker room items
 */

class LockerRoom extends CommercialRoom {
  /**
   * Override getItems() to fetch locker room items from ITEM_DEFINITIONS
   * Looks up: ITEM_DEFINITIONS[serviceType]['locker_room']
   * @returns {Array<Object>} Locker room items
   */
  getItems() {
    return this.getItemsFromCategory('locker_room');
  }
}
