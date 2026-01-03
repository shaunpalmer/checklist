/**
 * AysRoomMetadataLookup.js
 * 
 * Lookup table for room type metadata: emoji, labels, icons, variants, colors, descriptions
 * Used by AysRoomOrchestrator and form UI to display room cards with proper visual identity
 * 
 * Structure: residential / commercial / eot → room type → emoji, label, variants, icon, color
 */

const AysRoomMetadataLookup = {
  // ============================================================
  // RESIDENTIAL ROOMS
  // ============================================================
  residential: {
    bedroom: {
      emoji: '🛏️',
      label: 'Bedroom',
      category: 'sleeping_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '🛏️',
          label: 'Compact Bedroom',
          description: 'Small bedroom (< 2.5m × 3m)',
          displayName: 'Compact Bedroom'
        },
        standard: {
          emoji: '🛏️',
          label: 'Standard Bedroom',
          description: 'Typical bedroom (2.5m × 3.5m)',
          displayName: 'Standard Bedroom'
        },
        large: {
          emoji: '🛏️',
          label: 'Large Bedroom',
          description: 'Large bedroom (> 3.5m wide)',
          displayName: 'Large Bedroom'
        },
        master: {
          emoji: '👑',
          label: 'Master Bedroom',
          description: 'Master with ensuite/walk-in',
          displayName: 'Master Bedroom'
        }
      },
      icon: 'bed',
      color: '#e8d5f2'  // Lavender
    },

    bathroom: {
      emoji: '🚿',
      label: 'Bathroom',
      category: 'wet_areas',
      defaultVariant: 'standard',
      variants: {
        ensuite: {
          emoji: '🚿',
          label: 'Ensuite',
          description: 'Ensuite bathroom (private)',
          displayName: 'Ensuite'
        },
        family: {
          emoji: '🚿',
          label: 'Family Bathroom',
          description: 'Shared family bathroom',
          displayName: 'Family Bathroom'
        },
        shell_block: {
          emoji: '⬜',
          label: 'Shell Block',
          description: 'Bare bathroom (minimal fixtures)',
          displayName: 'Shell Block Bathroom'
        }
      },
      icon: 'droplet',
      color: '#d4e6f1'  // Light blue
    },

    kitchen: {
      emoji: '🍳',
      label: 'Kitchen',
      category: 'work_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '🍳',
          label: 'Compact Kitchen',
          description: 'Small kitchen (galley)',
          displayName: 'Compact Kitchen'
        },
        standard: {
          emoji: '🍳',
          label: 'Standard Kitchen',
          description: 'Typical kitchen layout',
          displayName: 'Standard Kitchen'
        },
        large: {
          emoji: '🍳',
          label: 'Large Kitchen',
          description: 'Large kitchen with island',
          displayName: 'Large Kitchen'
        }
      },
      icon: 'utensils',
      color: '#f9e79f'  // Light yellow
    },

    laundry: {
      emoji: '👕',
      label: 'Laundry',
      category: 'utility_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '👕',
          label: 'Compact Laundry',
          description: 'Small laundry (corner/closet)',
          displayName: 'Compact Laundry'
        },
        standard: {
          emoji: '👕',
          label: 'Laundry Room',
          description: 'Dedicated laundry room',
          displayName: 'Laundry Room'
        }
      },
      icon: 'shirt',
      color: '#d5f4e6'  // Mint
    },

    living_area: {
      emoji: '🛋️',
      label: 'Living Area',
      category: 'living_spaces',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '🛋️',
          label: 'Compact Living',
          description: 'Small living room',
          displayName: 'Compact Living Area'
        },
        standard: {
          emoji: '🛋️',
          label: 'Living Room',
          description: 'Standard living room',
          displayName: 'Living Room'
        },
        large: {
          emoji: '🛋️',
          label: 'Large Living',
          description: 'Open plan living/dining',
          displayName: 'Large Living Area'
        }
      },
      icon: 'couch',
      color: '#f5b7b1'  // Salmon
    },

    staircase: {
      emoji: '🪜',
      label: 'Staircase',
      category: 'circulation',
      defaultVariant: 'standard',
      variants: {
        standard: {
          emoji: '🪜',
          label: 'Staircase (flight)',
          description: 'Single flight of stairs',
          displayName: 'Staircase'
        }
      },
      icon: 'stairs',
      color: '#d7bde2'  // Light purple
    },

    basement: {
      emoji: '🏚️',
      label: 'Basement',
      category: 'storage_areas',
      defaultVariant: 'standard',
      variants: {
        finished: {
          emoji: '🏚️',
          label: 'Finished Basement',
          description: 'Finished/living basement',
          displayName: 'Finished Basement'
        },
        storage: {
          emoji: '📦',
          label: 'Storage Basement',
          description: 'Unfinished storage basement',
          displayName: 'Storage Basement'
        }
      },
      icon: 'box',
      color: '#aed6f1'  // Dark light blue
    },

    home_office: {
      emoji: '💼',
      label: 'Home Office',
      category: 'work_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '💼',
          label: 'Compact Office',
          description: 'Desk corner/small room',
          displayName: 'Compact Home Office'
        },
        standard: {
          emoji: '💼',
          label: 'Home Office',
          description: 'Dedicated office room',
          displayName: 'Home Office'
        },
        large: {
          emoji: '💼',
          label: 'Large Office',
          description: 'Large dedicated office',
          displayName: 'Large Home Office'
        }
      },
      icon: 'briefcase',
      color: '#fadbd8'  // Light red
    }
  },

  // ============================================================
  // COMMERCIAL ROOMS
  // ============================================================
  commercial: {
    office: {
      emoji: '🏢',
      label: 'Office',
      category: 'work_areas',
      defaultVariant: 'open_plan',
      variants: {
        private: {
          emoji: '🚪',
          label: 'Private Office',
          description: 'Enclosed private office',
          displayName: 'Private Office'
        },
        open_plan: {
          emoji: '🏢',
          label: 'Open Plan',
          description: 'Open plan desk area',
          displayName: 'Open Plan Office'
        },
        boardroom: {
          emoji: '📊',
          label: 'Boardroom',
          description: 'Conference/meeting room',
          displayName: 'Boardroom'
        },
        hot_desk: {
          emoji: '🖥️',
          label: 'Hot Desk',
          description: 'Shared desk hot-desking',
          displayName: 'Hot Desk Area'
        },
        reception: {
          emoji: '🚪',
          label: 'Reception',
          description: 'Reception/front desk',
          displayName: 'Reception Area'
        }
      },
      icon: 'building',
      color: '#d5f4e6'  // Mint
    },

    lunchroom: {
      emoji: '🍽️',
      label: 'Lunchroom',
      category: 'utility_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '🍽️',
          label: 'Break Room',
          description: 'Small break/lunch room',
          displayName: 'Compact Lunchroom'
        },
        standard: {
          emoji: '🍽️',
          label: 'Lunchroom',
          description: 'Standard lunchroom',
          displayName: 'Lunchroom'
        },
        large: {
          emoji: '🍽️',
          label: 'Large Lunchroom',
          description: 'Large cafeteria-style',
          displayName: 'Large Lunchroom'
        }
      },
      icon: 'utensils',
      color: '#f9e79f'  // Light yellow
    },

    toilet: {
      emoji: '🚽',
      label: 'Toilet Block',
      category: 'wet_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '🚽',
          label: 'Single Toilet',
          description: 'Single toilet cubicle',
          displayName: 'Single Toilet'
        },
        standard: {
          emoji: '🚽',
          label: 'Toilet Block',
          description: 'Standard toilet block',
          displayName: 'Toilet Block'
        },
        large: {
          emoji: '🚽',
          label: 'Large Toilet Block',
          description: 'Large multi-stall block',
          displayName: 'Large Toilet Block'
        }
      },
      icon: 'droplet',
      color: '#d4e6f1'  // Light blue
    },

    circulation: {
      emoji: '🚶',
      label: 'Circulation',
      category: 'circulation',
      defaultVariant: 'hallway',
      variants: {
        hallway: {
          emoji: '🚶',
          label: 'Hallway/Corridor',
          description: 'Hallways and corridors',
          displayName: 'Hallway/Corridor'
        },
        entry: {
          emoji: '🚪',
          label: 'Entry/Foyer',
          description: 'Building entry and foyer',
          displayName: 'Entry/Foyer'
        }
      },
      icon: 'arrow-right',
      color: '#aed6f1'  // Dark light blue
    },

    utility: {
      emoji: '⚙️',
      label: 'Utility',
      category: 'utility_areas',
      defaultVariant: 'storage',
      variants: {
        storage: {
          emoji: '📦',
          label: 'Storage Room',
          description: 'General storage area',
          displayName: 'Storage Room'
        },
        server: {
          emoji: '🖥️',
          label: 'Server Room',
          description: 'IT/server room',
          displayName: 'Server Room'
        },
        mechanical: {
          emoji: '⚙️',
          label: 'Mechanical',
          description: 'HVAC/mechanical room',
          displayName: 'Mechanical Room'
        }
      },
      icon: 'cog',
      color: '#d7bde2'  // Light purple
    },

    warehouse: {
      emoji: '🏭',
      label: 'Warehouse',
      category: 'storage_areas',
      defaultVariant: 'standard',
      variants: {
        compact: {
          emoji: '📦',
          label: 'Small Warehouse',
          description: 'Small storage warehouse',
          displayName: 'Small Warehouse'
        },
        standard: {
          emoji: '🏭',
          label: 'Warehouse',
          description: 'Standard warehouse',
          displayName: 'Warehouse'
        },
        large: {
          emoji: '🏭',
          label: 'Large Warehouse',
          description: 'Large warehouse/distribution',
          displayName: 'Large Warehouse'
        }
      },
      icon: 'box',
      color: '#abebc6'  // Mint green
    },

    trade: {
      emoji: '🔧',
      label: 'Workshop',
      category: 'trade_areas',
      defaultVariant: 'standard',
      variants: {
        standard: {
          emoji: '🔧',
          label: 'Workshop',
          description: 'Trade/workshop area',
          displayName: 'Workshop'
        },
        garage: {
          emoji: '🚗',
          label: 'Garage',
          description: 'Garage/mechanical space',
          displayName: 'Garage'
        }
      },
      icon: 'wrench',
      color: '#fadbd8'  // Light red
    },

    carpark: {
      emoji: '🅿️',
      label: 'Carpark',
      category: 'external',
      defaultVariant: 'open',
      variants: {
        open: {
          emoji: '🅿️',
          label: 'Open Carpark',
          description: 'Open air parking',
          displayName: 'Open Carpark'
        },
        covered: {
          emoji: '🏚️',
          label: 'Covered Carpark',
          description: 'Covered parking structure',
          displayName: 'Covered Carpark'
        },
        street: {
          emoji: '🚗',
          label: 'Street Parking',
          description: 'Street parking only',
          displayName: 'Street Parking'
        }
      },
      icon: 'car',
      color: '#f8b88b'  // Peach
    }
  },

  // ============================================================
  // END-OF-TENANCY SPECIFIC ROOMS
  // ============================================================
  eot: {
    // Uses same rooms as residential but with different defaults
    // (Often more intensive cleaning required)
    bedroom: {
      emoji: '🛏️',
      label: 'Bedroom (EOT)',
      category: 'sleeping_areas',
      defaultVariant: 'standard',
      // Inherits variants from residential.bedroom
      eotIntensive: true,  // Flag: EOT cleaning is more intensive
      icon: 'bed',
      color: '#f5b7b1'  // Salmon
    },

    bathroom: {
      emoji: '🚿',
      label: 'Bathroom (EOT)',
      category: 'wet_areas',
      defaultVariant: 'standard',
      eotIntensive: true,
      icon: 'droplet',
      color: '#d4e6f1'  // Light blue
    },

    kitchen: {
      emoji: '🍳',
      label: 'Kitchen (EOT)',
      category: 'work_areas',
      defaultVariant: 'standard',
      eotIntensive: true,  // EOT kitchens require deep clean (oven, fridge, etc.)
      icon: 'utensils',
      color: '#f9e79f'  // Light yellow
    }
  }
};

// Export for use in AysRoomOrchestrator and form UI generation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysRoomMetadataLookup;
}
