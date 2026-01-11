/**
 * ITEM_DEFINITIONS.js
 * 
 * Defines all service items for commercial cleaning quotes.
 * Structure: SERVICE_TYPE → ROOM_TYPE → VARIANT → [items array]
 * 
 * CRITICAL: All prices reference SETTINGS keys, NOT hardcoded values.
 * This allows prices to be updated in Settings UI without code changes.
 * 
 * At runtime, calculator pulls: SETTINGS['setting_key'] to get actual price
 * 
 * Pricing Model References:
 * - COMMERCIAL (Ground Floor): Unit-based pricing
 *   * priceSetting: 'window_large_pane_price' → pulls from SETTINGS
 *   * priceSetting: 'window_small_pane_price' → pulls from SETTINGS
 *   * priceSetting: 'window_door_pane_price' → pulls from SETTINGS
 * 
 * - Height Surcharges (in SETTINGS):
 *   * window_ground_floor_surcharge: 0
 *   * window_two_storey_surcharge: 100
 *   * window_extra_staff_rate: 50 (per hour if > 6 hrs)
 *   * window_extra_staff_threshold: 6 (hours)
 */

const ITEM_DEFINITIONS = {
  commercial: {
    // ============================================================
    // WINDOW CLEANING ITEMS
    // ============================================================
    windows: {
      // Pane size items (parameterized, unit pricing via SETTINGS)
      large_pane: {
        itemId: 'site-window_large_pane',
        label: 'Large window pane',
        category: 'windows',
        parameterized: true,
        parameter: 'number_of_large_panes',
        priceSetting: 'window_large_pane_price',
        baseHours: 0.15,
        optional: true,
        description: 'Large storefront/windows (1.5m+ wide). Inside + outside.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['glass_cleaner', 'squeegee', 'microfiber_cloth'],
        staffCount: 1
      },
      small_pane: {
        itemId: 'site-window_small_pane',
        label: 'Small window pane',
        category: 'windows',
        parameterized: true,
        parameter: 'number_of_small_panes',
        priceSetting: 'window_small_pane_price',
        baseHours: 0.08,
        optional: true,
        description: 'Small/odd-sized windows (60cm × 30cm+). Bathrooms, skylights, narrow windows.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['glass_cleaner', 'cloth', 'microfiber_cloth'],
        staffCount: 1
      },
      door_pane: {
        itemId: 'site-window_door_pane',
        label: 'Glass door or panel',
        category: 'windows',
        parameterized: true,
        parameter: 'number_of_door_panes',
        priceSetting: 'window_door_pane_price',
        baseHours: 0.20,
        optional: true,
        description: 'Entrance doors, interior glass doors. Both sides + frame + handle.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['glass_cleaner', 'squeegee', 'microfiber_cloth'],
        staffCount: 1
      },

      // Building height surcharges (non-parameterized, SETTINGS-referenced)
      ground_floor: {
        itemId: 'site-window_ground_floor',
        label: 'Ground floor (1-storey)',
        category: 'windows_height',
        parameterized: false,
        priceSetting: 'window_ground_floor_surcharge',
        optional: true,
        description: 'Building is single storey. One staff member. No extra cost.',
        staffCount: 1,
        heightMultiplier: 1.0,
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['glass_cleaner', 'squeegee', 'microfiber_cloth']
      },
      two_storey: {
        itemId: 'site-window_two_storey',
        label: 'Two-storey building',
        category: 'windows_height',
        parameterized: false,
        priceSetting: 'window_two_storey_surcharge',
        optional: true,
        description: 'Building is 2-storey. Equipment surcharge. If > 6 hrs, +$50/hr extra staff.',
        staffCount: 1,
        heightMultiplier: 1.0,
        extraStaffRateSetting: 'window_extra_staff_rate',
        extraStaffThresholdSetting: 'window_extra_staff_threshold',
        workType: 'labor',
        skillLevel: 'advanced',
        products: ['glass_cleaner', 'squeegee', 'microfiber_cloth', 'equipment_rental']
      },
      multi_storey: {
        itemId: 'site-window_multi_storey',
        label: 'Multi-storey (3+ floors)',
        category: 'windows_height',
        parameterized: false,
        priceSetting: 'CUSTOM_QUOTE',
        optional: true,
        description: 'Contact for custom quote. Equipment rental $1000+ base + $500/day + extra staff.',
        note: 'Rare (3-4 jobs/career). Requires email/phone quote.',
        requiresManualQuote: true,
        workType: 'labor',
        skillLevel: 'advanced',
        products: ['glass_cleaner', 'squeegee', 'microfiber_cloth', 'heavy_equipment_rental'],
        staffCount: 2
      }
    },

    // ============================================================
    // RUBBISH HANDLING ITEMS
    // ============================================================
    rubbish: {
      small_tin: {
        itemId: 'site-rubbish_small_tin',
        label: 'Small rubbish tin cleared',
        category: 'rubbish',
        parameterized: true,
        parameter: 'number_of_small_tins',
        pricePerUnit: 15,
        baseHours: 0.05,
        optional: true,
        description: 'Small rubbish tin (60L). Cleared and removed.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['gloves', 'trash_bags'],
        staffCount: 1
      },
      medium_bin: {
        itemId: 'site-rubbish_medium_bin',
        label: 'Medium rubbish bin cleared',
        category: 'rubbish',
        parameterized: true,
        parameter: 'number_of_medium_bins',
        pricePerUnit: 30,
        baseHours: 0.10,
        optional: true,
        description: 'Medium rubbish bin (120L). Cleared and removed.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['gloves', 'trash_bags'],
        staffCount: 1
      },
      large_bin: {
        itemId: 'site-rubbish_large_bin',
        label: 'Large rubbish bin cleared',
        category: 'rubbish',
        parameterized: true,
        parameter: 'number_of_large_bins',
        pricePerUnit: 50,
        baseHours: 0.15,
        optional: true,
        description: 'Large rubbish bin (240L+). Cleared and removed.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['gloves', 'trash_bags'],
        staffCount: 1
      },
      rubbish_transport: {
        itemId: 'site-rubbish_transport',
        label: 'Rubbish transport to dumpster',
        category: 'rubbish',
        parameterized: true,
        parameter: 'transport_distance_meters',
        pricePerUnit: 0.10,
        baseHours: 0.20,
        optional: true,
        description: 'Transport rubbish to dumpster station. Charged per meter distance.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['gloves'],
        staffCount: 1
      }
    },

    // ============================================================
    // OFFICE ITEMS (parameterized by office count)
    // ============================================================
    offices: {
      private_office: {
        itemId: 'site-office_private',
        label: 'Private office cleaned',
        category: 'offices',
        parameterized: true,
        parameter: 'number_of_private_offices',
        price: 45,
        baseHours: 0.5,
        optional: true,
        description: 'Single private office. Floors, surfaces, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'vacuum_cleaner', 'cloth'],
        staffCount: 1
      },
      open_plan_desk: {
        itemId: 'site-office_open_plan',
        label: 'Open-plan desk station',
        category: 'offices',
        parameterized: true,
        parameter: 'number_of_open_plan_desks',
        price: 25,
        baseHours: 0.25,
        optional: true,
        description: 'Individual desk in open-plan area. Surfaces, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'microfiber_cloth'],
        staffCount: 1
      },
      boardroom: {
        itemId: 'site-office_boardroom',
        label: 'Boardroom/conference room',
        category: 'offices',
        parameterized: true,
        parameter: 'number_of_boardrooms',
        price: 75,
        baseHours: 1.0,
        optional: true,
        description: 'Conference room. Table, chairs, floor, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'vacuum_cleaner', 'cloth'],
        staffCount: 1
      },
      reception: {
        itemId: 'site-office_reception',
        label: 'Reception area',
        category: 'offices',
        parameterized: true,
        parameter: 'number_of_receptions',
        price: 50,
        baseHours: 0.5,
        optional: true,
        description: 'Reception desk area. Surfaces, waiting area, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'vacuum_cleaner', 'cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // TOILET BLOCK ITEMS
    // ============================================================
    toilets: {
      single_toilet: {
        itemId: 'site-toilet_single',
        label: 'Single toilet (urinal/stall)',
        category: 'toilets',
        parameterized: true,
        parameter: 'number_of_single_toilets',
        price: 25,
        baseHours: 0.25,
        optional: true,
        description: 'Single toilet/urinal. Cleaned, sanitized, paper/soap restocked.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['toilet_cleaner', 'toilet_brush', 'disinfectant', 'toilet_paper', 'soap'],
        staffCount: 1
      },
      stall: {
        itemId: 'site-toilet_stall',
        label: 'Toilet stall',
        category: 'toilets',
        parameterized: true,
        parameter: 'number_of_stalls',
        price: 30,
        baseHours: 0.3,
        optional: true,
        description: 'Private toilet stall. Cleaned, sanitized, paper restocked.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['toilet_cleaner', 'toilet_brush', 'disinfectant', 'toilet_paper'],
        staffCount: 1
      },
      sink_station: {
        itemId: 'site-toilet_sink',
        label: 'Sink/washbasin station',
        category: 'toilets',
        parameterized: true,
        parameter: 'number_of_sinks',
        price: 20,
        baseHours: 0.2,
        optional: true,
        description: 'Sink and counter area. Cleaned, mirrors, soap restocked.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['bathroom_cleaner', 'microfiber_cloth', 'glass_cleaner', 'soap'],
        staffCount: 1
      }
    },

    // ============================================================
    // CARPARK / PARKING ITEMS
    // ============================================================
    carpark: {
      open_carpark: {
        itemId: 'site-carpark_open',
        label: 'Open carpark parking space',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_open_spaces',
        price: 0,
        baseHours: 0,
        optional: true,
        description: 'Open carpark. Swept, basic maintenance.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['broom', 'hose'],
        staffCount: 1
      },
      covered_carpark: {
        itemId: 'site-carpark_covered',
        label: 'Covered carpark space',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_covered_spaces',
        price: 10,
        baseHours: 0.1,
        optional: true,
        description: 'Covered carpark. Cleaned, swept, basic maintenance.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['broom', 'hose', 'surface_cleaner'],
        staffCount: 1
      },
      street_parking: {
        itemId: 'site-carpark_street',
        label: 'Street parking only',
        category: 'carpark',
        parameterized: false,
        price: 0,
        optional: true,
        description: 'No dedicated carpark. Street parking only.',
        workType: 'labor',
        skillLevel: 'basic',
        products: [],
        staffCount: 0
      }
    },

    // ============================================================
    // LUNCHROOM / KITCHEN ITEMS
    // ============================================================
    lunchroom: {
      lunchroom_clean: {
        itemId: 'site-lunchroom_clean',
        label: 'Lunchroom/kitchen cleaned',
        category: 'lunchroom',
        parameterized: true,
        parameter: 'number_of_lunchrooms',
        price: 60,
        baseHours: 0.75,
        optional: true,
        description: 'Lunchroom/kitchen. Counters, sink, appliances, floor, trash, dishes.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'kitchen_cleaner', 'mop', 'cloth'],
        staffCount: 1
      },
      microwave: {
        itemId: 'site-lunchroom_microwave',
        label: 'Microwave cleaned',
        category: 'lunchroom',
        parameterized: true,
        parameter: 'number_of_microwaves',
        price: 15,
        baseHours: 0.15,
        optional: true,
        description: 'Microwave interior and exterior cleaned.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['kitchen_cleaner', 'cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // CIRCULATION AREAS (Hallways, Corridors, Entries)
    // ============================================================
    circulation: {
      hallway_100m2: {
        itemId: 'site-circulation_hallway',
        label: 'Hallway/corridor (100m²)',
        category: 'circulation',
        parameterized: true,
        parameter: 'number_of_hallways_100m2',
        price: 40,
        baseHours: 0.5,
        optional: true,
        description: 'Hallway or corridor (100m²). Floors swept/mopped, dusting, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['floor_cleaner', 'mop', 'microfiber_cloth'],
        staffCount: 1
      },
      entry_foyer: {
        itemId: 'site-circulation_entry',
        label: 'Entry/foyer area',
        category: 'circulation',
        parameterized: true,
        parameter: 'number_of_entries',
        price: 35,
        baseHours: 0.4,
        optional: true,
        description: 'Entry foyer. Doors cleaned, floors, mats, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['glass_cleaner', 'floor_cleaner', 'mop', 'cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // UTILITY ROOMS (Storage, Kitchenettes, etc.)
    // ============================================================
    utility: {
      utility_room: {
        itemId: 'site-utility_room',
        label: 'Utility room cleaned',
        category: 'utility',
        parameterized: true,
        parameter: 'number_of_utility_rooms',
        price: 50,
        baseHours: 0.6,
        optional: true,
        description: 'Utility room. Shelves, storage, equipment, floors, trash.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'floor_cleaner', 'microfiber_cloth'],
        staffCount: 1
      }
      },
      staircase: {
        itemId: 'site-staircase',
        label: 'Staircase (flight)',
        category: 'utility',
        parameterized: true,
        parameter: 'number_of_staircases',
        price: 40,
        baseHours: 0.5,
        optional: true,
        description: 'Staircase flight. Steps, railings, walls cleaned.'
      }
    },

    // ============================================================
    // WAREHOUSE ITEMS (Shelving, Racks, High Areas)
    // ============================================================
    warehouse: {
      warehouse_100m2: {
        itemId: 'site-warehouse_area',
        label: 'Warehouse area (100m²)',
        category: 'warehouse',
        parameterized: true,
        parameter: 'number_of_warehouse_areas_100m2',
        price: 60,
        baseHours: 0.75,
        optional: true,
        description: 'Warehouse floor area (100m²). Swept, basic dusting, trash.'
      },
      shelving_unit: {
        itemId: 'site-warehouse_shelving',
        label: 'Shelving unit cleaned',
        category: 'warehouse',
        parameterized: true,
        parameter: 'number_of_shelving_units',
        price: 25,
        baseHours: 0.3,
        optional: true,
        description: 'Shelving unit. Dusted, organized, trash removed.'
      }
    },

    // ============================================================
    // TRADE / WORKSHOP ITEMS (Tools, Equipment Areas)
    // ============================================================
    trade: {
      workshop_100m2: {
        itemId: 'site-workshop_area',
        label: 'Workshop area (100m²)',
        category: 'trade',
        parameterized: true,
        parameter: 'number_of_workshop_areas_100m2',
        price: 70,
        baseHours: 0.9,
        optional: true,
        description: 'Workshop area. Swept, tool racks dusted, trash, basic organization.'
      },
      workbench: {
        itemId: 'site-workbench',
        label: 'Workbench cleaned',
        category: 'trade',
        parameterized: true,
        parameter: 'number_of_workbenches',
        price: 30,
        baseHours: 0.4,
        optional: true,
        description: 'Workbench. Cleaned, organized, trash removed.'
      }
    },

    // ============================================================
    // CARPET CLEANING SERVICE (Property-Wide Service)
    // ============================================================
    // SETTINGS: include_carpet_cleaning: true/false (structural toggle)
    // FORM: Room count, stains, protection, extra rooms, stairs (user choices)
    carpet_cleaning: {
      // Base pricing by room count (user selects in form)
      base_2_room: {
        itemId: 'site-carpet_2room',
        label: 'Carpet cleaning - 2 rooms',
        category: 'carpet_cleaning',
        parameterized: false,
        priceSetting: 'carpet_base_2room_price',
        baseHours: 1.5,
        optional: true,
        description: 'Professional carpet cleaning for 2 rooms. Inside + outside clean, vacuum included.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine', 'vacuum_cleaner'],
        staffCount: 1
      },
      base_3_room: {
        itemId: 'site-carpet_3room',
        label: 'Carpet cleaning - 3 rooms',
        category: 'carpet_cleaning',
        parameterized: false,
        priceSetting: 'carpet_base_3room_price',
        baseHours: 2.0,
        optional: true,
        description: 'Professional carpet cleaning for 3 rooms. Inside + outside clean, vacuum included.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine', 'vacuum_cleaner'],
        staffCount: 1
      },
      base_4_room: {
        itemId: 'site-carpet_4room',
        label: 'Carpet cleaning - 4 rooms',
        category: 'carpet_cleaning',
        parameterized: false,
        priceSetting: 'carpet_base_4room_price',
        baseHours: 2.5,
        optional: true,
        description: 'Professional carpet cleaning for 4 rooms. Inside + outside clean, vacuum included.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine', 'vacuum_cleaner'],
        staffCount: 1
      },
      base_5_room: {
        itemId: 'site-carpet_5room',
        label: 'Carpet cleaning - 5 rooms',
        category: 'carpet_cleaning',
        parameterized: false,
        priceSetting: 'carpet_base_5room_price',
        baseHours: 3.0,
        optional: true,
        description: 'Professional carpet cleaning for 5 rooms. Inside + outside clean, vacuum included.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine', 'vacuum_cleaner'],
        staffCount: 1
      },
      base_6_room: {
        itemId: 'site-carpet_6room',
        label: 'Carpet cleaning - 6 rooms',
        category: 'carpet_cleaning',
        parameterized: false,
        priceSetting: 'carpet_base_6room_price',
        baseHours: 4.0,
        optional: true,
        description: 'Professional carpet cleaning for 6 rooms. Inside + outside clean, vacuum included.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine', 'vacuum_cleaner'],
        staffCount: 1
      },

      // Optional extras (form choices, parameterized)
      stain_removal: {
        itemId: 'site-carpet_stain_removal',
        label: 'Stain removal',
        category: 'carpet_cleaning_extras',
        parameterized: true,
        parameter: 'number_of_stains',
        priceSetting: 'carpet_stain_removal_price',
        baseHours: 0.1,
        optional: true,
        description: 'Stain removal per stain (5-15 stains). Steam or chemical treatment. After 15, contact insurance company.',
        maxItems: 15,
        note: 'Beyond 15 stains requires custom quote',
        workType: 'labor',
        skillLevel: 'advanced',
        products: ['stain_removal_solution', 'steam_cleaner'],
        staffCount: 1
      },
      carpet_protection: {
        itemId: 'site-carpet_protection',
        label: 'Carpet protection',
        category: 'carpet_cleaning_extras',
        parameterized: true,
        parameter: 'protection_room_count',
        priceSetting: 'carpet_protection_price',
        baseHours: 0.15,
        optional: true,
        description: 'Carpet protection treatment per room. Stain resistant coating.',
        unit: 'per room',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['stain_resistant_coating'],
        staffCount: 1
      },
      extra_room: {
        itemId: 'site-carpet_extra_room',
        label: 'Extra room',
        category: 'carpet_cleaning_extras',
        parameterized: true,
        parameter: 'extra_room_count',
        priceSetting: 'carpet_extra_room_price',
        baseHours: 0.5,
        optional: true,
        description: 'Any rooms beyond the base package.',
        unit: 'per additional room',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine'],
        staffCount: 1
      },
      stairs: {
        itemId: 'site-carpet_stairs',
        label: 'Flight of stairs',
        category: 'carpet_cleaning_extras',
        parameterized: true,
        parameter: 'stair_flights_count',
        priceSetting: 'carpet_stairs_price',
        baseHours: 0.5,
        optional: true,
        description: 'Carpet on stairs. Cleaned and protected.',
        unit: 'per flight of stairs',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['carpet_cleaning_solution', 'carpet_cleaner_machine'],
        staffCount: 1
      },

      // Surcharges (distance-based, location-based)
      distance_surcharge: {
        itemId: 'site-carpet_distance_surcharge',
        label: 'Distance surcharge (outside 12km CBD)',
        category: 'carpet_cleaning_surcharges',
        parameterized: false,
        priceSetting: 'carpet_distance_surcharge_price',
        baseHours: 0,
        optional: true,
        description: 'Additional charge for travel outside Christchurch City 12km radius.',
        unit: 'flat surcharge',
        condition: 'Applied if property > 12km from CBD'
      }
    },

    // ============================================================
    // GARDENING & LAWN MAINTENANCE SERVICE (Property-Wide)
    // ============================================================
    // SETTINGS: include_gardening_services: true/false (structural toggle, default: OFF)
    // NOTE: Default is OFF because most cleaning services don't offer gardening.
    // Gardening specialists or multi-service operators can enable and configure.
    // FORM: Property size, lawn area, garden beds, hedges, weeding, deck cleaning
    gardening: {
      // Base packages by property size (user selects in form)
      base_small: {
        itemId: 'site-gardening_small',
        label: 'Small property maintenance',
        category: 'gardening',
        parameterized: false,
        priceSetting: 'gardening_base_small_price',
        baseHours: 0.5,
        optional: true,
        description: 'Small residential property (< 500 sqm outdoor). Lawn mow, basic trim.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['lawnmower', 'trimmer', 'gloves'],
        staffCount: 1
      },
      base_medium: {
        itemId: 'site-gardening_medium',
        label: 'Medium property maintenance',
        category: 'gardening',
        parameterized: false,
        priceSetting: 'gardening_base_medium_price',
        baseHours: 1.5,
        optional: true,
        description: 'Medium residential property (500-1500 sqm outdoor). Lawn, garden, basic trim.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['lawnmower', 'trimmer', 'hedge_trimmer', 'gloves'],
        staffCount: 1
      },
      base_large: {
        itemId: 'site-gardening_large',
        label: 'Large property maintenance',
        category: 'gardening',
        parameterized: false,
        priceSetting: 'gardening_base_large_price',
        baseHours: 3.0,
        optional: true,
        description: 'Large residential property (1500+ sqm outdoor). Full lawn, gardens, hedges.',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['lawnmower', 'trimmer', 'hedge_trimmer', 'leaf_blower', 'gloves'],
        staffCount: 2
      },
      base_commercial: {
        itemId: 'site-gardening_commercial',
        label: 'Commercial property maintenance',
        category: 'gardening',
        parameterized: false,
        priceSetting: 'gardening_base_commercial_price',
        baseHours: 8.0,
        optional: true,
        description: 'Commercial outdoor space. Custom estimate. Full grounds maintenance.',
        note: 'May require multiple staff',
        workType: 'labor',
        skillLevel: 'advanced',
        products: ['lawnmower', 'trimmer', 'hedge_trimmer', 'leaf_blower', 'power_washer'],
        staffCount: 3
      },

      // Optional services (parameterized, form choices)
      lawn_mowing: {
        itemId: 'site-gardening_lawn_mow',
        label: 'Lawn mowing',
        category: 'gardening_services',
        parameterized: true,
        parameter: 'lawn_area_sqm',
        priceSetting: 'gardening_lawn_mow_price',
        baseHours: 0.001,
        optional: true,
        description: 'Professional lawn mowing per square meter.',
        unit: 'per sqm',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['lawnmower', 'leaf_blower'],
        staffCount: 1
      },
      garden_trimming: {
        itemId: 'site-gardening_trim',
        label: 'Garden trimming',
        category: 'gardening_services',
        parameterized: true,
        parameter: 'garden_bed_count',
        priceSetting: 'gardening_trim_price',
        baseHours: 0.5,
        optional: true,
        description: 'Garden bed trimming, shaping, cleanup.',
        unit: 'per garden bed',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['trimmer', 'shears', 'gloves'],
        staffCount: 1
      },
      hedge_trimming: {
        itemId: 'site-gardening_hedge',
        label: 'Hedge trimming',
        category: 'gardening_services',
        parameterized: true,
        parameter: 'hedge_linear_meters',
        priceSetting: 'gardening_hedge_price',
        baseHours: 0.05,
        optional: true,
        description: 'Professional hedge trimming and shaping.',
        unit: 'per linear meter',
        workType: 'labor',
        skillLevel: 'intermediate',
        products: ['hedge_trimmer', 'shears', 'gloves'],
        staffCount: 1
      },
      weed_removal: {
        itemId: 'site-gardening_weeds',
        label: 'Weed removal',
        category: 'gardening_services',
        parameterized: true,
        parameter: 'weed_area_sqm',
        priceSetting: 'gardening_weed_removal_price',
        baseHours: 0.004,
        optional: true,
        description: 'Hand weeding, removal of unwanted vegetation.',
        unit: 'per sqm',
        note: 'Hand weeding is labor-intensive. Consider chemical treatment for large areas.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['gloves', 'hand_tools'],
        staffCount: 1
      },
      deck_driveway_clean: {
        itemId: 'site-gardening_deck_clean',
        label: 'Deck/driveway cleaning',
        category: 'gardening_services',
        parameterized: true,
        parameter: 'deck_driveway_sqm',
        priceSetting: 'gardening_deck_clean_price',
        baseHours: 0.01,  // ~0.01 hours per sqm
        optional: true,
        description: 'Professional power wash of decks, patios, driveways.',
        unit: 'per sqm'
      },

      // Contract options
      quarterly_contract_discount: {
        itemId: 'site-gardening_quarterly',
        label: 'Quarterly contract discount',
        category: 'gardening_discounts',
        parameterized: false,
        priceSetting: 'gardening_quarterly_discount_pct',  // Percentage discount (e.g., 10)
        baseHours: 0,
        optional: true,
        description: '10% discount for quarterly maintenance contracts (4× per year).',
        note: 'Typical schedule: March, June, September, December for lawns'
      }
    }
  }
};

