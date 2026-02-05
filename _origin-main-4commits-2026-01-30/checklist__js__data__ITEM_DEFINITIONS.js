/**
 * ITEM_DEFINITIONS.js
 * 
 * Defines all service items for commercial cleaning quotes.
 * Structure: SERVICE_TYPE ΓåÆ ROOM_TYPE ΓåÆ VARIANT ΓåÆ [items array]
 * 
 * CRITICAL: All prices reference SETTINGS keys, NOT hardcoded values.
 * This allows prices to be updated in Settings UI without code changes.
 * 
 * At runtime, calculator pulls: SETTINGS['setting_key'] to get actual price
 * 
 * Pricing Model References:
 * - COMMERCIAL (Ground Floor): Unit-based pricing
 *   * priceSetting: 'window_large_pane_price' ΓåÆ pulls from SETTINGS
 *   * priceSetting: 'window_small_pane_price' ΓåÆ pulls from SETTINGS
 *   * priceSetting: 'window_door_pane_price' ΓåÆ pulls from SETTINGS
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
        description: 'Small/odd-sized windows (60cm ├ù 30cm+). Bathrooms, skylights, narrow windows.',
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
    // SALES FLOOR ITEMS
    // ============================================================
    sales_floor: {
      sales_floor_area_100m2: {
        itemId: 'site-sales_floor_area',
        label: 'Sales floor area (100m┬▓)',
        category: 'sales_floor',
        parameterized: true,
        parameter: 'number_of_sales_floor_areas_100m2',
        optional: true,
        description: 'Sales floor area. Sweep/vacuum, spot clean, trash removal.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['floor_cleaner', 'vacuum_cleaner', 'microfiber_cloth'],
        staffCount: 1
      },
      display_fixture: {
        itemId: 'site-sales_floor_display_fixture',
        label: 'Display fixture wiped',
        category: 'sales_floor',
        parameterized: true,
        parameter: 'number_of_display_fixtures',
        optional: true,
        description: 'Display fixtures and shelving wiped down.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'microfiber_cloth'],
        staffCount: 1
      },
      checkout_counter: {
        itemId: 'site-sales_floor_checkout_counter',
        label: 'Checkout counter cleaned',
        category: 'sales_floor',
        parameterized: true,
        parameter: 'number_of_checkout_counters',
        optional: true,
        description: 'Checkout counters and bagging areas cleaned.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'disinfectant', 'microfiber_cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // STOCKROOM ITEMS
    // ============================================================
    stockroom: {
      stockroom_area_50m2: {
        itemId: 'site-stockroom_area',
        label: 'Stockroom area (50m┬▓)',
        category: 'stockroom',
        parameterized: true,
        parameter: 'number_of_stockroom_areas_50m2',
        optional: true,
        description: 'Stockroom area. Sweep, dust accessible surfaces, remove debris.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['broom', 'dust_pan', 'microfiber_cloth'],
        staffCount: 1
      },
      stock_shelving: {
        itemId: 'site-stockroom_shelving',
        label: 'Stock shelving wiped',
        category: 'stockroom',
        parameterized: true,
        parameter: 'number_of_stock_shelving_units',
        optional: true,
        description: 'Shelving wiped and organized if accessible.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'microfiber_cloth'],
        staffCount: 1
      },
      pallet_zone: {
        itemId: 'site-stockroom_pallet_zone',
        label: 'Pallet zone sweep',
        category: 'stockroom',
        parameterized: true,
        parameter: 'number_of_pallet_zones',
        optional: true,
        description: 'Pallet storage zones swept and cleared.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['broom', 'dust_pan'],
        staffCount: 1
      }
    },

    // ============================================================
    // LOCKER ROOM ITEMS
    // ============================================================
    locker_room: {
      locker_room_area_50m2: {
        itemId: 'site-locker_room_area',
        label: 'Locker room area (50m┬▓)',
        category: 'locker_room',
        parameterized: true,
        parameter: 'number_of_locker_room_areas_50m2',
        optional: true,
        description: 'Locker room floors and surfaces cleaned.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['floor_cleaner', 'disinfectant', 'microfiber_cloth'],
        staffCount: 1
      },
      locker_bank: {
        itemId: 'site-locker_room_locker_bank',
        label: 'Locker bank wipe',
        category: 'locker_room',
        parameterized: true,
        parameter: 'number_of_locker_banks',
        optional: true,
        description: 'Locker doors and handles wiped down.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['disinfectant', 'microfiber_cloth'],
        staffCount: 1
      },
      bench_seating: {
        itemId: 'site-locker_room_bench',
        label: 'Bench seating cleaned',
        category: 'locker_room',
        parameterized: true,
        parameter: 'number_of_locker_benches',
        optional: true,
        description: 'Benches and seating surfaces wiped.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'microfiber_cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // SHOWER ITEMS
    // ============================================================
    shower: {
      shower_stall: {
        itemId: 'site-shower_stall',
        label: 'Shower stall cleaned',
        category: 'shower',
        parameterized: true,
        parameter: 'number_of_shower_stalls',
        optional: true,
        description: 'Shower walls and fixtures cleaned and sanitized.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['bathroom_cleaner', 'scrub_brush', 'disinfectant'],
        staffCount: 1
      },
      shower_floor: {
        itemId: 'site-shower_floor',
        label: 'Shower floor scrub',
        category: 'shower',
        parameterized: true,
        parameter: 'number_of_shower_floors',
        optional: true,
        description: 'Shower floors scrubbed and rinsed.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['bathroom_cleaner', 'scrub_brush'],
        staffCount: 1
      },
      shower_glass: {
        itemId: 'site-shower_glass',
        label: 'Shower glass wiped',
        category: 'shower',
        parameterized: true,
        parameter: 'number_of_shower_glass_panels',
        optional: true,
        description: 'Shower glass panels and screens wiped.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['glass_cleaner', 'microfiber_cloth'],
        staffCount: 1
      }
    },

    // ============================================================
    // LOADING DOCK ITEMS
    // ============================================================
    loading_dock: {
      dock_bay: {
        itemId: 'site-loading_dock_bay',
        label: 'Loading dock bay',
        category: 'loading_dock',
        parameterized: true,
        parameter: 'number_of_loading_dock_bays',
        optional: true,
        description: 'Dock bay swept, debris cleared, basic wipe down.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['broom', 'dust_pan', 'gloves'],
        staffCount: 1
      },
      dock_door: {
        itemId: 'site-loading_dock_door',
        label: 'Dock door wipe',
        category: 'loading_dock',
        parameterized: true,
        parameter: 'number_of_loading_dock_doors',
        optional: true,
        description: 'Dock doors and handles wiped.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['surface_cleaner', 'microfiber_cloth'],
        staffCount: 1
      },
      dock_floor_strip: {
        itemId: 'site-loading_dock_floor_strip',
        label: 'Dock floor strip',
        category: 'loading_dock',
        parameterized: true,
        parameter: 'number_of_loading_dock_floor_strips',
        optional: true,
        description: 'Dock floor strip swept and spot cleaned.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['floor_cleaner', 'mop'],
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
      accessible_stall: {
        itemId: 'site-toilet_accessible_stall',
        label: 'Accessible toilet stall',
        category: 'toilets',
        parameterized: true,
        parameter: 'number_of_accessible_stalls',
        optional: true,
        description: 'Accessible stall. Cleaned, sanitized, paper restocked.',
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
      },
      jumbo_roll_refill: {
        itemId: 'site-toilet_jumbo_roll_refill',
        label: 'Jumbo toilet roll refill',
        category: 'toilets_consumables',
        parameterized: true,
        parameter: 'number_of_jumbo_roll_refills',
        optional: true,
        description: 'Replace jumbo roll dispensers.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['jumbo_toilet_roll']
      },
      paper_towel_refill: {
        itemId: 'site-toilet_paper_towel_refill',
        label: 'Paper towel refill',
        category: 'toilets_consumables',
        parameterized: true,
        parameter: 'number_of_paper_towel_refills',
        optional: true,
        description: 'Restock paper towel dispensers.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['paper_towels']
      },
      sanitary_bin_service: {
        itemId: 'site-toilet_sanitary_bin_service',
        label: 'Sanitary bin service',
        category: 'toilets_consumables',
        parameterized: true,
        parameter: 'number_of_sanitary_bins',
        optional: true,
        description: 'Service sanitary bins (replace liners as needed).',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['sanitary_bin_liners']
      },
      hand_dryer_wipe: {
        itemId: 'site-toilet_hand_dryer_wipe',
        label: 'Hand dryer exterior wipe',
        category: 'toilets_fixtures',
        parameterized: true,
        parameter: 'number_of_hand_dryers',
        optional: true,
        description: 'Wipe down hand dryers and touchpoints.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['disinfectant', 'cloth']
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
        label: 'Hallway/corridor (100m┬▓)',
        category: 'circulation',
        parameterized: true,
        parameter: 'number_of_hallways_100m2',
        price: 40,
        baseHours: 0.5,
        optional: true,
        description: 'Hallway or corridor (100m┬▓). Floors swept/mopped, dusting, trash.',
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
        label: 'Warehouse area (100m┬▓)',
        category: 'warehouse',
        parameterized: true,
        parameter: 'number_of_warehouse_areas_100m2',
        price: 60,
        baseHours: 0.75,
        optional: true,
        description: 'Warehouse floor area (100m┬▓). Swept, basic dusting, trash.'
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
        label: 'Workshop area (100m┬▓)',
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
    // PROPERTY-WIDE COMMERCIAL ITEMS
    // ============================================================
    property_wide: {
      standard: [
        {
          itemId: 'commercial-property-wide-vacuum',
          label: 'Property-wide floors vacuum (carpeted areas)',
          category: 'property_wide'
        },
        {
          itemId: 'commercial-property-wide-mop',
          label: 'Property-wide floors mop (hard surface areas)',
          category: 'property_wide'
        },
        {
          itemId: 'commercial-property-wide-touchpoints',
          label: 'Property-wide touchpoints wipe (handles, switches)',
          category: 'property_wide'
        },
        {
          itemId: 'commercial-property-wide-glass',
          label: 'Property-wide internal glass (if included in scope)',
          category: 'property_wide'
        },
        {
          itemId: 'commercial-property-wide-walkthrough',
          label: 'Final walkthrough / quality check',
          category: 'property_wide'
        }
      ]
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
        description: '10% discount for quarterly maintenance contracts (4├ù per year).',
        note: 'Typical schedule: March, June, September, December for lawns'
      }
    }
  }
  ,
  // ============================================================
  // END OF TENANCY CLEANING ITEMS
  // ============================================================
  eot: {
    bedroom: {
      standard: [
        {
          itemId: 'eot-bedroom-walls',
          label: 'Walls (spot clean marks, scuffs)',
          category: 'walls'
        },
        {
          itemId: 'eot-bedroom-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-bedroom-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-bedroom-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-bedroom-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'eot-bedroom-wardrobe-exterior',
          label: 'Wardrobe exterior',
          category: 'wardrobe'
        },
        {
          itemId: 'eot-bedroom-wardrobe-shelving',
          label: 'Wardrobe interior shelving',
          category: 'wardrobe'
        },
        {
          itemId: 'eot-bedroom-wardrobe-hanging-rail',
          label: 'Wardrobe hanging rail',
          category: 'wardrobe'
        },
        {
          itemId: 'eot-bedroom-drawers',
          label: 'Drawers (internal + external)',
          category: 'storage'
        },
        {
          itemId: 'eot-bedroom-window-glass',
          label: 'Windows (internal glass)',
          category: 'windows'
        },
        {
          itemId: 'eot-bedroom-window-frames',
          label: 'Window frames',
          category: 'windows'
        },
        {
          itemId: 'eot-bedroom-window-sills',
          label: 'Window sills',
          category: 'windows'
        },
        {
          itemId: 'eot-bedroom-curtains-blinds',
          label: 'Curtains / blinds (dusting only)',
          category: 'windows'
        },
        {
          itemId: 'eot-bedroom-bed-frame',
          label: 'Bed frame',
          category: 'furniture'
        },
        {
          itemId: 'eot-bedroom-mattress-edges',
          label: 'Mattress (vacuum edges only)',
          category: 'furniture'
        },
        {
          itemId: 'eot-bedroom-bedside-tables',
          label: 'Bedside tables',
          category: 'furniture'
        },
        {
          itemId: 'eot-bedroom-desks-dressers',
          label: 'Desks / dressers',
          category: 'furniture'
        },
        {
          itemId: 'eot-bedroom-shelving',
          label: 'Shelving (open shelves)',
          category: 'furniture'
        },
        {
          itemId: 'eot-bedroom-mirrors',
          label: 'Mirrors',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-floor-vacuum',
          label: 'Floor ΓÇô vacuum',
          category: 'floors'
        },
        {
          itemId: 'eot-bedroom-floor-mop',
          label: 'Floor ΓÇô mop (if hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-bedroom-carpet-edges',
          label: 'Floor ΓÇô carpet edges',
          category: 'floors'
        },
        {
          itemId: 'eot-bedroom-heater-unit',
          label: 'Heater / heat pump unit',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-smoke-alarm',
          label: 'Smoke alarm (external dusting)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bedroom-ceiling-fan',
          label: 'Ceiling fan (if present)',
          category: 'fixtures'
        }
      ]
    },
    bathroom: {
      standard: [
        {
          itemId: 'eot-bathroom-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-bathroom-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-exhaust-fan',
          label: 'Exhaust fan',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-walls',
          label: 'Walls (spot clean marks, moisture residue)',
          category: 'walls'
        },
        {
          itemId: 'eot-bathroom-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-bathroom-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-bathroom-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'eot-bathroom-toilet-pan-internal',
          label: 'Toilet ΓÇô pan (internal)',
          category: 'toilet'
        },
        {
          itemId: 'eot-bathroom-toilet-pan-external',
          label: 'Toilet ΓÇô pan (external)',
          category: 'toilet'
        },
        {
          itemId: 'eot-bathroom-toilet-seat',
          label: 'Toilet seat (top + underside)',
          category: 'toilet'
        },
        {
          itemId: 'eot-bathroom-toilet-cistern',
          label: 'Toilet cistern',
          category: 'toilet'
        },
        {
          itemId: 'eot-bathroom-toilet-base',
          label: 'Toilet base / floor seal',
          category: 'toilet'
        },
        {
          itemId: 'eot-bathroom-sink-basin',
          label: 'Sink / basin',
          category: 'sink'
        },
        {
          itemId: 'eot-bathroom-tapware',
          label: 'Tapware (sink taps)',
          category: 'sink'
        },
        {
          itemId: 'eot-bathroom-vanity-exterior',
          label: 'Vanity exterior',
          category: 'vanity'
        },
        {
          itemId: 'eot-bathroom-vanity-shelving',
          label: 'Vanity interior shelving',
          category: 'vanity'
        },
        {
          itemId: 'eot-bathroom-drawers',
          label: 'Drawers (internal + external)',
          category: 'vanity'
        },
        {
          itemId: 'eot-bathroom-mirror',
          label: 'Mirror',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-shower-glass',
          label: 'Shower glass / screen',
          category: 'shower'
        },
        {
          itemId: 'eot-bathroom-shower-frame',
          label: 'Shower frame / seals',
          category: 'shower'
        },
        {
          itemId: 'eot-bathroom-shower-walls',
          label: 'Shower walls',
          category: 'shower'
        },
        {
          itemId: 'eot-bathroom-shower-floor',
          label: 'Shower floor / tray',
          category: 'shower'
        },
        {
          itemId: 'eot-bathroom-shower-drain',
          label: 'Shower drain',
          category: 'shower'
        },
        {
          itemId: 'eot-bathroom-bathtub',
          label: 'Bathtub (if present)',
          category: 'bath'
        },
        {
          itemId: 'eot-bathroom-bathtub-tapware',
          label: 'Bathtub tapware',
          category: 'bath'
        },
        {
          itemId: 'eot-bathroom-tile-grout-walls',
          label: 'Tile grout (walls)',
          category: 'tiles'
        },
        {
          itemId: 'eot-bathroom-tile-grout-floors',
          label: 'Tile grout (floors)',
          category: 'tiles'
        },
        {
          itemId: 'eot-bathroom-heated-towel-rail',
          label: 'Heated towel rail (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-towel-hooks',
          label: 'Towel hooks / rails',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-window-glass',
          label: 'Window glass (internal, if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-bathroom-window-frame',
          label: 'Window frame / sill (if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-bathroom-floor-vacuum',
          label: 'Floor ΓÇô vacuum (if applicable)',
          category: 'floors'
        },
        {
          itemId: 'eot-bathroom-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-bathroom-floor-drain',
          label: 'Floor drain (if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-bathroom-soap-dispensers',
          label: 'Soap dispensers',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-sanitary-bin',
          label: 'Sanitary bin (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-bathroom-hand-dryer',
          label: 'Hand dryer / paper towel unit (commercial, if present)',
          category: 'fixtures'
        }
      ]
    },
    laundry: {
      standard: [
        {
          itemId: 'eot-laundry-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-laundry-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-exhaust-fan',
          label: 'Exhaust fan',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'eot-laundry-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-laundry-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-laundry-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'eot-laundry-tub-sink',
          label: 'Laundry tub / sink',
          category: 'sink'
        },
        {
          itemId: 'eot-laundry-tapware',
          label: 'Tapware (laundry taps)',
          category: 'sink'
        },
        {
          itemId: 'eot-laundry-splashback',
          label: 'Splashback / wall behind tub',
          category: 'surfaces'
        },
        {
          itemId: 'eot-laundry-benchtop',
          label: 'Benchtop / folding surface',
          category: 'surfaces'
        },
        {
          itemId: 'eot-laundry-cabinet-exterior',
          label: 'Cabinet exterior',
          category: 'storage'
        },
        {
          itemId: 'eot-laundry-cabinet-shelving',
          label: 'Cabinet interior shelving',
          category: 'storage'
        },
        {
          itemId: 'eot-laundry-drawers',
          label: 'Drawers (internal + external)',
          category: 'storage'
        },
        {
          itemId: 'eot-laundry-open-shelving',
          label: 'Open shelving',
          category: 'storage'
        },
        {
          itemId: 'eot-laundry-washer-exterior',
          label: 'Washer exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'eot-laundry-washer-lint-filter',
          label: 'Washer lint filter',
          category: 'appliances'
        },
        {
          itemId: 'eot-laundry-dryer-exterior',
          label: 'Dryer exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'eot-laundry-dryer-lint-trap',
          label: 'Dryer lint trap',
          category: 'appliances'
        },
        {
          itemId: 'eot-laundry-drying-racks',
          label: 'Drying racks / clotheslines (internal)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-ironing-board',
          label: 'Ironing board (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-storage-baskets',
          label: 'Storage baskets / hampers',
          category: 'storage'
        },
        {
          itemId: 'eot-laundry-window-glass',
          label: 'Window glass (internal, if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-laundry-window-frame',
          label: 'Window frame / sill (if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-laundry-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-floor-vacuum',
          label: 'Floor ΓÇô vacuum',
          category: 'floors'
        },
        {
          itemId: 'eot-laundry-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-laundry-floor-drain',
          label: 'Floor drain (if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-laundry-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-laundry-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
    },
    living_area: {
      standard: [
        {
          itemId: 'eot-living-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-living-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-ceiling-fans',
          label: 'Ceiling fans (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'eot-living-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-living-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-living-door-handles',
          label: 'Door handles',
          category: 'doors'
        },
        {
          itemId: 'eot-living-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-window-glass',
          label: 'Windows (internal glass)',
          category: 'windows'
        },
        {
          itemId: 'eot-living-window-frames',
          label: 'Window frames',
          category: 'windows'
        },
        {
          itemId: 'eot-living-window-sills',
          label: 'Window sills',
          category: 'windows'
        },
        {
          itemId: 'eot-living-curtains-blinds',
          label: 'Curtains / blinds (dusting only)',
          category: 'windows'
        },
        {
          itemId: 'eot-living-built-in-shelving',
          label: 'Built-in shelving',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-freestanding-shelving',
          label: 'Freestanding shelving',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-tv-unit',
          label: 'TV unit / media cabinet',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-cabinets-sideboards',
          label: 'Cabinets / sideboards',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-tables',
          label: 'Tables / coffee tables',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-chairs',
          label: 'Chairs / seating (external wipe)',
          category: 'furniture'
        },
        {
          itemId: 'eot-living-fireplace-surround',
          label: 'Fireplace surround (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-heater-unit',
          label: 'Heater / heat pump unit',
          category: 'fixtures'
        },
        {
          itemId: 'eot-living-stair-treads',
          label: 'Stair treads (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-stair-risers',
          label: 'Stair risers',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-stair-edges',
          label: 'Stair edges / nosing',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-bannisters-handrails',
          label: 'Bannisters / handrails',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-staircase-underside',
          label: 'Staircase underside (dusting)',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-stair-lift-rail',
          label: 'Stair lift rail (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-stair-lift-chair',
          label: 'Stair lift chair (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-living-floor-vacuum',
          label: 'Floor ΓÇô vacuum (carpet)',
          category: 'floors'
        },
        {
          itemId: 'eot-living-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-living-floor-edges',
          label: 'Floor edges / corners',
          category: 'floors'
        },
        {
          itemId: 'eot-living-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
    },
    entryway: {
      standard: [
        {
          itemId: 'eot-entryway-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-entryway-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'eot-entryway-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-entryway-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-entryway-door-handles',
          label: 'Door handles',
          category: 'doors'
        },
        {
          itemId: 'eot-entryway-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-shoe-storage',
          label: 'Built-in shoe storage / cubbies (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-entryway-coat-hooks',
          label: 'Coat hooks / coat rack (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-console-table',
          label: 'Console table / side table (if present)',
          category: 'furniture'
        },
        {
          itemId: 'eot-entryway-mirror',
          label: 'Mirror (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-window-glass',
          label: 'Windows (internal glass, if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-entryway-window-frames',
          label: 'Window frames / sills (if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-entryway-stair-treads',
          label: 'Stair treads (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-entryway-stair-risers',
          label: 'Stair risers (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-entryway-bannisters',
          label: 'Bannisters / handrails (if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-entryway-stair-underside',
          label: 'Stair underside (dusting, if present)',
          category: 'stairs'
        },
        {
          itemId: 'eot-entryway-heater-unit',
          label: 'Heater / heat pump unit (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-entryway-floor-vacuum',
          label: 'Floor ΓÇô vacuum (carpet)',
          category: 'floors'
        },
        {
          itemId: 'eot-entryway-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-entryway-floor-edges',
          label: 'Floor edges / corners',
          category: 'floors'
        }
      ]
    },
    basement: {
      standard: [
        {
          itemId: 'eot-basement-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-basement-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-exposed-beams',
          label: 'Exposed beams / pipes (dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-walls',
          label: 'Walls (spot clean marks / moisture residue)',
          category: 'walls'
        },
        {
          itemId: 'eot-basement-skirting-boards',
          label: 'Skirting boards (if present)',
          category: 'trim'
        },
        {
          itemId: 'eot-basement-doors',
          label: 'Doors (front + back, if present)',
          category: 'doors'
        },
        {
          itemId: 'eot-basement-door-handles',
          label: 'Door handles',
          category: 'doors'
        },
        {
          itemId: 'eot-basement-window-glass',
          label: 'Windows (internal glass, if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-basement-window-frames',
          label: 'Window frames / sills (if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-basement-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-dehumidifier',
          label: 'Dehumidifier unit exterior (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-hvac-unit',
          label: 'Heater / HVAC unit exterior (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-shelving',
          label: 'Shelving (open shelves)',
          category: 'storage'
        },
        {
          itemId: 'eot-basement-storage-racks',
          label: 'Storage racks',
          category: 'storage'
        },
        {
          itemId: 'eot-basement-cabinets-exterior',
          label: 'Cabinets exterior (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-basement-cabinets-shelving',
          label: 'Cabinets interior shelving (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-basement-workbench',
          label: 'Workbench / utility bench (if present)',
          category: 'surfaces'
        },
        {
          itemId: 'eot-basement-electrical-panel',
          label: 'Electrical panel exterior (utility rooms, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-water-heater',
          label: 'Water heater / boiler exterior (utility rooms, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-pipes-valves',
          label: 'Pipes / valves accessible surfaces (dusting only, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-concrete-sweep',
          label: 'Concrete floor ΓÇô sweep',
          category: 'floors'
        },
        {
          itemId: 'eot-basement-concrete-mop',
          label: 'Concrete floor ΓÇô mop (if applicable)',
          category: 'floors'
        },
        {
          itemId: 'eot-basement-floor-vacuum',
          label: 'Floor ΓÇô vacuum (carpet, if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-basement-floor-mop',
          label: 'Floor ΓÇô mop (hard surface, if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-basement-floor-drain',
          label: 'Floor drain (if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-basement-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-mirrors',
          label: 'Mirrors (gym / theater, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-basement-equipment-exterior',
          label: 'Equipment exterior wipe (gym/theater/laundry station, if present)',
          category: 'fixtures'
        }
      ]
    },
    utility_special: {
      standard: [
        {
          itemId: 'eot-utility-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-utility-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'eot-utility-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-utility-doors',
          label: 'Doors (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-utility-door-handles',
          label: 'Door handles',
          category: 'doors'
        },
        {
          itemId: 'eot-utility-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-shelving',
          label: 'Shelving (open shelves)',
          category: 'storage'
        },
        {
          itemId: 'eot-utility-cabinets-exterior',
          label: 'Cabinets exterior (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-utility-cabinets-shelving',
          label: 'Cabinets interior shelving (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-utility-storage-bins',
          label: 'Storage bins / hampers (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-utility-sauna-benches',
          label: 'Sauna benches (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-sauna-walls',
          label: 'Sauna walls / interior wood surfaces (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-sauna-heater',
          label: 'Sauna heater exterior (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-steam-benches',
          label: 'Steam room benches (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-steam-walls',
          label: 'Steam room walls (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-steam-floor',
          label: 'Steam room floor (if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-utility-garage-sweep',
          label: 'Garage floor ΓÇô sweep (if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-utility-garage-spot-mop',
          label: 'Garage floor ΓÇô spot mop (optional, if present)',
          category: 'floors'
        },
        {
          itemId: 'eot-utility-garage-shelves',
          label: 'Garage shelves / racks (if present)',
          category: 'storage'
        },
        {
          itemId: 'eot-utility-garage-door-track',
          label: 'Garage door track accessible surfaces (dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-utility-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
    },
    home_office: {
      standard: [
        {
          itemId: 'eot-office-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'eot-office-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'eot-office-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'eot-office-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'eot-office-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'eot-office-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-desk-surface',
          label: 'Desk surface (dry wipe)',
          category: 'furniture'
        },
        {
          itemId: 'eot-office-desk-drawers',
          label: 'Desk drawers (external + internal, if applicable)',
          category: 'furniture'
        },
        {
          itemId: 'eot-office-filing-cabinet',
          label: 'Filing cabinet exterior (if present)',
          category: 'furniture'
        },
        {
          itemId: 'eot-office-shelving',
          label: 'Shelving / bookcases',
          category: 'furniture'
        },
        {
          itemId: 'eot-office-monitor-screens',
          label: 'Monitor screens (dry cloth only, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-keyboard-mouse',
          label: 'Keyboard / mouse surfaces (dry wipe only, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-printers-devices',
          label: 'Printers / devices exterior (dry wipe only, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-chair',
          label: 'Chair (external wipe)',
          category: 'furniture'
        },
        {
          itemId: 'eot-office-window-glass',
          label: 'Windows (internal glass, if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-office-window-frames',
          label: 'Window frames / sills (if present)',
          category: 'windows'
        },
        {
          itemId: 'eot-office-curtains-blinds',
          label: 'Curtains / blinds (dusting only)',
          category: 'windows'
        },
        {
          itemId: 'eot-office-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-office-floor-vacuum',
          label: 'Floor ΓÇô vacuum (carpet)',
          category: 'floors'
        },
        {
          itemId: 'eot-office-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'eot-office-floor-edges',
          label: 'Floor edges / corners',
          category: 'floors'
        }
      ]
    },
    outdoor: {
      standard: [
        {
          itemId: 'eot-outdoor-furniture',
          label: 'Outdoor furniture (wipe down, if present)',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-railings',
          label: 'Railings / balustrades',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-deck-sweep',
          label: 'Deck boards / surface ΓÇô sweep',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-deck-mop',
          label: 'Deck boards / surface ΓÇô mop (if applicable)',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-patio-sweep',
          label: 'Patio surface ΓÇô sweep',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-patio-mop',
          label: 'Patio surface ΓÇô mop (if applicable)',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-steps-sweep',
          label: 'Outdoor steps ΓÇô sweep',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-steps-edges',
          label: 'Outdoor steps ΓÇô edges/corners',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-pool-sweep',
          label: 'Pool surround ΓÇô sweep',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-pool-spot-wash',
          label: 'Pool surround ΓÇô spot wash',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-shed-floor',
          label: 'Outdoor storage shed floor ΓÇô sweep',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-shed-shelves',
          label: 'Outdoor storage shed shelves (wipe, if present)',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-external-doors',
          label: 'External doors (accessible surfaces, if present)',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-external-door-handles',
          label: 'External door handles',
          category: 'outdoor'
        },
        {
          itemId: 'eot-outdoor-cobweb-sweep',
          label: 'Cobweb sweep (corners/eaves within reach, if applicable)',
          category: 'outdoor'
        }
      ]
    },
    property_wide: {
      standard: [
        {
          itemId: 'eot-property-wide-vacuum',
          label: 'Property-wide floors vacuum (carpet areas)',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-mop',
          label: 'Property-wide floors mop (hard surface areas)',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-floor-edges',
          label: 'Property-wide floors edges/corners pass',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-windows',
          label: 'Property-wide internal windows (if included in service scope)',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-window-frames',
          label: 'Property-wide internal window frames/sills (if included)',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-spot-marks',
          label: 'Property-wide spot marks (walls/doors) sweep pass',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-walkthrough',
          label: 'Final walkthrough / quality check',
          category: 'property_wide'
        },
        {
          itemId: 'eot-property-wide-waste',
          label: 'Waste removal / bin liners (if included)',
          category: 'property_wide'
        }
      ]
    },
    kitchen: {
      standard: [
        {
          itemId: 'eot-kitchen-benchtops',
          label: 'Benchtops (laminate / stainless steel)',
          category: 'surfaces'
        },
        {
          itemId: 'eot-kitchen-bench-edges',
          label: 'Bench edges & joins',
          category: 'surfaces'
        },
        {
          itemId: 'eot-kitchen-splashback',
          label: 'Splashback (tiles or metal backing)',
          category: 'surfaces'
        },
        {
          itemId: 'eot-kitchen-bench-corners',
          label: 'Bench corners & wall junctions',
          category: 'surfaces'
        },
        {
          itemId: 'eot-kitchen-sink-bowls',
          label: 'Sink bowls (single / double)',
          category: 'sink'
        },
        {
          itemId: 'eot-kitchen-sink-drains',
          label: 'Sink drains & strainers',
          category: 'sink'
        },
        {
          itemId: 'eot-kitchen-taps',
          label: 'Taps / mixer',
          category: 'sink'
        },
        {
          itemId: 'eot-kitchen-tap-bases',
          label: 'Tap bases & splash zone',
          category: 'sink'
        },
        {
          itemId: 'eot-kitchen-under-sink-cupboard',
          label: 'Under-sink cupboard (external)',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-pipe-visible',
          label: 'Pipe visible areas (if accessible)',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-lower-cupboards',
          label: 'Lower cupboards (doors)',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-upper-cupboards',
          label: 'Upper cupboards (doors)',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-drawer-fronts',
          label: 'Drawer fronts',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-drawer-handles',
          label: 'Drawer handles',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-cupboard-handles',
          label: 'Cupboard handles',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-kickboards',
          label: 'Kickboards / toe-kicks',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-cupboard-sides',
          label: 'External cupboard sides',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-cupboard-tops',
          label: 'Cupboard tops (where exposed)',
          category: 'cupboards'
        },
        {
          itemId: 'eot-kitchen-oven-exterior',
          label: 'Oven exterior',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-oven-door-outside',
          label: 'Oven door (outside)',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-oven-handle',
          label: 'Oven handle',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-oven-knobs',
          label: 'Oven control knobs',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-cooktop',
          label: 'Cooktop / hotplates',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-cooktop-elements',
          label: 'Cooktop rings / elements',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-drip-trays',
          label: 'Cooktop drip trays (if applicable)',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-stove-splashback',
          label: 'Stove splashback panel (metal / tile)',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-rangehood-exterior',
          label: 'Rangehood exterior',
          category: 'rangehood'
        },
        {
          itemId: 'eot-kitchen-rangehood-underside',
          label: 'Rangehood underside',
          category: 'rangehood'
        },
        {
          itemId: 'eot-kitchen-rangehood-filters',
          label: 'Grease filters (external surface)',
          category: 'rangehood'
        },
        {
          itemId: 'eot-kitchen-rangehood-light-covers',
          label: 'Light covers (if reachable)',
          category: 'rangehood'
        },
        {
          itemId: 'eot-kitchen-rangehood-wall-area',
          label: 'Surrounding wall area',
          category: 'rangehood'
        },
        {
          itemId: 'eot-kitchen-fridge-exterior',
          label: 'Refrigerator exterior',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-fridge-handles',
          label: 'Fridge door handles',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-microwave-exterior',
          label: 'Microwave exterior',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-kettle-exterior',
          label: 'Kettle exterior',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-dishwasher-exterior',
          label: 'Dishwasher exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-appliance-bases',
          label: 'Appliance bases (where visible)',
          category: 'appliances'
        },
        {
          itemId: 'eot-kitchen-painted-walls',
          label: 'Painted walls (wipe-down)',
          category: 'walls'
        },
        {
          itemId: 'eot-kitchen-tiles-grout',
          label: 'Tiles & grout',
          category: 'walls'
        },
        {
          itemId: 'eot-kitchen-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'eot-kitchen-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'eot-kitchen-safety-signage',
          label: 'Safety signage (wipe only)',
          category: 'fixtures'
        },
        {
          itemId: 'eot-kitchen-fire-extinguisher',
          label: 'Fire extinguisher exterior',
          category: 'fixtures'
        },
        {
          itemId: 'eot-kitchen-floor',
          label: 'Kitchen floor (vinyl / tile)',
          category: 'floors'
        },
        {
          itemId: 'eot-kitchen-floor-edges',
          label: 'Floor edges & corners',
          category: 'floors'
        },
        {
          itemId: 'eot-kitchen-under-bench-floor',
          label: 'Under-bench floor areas',
          category: 'floors'
        },
        {
          itemId: 'eot-kitchen-bins',
          label: 'Bins (external)',
          category: 'waste'
        },
        {
          itemId: 'eot-kitchen-bin-lids',
          label: 'Bin lids',
          category: 'waste'
        }
      ]
    }
  },
  residential: {
    bedroom: {
      standard: [
        {
          itemId: 'res-bedroom-walls',
          label: 'Walls (spot clean marks, scuffs)',
          category: 'walls'
        },
        {
          itemId: 'res-bedroom-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'res-bedroom-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'res-bedroom-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'res-bedroom-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'res-bedroom-wardrobe-exterior',
          label: 'Wardrobe exterior',
          category: 'wardrobe'
        },
        {
          itemId: 'res-bedroom-wardrobe-shelving',
          label: 'Wardrobe interior shelving',
          category: 'wardrobe'
        },
        {
          itemId: 'res-bedroom-wardrobe-hanging-rail',
          label: 'Wardrobe hanging rail',
          category: 'wardrobe'
        },
        {
          itemId: 'res-bedroom-drawers',
          label: 'Drawers (internal + external)',
          category: 'storage'
        },
        {
          itemId: 'res-bedroom-window-glass',
          label: 'Windows (internal glass)',
          category: 'windows'
        },
        {
          itemId: 'res-bedroom-window-frames',
          label: 'Window frames',
          category: 'windows'
        },
        {
          itemId: 'res-bedroom-window-sills',
          label: 'Window sills',
          category: 'windows'
        },
        {
          itemId: 'res-bedroom-curtains-blinds',
          label: 'Curtains / blinds (dusting only)',
          category: 'windows'
        },
        {
          itemId: 'res-bedroom-bed-frame',
          label: 'Bed frame',
          category: 'furniture'
        },
        {
          itemId: 'res-bedroom-mattress-edges',
          label: 'Mattress (vacuum edges only)',
          category: 'furniture'
        },
        {
          itemId: 'res-bedroom-bedside-tables',
          label: 'Bedside tables',
          category: 'furniture'
        },
        {
          itemId: 'res-bedroom-desks-dressers',
          label: 'Desks / dressers',
          category: 'furniture'
        },
        {
          itemId: 'res-bedroom-shelving',
          label: 'Shelving (open shelves)',
          category: 'furniture'
        },
        {
          itemId: 'res-bedroom-mirrors',
          label: 'Mirrors',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-floor-vacuum',
          label: 'Floor ΓÇô vacuum',
          category: 'floors'
        },
        {
          itemId: 'res-bedroom-floor-mop',
          label: 'Floor ΓÇô mop (if hard surface)',
          category: 'floors'
        },
        {
          itemId: 'res-bedroom-carpet-edges',
          label: 'Floor ΓÇô carpet edges',
          category: 'floors'
        },
        {
          itemId: 'res-bedroom-heater-unit',
          label: 'Heater / heat pump unit',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        },
        {
          itemId: 'res-bedroom-ceiling-fan',
          label: 'Ceiling fan (if present)',
          category: 'fixtures'
        }
      ]
    },
    bathroom: {
      standard: [
        {
          itemId: 'res-bathroom-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'res-bathroom-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'res-bathroom-exhaust-fan',
          label: 'Exhaust fan',
          category: 'fixtures'
        },
        {
          itemId: 'res-bathroom-walls',
          label: 'Walls (spot clean marks, moisture residue)',
          category: 'walls'
        },
        {
          itemId: 'res-bathroom-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'res-bathroom-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'res-bathroom-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'res-bathroom-toilet-pan-internal',
          label: 'Toilet ΓÇô pan (internal)',
          category: 'toilet'
        },
        {
          itemId: 'res-bathroom-toilet-pan-external',
          label: 'Toilet ΓÇô pan (external)',
          category: 'toilet'
        },
        {
          itemId: 'res-bathroom-toilet-seat',
          label: 'Toilet seat (top + underside)',
          category: 'toilet'
        },
        {
          itemId: 'res-bathroom-toilet-cistern',
          label: 'Toilet cistern',
          category: 'toilet'
        },
        {
          itemId: 'res-bathroom-toilet-base',
          label: 'Toilet base / floor seal',
          category: 'toilet'
        },
        {
          itemId: 'res-bathroom-sink-basin',
          label: 'Sink / basin',
          category: 'sink'
        },
        {
          itemId: 'res-bathroom-tapware',
          label: 'Tapware (sink taps)',
          category: 'sink'
        },
        {
          itemId: 'res-bathroom-vanity-exterior',
          label: 'Vanity exterior',
          category: 'vanity'
        },
        {
          itemId: 'res-bathroom-vanity-shelving',
          label: 'Vanity interior shelving',
          category: 'vanity'
        },
        {
          itemId: 'res-bathroom-drawers',
          label: 'Drawers (internal + external)',
          category: 'vanity'
        },
        {
          itemId: 'res-bathroom-mirror',
          label: 'Mirror',
          category: 'fixtures'
        },
        {
          itemId: 'res-bathroom-shower-glass',
          label: 'Shower glass / screen',
          category: 'shower'
        },
        {
          itemId: 'res-bathroom-shower-frame',
          label: 'Shower frame / seals',
          category: 'shower'
        },
        {
          itemId: 'res-bathroom-shower-walls',
          label: 'Shower walls',
          category: 'shower'
        },
        {
          itemId: 'res-bathroom-shower-floor',
          label: 'Shower floor / tray',
          category: 'shower'
        },
        {
          itemId: 'res-bathroom-shower-drain',
          label: 'Shower drain',
          category: 'shower'
        },
        {
          itemId: 'res-bathroom-bathtub',
          label: 'Bathtub (if present)',
          category: 'bath'
        },
        {
          itemId: 'res-bathroom-bathtub-tapware',
          label: 'Bathtub tapware',
          category: 'bath'
        },
        {
          itemId: 'res-bathroom-tile-grout-walls',
          label: 'Tile grout (walls)',
          category: 'tiles'
        },
        {
          itemId: 'res-bathroom-tile-grout-floors',
          label: 'Tile grout (floors)',
          category: 'tiles'
        },
        {
          itemId: 'res-bathroom-towel-hooks',
          label: 'Towel hooks / rails',
          category: 'fixtures'
        },
        {
          itemId: 'res-bathroom-window-glass',
          label: 'Window glass (internal, if present)',
          category: 'windows'
        },
        {
          itemId: 'res-bathroom-window-frame',
          label: 'Window frame / sill (if present)',
          category: 'windows'
        },
        {
          itemId: 'res-bathroom-floor-vacuum',
          label: 'Floor ΓÇô vacuum (if applicable)',
          category: 'floors'
        },
        {
          itemId: 'res-bathroom-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'res-bathroom-floor-drain',
          label: 'Floor drain (if present)',
          category: 'floors'
        },
        {
          itemId: 'res-bathroom-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
    },
    kitchen: {
      standard: [
        {
          itemId: 'res-kitchen-benchtops',
          label: 'Benchtops (laminate / stainless steel)',
          category: 'surfaces'
        },
        {
          itemId: 'res-kitchen-bench-edges',
          label: 'Bench edges & joins',
          category: 'surfaces'
        },
        {
          itemId: 'res-kitchen-splashback',
          label: 'Splashback (tiles or metal backing)',
          category: 'surfaces'
        },
        {
          itemId: 'res-kitchen-bench-corners',
          label: 'Bench corners & wall junctions',
          category: 'surfaces'
        },
        {
          itemId: 'res-kitchen-sink-bowls',
          label: 'Sink bowls (single / double)',
          category: 'sink'
        },
        {
          itemId: 'res-kitchen-sink-drains',
          label: 'Sink drains & strainers',
          category: 'sink'
        },
        {
          itemId: 'res-kitchen-taps',
          label: 'Taps / mixer',
          category: 'sink'
        },
        {
          itemId: 'res-kitchen-tap-bases',
          label: 'Tap bases & splash zone',
          category: 'sink'
        },
        {
          itemId: 'res-kitchen-under-sink-cupboard',
          label: 'Under-sink cupboard (external)',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-pipe-visible',
          label: 'Pipe visible areas (if accessible)',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-lower-cupboards',
          label: 'Lower cupboards (doors)',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-upper-cupboards',
          label: 'Upper cupboards (doors)',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-drawer-fronts',
          label: 'Drawer fronts',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-drawer-handles',
          label: 'Drawer handles',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-cupboard-handles',
          label: 'Cupboard handles',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-kickboards',
          label: 'Kickboards / toe-kicks',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-cupboard-sides',
          label: 'External cupboard sides',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-cupboard-tops',
          label: 'Cupboard tops (where exposed)',
          category: 'cupboards'
        },
        {
          itemId: 'res-kitchen-oven-exterior',
          label: 'Oven exterior',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-oven-door-outside',
          label: 'Oven door (outside)',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-oven-handle',
          label: 'Oven handle',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-oven-knobs',
          label: 'Oven control knobs',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-cooktop',
          label: 'Cooktop / hotplates',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-cooktop-elements',
          label: 'Cooktop rings / elements',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-drip-trays',
          label: 'Cooktop drip trays (if applicable)',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-stove-splashback',
          label: 'Stove splashback panel (metal / tile)',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-rangehood-exterior',
          label: 'Rangehood exterior',
          category: 'rangehood'
        },
        {
          itemId: 'res-kitchen-rangehood-underside',
          label: 'Rangehood underside',
          category: 'rangehood'
        },
        {
          itemId: 'res-kitchen-rangehood-filters',
          label: 'Grease filters (external surface)',
          category: 'rangehood'
        },
        {
          itemId: 'res-kitchen-rangehood-light-covers',
          label: 'Light covers (if reachable)',
          category: 'rangehood'
        },
        {
          itemId: 'res-kitchen-rangehood-wall-area',
          label: 'Surrounding wall area',
          category: 'rangehood'
        },
        {
          itemId: 'res-kitchen-fridge-exterior',
          label: 'Refrigerator exterior',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-fridge-handles',
          label: 'Fridge door handles',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-microwave-exterior',
          label: 'Microwave exterior',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-kettle-exterior',
          label: 'Kettle exterior',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-dishwasher-exterior',
          label: 'Dishwasher exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-appliance-bases',
          label: 'Appliance bases (where visible)',
          category: 'appliances'
        },
        {
          itemId: 'res-kitchen-painted-walls',
          label: 'Painted walls (wipe-down)',
          category: 'walls'
        },
        {
          itemId: 'res-kitchen-tiles-grout',
          label: 'Tiles & grout',
          category: 'walls'
        },
        {
          itemId: 'res-kitchen-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'res-kitchen-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'res-kitchen-floor',
          label: 'Kitchen floor (vinyl / tile)',
          category: 'floors'
        },
        {
          itemId: 'res-kitchen-floor-edges',
          label: 'Floor edges & corners',
          category: 'floors'
        },
        {
          itemId: 'res-kitchen-under-bench-floor',
          label: 'Under-bench floor areas',
          category: 'floors'
        },
        {
          itemId: 'res-kitchen-bins',
          label: 'Bins (external)',
          category: 'waste'
        },
        {
          itemId: 'res-kitchen-bin-lids',
          label: 'Bin lids',
          category: 'waste'
        }
      ]
    },
    living_area: {
      standard: [
        {
          itemId: 'res-living-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'res-living-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-ceiling-fans',
          label: 'Ceiling fans (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'res-living-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'res-living-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'res-living-door-handles',
          label: 'Door handles',
          category: 'doors'
        },
        {
          itemId: 'res-living-light-switches',
          label: 'Light switches',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-window-glass',
          label: 'Windows (internal glass)',
          category: 'windows'
        },
        {
          itemId: 'res-living-window-frames',
          label: 'Window frames',
          category: 'windows'
        },
        {
          itemId: 'res-living-window-sills',
          label: 'Window sills',
          category: 'windows'
        },
        {
          itemId: 'res-living-curtains-blinds',
          label: 'Curtains / blinds (dusting only)',
          category: 'windows'
        },
        {
          itemId: 'res-living-built-in-shelving',
          label: 'Built-in shelving',
          category: 'furniture'
        },
        {
          itemId: 'res-living-freestanding-shelving',
          label: 'Freestanding shelving',
          category: 'furniture'
        },
        {
          itemId: 'res-living-tv-unit',
          label: 'TV unit / media cabinet',
          category: 'furniture'
        },
        {
          itemId: 'res-living-cabinets-sideboards',
          label: 'Cabinets / sideboards',
          category: 'furniture'
        },
        {
          itemId: 'res-living-tables',
          label: 'Tables / coffee tables',
          category: 'furniture'
        },
        {
          itemId: 'res-living-chairs',
          label: 'Chairs / seating (external wipe)',
          category: 'furniture'
        },
        {
          itemId: 'res-living-fireplace-surround',
          label: 'Fireplace surround (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-heater-unit',
          label: 'Heater / heat pump unit',
          category: 'fixtures'
        },
        {
          itemId: 'res-living-floor-vacuum',
          label: 'Floor ΓÇô vacuum (carpet)',
          category: 'floors'
        },
        {
          itemId: 'res-living-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'res-living-floor-edges',
          label: 'Floor edges / corners',
          category: 'floors'
        },
        {
          itemId: 'res-living-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
    },
    laundry: {
      standard: [
        {
          itemId: 'res-laundry-ceiling-cobwebs',
          label: 'Ceiling (cobwebs)',
          category: 'ceiling'
        },
        {
          itemId: 'res-laundry-light-fittings',
          label: 'Light fittings',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-exhaust-fan',
          label: 'Exhaust fan',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-walls',
          label: 'Walls (spot clean marks)',
          category: 'walls'
        },
        {
          itemId: 'res-laundry-skirting-boards',
          label: 'Skirting boards',
          category: 'trim'
        },
        {
          itemId: 'res-laundry-door',
          label: 'Door (front + back)',
          category: 'doors'
        },
        {
          itemId: 'res-laundry-door-handle',
          label: 'Door handle',
          category: 'doors'
        },
        {
          itemId: 'res-laundry-tub-sink',
          label: 'Laundry tub / sink',
          category: 'sink'
        },
        {
          itemId: 'res-laundry-tapware',
          label: 'Tapware (laundry taps)',
          category: 'sink'
        },
        {
          itemId: 'res-laundry-splashback',
          label: 'Splashback / wall behind tub',
          category: 'surfaces'
        },
        {
          itemId: 'res-laundry-benchtop',
          label: 'Benchtop / folding surface',
          category: 'surfaces'
        },
        {
          itemId: 'res-laundry-cabinet-exterior',
          label: 'Cabinet exterior',
          category: 'storage'
        },
        {
          itemId: 'res-laundry-cabinet-shelving',
          label: 'Cabinet interior shelving',
          category: 'storage'
        },
        {
          itemId: 'res-laundry-drawers',
          label: 'Drawers (internal + external)',
          category: 'storage'
        },
        {
          itemId: 'res-laundry-open-shelving',
          label: 'Open shelving',
          category: 'storage'
        },
        {
          itemId: 'res-laundry-washer-exterior',
          label: 'Washer exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'res-laundry-washer-lint-filter',
          label: 'Washer lint filter',
          category: 'appliances'
        },
        {
          itemId: 'res-laundry-dryer-exterior',
          label: 'Dryer exterior (if present)',
          category: 'appliances'
        },
        {
          itemId: 'res-laundry-dryer-lint-trap',
          label: 'Dryer lint trap',
          category: 'appliances'
        },
        {
          itemId: 'res-laundry-drying-racks',
          label: 'Drying racks / clotheslines (internal)',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-ironing-board',
          label: 'Ironing board (if present)',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-storage-baskets',
          label: 'Storage baskets / hampers',
          category: 'storage'
        },
        {
          itemId: 'res-laundry-window-glass',
          label: 'Window glass (internal, if present)',
          category: 'windows'
        },
        {
          itemId: 'res-laundry-window-frame',
          label: 'Window frame / sill (if present)',
          category: 'windows'
        },
        {
          itemId: 'res-laundry-power-points',
          label: 'Power points',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-floor-vacuum',
          label: 'Floor ΓÇô vacuum',
          category: 'floors'
        },
        {
          itemId: 'res-laundry-floor-mop',
          label: 'Floor ΓÇô mop (hard surface)',
          category: 'floors'
        },
        {
          itemId: 'res-laundry-floor-drain',
          label: 'Floor drain (if present)',
          category: 'floors'
        },
        {
          itemId: 'res-laundry-air-vents',
          label: 'Air vents',
          category: 'fixtures'
        },
        {
          itemId: 'res-laundry-smoke-alarm',
          label: 'Smoke alarm (external dusting, if present)',
          category: 'fixtures'
        }
      ]
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
