/**
 * HomeOffice Class
 * Definition-backed room for home offices (EOT: home_office).
 */

class HomeOffice extends CommercialRoom {
  constructor(config = {}) {
    super({
      ...config,
      roomType: config.roomType || 'home_office',
      variant: config.variant || 'standard'
    });
  }

  getItems() {
    return this.getItemsFromCategory('home_office');
  }
}