/**
 * OPTIONAL FORM CHOICES
 * These are toggles/modifiers offered on the form during inspection walk-through
 */
const OPTIONAL_FORM_CHOICES = {
  desk_tidying: {
    choiceId: 'form-choice_desk_tidying',
    label: 'Desk Tidying (Cluttered areas)',
    category: 'optional_services',
    conditional: 'if_desks_cluttered',
    price: 35,
    baseHours: 0.5,
    description: 'Organize desks, files, surfaces. (Triggered if "Yes" to "Are desks cluttered?")'
  },
  laundry_service: {
    choiceId: 'form-choice_laundry',
    label: 'Laundry Service (If facilities exist)',
    category: 'optional_services',
    conditional: 'if_laundry_facilities',
    price: 40,
    baseHours: 0.5,
    description: 'Wash, dry, fold laundry. (If kitchen/break room has washing/drying facilities)'
  },
  vacuum_and_rubbish: {
    choiceId: 'form-choice_vac_rubbish',
    label: 'Vacuum & Rubbish Package',
    category: 'optional_services',
    price: 80,
    baseHours: 1.0,
    description: 'Quick vacuum and rubbish clear. Budget package. (~$80-150 depending on size)'
  }
};

/**
 * COMMERCIAL SERVICE PACKAGES
 * Pre-bundled service combinations for quick quoting
 */
