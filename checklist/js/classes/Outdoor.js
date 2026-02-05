/**
 * Outdoor Class
 * Definition-backed room for outdoor areas.
 */

class Outdoor extends CommercialRoom {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'outdoor',
      variant: config.variant || 'standard'
    });
  }

  getItems() {
    return this.getItemsFromCategory('outdoor');
  }
}
