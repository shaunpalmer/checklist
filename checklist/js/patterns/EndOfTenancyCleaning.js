/**
 * EndOfTenancyCleaning - Metadata container for EOT-specific inputs
 * Tracks move date and room counts for EOT form flow.
 */

class EndOfTenancyCleaning {
  /**
   * @param {Object} config
   * @param {string|null} config.dateOfMove - Move-out date (ISO or display string)
   * @param {number|null} config.numberOfRooms - Total room count
   * @param {number|null} config.numberOfBathrooms - Bathroom count
   * @param {number|null} config.numberOfKitchens - Kitchen count
   * @param {number|null} config.numberOfEntryways - Entryway count
   * @param {number|null} config.numberOfLaundryRooms - Laundry room count
   * @param {number|null} config.numberOfLoungeAreas - Lounge/living area count
   * @param {number|null} config.numberOfBedrooms - Bedroom count
   * @param {Object} config.propertyWideServices - Property-wide service selections
   */
  constructor(config = {}) {
    this.dateOfMove = config.dateOfMove || null;
    this.numberOfRooms = config.numberOfRooms ?? null;
    this.numberOfBathrooms = config.numberOfBathrooms ?? null;
    this.numberOfKitchens = config.numberOfKitchens ?? null;
    this.numberOfEntryways = config.numberOfEntryways ?? null;
    this.numberOfLaundryRooms = config.numberOfLaundryRooms ?? null;
    this.numberOfLoungeAreas = config.numberOfLoungeAreas ?? null;
    this.numberOfBedrooms = config.numberOfBedrooms ?? null;
    this.propertyWideServices = {
      vacuumThroughout: Boolean(config.propertyWideServices?.vacuumThroughout),
      windowCleaning: Boolean(config.propertyWideServices?.windowCleaning),
      carpetCleaning: Boolean(config.propertyWideServices?.carpetCleaning)
    };
  }

  /**
   * Serialize to a plain object
   * @returns {Object}
   */
  serialize() {
    return {
      dateOfMove: this.dateOfMove,
      numberOfRooms: this.numberOfRooms,
      numberOfBathrooms: this.numberOfBathrooms,
      numberOfKitchens: this.numberOfKitchens,
      numberOfEntryways: this.numberOfEntryways,
      numberOfLaundryRooms: this.numberOfLaundryRooms,
      numberOfLoungeAreas: this.numberOfLoungeAreas,
      numberOfBedrooms: this.numberOfBedrooms,
      propertyWideServices: { ...this.propertyWideServices }
    };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EndOfTenancyCleaning;
}