const COMMERCIAL_PACKAGES = {
  package_a_budget: {
    packageId: 'commercial_package_a',
    name: 'Vacuum & Rubbish (Budget)',
    description: 'Quick vacuum and rubbish clearing. Cheapest option.',
    baseServices: ['vacuum_and_rubbish'],
    estimatedPrice: '$80-150',
    estimatedHours: '1-2 hours'
  },
  package_b_floors_windows: {
    packageId: 'commercial_package_b',
    name: 'Floors & Windows',
    description: 'Typical for retail shops. Floors + window cleaning.',
    baseServices: ['vacuum', 'windows'],
    estimatedPrice: '$150-400',
    estimatedHours: '2-3 hours'
  },
  package_c_basic: {
    packageId: 'commercial_package_c',
    name: 'Basic Cleaning',
    description: 'Office spaces. Floors, windows, toilets, office areas.',
    baseServices: ['vacuum', 'windows', 'toilets', 'offices'],
    estimatedPrice: '$250-600',
    estimatedHours: '3-5 hours'
  },
  package_d_comprehensive: {
    packageId: 'commercial_package_d',
    name: 'Comprehensive',
    description: 'Full service. All areas, windows, rubbish, lunchroom.',
    baseServices: ['vacuum', 'windows', 'rubbish', 'toilets', 'offices', 'lunchroom', 'circulation'],
    estimatedPrice: '$600-1200',
    estimatedHours: '6-10 hours'
  }
};

// Export for use in quote calculator
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ITEM_DEFINITIONS,
    OPTIONAL_FORM_CHOICES,
    COMMERCIAL_PACKAGES
  };
}
