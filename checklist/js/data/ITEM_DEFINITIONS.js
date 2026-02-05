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

const VARIANTS = {
  floor_types: [
    { value: 'carpet', label: 'Carpet' },
    { value: 'lino', label: 'Lino/Vinyl' },
    { value: 'tile', label: 'Tile' },
    { value: 'wood', label: 'Wood' },
    { value: 'concrete', label: 'Concrete/Sealed' },
    { value: 'other', label: 'Other' }
  ],
  floor_variants: [
    { value: 'carpet', label: 'Carpet' },
    { value: 'lino', label: 'Lino/Vinyl' },
    { value: 'tile', label: 'Tile' },
    { value: 'wood', label: 'Wood' },
    { value: 'concrete', label: 'Concrete/Sealed' },
    { value: 'other', label: 'Other' }
  ],
  oven_variants: [
    { value: 'single-1', label: '1 × Single oven' },
    { value: 'single-2', label: '2 × Single ovens' },
    { value: 'double-1', label: '1 × Double oven' }
  ]
};

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
    // SALES FLOOR ITEMS
    // ============================================================
    sales_floor: {
      sales_floor_area_100m2: {
        itemId: 'site-sales_floor_area',
        label: 'Sales floor area (100m²)',
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
        label: 'Stockroom area (50m²)',
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
        label: 'Locker room area (50m²)',
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
      // Alias keys (clear intent) — kept alongside legacy keys for compatibility
      // frontage_sweep_100m2 ≈ open_carpark
      // full_sweep_500m2 ≈ covered_carpark

      open_carpark: {
        itemId: 'site-carpark_open',
        label: 'Front/entry area sweep (100m²)',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_front_entry_areas_100m2',
        priceSetting: 'carpark_open_price',
        price: 40,
        baseHours: 0.5,
        optional: true,
        description: 'Sweep/blow off debris around entrances and immediate frontage (100m² blocks).',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['leaf_blower', 'broom'],
        staffCount: 1
      },

      frontage_sweep_100m2: {
        itemId: 'site-carpark_frontage_sweep',
        label: 'Front/entry area sweep (100m²)',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_front_entry_areas_100m2',
        priceSetting: 'carpark_open_price',
        price: 40,
        baseHours: 0.5,
        optional: true,
        description: 'Sweep/blow off debris around entrances and immediate frontage (100m² blocks).',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['leaf_blower', 'broom'],
        staffCount: 1
      },

      covered_carpark: {
        itemId: 'site-carpark_covered',
        label: 'Full carpark sweep (500m²)',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_carpark_areas_500m2',
        priceSetting: 'carpark_covered_price',
        price: 180,
        baseHours: 2.0,
        optional: true,
        description: 'Full carpark sweep/blow (500m² blocks). Typically requires a sweeper/blower machine (not a broom).',
        note: 'If weekly/recurring, quote as a recurring service. Sweeper/blower machine rental may be required.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['sweeper_machine_rental', 'leaf_blower', 'broom'],
        staffCount: 1
      },

      full_sweep_500m2: {
        itemId: 'site-carpark_full_sweep',
        label: 'Full carpark sweep (500m²)',
        category: 'carpark',
        parameterized: true,
        parameter: 'number_of_carpark_areas_500m2',
        priceSetting: 'carpark_covered_price',
        price: 180,
        baseHours: 2.0,
        optional: true,
        description: 'Full carpark sweep/blow (500m² blocks). Typically requires a sweeper/blower machine (not a broom).',
        note: 'If weekly/recurring, quote as a recurring service. Sweeper/blower machine rental may be required.',
        workType: 'labor',
        skillLevel: 'basic',
        products: ['sweeper_machine_rental', 'leaf_blower', 'broom'],
        staffCount: 1
      },

      street_parking: {
        itemId: 'site-carpark_street',
        label: 'Street parking only',
        category: 'carpark',
        parameterized: false,
        priceSetting: 'carpark_street_price',
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
    },

    // Property-wide items that should appear once (site-scoped)
    all_rooms: {
      floors_vacuum_property: {
        itemId: 'comm_allrooms_floors_vacuum',
        label: 'Property-wide floors vacuum (carpet areas)',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      floors_mop_property: {
        itemId: 'comm_allrooms_floors_mop',
        label: 'Property-wide floors mop (hard surface areas)',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      floors_edges_corners_property: {
        itemId: 'comm_allrooms_floors_edges',
        label: 'Property-wide floors edges/corners pass',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      internal_windows_property: {
        itemId: 'comm_allrooms_windows_internal',
        label: 'Property-wide internal windows (if included in service scope)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      internal_window_frames_property: {
        itemId: 'comm_allrooms_window_frames',
        label: 'Property-wide internal window frames/sills (if included)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      spot_marks_pass_property: {
        itemId: 'comm_allrooms_spot_marks',
        label: 'Property-wide spot marks (walls/doors) sweep pass',
        category: 'walls',
        baseHours: 0,
        optional: true
      },
      dusting_pass_property: {
        itemId: 'comm_allrooms_dusting_pass',
        label: 'Property-wide dusting pass (reachable surfaces)',
        category: 'dust',
        baseHours: 0,
        optional: true
      },
      waste_removal: {
        itemId: 'comm_allrooms_waste_removal',
        label: 'Property-wide waste removal / bin liners (if included)',
        category: 'waste',
        baseHours: 0,
        optional: true
      },
      final_walkthrough: {
        itemId: 'comm_allrooms_final_walkthrough',
        label: 'Final walkthrough / quality check',
        category: 'qa',
        baseHours: 0,
        optional: true
      }
    }
  },

  // ============================================================
  // RESIDENTIAL - Property-wide items
  // ============================================================
  residential: {
    all_rooms: {
      floors_vacuum_property: {
        itemId: 'res_allrooms_floors_vacuum',
        label: 'Property-wide floors vacuum (carpet areas)',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      floors_mop_property: {
        itemId: 'res_allrooms_floors_mop',
        label: 'Property-wide floors mop (hard surface areas)',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      floors_edges_corners_property: {
        itemId: 'res_allrooms_floors_edges',
        label: 'Property-wide floors edges/corners pass',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      internal_windows_property: {
        itemId: 'res_allrooms_windows_internal',
        label: 'Property-wide internal windows (if included in service scope)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      internal_window_frames_property: {
        itemId: 'res_allrooms_window_frames',
        label: 'Property-wide internal window frames/sills (if included)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      spot_marks_pass_property: {
        itemId: 'res_allrooms_spot_marks',
        label: 'Property-wide spot marks (walls/doors) sweep pass',
        category: 'walls',
        baseHours: 0,
        optional: true
      },
      dusting_pass_property: {
        itemId: 'res_allrooms_dusting_pass',
        label: 'Property-wide dusting pass (reachable surfaces)',
        category: 'dust',
        baseHours: 0,
        optional: true
      },
      waste_removal: {
        itemId: 'res_allrooms_waste_removal',
        label: 'Property-wide waste removal / bin liners (if included)',
        category: 'waste',
        baseHours: 0,
        optional: true
      },
      final_walkthrough: {
        itemId: 'res_allrooms_final_walkthrough',
        label: 'Final walkthrough / quality check',
        category: 'qa',
        baseHours: 0,
        optional: true
      }
    }
  },

  // ============================================================
  // END OF TENANCY (EOT) - Room Definitions
  // ============================================================
  eot: {
    // Property-wide items (all rooms)
    all_rooms: {
      floors_edges_corners_property: {
        itemId: 'eot_allrooms_floors_edges',
        label: 'Property-wide floors edges/corners pass',
        category: 'floors',
        baseHours: 0,
        optional: true
      },
      internal_windows_property: {
        itemId: 'eot_allrooms_windows_internal',
        label: 'Property-wide internal windows (if included in service scope)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      internal_window_frames_property: {
        itemId: 'eot_allrooms_window_frames',
        label: 'Property-wide internal window frames/sills (if included)',
        category: 'windows',
        baseHours: 0,
        optional: true
      },
      spot_marks_pass_property: {
        itemId: 'eot_allrooms_spot_marks',
        label: 'Property-wide spot marks (walls/doors) sweep pass',
        category: 'walls',
        baseHours: 0,
        optional: true
      },
      dusting_pass_property: {
        itemId: 'eot_allrooms_dusting_pass',
        label: 'Property-wide dusting pass (reachable surfaces)',
        category: 'dust',
        baseHours: 0,
        optional: true
      },
      ceiling_cobwebs_property: {
        itemId: 'eot_allrooms_ceiling_cobwebs',
        label: 'Property-wide ceiling cobwebs (reachable)',
        category: 'ceiling',
        baseHours: 0,
        optional: true
      },
      light_fittings_property: {
        itemId: 'eot_allrooms_light_fittings',
        label: 'Property-wide light fittings (reachable)',
        category: 'fixtures',
        baseHours: 0,
        optional: true
      },
      final_walkthrough: {
        itemId: 'eot_allrooms_final_walkthrough',
        label: 'Final walkthrough / quality check',
        category: 'qa',
        baseHours: 0,
        optional: true
      },
      waste_removal: {
        itemId: 'eot_allrooms_waste_removal',
        label: 'Waste removal / bin liners (if included)',
        category: 'waste',
        baseHours: 0,
        optional: true
      }
    },

    // EOT – Entryway / Hallway / Circulation
    entryway: {
      ceiling_cobwebs: { itemId: 'eot-entryway-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-entryway-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      walls_spot_clean: { itemId: 'eot-entryway-walls_spot_clean', label: 'Walls (spot clean marks)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-entryway-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },
      doors_front_back: { itemId: 'eot-entryway-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-entryway-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-entryway-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-entryway-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },
      shoe_storage: { itemId: 'eot-entryway-shoe_storage', label: 'Built-in shoe storage / cubbies (if present)', category: 'storage', baseHours: 0, optional: true },
      coat_hooks: { itemId: 'eot-entryway-coat_hooks', label: 'Coat hooks / coat rack (if present)', category: 'fixtures', baseHours: 0, optional: true },
      console_table: { itemId: 'eot-entryway-console_table', label: 'Console table / side table (if present)', category: 'surfaces', baseHours: 0, optional: true },
      mirror: { itemId: 'eot-entryway-mirror', label: 'Mirror (if present)', category: 'glass', baseHours: 0, optional: true },
      windows_internal: { itemId: 'eot-entryway-windows_internal', label: 'Windows (internal glass, if present)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-entryway-window_frames', label: 'Window frames / sills (if present)', category: 'windows', baseHours: 0, optional: true },
      stair_treads: { itemId: 'eot-entryway-stair_treads', label: 'Stair treads (if present)', category: 'stairs', baseHours: 0, optional: true },
      stair_risers: { itemId: 'eot-entryway-stair_risers', label: 'Stair risers (if present)', category: 'stairs', baseHours: 0, optional: true },
      bannisters: { itemId: 'eot-entryway-bannisters', label: 'Bannisters / handrails (if present)', category: 'stairs', baseHours: 0, optional: true },
      stair_underside: { itemId: 'eot-entryway-stair_underside', label: 'Stair underside (dusting, if present)', category: 'stairs', baseHours: 0, optional: true },
      heater_unit: { itemId: 'eot-entryway-heater_unit', label: 'Heater / heat pump unit (if present)', category: 'hvac', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-entryway-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-entryway-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true },
      floor_vacuum: { itemId: 'eot-entryway-floor_vacuum', label: 'Floor – vacuum (carpet)', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-entryway-floor_mop', label: 'Floor – mop (hard surface)', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-entryway-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Basement
    basement: {
      ceiling_cobwebs: { itemId: 'eot-basement-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-basement-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      beams_pipes: { itemId: 'eot-basement-beams_pipes', label: 'Exposed beams / pipes (dusting, if present)', category: 'structure', baseHours: 0, optional: true },
      walls_spot_clean: { itemId: 'eot-basement-walls_spot_clean', label: 'Walls (spot clean marks / moisture residue)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-basement-skirting', label: 'Skirting boards (if present)', category: 'walls', baseHours: 0, optional: true },
      doors_front_back: { itemId: 'eot-basement-doors', label: 'Doors (front + back, if present)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-basement-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      windows_internal: { itemId: 'eot-basement-windows_internal', label: 'Windows (internal glass, if present)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-basement-window_frames', label: 'Window frames / sills (if present)', category: 'windows', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-basement-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      dehumidifier: { itemId: 'eot-basement-dehumidifier', label: 'Dehumidifier unit exterior (if present)', category: 'appliances', baseHours: 0, optional: true },
      hvac_unit: { itemId: 'eot-basement-hvac_unit', label: 'Heater / HVAC unit exterior (if present)', category: 'hvac', baseHours: 0, optional: true },
      shelving: { itemId: 'eot-basement-shelving', label: 'Shelving (open shelves)', category: 'storage', baseHours: 0, optional: true },
      storage_racks: { itemId: 'eot-basement-storage_racks', label: 'Storage racks', category: 'storage', baseHours: 0, optional: true },
      cabinets_exterior: { itemId: 'eot-basement-cabinets_exterior', label: 'Cabinets exterior (if present)', category: 'storage', baseHours: 0, optional: true },
      cabinets_interior: { itemId: 'eot-basement-cabinets_interior', label: 'Cabinets interior shelving (if present)', category: 'storage', baseHours: 0, optional: true },
      workbench: { itemId: 'eot-basement-workbench', label: 'Workbench / utility bench (if present)', category: 'surfaces', baseHours: 0, optional: true },
      electrical_panel: { itemId: 'eot-basement-electrical_panel', label: 'Electrical panel exterior (utility rooms, if present)', category: 'utilities', baseHours: 0, optional: true },
      water_heater: { itemId: 'eot-basement-water_heater', label: 'Water heater / boiler exterior (utility rooms, if present)', category: 'utilities', baseHours: 0, optional: true },
      pipes_valves: { itemId: 'eot-basement-pipes_valves', label: 'Pipes / valves accessible surfaces (dusting only, if present)', category: 'utilities', baseHours: 0, optional: true },
      concrete_sweep: { itemId: 'eot-basement-concrete_sweep', label: 'Concrete floor – sweep', category: 'floors', baseHours: 0, optional: true },
      concrete_mop: { itemId: 'eot-basement-concrete_mop', label: 'Concrete floor – mop (if applicable)', category: 'floors', baseHours: 0, optional: true },
      floor_vacuum: { itemId: 'eot-basement-floor_vacuum', label: 'Floor – vacuum (carpet, if present)', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-basement-floor_mop', label: 'Floor – mop (hard surface, if present)', category: 'floors', baseHours: 0, optional: true },
      floor_drain: { itemId: 'eot-basement-floor_drain', label: 'Floor drain (if present)', category: 'utilities', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-basement-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true },
      mirrors: { itemId: 'eot-basement-mirrors', label: 'Mirrors (gym / theater, if present)', category: 'glass', baseHours: 0, optional: true },
      equipment_wipe: { itemId: 'eot-basement-equipment_wipe', label: 'Equipment exterior wipe (gym/theater/laundry station, if present)', category: 'appliances', baseHours: 0, optional: true }
    },

    // EOT – Kitchen
    kitchen: {
      // Ceiling & Lighting
      ceiling_cobwebs: { itemId: 'eot-kitchen-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-kitchen-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      extractor_fan: { itemId: 'eot-kitchen-extractor_fan', label: 'Extractor fan / exhaust (external)', category: 'hvac', baseHours: 0, optional: true },

      // Walls & Trim
      walls_spot_clean: { itemId: 'eot-kitchen-walls_spot_clean', label: 'Walls (spot clean marks / splashes)', category: 'walls', baseHours: 0, optional: true },
      splashback: { itemId: 'eot-kitchen-splashback', label: 'Splashback (tiles / glass)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-kitchen-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },

      // Doors & Hardware
      doors_front_back: { itemId: 'eot-kitchen-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-kitchen-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-kitchen-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-kitchen-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },

      // Windows
      windows_internal: { itemId: 'eot-kitchen-windows_internal', label: 'Windows (internal glass)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-kitchen-window_frames', label: 'Window frames / sills', category: 'windows', baseHours: 0, optional: true },
      curtains_blinds: { itemId: 'eot-kitchen-curtains_blinds', label: 'Curtains / blinds (dusting only)', category: 'windows', baseHours: 0, optional: true },

      // Counters & Surfaces
      benchtops: { itemId: 'eot-kitchen-benchtops', label: 'Benchtops / counters', category: 'surfaces', baseHours: 0, optional: true },
      breakfast_bar: { itemId: 'eot-kitchen-breakfast_bar', label: 'Breakfast bar (if present)', category: 'surfaces', baseHours: 0, optional: true },

      // Sink Area
      sink_basin: { itemId: 'eot-kitchen-sink_basin', label: 'Sink basin (scrub + polish)', category: 'plumbing', baseHours: 0, optional: true },
      sink_taps: { itemId: 'eot-kitchen-sink_taps', label: 'Sink taps / mixer', category: 'plumbing', baseHours: 0, optional: true },
      sink_drainer: { itemId: 'eot-kitchen-sink_drainer', label: 'Drainer / dish rack area', category: 'plumbing', baseHours: 0, optional: true },
      under_sink: { itemId: 'eot-kitchen-under_sink', label: 'Under sink cabinet (interior)', category: 'storage', baseHours: 0, optional: true },

      // Cabinets & Drawers
      cabinets_exterior: { itemId: 'eot-kitchen-cabinets_exterior', label: 'Cabinet doors / drawer fronts (exterior)', category: 'storage', baseHours: 0, optional: true },
      cabinets_interior: { itemId: 'eot-kitchen-cabinets_interior', label: 'Cabinet interiors (shelves, wipe out)', category: 'storage', baseHours: 0, optional: true },
      drawers_interior: { itemId: 'eot-kitchen-drawers_interior', label: 'Drawer interiors (wipe out)', category: 'storage', baseHours: 0, optional: true },
      cabinet_handles: { itemId: 'eot-kitchen-cabinet_handles', label: 'Cabinet / drawer handles', category: 'storage', baseHours: 0, optional: true },
      pantry_shelves: { itemId: 'eot-kitchen-pantry_shelves', label: 'Pantry shelves (if present)', category: 'storage', baseHours: 0, optional: true },

      // Oven & Stovetop
      oven_exterior: { itemId: 'eot-kitchen-oven_exterior', label: 'Oven exterior (door, handles)', category: 'appliances', baseHours: 0, optional: true },
      oven_interior: { itemId: 'eot-kitchen-oven_interior', label: 'Oven interior (deep clean)', category: 'appliances', baseHours: 0, optional: true },
      oven_racks: { itemId: 'eot-kitchen-oven_racks', label: 'Oven racks / trays', category: 'appliances', baseHours: 0, optional: true },
      oven_glass: { itemId: 'eot-kitchen-oven_glass', label: 'Oven door glass (inside + outside)', category: 'appliances', baseHours: 0, optional: true },
      stovetop: { itemId: 'eot-kitchen-stovetop', label: 'Stovetop / cooktop', category: 'appliances', baseHours: 0, optional: true },
      stovetop_knobs: { itemId: 'eot-kitchen-stovetop_knobs', label: 'Stovetop knobs / controls', category: 'appliances', baseHours: 0, optional: true },
      grill_plate: { itemId: 'eot-kitchen-grill_plate', label: 'Grill plate / drip tray (if present)', category: 'appliances', baseHours: 0, optional: true },

      // Rangehood
      rangehood_exterior: { itemId: 'eot-kitchen-rangehood_exterior', label: 'Rangehood exterior', category: 'appliances', baseHours: 0, optional: true },
      rangehood_filters: { itemId: 'eot-kitchen-rangehood_filters', label: 'Rangehood filters (degrease)', category: 'appliances', baseHours: 0, optional: true },
      rangehood_interior: { itemId: 'eot-kitchen-rangehood_interior', label: 'Rangehood interior (if accessible)', category: 'appliances', baseHours: 0, optional: true },

      // Fridge Space
      fridge_cavity: { itemId: 'eot-kitchen-fridge_cavity', label: 'Fridge cavity / alcove (walls, floor)', category: 'appliances', baseHours: 0, optional: true },
      fridge_exterior: { itemId: 'eot-kitchen-fridge_exterior', label: 'Fridge exterior (if left behind)', category: 'appliances', baseHours: 0, optional: true },
      fridge_interior: { itemId: 'eot-kitchen-fridge_interior', label: 'Fridge interior (if left behind)', category: 'appliances', baseHours: 0, optional: true },
      freezer_interior: { itemId: 'eot-kitchen-freezer_interior', label: 'Freezer interior (if left behind)', category: 'appliances', baseHours: 0, optional: true },

      // Dishwasher
      dishwasher_exterior: { itemId: 'eot-kitchen-dishwasher_exterior', label: 'Dishwasher exterior (door, handles)', category: 'appliances', baseHours: 0, optional: true },
      dishwasher_interior: { itemId: 'eot-kitchen-dishwasher_interior', label: 'Dishwasher interior (wipe out, filter)', category: 'appliances', baseHours: 0, optional: true },

      // Other Appliances
      microwave_exterior: { itemId: 'eot-kitchen-microwave_exterior', label: 'Microwave exterior (if present)', category: 'appliances', baseHours: 0, optional: true },
      microwave_interior: { itemId: 'eot-kitchen-microwave_interior', label: 'Microwave interior (if present)', category: 'appliances', baseHours: 0, optional: true },
      small_appliances: { itemId: 'eot-kitchen-small_appliances', label: 'Small appliances exterior (kettle, toaster, if left)', category: 'appliances', baseHours: 0, optional: true },

      // Waste & Utilities
      bin_area: { itemId: 'eot-kitchen-bin_area', label: 'Bin area / cabinet', category: 'waste', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-kitchen-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-kitchen-smoke_alarm', label: 'Smoke alarm (external dusting)', category: 'safety', baseHours: 0, optional: true },

      // Floors
      floor_sweep: { itemId: 'eot-kitchen-floor_sweep', label: 'Floor – sweep', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-kitchen-floor_mop', label: 'Floor – mop', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-kitchen-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      floor_grout: { itemId: 'eot-kitchen-floor_grout', label: 'Floor grout (spot scrub, if tiled)', category: 'floors', baseHours: 0, optional: true },
      kickboards: { itemId: 'eot-kitchen-kickboards', label: 'Kickboards (under cabinets)', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Utility & Special Rooms
    utility_special: {
      ceiling_cobwebs: { itemId: 'eot-utility-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-utility-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      walls_spot_clean: { itemId: 'eot-utility-walls_spot_clean', label: 'Walls (spot clean marks)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-utility-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },
      doors_front_back: { itemId: 'eot-utility-doors', label: 'Doors (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-utility-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-utility-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-utility-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },
      shelving: { itemId: 'eot-utility-shelving', label: 'Shelving (open shelves)', category: 'storage', baseHours: 0, optional: true },
      cabinets_exterior: { itemId: 'eot-utility-cabinets_exterior', label: 'Cabinets exterior (if present)', category: 'storage', baseHours: 0, optional: true },
      cabinets_interior: { itemId: 'eot-utility-cabinets_interior', label: 'Cabinets interior shelving (if present)', category: 'storage', baseHours: 0, optional: true },
      storage_bins: { itemId: 'eot-utility-storage_bins', label: 'Storage bins / hampers (if present)', category: 'storage', baseHours: 0, optional: true },
      sauna_benches: { itemId: 'eot-utility-sauna_benches', label: 'Sauna benches (if present)', category: 'special', baseHours: 0, optional: true },
      sauna_walls: { itemId: 'eot-utility-sauna_walls', label: 'Sauna walls / interior wood surfaces (if present)', category: 'special', baseHours: 0, optional: true },
      sauna_heater: { itemId: 'eot-utility-sauna_heater', label: 'Sauna heater exterior (if present)', category: 'special', baseHours: 0, optional: true },
      steam_benches: { itemId: 'eot-utility-steam_benches', label: 'Steam room benches (if present)', category: 'special', baseHours: 0, optional: true },
      steam_walls: { itemId: 'eot-utility-steam_walls', label: 'Steam room walls (if present)', category: 'special', baseHours: 0, optional: true },
      steam_floor: { itemId: 'eot-utility-steam_floor', label: 'Steam room floor (if present)', category: 'special', baseHours: 0, optional: true },
      garage_sweep: { itemId: 'eot-utility-garage_sweep', label: 'Garage floor – sweep (if present)', category: 'floors', baseHours: 0, optional: true },
      garage_spot_mop: { itemId: 'eot-utility-garage_spot_mop', label: 'Garage floor – spot mop (optional, if present)', category: 'floors', baseHours: 0, optional: true },
      garage_shelves: { itemId: 'eot-utility-garage_shelves', label: 'Garage shelves / racks (if present)', category: 'storage', baseHours: 0, optional: true },
      garage_door_track: { itemId: 'eot-utility-garage_door_track', label: 'Garage door track accessible surfaces (dusting, if present)', category: 'fixtures', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-utility-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-utility-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true }
    },

    // EOT – Home Office
    home_office: {
      ceiling_cobwebs: { itemId: 'eot-office-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-office-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      walls_spot_clean: { itemId: 'eot-office-walls_spot_clean', label: 'Walls (spot clean marks)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-office-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },
      doors_front_back: { itemId: 'eot-office-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handle: { itemId: 'eot-office-door_handle', label: 'Door handle', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-office-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-office-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },
      desk_surface: { itemId: 'eot-office-desk_surface', label: 'Desk surface (dry wipe)', category: 'surfaces', baseHours: 0, optional: true },
      desk_drawers: { itemId: 'eot-office-desk_drawers', label: 'Desk drawers (external + internal, if applicable)', category: 'storage', baseHours: 0, optional: true },
      filing_cabinet: { itemId: 'eot-office-filing_cabinet', label: 'Filing cabinet exterior (if present)', category: 'storage', baseHours: 0, optional: true },
      shelving_bookcases: { itemId: 'eot-office-shelving', label: 'Shelving / bookcases', category: 'storage', baseHours: 0, optional: true },
      monitor_screens: { itemId: 'eot-office-monitor_screens', label: 'Monitor screens (dry cloth only, if present)', category: 'electronics', baseHours: 0, optional: true },
      keyboard_mouse: { itemId: 'eot-office-keyboard_mouse', label: 'Keyboard / mouse surfaces (dry wipe only, if present)', category: 'electronics', baseHours: 0, optional: true },
      printers_devices: { itemId: 'eot-office-printers_devices', label: 'Printers / devices exterior (dry wipe only, if present)', category: 'electronics', baseHours: 0, optional: true },
      chair_wipe: { itemId: 'eot-office-chair_wipe', label: 'Chair (external wipe)', category: 'furniture', baseHours: 0, optional: true },
      windows_internal: { itemId: 'eot-office-windows_internal', label: 'Windows (internal glass, if present)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-office-window_frames', label: 'Window frames / sills (if present)', category: 'windows', baseHours: 0, optional: true },
      curtains_blinds: { itemId: 'eot-office-curtains_blinds', label: 'Curtains / blinds (dusting only)', category: 'windows', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-office-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-office-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true },
      floor_vacuum: { itemId: 'eot-office-floor_vacuum', label: 'Floor – vacuum (carpet)', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-office-floor_mop', label: 'Floor – mop (hard surface)', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-office-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Outdoor Areas
    outdoor: {
      // ===== DECKING =====
      deck_sweep: { itemId: 'eot-outdoor-deck_sweep', label: 'Decking – sweep', category: 'decking', baseHours: 0, optional: true },
      deck_wash: { itemId: 'eot-outdoor-deck_wash', label: 'Decking – wash / scrub', category: 'decking', baseHours: 0, optional: true },
      deck_mop: { itemId: 'eot-outdoor-deck_mop', label: 'Decking – mop (if applicable)', category: 'decking', baseHours: 0, optional: true },
      deck_oil_stains: { itemId: 'eot-outdoor-deck_oil', label: 'Decking – oil/grease stain spot clean', category: 'decking', baseHours: 0, optional: true },
      deck_gaps: { itemId: 'eot-outdoor-deck_gaps', label: 'Decking gaps – debris removal', category: 'decking', baseHours: 0, optional: true },
      deck_edges: { itemId: 'eot-outdoor-deck_edges', label: 'Decking edges / perimeter', category: 'decking', baseHours: 0, optional: true },

      // ===== PATIO & PAVING =====
      patio_sweep: { itemId: 'eot-outdoor-patio_sweep', label: 'Patio – sweep', category: 'paving', baseHours: 0, optional: true },
      patio_wash: { itemId: 'eot-outdoor-patio_wash', label: 'Patio – wash / hose down', category: 'paving', baseHours: 0, optional: true },
      paving_sweep: { itemId: 'eot-outdoor-paving_sweep', label: 'Paved areas – sweep', category: 'paving', baseHours: 0, optional: true },
      paving_wash: { itemId: 'eot-outdoor-paving_wash', label: 'Paved areas – wash', category: 'paving', baseHours: 0, optional: true },
      concrete_sweep: { itemId: 'eot-outdoor-concrete_sweep', label: 'Concrete areas – sweep', category: 'paving', baseHours: 0, optional: true },
      concrete_wash: { itemId: 'eot-outdoor-concrete_wash', label: 'Concrete areas – wash', category: 'paving', baseHours: 0, optional: true },
      driveway_sweep: { itemId: 'eot-outdoor-driveway_sweep', label: 'Driveway – sweep', category: 'paving', baseHours: 0, optional: true },
      driveway_wash: { itemId: 'eot-outdoor-driveway_wash', label: 'Driveway – wash / hose down', category: 'paving', baseHours: 0, optional: true },
      pathway_sweep: { itemId: 'eot-outdoor-pathway_sweep', label: 'Pathways – sweep', category: 'paving', baseHours: 0, optional: true },

      // ===== STEPS & STAIRS =====
      steps_sweep: { itemId: 'eot-outdoor-steps_sweep', label: 'Outdoor steps – sweep', category: 'steps', baseHours: 0, optional: true },
      steps_wash: { itemId: 'eot-outdoor-steps_wash', label: 'Outdoor steps – wash', category: 'steps', baseHours: 0, optional: true },
      steps_edges: { itemId: 'eot-outdoor-steps_edges', label: 'Step edges / nosings', category: 'steps', baseHours: 0, optional: true },
      handrails: { itemId: 'eot-outdoor-handrails', label: 'Handrails – wipe down', category: 'steps', baseHours: 0, optional: true },

      // ===== PERGOLA & STRUCTURES =====
      pergola_frame: { itemId: 'eot-outdoor-pergola_frame', label: 'Pergola frame – dust / wipe (reachable)', category: 'structures', baseHours: 0, optional: true },
      pergola_cobwebs: { itemId: 'eot-outdoor-pergola_cobwebs', label: 'Pergola – cobweb removal', category: 'structures', baseHours: 0, optional: true },
      pergola_rafters: { itemId: 'eot-outdoor-pergola_rafters', label: 'Pergola rafters / beams (if reachable)', category: 'structures', baseHours: 0, optional: true },
      gazebo_clean: { itemId: 'eot-outdoor-gazebo', label: 'Gazebo – sweep / wipe surfaces', category: 'structures', baseHours: 0, optional: true },
      carport_sweep: { itemId: 'eot-outdoor-carport_sweep', label: 'Carport floor – sweep', category: 'structures', baseHours: 0, optional: true },
      carport_cobwebs: { itemId: 'eot-outdoor-carport_cobwebs', label: 'Carport – cobweb removal', category: 'structures', baseHours: 0, optional: true },
      awning_wipe: { itemId: 'eot-outdoor-awning', label: 'Awning – wipe / dust underside (if reachable)', category: 'structures', baseHours: 0, optional: true },

      // ===== OUTDOOR FURNITURE =====
      outdoor_table: { itemId: 'eot-outdoor-table', label: 'Outdoor table – wipe down', category: 'furniture', baseHours: 0, optional: true },
      outdoor_chairs: { itemId: 'eot-outdoor-chairs', label: 'Outdoor chairs – wipe down', category: 'furniture', baseHours: 0, optional: true },
      outdoor_cushions: { itemId: 'eot-outdoor-cushions', label: 'Outdoor cushions – shake out / wipe', category: 'furniture', baseHours: 0, optional: true },
      sun_loungers: { itemId: 'eot-outdoor-loungers', label: 'Sun loungers – wipe down', category: 'furniture', baseHours: 0, optional: true },
      outdoor_umbrella: { itemId: 'eot-outdoor-umbrella', label: 'Outdoor umbrella – wipe down / fold', category: 'furniture', baseHours: 0, optional: true },
      bench_seats: { itemId: 'eot-outdoor-bench', label: 'Bench seats – wipe down', category: 'furniture', baseHours: 0, optional: true },
      swing_seat: { itemId: 'eot-outdoor-swing', label: 'Swing seat – wipe down (if present)', category: 'furniture', baseHours: 0, optional: true },
      hammock_area: { itemId: 'eot-outdoor-hammock', label: 'Hammock area – tidy (if present)', category: 'furniture', baseHours: 0, optional: true },

      // ===== BBQ & OUTDOOR KITCHEN =====
      bbq_exterior: { itemId: 'eot-outdoor-bbq_ext', label: 'BBQ exterior – wipe down', category: 'bbq', baseHours: 0, optional: true },
      bbq_grill: { itemId: 'eot-outdoor-bbq_grill', label: 'BBQ grill / hotplate – scrub', category: 'bbq', baseHours: 0, optional: true },
      bbq_drip_tray: { itemId: 'eot-outdoor-bbq_drip', label: 'BBQ drip tray – clean out', category: 'bbq', baseHours: 0, optional: true },
      bbq_cover: { itemId: 'eot-outdoor-bbq_cover', label: 'BBQ cover – wipe / shake out', category: 'bbq', baseHours: 0, optional: true },
      outdoor_sink: { itemId: 'eot-outdoor-sink', label: 'Outdoor sink – clean (if present)', category: 'bbq', baseHours: 0, optional: true },
      outdoor_bench_kitchen: { itemId: 'eot-outdoor-kitchen_bench', label: 'Outdoor kitchen bench – wipe', category: 'bbq', baseHours: 0, optional: true },

      // ===== RAILINGS & BALUSTRADES =====
      railings_wipe: { itemId: 'eot-outdoor-railings', label: 'Railings – wipe down', category: 'railings', baseHours: 0, optional: true },
      balustrade_glass: { itemId: 'eot-outdoor-balustrade_glass', label: 'Glass balustrade – clean both sides', category: 'railings', baseHours: 0, optional: true },
      balustrade_posts: { itemId: 'eot-outdoor-balustrade_posts', label: 'Balustrade posts – wipe', category: 'railings', baseHours: 0, optional: true },
      fence_wipe: { itemId: 'eot-outdoor-fence_wipe', label: 'Fence rails – wipe (if applicable)', category: 'railings', baseHours: 0, optional: true },

      // ===== DOORS & ENTRY =====
      external_doors: { itemId: 'eot-outdoor-external_doors', label: 'External doors – wipe', category: 'doors', baseHours: 0, optional: true },
      external_door_handles: { itemId: 'eot-outdoor-door_handles', label: 'External door handles', category: 'doors', baseHours: 0, optional: true },
      sliding_door_tracks: { itemId: 'eot-outdoor-sliding_tracks', label: 'Sliding door tracks – clean out', category: 'doors', baseHours: 0, optional: true },
      front_door_mat: { itemId: 'eot-outdoor-doormat', label: 'Front door mat – shake out / vacuum', category: 'doors', baseHours: 0, optional: true },
      letterbox: { itemId: 'eot-outdoor-letterbox', label: 'Letterbox – wipe (if applicable)', category: 'doors', baseHours: 0, optional: true },

      // ===== WINDOWS & GLASS =====
      external_windows: { itemId: 'eot-outdoor-windows', label: 'External windows – clean (reachable)', category: 'windows', baseHours: 0, optional: true },
      window_frames_ext: { itemId: 'eot-outdoor-window_frames', label: 'External window frames / sills', category: 'windows', baseHours: 0, optional: true },
      window_screens: { itemId: 'eot-outdoor-screens', label: 'Window screens / fly screens – dust', category: 'windows', baseHours: 0, optional: true },

      // ===== LIGHTING & FIXTURES =====
      outdoor_lights: { itemId: 'eot-outdoor-lights', label: 'Outdoor light fittings – wipe', category: 'fixtures', baseHours: 0, optional: true },
      sensor_lights: { itemId: 'eot-outdoor-sensor_lights', label: 'Sensor lights – wipe', category: 'fixtures', baseHours: 0, optional: true },
      solar_lights: { itemId: 'eot-outdoor-solar_lights', label: 'Solar garden lights – wipe', category: 'fixtures', baseHours: 0, optional: true },
      outdoor_powerpoints: { itemId: 'eot-outdoor-powerpoints', label: 'Outdoor power points – wipe', category: 'fixtures', baseHours: 0, optional: true },
      tap_fittings: { itemId: 'eot-outdoor-taps', label: 'Outdoor taps / hose fittings – wipe', category: 'fixtures', baseHours: 0, optional: true },

      // ===== POOL AREA =====
      pool_surround_sweep: { itemId: 'eot-outdoor-pool_sweep', label: 'Pool surround – sweep', category: 'pool', baseHours: 0, optional: true },
      pool_surround_wash: { itemId: 'eot-outdoor-pool_wash', label: 'Pool surround – wash / hose', category: 'pool', baseHours: 0, optional: true },
      pool_fence: { itemId: 'eot-outdoor-pool_fence', label: 'Pool fence / gate – wipe', category: 'pool', baseHours: 0, optional: true },
      pool_gate_latch: { itemId: 'eot-outdoor-pool_latch', label: 'Pool gate latch – check / wipe', category: 'pool', baseHours: 0, optional: true },
      pool_furniture: { itemId: 'eot-outdoor-pool_furniture', label: 'Pool furniture – wipe down', category: 'pool', baseHours: 0, optional: true },

      // ===== SHED & STORAGE =====
      shed_sweep: { itemId: 'eot-outdoor-shed_sweep', label: 'Shed floor – sweep', category: 'shed', baseHours: 0, optional: true },
      shed_shelves: { itemId: 'eot-outdoor-shed_shelves', label: 'Shed shelves – wipe', category: 'shed', baseHours: 0, optional: true },
      shed_cobwebs: { itemId: 'eot-outdoor-shed_cobwebs', label: 'Shed – cobweb removal', category: 'shed', baseHours: 0, optional: true },
      shed_door: { itemId: 'eot-outdoor-shed_door', label: 'Shed door – wipe', category: 'shed', baseHours: 0, optional: true },
      garden_storage_box: { itemId: 'eot-outdoor-storage_box', label: 'Garden storage box – wipe out', category: 'shed', baseHours: 0, optional: true },

      // ===== LAWN & GARDEN =====
      lawn_mow: { itemId: 'eot-outdoor-lawn_mow', label: 'Lawn – mow', category: 'lawn', baseHours: 0, optional: true },
      lawn_edge: { itemId: 'eot-outdoor-lawn_edge', label: 'Lawn edges – trim / whipper-snip', category: 'lawn', baseHours: 0, optional: true },
      lawn_rake: { itemId: 'eot-outdoor-lawn_rake', label: 'Lawn – rake leaves / debris', category: 'lawn', baseHours: 0, optional: true },
      garden_beds_weed: { itemId: 'eot-outdoor-weed', label: 'Garden beds – basic weeding', category: 'garden', baseHours: 0, optional: true },
      garden_beds_tidy: { itemId: 'eot-outdoor-beds_tidy', label: 'Garden beds – tidy up / remove debris', category: 'garden', baseHours: 0, optional: true },
      hedge_trim: { itemId: 'eot-outdoor-hedge_trim', label: 'Hedges – trim / shape', category: 'garden', baseHours: 0, optional: true },
      shrubs_prune: { itemId: 'eot-outdoor-shrubs_prune', label: 'Shrubs – light prune', category: 'garden', baseHours: 0, optional: true },
      tree_branches: { itemId: 'eot-outdoor-tree_branches', label: 'Tree branches – trim overhanging (reachable)', category: 'garden', baseHours: 0, optional: true },
      fallen_leaves: { itemId: 'eot-outdoor-leaves', label: 'Fallen leaves – collect / bag', category: 'garden', baseHours: 0, optional: true },
      green_waste_bag: { itemId: 'eot-outdoor-greenwaste', label: 'Green waste – bag up', category: 'garden', baseHours: 0, optional: true },

      // ===== GUTTERS & DRAINS =====
      gutters_clear: { itemId: 'eot-outdoor-gutters', label: 'Gutters – clear debris (if reachable)', category: 'gutters', baseHours: 0, optional: true },
      downpipes_check: { itemId: 'eot-outdoor-downpipes', label: 'Downpipes – clear / check', category: 'gutters', baseHours: 0, optional: true },
      drain_grates: { itemId: 'eot-outdoor-drain_grates', label: 'Drain grates – clear debris', category: 'gutters', baseHours: 0, optional: true },

      // ===== COBWEBS & GENERAL =====
      cobweb_sweep_eaves: { itemId: 'eot-outdoor-cobwebs_eaves', label: 'Cobwebs – eaves / overhangs (reachable)', category: 'general', baseHours: 0, optional: true },
      cobweb_sweep_corners: { itemId: 'eot-outdoor-cobwebs_corners', label: 'Cobwebs – corners / doorways', category: 'general', baseHours: 0, optional: true },
      bird_mess: { itemId: 'eot-outdoor-bird_mess', label: 'Bird droppings – spot clean', category: 'general', baseHours: 0, optional: true },
      general_debris: { itemId: 'eot-outdoor-debris', label: 'General debris – collect / dispose', category: 'general', baseHours: 0, optional: true },
      rubbish_bins_wipe: { itemId: 'eot-outdoor-bins', label: 'Rubbish bins – wipe exterior', category: 'general', baseHours: 0, optional: true },
      bin_area_sweep: { itemId: 'eot-outdoor-bin_area', label: 'Bin area – sweep / hose', category: 'general', baseHours: 0, optional: true },
      clothesline_wipe: { itemId: 'eot-outdoor-clothesline', label: 'Clothesline – wipe down', category: 'general', baseHours: 0, optional: true },
      hose_tidy: { itemId: 'eot-outdoor-hose', label: 'Hose – coil / tidy', category: 'general', baseHours: 0, optional: true },
      pot_plants_move: { itemId: 'eot-outdoor-pots', label: 'Pot plants – move / sweep underneath', category: 'general', baseHours: 0, optional: true }
    },

    // EOT – Bedroom
    bedroom: {
      // Ceiling & Lighting
      ceiling_cobwebs: { itemId: 'eot-bedroom-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-bedroom-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      ceiling_fan: { itemId: 'eot-bedroom-ceiling_fan', label: 'Ceiling fan (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // Walls & Trim
      walls_spot_clean: { itemId: 'eot-bedroom-walls_spot_clean', label: 'Walls (spot clean marks)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-bedroom-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },
      picture_rails: { itemId: 'eot-bedroom-picture_rails', label: 'Picture rails (if present)', category: 'walls', baseHours: 0, optional: true },

      // Doors & Hardware
      doors_front_back: { itemId: 'eot-bedroom-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-bedroom-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-bedroom-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-bedroom-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },

      // Windows
      windows_internal: { itemId: 'eot-bedroom-windows_internal', label: 'Windows (internal glass)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-bedroom-window_frames', label: 'Window frames / sills', category: 'windows', baseHours: 0, optional: true },
      window_tracks: { itemId: 'eot-bedroom-window_tracks', label: 'Window tracks (sliding, if present)', category: 'windows', baseHours: 0, optional: true },
      curtains_blinds: { itemId: 'eot-bedroom-curtains_blinds', label: 'Curtains / blinds (dusting only)', category: 'windows', baseHours: 0, optional: true },

      // Wardrobe / Closet
      wardrobe_doors_exterior: { itemId: 'eot-bedroom-wardrobe_doors_ext', label: 'Wardrobe doors exterior', category: 'storage', baseHours: 0, optional: true },
      wardrobe_doors_interior: { itemId: 'eot-bedroom-wardrobe_doors_int', label: 'Wardrobe doors interior', category: 'storage', baseHours: 0, optional: true },
      wardrobe_shelves: { itemId: 'eot-bedroom-wardrobe_shelves', label: 'Wardrobe shelves (wipe out)', category: 'storage', baseHours: 0, optional: true },
      wardrobe_drawers: { itemId: 'eot-bedroom-wardrobe_drawers', label: 'Wardrobe drawers (interior)', category: 'storage', baseHours: 0, optional: true },
      wardrobe_rails: { itemId: 'eot-bedroom-wardrobe_rails', label: 'Wardrobe hanging rails', category: 'storage', baseHours: 0, optional: true },
      wardrobe_floor: { itemId: 'eot-bedroom-wardrobe_floor', label: 'Wardrobe floor', category: 'storage', baseHours: 0, optional: true },
      wardrobe_handles: { itemId: 'eot-bedroom-wardrobe_handles', label: 'Wardrobe handles', category: 'storage', baseHours: 0, optional: true },
      wardrobe_mirrors: { itemId: 'eot-bedroom-wardrobe_mirrors', label: 'Wardrobe mirrors (if fitted)', category: 'glass', baseHours: 0, optional: true },

      // Other Storage
      bedside_tables: { itemId: 'eot-bedroom-bedside_tables', label: 'Bedside tables (surface + drawers)', category: 'furniture', baseHours: 0, optional: true },
      dresser_chest: { itemId: 'eot-bedroom-dresser', label: 'Dresser / chest of drawers (if left)', category: 'furniture', baseHours: 0, optional: true },
      shelving: { itemId: 'eot-bedroom-shelving', label: 'Shelving (open shelves)', category: 'storage', baseHours: 0, optional: true },

      // Mirrors & Glass
      mirror_freestanding: { itemId: 'eot-bedroom-mirror_freestanding', label: 'Freestanding / wall mirror', category: 'glass', baseHours: 0, optional: true },

      // HVAC
      heater_unit: { itemId: 'eot-bedroom-heater_unit', label: 'Heater / heat pump unit (if present)', category: 'hvac', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-bedroom-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-bedroom-smoke_alarm', label: 'Smoke alarm (external dusting)', category: 'safety', baseHours: 0, optional: true },

      // Floors
      floor_vacuum: { itemId: 'eot-bedroom-floor_vacuum', label: 'Floor – vacuum (carpet)', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-bedroom-floor_mop', label: 'Floor – mop (hard surface)', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-bedroom-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      under_bed_area: { itemId: 'eot-bedroom-under_bed', label: 'Under bed area (vacuum/mop)', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Bathroom
    bathroom: {
      // Ceiling & Lighting
      ceiling_cobwebs: { itemId: 'eot-bathroom-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-bathroom-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      extractor_fan: { itemId: 'eot-bathroom-extractor_fan', label: 'Extractor fan / exhaust', category: 'hvac', baseHours: 0, optional: true },

      // Walls & Trim
      walls_spot_clean: { itemId: 'eot-bathroom-walls_spot_clean', label: 'Walls (spot clean marks / splashes)', category: 'walls', baseHours: 0, optional: true },
      tiles_walls: { itemId: 'eot-bathroom-tiles_walls', label: 'Wall tiles (full wipe)', category: 'walls', baseHours: 0, optional: true },
      tile_grout_walls: { itemId: 'eot-bathroom-grout_walls', label: 'Tile grout – walls (scrub)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-bathroom-skirting', label: 'Skirting boards (if present)', category: 'walls', baseHours: 0, optional: true },

      // Doors & Hardware
      doors_front_back: { itemId: 'eot-bathroom-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-bathroom-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-bathroom-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-bathroom-power_points', label: 'Power points (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // Windows
      windows_internal: { itemId: 'eot-bathroom-windows_internal', label: 'Window (internal glass)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-bathroom-window_frames', label: 'Window frame / sill', category: 'windows', baseHours: 0, optional: true },
      window_tracks: { itemId: 'eot-bathroom-window_tracks', label: 'Window tracks (if present)', category: 'windows', baseHours: 0, optional: true },
      blinds: { itemId: 'eot-bathroom-blinds', label: 'Blinds (dusting / wipe)', category: 'windows', baseHours: 0, optional: true },

      // Mirror & Vanity
      mirror: { itemId: 'eot-bathroom-mirror', label: 'Mirror', category: 'glass', baseHours: 0, optional: true },
      vanity_top: { itemId: 'eot-bathroom-vanity_top', label: 'Vanity top / counter', category: 'surfaces', baseHours: 0, optional: true },
      vanity_cabinet_exterior: { itemId: 'eot-bathroom-vanity_ext', label: 'Vanity cabinet exterior', category: 'storage', baseHours: 0, optional: true },
      vanity_cabinet_interior: { itemId: 'eot-bathroom-vanity_int', label: 'Vanity cabinet interior (shelves)', category: 'storage', baseHours: 0, optional: true },
      vanity_drawers: { itemId: 'eot-bathroom-vanity_drawers', label: 'Vanity drawers (interior)', category: 'storage', baseHours: 0, optional: true },

      // Sink
      sink_basin: { itemId: 'eot-bathroom-sink_basin', label: 'Sink basin (scrub + polish)', category: 'plumbing', baseHours: 0, optional: true },
      sink_taps: { itemId: 'eot-bathroom-sink_taps', label: 'Sink taps / mixer', category: 'plumbing', baseHours: 0, optional: true },
      sink_drain: { itemId: 'eot-bathroom-sink_drain', label: 'Sink drain / plug hole', category: 'plumbing', baseHours: 0, optional: true },
      sink_overflow: { itemId: 'eot-bathroom-sink_overflow', label: 'Sink overflow (if accessible)', category: 'plumbing', baseHours: 0, optional: true },

      // Toilet
      toilet_exterior: { itemId: 'eot-bathroom-toilet_exterior', label: 'Toilet exterior (cistern, base)', category: 'plumbing', baseHours: 0, optional: true },
      toilet_bowl: { itemId: 'eot-bathroom-toilet_bowl', label: 'Toilet bowl (interior scrub)', category: 'plumbing', baseHours: 0, optional: true },
      toilet_seat: { itemId: 'eot-bathroom-toilet_seat', label: 'Toilet seat (top + underside)', category: 'plumbing', baseHours: 0, optional: true },
      toilet_hinges: { itemId: 'eot-bathroom-toilet_hinges', label: 'Toilet seat hinges', category: 'plumbing', baseHours: 0, optional: true },
      toilet_brush_holder: { itemId: 'eot-bathroom-toilet_brush', label: 'Toilet brush holder (if left)', category: 'plumbing', baseHours: 0, optional: true },

      // Shower
      shower_screen: { itemId: 'eot-bathroom-shower_screen', label: 'Shower screen / glass', category: 'glass', baseHours: 0, optional: true },
      shower_screen_tracks: { itemId: 'eot-bathroom-shower_tracks', label: 'Shower screen tracks / frame', category: 'glass', baseHours: 0, optional: true },
      shower_walls: { itemId: 'eot-bathroom-shower_walls', label: 'Shower walls (tiles)', category: 'walls', baseHours: 0, optional: true },
      shower_grout: { itemId: 'eot-bathroom-shower_grout', label: 'Shower tile grout (scrub)', category: 'walls', baseHours: 0, optional: true },
      shower_floor: { itemId: 'eot-bathroom-shower_floor', label: 'Shower floor', category: 'floors', baseHours: 0, optional: true },
      shower_drain: { itemId: 'eot-bathroom-shower_drain', label: 'Shower drain', category: 'plumbing', baseHours: 0, optional: true },
      shower_taps: { itemId: 'eot-bathroom-shower_taps', label: 'Shower taps / mixer', category: 'plumbing', baseHours: 0, optional: true },
      showerhead: { itemId: 'eot-bathroom-showerhead', label: 'Showerhead', category: 'plumbing', baseHours: 0, optional: true },
      shower_rail: { itemId: 'eot-bathroom-shower_rail', label: 'Shower rail / hose', category: 'plumbing', baseHours: 0, optional: true },
      shower_niche: { itemId: 'eot-bathroom-shower_niche', label: 'Shower niche / shelf (if present)', category: 'storage', baseHours: 0, optional: true },
      shower_curtain_rail: { itemId: 'eot-bathroom-curtain_rail', label: 'Shower curtain rail (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // Bath
      bath_exterior: { itemId: 'eot-bathroom-bath_exterior', label: 'Bathtub exterior / surround', category: 'plumbing', baseHours: 0, optional: true },
      bath_interior: { itemId: 'eot-bathroom-bath_interior', label: 'Bathtub interior (scrub + polish)', category: 'plumbing', baseHours: 0, optional: true },
      bath_taps: { itemId: 'eot-bathroom-bath_taps', label: 'Bath taps / mixer', category: 'plumbing', baseHours: 0, optional: true },
      bath_drain: { itemId: 'eot-bathroom-bath_drain', label: 'Bath drain / plug', category: 'plumbing', baseHours: 0, optional: true },
      bath_overflow: { itemId: 'eot-bathroom-bath_overflow', label: 'Bath overflow (if accessible)', category: 'plumbing', baseHours: 0, optional: true },

      // Fixtures & Accessories
      towel_rails: { itemId: 'eot-bathroom-towel_rails', label: 'Towel rails', category: 'fixtures', baseHours: 0, optional: true },
      heated_towel_rail: { itemId: 'eot-bathroom-heated_rail', label: 'Heated towel rail (if present)', category: 'fixtures', baseHours: 0, optional: true },
      toilet_roll_holder: { itemId: 'eot-bathroom-tp_holder', label: 'Toilet roll holder', category: 'fixtures', baseHours: 0, optional: true },
      soap_dish: { itemId: 'eot-bathroom-soap_dish', label: 'Soap dish / dispenser (if fitted)', category: 'fixtures', baseHours: 0, optional: true },
      hooks: { itemId: 'eot-bathroom-hooks', label: 'Hooks (robe / towel)', category: 'fixtures', baseHours: 0, optional: true },
      shelving: { itemId: 'eot-bathroom-shelving', label: 'Shelving (if present)', category: 'storage', baseHours: 0, optional: true },

      // HVAC & Safety
      heater_unit: { itemId: 'eot-bathroom-heater_unit', label: 'Heater / heat lamp (if present)', category: 'hvac', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-bathroom-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-bathroom-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true },

      // Floors
      floor_sweep: { itemId: 'eot-bathroom-floor_sweep', label: 'Floor – sweep', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-bathroom-floor_mop', label: 'Floor – mop', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-bathroom-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      floor_grout: { itemId: 'eot-bathroom-floor_grout', label: 'Floor grout (scrub)', category: 'floors', baseHours: 0, optional: true },
      floor_drain: { itemId: 'eot-bathroom-floor_drain', label: 'Floor drain (if present)', category: 'plumbing', baseHours: 0, optional: true },
      behind_toilet: { itemId: 'eot-bathroom-behind_toilet', label: 'Behind toilet (floor + wall)', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Living Room / Lounge
    living: {
      // Ceiling & Lighting
      ceiling_cobwebs: { itemId: 'eot-living-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-living-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      ceiling_fan: { itemId: 'eot-living-ceiling_fan', label: 'Ceiling fan (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // Walls & Trim
      walls_spot_clean: { itemId: 'eot-living-walls_spot_clean', label: 'Walls (spot clean marks)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-living-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },
      picture_rails: { itemId: 'eot-living-picture_rails', label: 'Picture rails (if present)', category: 'walls', baseHours: 0, optional: true },
      dado_rails: { itemId: 'eot-living-dado_rails', label: 'Dado rails (if present)', category: 'walls', baseHours: 0, optional: true },

      // Doors & Hardware
      doors_front_back: { itemId: 'eot-living-doors', label: 'Doors (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-living-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-living-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-living-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },

      // Windows
      windows_internal: { itemId: 'eot-living-windows_internal', label: 'Windows (internal glass)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-living-window_frames', label: 'Window frames / sills', category: 'windows', baseHours: 0, optional: true },
      window_tracks: { itemId: 'eot-living-window_tracks', label: 'Window tracks (sliding, if present)', category: 'windows', baseHours: 0, optional: true },
      curtains_blinds: { itemId: 'eot-living-curtains_blinds', label: 'Curtains / blinds (dusting only)', category: 'windows', baseHours: 0, optional: true },

      // Sliding / French Doors
      sliding_door_glass: { itemId: 'eot-living-sliding_glass', label: 'Sliding door glass (if present)', category: 'windows', baseHours: 0, optional: true },
      sliding_door_tracks: { itemId: 'eot-living-sliding_tracks', label: 'Sliding door tracks', category: 'windows', baseHours: 0, optional: true },
      sliding_door_frame: { itemId: 'eot-living-sliding_frame', label: 'Sliding door frame', category: 'windows', baseHours: 0, optional: true },

      // Storage & Shelving
      shelving: { itemId: 'eot-living-shelving', label: 'Shelving (open shelves)', category: 'storage', baseHours: 0, optional: true },
      built_in_cabinets_ext: { itemId: 'eot-living-cabinets_ext', label: 'Built-in cabinets exterior (if present)', category: 'storage', baseHours: 0, optional: true },
      built_in_cabinets_int: { itemId: 'eot-living-cabinets_int', label: 'Built-in cabinets interior (if present)', category: 'storage', baseHours: 0, optional: true },
      tv_unit: { itemId: 'eot-living-tv_unit', label: 'TV unit / entertainment centre (if left)', category: 'furniture', baseHours: 0, optional: true },

      // Fireplace (if present)
      fireplace_surround: { itemId: 'eot-living-fireplace_surround', label: 'Fireplace surround (if present)', category: 'fixtures', baseHours: 0, optional: true },
      fireplace_hearth: { itemId: 'eot-living-fireplace_hearth', label: 'Fireplace hearth (if present)', category: 'fixtures', baseHours: 0, optional: true },
      mantelpiece: { itemId: 'eot-living-mantelpiece', label: 'Mantelpiece (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // Mirrors & Glass
      mirrors: { itemId: 'eot-living-mirrors', label: 'Mirrors (if present)', category: 'glass', baseHours: 0, optional: true },

      // HVAC & Safety
      heater_unit: { itemId: 'eot-living-heater_unit', label: 'Heater / heat pump unit (if present)', category: 'hvac', baseHours: 0, optional: true },
      air_vents: { itemId: 'eot-living-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-living-smoke_alarm', label: 'Smoke alarm (external dusting)', category: 'safety', baseHours: 0, optional: true },

      // Floors
      floor_vacuum: { itemId: 'eot-living-floor_vacuum', label: 'Floor – vacuum (carpet)', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-living-floor_mop', label: 'Floor – mop (hard surface)', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-living-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      floor_under_furniture: { itemId: 'eot-living-floor_under_furniture', label: 'Floor under furniture areas', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Laundry
    laundry: {
      // Ceiling & Lighting
      ceiling_cobwebs: { itemId: 'eot-laundry-ceiling_cobwebs', label: 'Ceiling (cobwebs)', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-laundry-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },

      // Walls & Trim
      walls_spot_clean: { itemId: 'eot-laundry-walls_spot_clean', label: 'Walls (spot clean marks / splashes)', category: 'walls', baseHours: 0, optional: true },
      splashback: { itemId: 'eot-laundry-splashback', label: 'Splashback (if tiled)', category: 'walls', baseHours: 0, optional: true },
      skirting_boards: { itemId: 'eot-laundry-skirting', label: 'Skirting boards', category: 'walls', baseHours: 0, optional: true },

      // Doors & Hardware
      doors_front_back: { itemId: 'eot-laundry-doors', label: 'Door (front + back)', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-laundry-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-laundry-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-laundry-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },

      // Windows
      windows_internal: { itemId: 'eot-laundry-windows_internal', label: 'Window (internal glass, if present)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-laundry-window_frames', label: 'Window frame / sill (if present)', category: 'windows', baseHours: 0, optional: true },

      // Sink / Tub
      laundry_tub: { itemId: 'eot-laundry-tub', label: 'Laundry tub / sink (scrub + polish)', category: 'plumbing', baseHours: 0, optional: true },
      laundry_taps: { itemId: 'eot-laundry-taps', label: 'Laundry taps / mixer', category: 'plumbing', baseHours: 0, optional: true },
      laundry_drain: { itemId: 'eot-laundry-drain', label: 'Laundry drain / plug hole', category: 'plumbing', baseHours: 0, optional: true },

      // Benchtops & Surfaces
      benchtop: { itemId: 'eot-laundry-benchtop', label: 'Benchtop / counter (if present)', category: 'surfaces', baseHours: 0, optional: true },

      // Cabinets & Storage
      cabinets_exterior: { itemId: 'eot-laundry-cabinets_ext', label: 'Cabinet doors exterior', category: 'storage', baseHours: 0, optional: true },
      cabinets_interior: { itemId: 'eot-laundry-cabinets_int', label: 'Cabinet interiors (shelves)', category: 'storage', baseHours: 0, optional: true },
      under_tub_cabinet: { itemId: 'eot-laundry-under_tub', label: 'Under tub cabinet (interior)', category: 'storage', baseHours: 0, optional: true },
      shelving: { itemId: 'eot-laundry-shelving', label: 'Shelving (if present)', category: 'storage', baseHours: 0, optional: true },

      // Appliance Spaces
      washing_machine_cavity: { itemId: 'eot-laundry-washer_cavity', label: 'Washing machine cavity (walls, floor)', category: 'appliances', baseHours: 0, optional: true },
      dryer_cavity: { itemId: 'eot-laundry-dryer_cavity', label: 'Dryer cavity (walls, floor, if separate)', category: 'appliances', baseHours: 0, optional: true },
      washing_machine_exterior: { itemId: 'eot-laundry-washer_ext', label: 'Washing machine exterior (if left behind)', category: 'appliances', baseHours: 0, optional: true },
      dryer_exterior: { itemId: 'eot-laundry-dryer_ext', label: 'Dryer exterior (if left behind)', category: 'appliances', baseHours: 0, optional: true },
      lint_filter_area: { itemId: 'eot-laundry-lint_area', label: 'Lint filter area (if accessible)', category: 'appliances', baseHours: 0, optional: true },
      appliance_hoses: { itemId: 'eot-laundry-hoses', label: 'Appliance hoses / connections (dusting)', category: 'appliances', baseHours: 0, optional: true },

      // Utilities
      hot_water_cylinder: { itemId: 'eot-laundry-hwc', label: 'Hot water cylinder exterior (if present)', category: 'utilities', baseHours: 0, optional: true },
      water_taps_valves: { itemId: 'eot-laundry-valves', label: 'Water taps / isolation valves (dusting)', category: 'utilities', baseHours: 0, optional: true },

      // Drying
      drying_rack_area: { itemId: 'eot-laundry-drying_rack', label: 'Drying rack area (if fitted)', category: 'fixtures', baseHours: 0, optional: true },
      wall_airer: { itemId: 'eot-laundry-wall_airer', label: 'Wall-mounted airer (if present)', category: 'fixtures', baseHours: 0, optional: true },

      // HVAC & Safety
      air_vents: { itemId: 'eot-laundry-air_vents', label: 'Air vents', category: 'hvac', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-laundry-smoke_alarm', label: 'Smoke alarm (external dusting, if present)', category: 'safety', baseHours: 0, optional: true },

      // Floors
      floor_sweep: { itemId: 'eot-laundry-floor_sweep', label: 'Floor – sweep', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-laundry-floor_mop', label: 'Floor – mop', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-laundry-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      floor_drain: { itemId: 'eot-laundry-floor_drain', label: 'Floor drain (if present)', category: 'plumbing', baseHours: 0, optional: true },
      behind_appliances: { itemId: 'eot-laundry-behind_appliances', label: 'Behind appliances (floor)', category: 'floors', baseHours: 0, optional: true }
    },

    // EOT – Garage
    garage: {
      // ===== CEILING & LIGHTING =====
      ceiling_cobwebs: { itemId: 'eot-garage-ceiling_cobwebs', label: 'Ceiling – cobweb removal', category: 'ceiling', baseHours: 0, optional: true },
      light_fittings: { itemId: 'eot-garage-light_fittings', label: 'Light fittings', category: 'fixtures', baseHours: 0, optional: true },
      exposed_beams: { itemId: 'eot-garage-beams', label: 'Exposed beams / rafters (dust, if reachable)', category: 'ceiling', baseHours: 0, optional: true },

      // ===== WALLS =====
      walls_spot_clean: { itemId: 'eot-garage-walls_spot', label: 'Walls – spot clean marks / scuffs', category: 'walls', baseHours: 0, optional: true },
      walls_cobwebs: { itemId: 'eot-garage-walls_cobwebs', label: 'Walls – cobweb removal', category: 'walls', baseHours: 0, optional: true },

      // ===== DOORS =====
      garage_door_interior: { itemId: 'eot-garage-door_int', label: 'Garage door – interior surface wipe', category: 'doors', baseHours: 0, optional: true },
      garage_door_tracks: { itemId: 'eot-garage-door_tracks', label: 'Garage door tracks – clear debris', category: 'doors', baseHours: 0, optional: true },
      garage_door_sensors: { itemId: 'eot-garage-door_sensors', label: 'Garage door sensors – wipe', category: 'doors', baseHours: 0, optional: true },
      internal_door: { itemId: 'eot-garage-internal_door', label: 'Internal access door – front + back', category: 'doors', baseHours: 0, optional: true },
      door_handles: { itemId: 'eot-garage-door_handles', label: 'Door handles', category: 'doors', baseHours: 0, optional: true },
      light_switches: { itemId: 'eot-garage-light_switches', label: 'Light switches', category: 'fixtures', baseHours: 0, optional: true },
      power_points: { itemId: 'eot-garage-power_points', label: 'Power points', category: 'fixtures', baseHours: 0, optional: true },

      // ===== WINDOWS =====
      windows: { itemId: 'eot-garage-windows', label: 'Windows (internal glass, if present)', category: 'windows', baseHours: 0, optional: true },
      window_frames: { itemId: 'eot-garage-window_frames', label: 'Window frames / sills', category: 'windows', baseHours: 0, optional: true },

      // ===== STORAGE & SHELVING =====
      shelving_units: { itemId: 'eot-garage-shelving', label: 'Shelving units – wipe', category: 'storage', baseHours: 0, optional: true },
      storage_racks: { itemId: 'eot-garage-racks', label: 'Storage racks – wipe', category: 'storage', baseHours: 0, optional: true },
      wall_hooks: { itemId: 'eot-garage-wall_hooks', label: 'Wall hooks / pegboard – dust', category: 'storage', baseHours: 0, optional: true },
      cabinets_exterior: { itemId: 'eot-garage-cabinets_ext', label: 'Cabinets exterior (if present)', category: 'storage', baseHours: 0, optional: true },
      cabinets_interior: { itemId: 'eot-garage-cabinets_int', label: 'Cabinets interior (if present)', category: 'storage', baseHours: 0, optional: true },
      overhead_storage: { itemId: 'eot-garage-overhead', label: 'Overhead storage – dust (if reachable)', category: 'storage', baseHours: 0, optional: true },

      // ===== WORKBENCH =====
      workbench_surface: { itemId: 'eot-garage-workbench', label: 'Workbench surface – clear / wipe', category: 'surfaces', baseHours: 0, optional: true },
      workbench_drawers: { itemId: 'eot-garage-workbench_drawers', label: 'Workbench drawers – wipe out', category: 'storage', baseHours: 0, optional: true },
      vice_tools: { itemId: 'eot-garage-vice', label: 'Vice / fixed tools – wipe (if present)', category: 'surfaces', baseHours: 0, optional: true },

      // ===== UTILITIES =====
      electrical_panel: { itemId: 'eot-garage-elec_panel', label: 'Electrical panel exterior – dust', category: 'utilities', baseHours: 0, optional: true },
      hot_water_cylinder: { itemId: 'eot-garage-hwc', label: 'Hot water cylinder exterior (if present)', category: 'utilities', baseHours: 0, optional: true },
      water_taps: { itemId: 'eot-garage-taps', label: 'Water taps – wipe', category: 'utilities', baseHours: 0, optional: true },
      hose_reel: { itemId: 'eot-garage-hose', label: 'Hose reel – wipe / tidy', category: 'utilities', baseHours: 0, optional: true },
      laundry_tub: { itemId: 'eot-garage-laundry_tub', label: 'Laundry tub – clean (if present)', category: 'utilities', baseHours: 0, optional: true },

      // ===== APPLIANCES =====
      chest_freezer: { itemId: 'eot-garage-freezer', label: 'Chest freezer exterior (if present)', category: 'appliances', baseHours: 0, optional: true },
      bar_fridge: { itemId: 'eot-garage-fridge', label: 'Bar fridge exterior (if present)', category: 'appliances', baseHours: 0, optional: true },
      washing_machine: { itemId: 'eot-garage-washer', label: 'Washing machine exterior (if present)', category: 'appliances', baseHours: 0, optional: true },
      dryer: { itemId: 'eot-garage-dryer', label: 'Dryer exterior (if present)', category: 'appliances', baseHours: 0, optional: true },

      // ===== FLOOR =====
      floor_sweep: { itemId: 'eot-garage-floor_sweep', label: 'Floor – sweep', category: 'floors', baseHours: 0, optional: true },
      floor_mop: { itemId: 'eot-garage-floor_mop', label: 'Floor – mop / wash (if sealed)', category: 'floors', baseHours: 0, optional: true },
      floor_oil_stains: { itemId: 'eot-garage-oil_stains', label: 'Floor – oil / grease stain treatment', category: 'floors', baseHours: 0, optional: true },
      floor_edges: { itemId: 'eot-garage-floor_edges', label: 'Floor edges / corners', category: 'floors', baseHours: 0, optional: true },
      floor_drain: { itemId: 'eot-garage-floor_drain', label: 'Floor drain – clear debris (if present)', category: 'floors', baseHours: 0, optional: true },
      step_up: { itemId: 'eot-garage-step', label: 'Step up to house – sweep / wipe', category: 'floors', baseHours: 0, optional: true },

      // ===== GENERAL =====
      rubbish_clear: { itemId: 'eot-garage-rubbish', label: 'Rubbish – clear / dispose', category: 'general', baseHours: 0, optional: true },
      recycling_bins: { itemId: 'eot-garage-recycling', label: 'Recycling bins – wipe exterior', category: 'general', baseHours: 0, optional: true },
      bike_rack: { itemId: 'eot-garage-bike_rack', label: 'Bike rack – wipe (if present)', category: 'general', baseHours: 0, optional: true },
      sports_equipment: { itemId: 'eot-garage-sports', label: 'Sports equipment storage – tidy area', category: 'general', baseHours: 0, optional: true },
      garden_tools_area: { itemId: 'eot-garage-garden_tools', label: 'Garden tools area – sweep / tidy', category: 'general', baseHours: 0, optional: true },
      ladders: { itemId: 'eot-garage-ladders', label: 'Ladder storage area – sweep', category: 'general', baseHours: 0, optional: true },
      smoke_alarm: { itemId: 'eot-garage-smoke_alarm', label: 'Smoke alarm – external dusting', category: 'safety', baseHours: 0, optional: true }
    }
  }
};

/**
 * OPTIONAL FORM CHOICES
 * These are toggles/modifiers offered on the form during inspection walk-through
 */
const OPTIONAL_FORM_CHOICES = {
  bed_making: {
    choiceId: 'form-choice_bed_making',
    label: 'Bed making (if requested)',
    category: 'optional_services',
    conditional: 'if_bed_making_required',
    price: 20,
    baseHours: 0.3,
    description: 'Make beds and adjust linens/pillows when requested.'
  },
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
