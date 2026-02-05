/**
 * Basement Class
 * Definition-backed room for basements.
 */

class Basement extends CommercialRoom {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'basement',
      variant: config.variant || 'standard'
    });
  }

  getItems() {
    return this.getItemsFromCategory('basement');
  }
}
