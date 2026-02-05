/**
 * Carpark Class - Commercial carpark/parking areas
 */

class Carpark extends CommercialRoom {
  getItems() {
    if (typeof ITEM_DEFINITIONS === 'undefined') return [];

    const serviceKey = this.serviceType || 'commercial';
    const serviceDefs = ITEM_DEFINITIONS[serviceKey] || ITEM_DEFINITIONS.commercial;
    const defs = serviceDefs && serviceDefs.carpark;
    if (!defs || typeof defs !== 'object') return [];

    // Back-compat aliases: older metadata uses open/covered/street.
    // We treat these as frontage vs full carpark scope.
    const variant = String(this.variant || '').toLowerCase();
    const scope = {
      open: 'frontage',
      frontage: 'frontage',
      entry: 'frontage',
      covered: 'full',
      full: 'full',
      street: 'street'
    }[variant] || 'frontage';

    if (scope === 'street') {
      // Street parking is not a cleanable scope item; keep it as a selectable info-only option.
      return defs.street_parking ? [defs.street_parking] : [];
    }

    const frontageItem = defs.frontage_sweep_100m2 || defs.open_carpark;
    const fullItem = defs.full_sweep_500m2 || defs.covered_carpark;

    if (scope === 'full') {
      return fullItem ? [fullItem] : [];
    }

    // Default frontage/tidy-up near entrances
    return frontageItem ? [frontageItem] : [];
  }
}
