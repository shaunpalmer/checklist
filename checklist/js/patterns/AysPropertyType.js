/**
 * AysPropertyType.js - Polymorphic Property Type Hierarchy
 * 
 * CRITICAL: This defines the OOP type hierarchy for all property types.
 * Each property type specifies:
 * - Which Room classes to instantiate
 * - Which PropertyService toggles are available
 * - Room configurations (bedroom count, bathroom count, etc.)
 * 
 * Without this class, the system defaults to spaghetti code.
 * WITH this class, polymorphism is enforced at the TYPE level.
 * 
 * Usage:
 *   const propertyType = AysPropertyType.getType('residential_3bed');
 *   propertyType.rooms → ['Bedroom', 'Bedroom', 'Bedroom', 'Bathroom', 'Bathroom', 'Kitchen', ...]
 *   propertyType.availableServices → ['windows', 'carpet', 'gardening']
 *   propertyType.config → { numBedrooms: 3, numBathrooms: 2, ... }
 */

class AysPropertyType {
  // Registry of all property types (polymorphic hierarchy)
  static TYPES = {
    // ============================================================
    // RESIDENTIAL TYPES - Parametric (1-10 bedrooms)
    // ============================================================
    'residential': {
      name: 'residential',
      family: 'residential',
      label: 'Residential - Home (1-10 Bedrooms)',
      description: 'Residential home with flexible bedroom/bathroom counts',
      rooms: [
        { type: 'Bedroom', count: null },     // User specifies: 1-10
        { type: 'Bathroom', count: null },    // User specifies: 1-6
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        // DEFAULT: 3 bed, 2 bath (most common house size)
        // RANGE: 1-10 bedrooms, 1-6 bathrooms
        numBedrooms: 3,      // Default
        maxBedrooms: 10,     // Upper limit
        minBedrooms: 1,      // Lower limit (allows 1-2 bed apartments)
        numBathrooms: 2,     // Default
        maxBathrooms: 6,
        minBathrooms: 1
      }
    },

    'residential_1bed': {
      name: 'residential_1bed',
      family: 'residential',
      label: 'Residential - 1 Bedroom (Preset)',
      description: 'Compact 1-bedroom residential property',
      rooms: [
        { type: 'Bedroom', count: 1 },
        { type: 'Bathroom', count: 1 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        numBedrooms: 1,
        numBathrooms: 1,
        numKitchens: 1
      }
    },

    'residential_2bed': {
      name: 'residential_2bed',
      family: 'residential',
      label: 'Residential - 2 Bedroom (Preset)',
      description: 'Common 2-bedroom residential property',
      rooms: [
        { type: 'Bedroom', count: 2 },
        { type: 'Bathroom', count: 1 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        numBedrooms: 2,
        numBathrooms: 1,
        numKitchens: 1
      }
    },

    'residential_3bed': {
      name: 'residential_3bed',
      family: 'residential',
      label: 'Residential - 3 Bedroom (Preset)',
      description: 'Standard 3-bedroom residential home',
      rooms: [
        { type: 'Bedroom', count: 3 },
        { type: 'Bathroom', count: 2 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        numBedrooms: 3,
        numBathrooms: 2,
        numKitchens: 1
      }
    },
    
    'residential_4bed': {
      name: 'residential_4bed',
      family: 'residential',
      label: 'Residential - 4 Bedroom (Preset)',
      description: 'Standard 4-bedroom residential home',
      rooms: [
        { type: 'Bedroom', count: 4 },
        { type: 'Bathroom', count: 2 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        numBedrooms: 4,
        numBathrooms: 2,
        numKitchens: 1
      }
    },
    
    'residential_6bed': {
      name: 'residential_6bed',
      family: 'residential',
      label: 'Residential - 6 Bedroom (Preset)',
      description: 'Large 6-bedroom residential home',
      rooms: [
        { type: 'Bedroom', count: 6 },
        { type: 'Bathroom', count: 3 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 }
      ],
      availableServices: ['windows', 'carpet', 'gardening'],
      config: {
        numBedrooms: 6,
        numBathrooms: 3,
        numKitchens: 1
      }
    },

    // ============================================================
    // END OF TENANCY (EOT) - Parametric + Presets
    // ============================================================
    'eot_residential': {
      name: 'eot_residential',
      family: 'eot',
      label: 'End of Tenancy (Parametric)',
      description: 'End of tenancy residential clean with flexible bedroom/bathroom counts',
      rooms: [
        { type: 'Bedroom', count: null },
        { type: 'Bathroom', count: null },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },

        // EOT-specific / special spaces
        { type: 'Entryway', count: 1 },
        { type: 'Basement', count: 1 },
        { type: 'UtilitySpecial', count: 1 },
        { type: 'HomeOffice', count: 1 },
        { type: 'Outdoor', count: 1 },
        { type: 'Garage', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: {
        numBedrooms: 3,
        maxBedrooms: 10,
        minBedrooms: 1,
        numBathrooms: 2,
        maxBathrooms: 6,
        minBathrooms: 1
      }
    },

    'eot_1bed': {
      name: 'eot_1bed',
      family: 'eot',
      label: 'EOT - 1 Bed, 1 Bath (Preset)',
      description: 'End of tenancy 1-bedroom property',
      rooms: [
        { type: 'Bedroom', count: 1 },
        { type: 'Bathroom', count: 1 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },
        { type: 'Entryway', count: 1 },
        { type: 'Outdoor', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: { numBedrooms: 1, numBathrooms: 1, numKitchens: 1 }
    },

    'eot_2bed': {
      name: 'eot_2bed',
      family: 'eot',
      label: 'EOT - 2 Bed, 1 Bath (Preset)',
      description: 'End of tenancy 2-bedroom property',
      rooms: [
        { type: 'Bedroom', count: 2 },
        { type: 'Bathroom', count: 1 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },
        { type: 'Entryway', count: 1 },
        { type: 'Outdoor', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: { numBedrooms: 2, numBathrooms: 1, numKitchens: 1 }
    },

    'eot_3bed': {
      name: 'eot_3bed',
      family: 'eot',
      label: 'EOT - 3 Bed, 2 Bath (Preset)',
      description: 'End of tenancy 3-bedroom property',
      rooms: [
        { type: 'Bedroom', count: 3 },
        { type: 'Bathroom', count: 2 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },
        { type: 'Entryway', count: 1 },
        { type: 'Garage', count: 1 },
        { type: 'Outdoor', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: { numBedrooms: 3, numBathrooms: 2, numKitchens: 1 }
    },

    'eot_4bed': {
      name: 'eot_4bed',
      family: 'eot',
      label: 'EOT - 4 Bed, 2 Bath (Preset)',
      description: 'End of tenancy 4-bedroom property',
      rooms: [
        { type: 'Bedroom', count: 4 },
        { type: 'Bathroom', count: 2 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },
        { type: 'Entryway', count: 1 },
        { type: 'HomeOffice', count: 1 },
        { type: 'Garage', count: 1 },
        { type: 'Outdoor', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: { numBedrooms: 4, numBathrooms: 2, numKitchens: 1 }
    },

    'eot_6bed': {
      name: 'eot_6bed',
      family: 'eot',
      label: 'EOT - 6 Bed, 3 Bath (Preset)',
      description: 'End of tenancy large 6-bedroom property',
      rooms: [
        { type: 'Bedroom', count: 6 },
        { type: 'Bathroom', count: 3 },
        { type: 'Kitchen', count: 1 },
        { type: 'LivingArea', count: 1 },
        { type: 'Laundry', count: 1 },
        { type: 'Entryway', count: 1 },
        { type: 'Basement', count: 1 },
        { type: 'UtilitySpecial', count: 1 },
        { type: 'HomeOffice', count: 1 },
        { type: 'Garage', count: 1 },
        { type: 'Outdoor', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],
      config: { numBedrooms: 6, numBathrooms: 3, numKitchens: 1 }
    },
    
    // ============================================================
    // COMMERCIAL OFFICE TYPES
    // ============================================================
    'commercial_office': {
      name: 'commercial_office',
      family: 'commercial_office',
      label: 'Commercial - Office Building',
      description: 'Office building with desks, meeting rooms, facilities',
      rooms: [
        { type: 'Office', count: null },      // Parameterized by user (varies by floor/layout)
        { type: 'Reception', count: 1 },
        { type: 'Lunchroom', count: 1 },
        { type: 'Toilet', count: 1 },         // Block of toilets
        { type: 'Circulation', count: 1 }     // Hallways, entries
      ],
      availableServices: ['windows', 'carpet'],  // NOT gardening
      config: {
        // PARAMETERS (user must specify - no hardcoded defaults)
        // For single floor: numOffices: 6
        // For multi-story: numFloors: 5, numOfficesPerFloor: 6 (total = 30)
        numOffices: null,        // For single-floor layouts (user provides count)
        numFloors: null,         // For multi-story (user provides floors)
        numOfficesPerFloor: null // For multi-story (user provides offices/floor)
      }
    },
    
    // ============================================================
    // COMMERCIAL GYM TYPES
    // ============================================================
    'commercial_gym': {
      name: 'commercial_gym',
      family: 'commercial_gym',
      label: 'Commercial - Gym / Fitness Center',
      description: 'Gym with showers, locker rooms, fitness areas',
      rooms: [
        { type: 'Shower', count: null },      // User specifies count
        { type: 'LockerRoom', count: 2 },
        { type: 'Toilet', count: 1 },
        { type: 'Lunchroom', count: 1 }
      ],
      availableServices: ['windows'],  // NO carpet (wet areas), NO gardening
      config: {
        // PARAMETERS (user must specify)
        numShowers: null,        // User provides: 12, 20, 30, etc.
        numLockerRooms: 2        // Can be parameterized too
      }
    },
    
    // ============================================================
    // COMMERCIAL RETAIL TYPES
    // ============================================================
    'commercial_retail': {
      name: 'commercial_retail',
      family: 'commercial_retail',
      label: 'Commercial - Retail Store',
      description: 'Retail shop with sales floor, stockroom, office',
      rooms: [
        { type: 'SalesFloor', count: 1 },
        { type: 'Stockroom', count: 1 },
        { type: 'Office', count: 1 },
        { type: 'Toilet', count: 1 },
        { type: 'Circulation', count: 1 }
      ],
      availableServices: ['windows', 'carpet'],  // NOT gardening
      config: {
        numRooms: 5
      }
    },
    
    // ============================================================
    // COMMERCIAL WAREHOUSE TYPES
    // ============================================================
    'commercial_warehouse': {
      name: 'commercial_warehouse',
      family: 'commercial_warehouse',
      label: 'Commercial - Warehouse / Industrial',
      description: 'Warehouse or industrial facility',
      rooms: [
        { type: 'Warehouse', count: 1 },      // Single or repeated per zone
        { type: 'LoadingDock', count: null }, // User parameterizes
        { type: 'Office', count: null },      // Admin offices (user count)
        { type: 'Toilet', count: 1 }
      ],
      availableServices: ['windows'],  // NO carpet, NO gardening
      config: {
        // PARAMETERS (user must specify)
        numWarehouses: null,      // Single warehouse or multi-zone
        numLoadingDocks: null,    // 1, 2, 3 docks
        numAdminOffices: null     // 2-5 admin offices
      }
    }
  };

  /**
   * Get a specific property type by name
   * @param {string} typeName - e.g., 'residential_3bed', 'commercial_gym'
   * @returns {Object|null} Property type configuration or null if not found
   */
  static getType(typeName) {
    return this.TYPES[typeName] || null;
  }

  /**
   * Get all available property types (for Settings dropdown)
   * @returns {Array} Array of {name, label, description}
   */
  static getAllTypes() {
    return Object.values(this.TYPES).map(type => ({
      name: type.name,
      label: type.label,
      description: type.description,
      family: type.family
    }));
  }

  /**
   * Get all types in a specific family (residential, commercial_office, etc.)
   * @param {string} family - Family name
   * @returns {Array} Array of property types in that family
   */
  static getTypesByFamily(family) {
    return Object.values(this.TYPES).filter(type => type.family === family);
  }

  /**
   * Validate if a property type exists
   * @param {string} typeName
   * @returns {boolean}
   */
  static isValidType(typeName) {
    return typeName in this.TYPES;
  }

  /**
   * Get available services for a property type
   * @param {string} typeName - e.g., 'residential_3bed'
   * @returns {Array} Array of available service names, or empty array
   * 
   * Example:
   *   AysPropertyType.getAvailableServices('residential_3bed')
   *   → ['windows', 'carpet', 'gardening']
   *   
   *   AysPropertyType.getAvailableServices('commercial_gym')
   *   → ['windows']  (no carpet, no gardening)
   */
  static getAvailableServices(typeName) {
    const type = this.getType(typeName);
    return type ? type.availableServices : [];
  }

  /**
   * Get rooms to generate for a property type
   * @param {string} typeName
   * @returns {Array} Array of {type, count} objects
   */
  static getRooms(typeName) {
    const type = this.getType(typeName);
    return type ? type.rooms : [];
  }

  /**
   * Get configuration for a property type
   * @param {string} typeName
   * @returns {Object} Configuration object
   */
  static getConfig(typeName) {
    const type = this.getType(typeName);
    return type ? type.config : {};
  }
}

// Export for use in factory and settings
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysPropertyType;
}
