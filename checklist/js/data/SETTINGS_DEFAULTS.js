/**
 * SETTINGS_DEFAULTS.js
 * 
 * Default settings for commercial/residential cleaning quotes.
 * These are the BASE VALUES that ITEM_DEFINITIONS.js references.
 * 
 * CRITICAL OOP PRINCIPLE: property_type determines the FAMILY (base type).
 * All other choices are conditional on property_type.
 * Service toggles only apply to services relevant to that property_type.
 * Room types only exist for that property_type.
 * 
 * Example:
 *   property_type: 'residential_3bed' ONLY shows: Windows, Carpet, Gardening toggles
 *   property_type: 'commercial_office' ONLY shows: Windows, Carpet toggles (no Gardening)
 *   property_type: 'commercial_gym' room types: Showers, Lockers, Toilet (no Bedroom)
 * 
 * This is POLYMORPHISM: different types inherit from Property but show different content.
 * 
 * When user updates a setting in the Settings UI, it OVERRIDES these defaults.
 * At runtime, calculator uses: SETTINGS[key] ?? SETTINGS_DEFAULTS[key]
 * 
 * This allows:
 * - Code to remain static (references setting keys, not hardcoded prices)
 * - User to update prices in Settings UI without code changes
 * - Prices to evolve over time (inflation, market changes) easily
 * - Different property types to have different available services
 */

const SETTINGS_DEFAULTS = {
  // ============================================================
  // PROPERTY TYPE (POLYMORPHIC FAMILY - Controls everything else)
  // This determines:
  //   - Which Room types appear (bedrooms vs. offices vs. showers)
  //   - Which PropertyService toggles are relevant
  //   - What form structure is generated
  // ============================================================
  property_type: 'residential_3bed',
  
  // Valid property_type values and their characteristics:
  // RESIDENTIAL:
  //   'residential_3bed'     → Rooms: Bedroom(3), Bathroom(2), Kitchen, LivingArea, Laundry
  //                            Services: Windows(toggle), Carpet(toggle), Gardening(toggle)
  //   'residential_6bed'     → Rooms: Bedroom(6), Bathroom(4), Kitchen, LivingArea, Laundry
  //                            Services: Windows(toggle), Carpet(toggle), Gardening(toggle)
  //
  // COMMERCIAL OFFICE:
  //   'commercial_office'    → Rooms: Office(N), Reception, Lunchroom, Toilet(block), Circulation
  //                            Services: Windows(toggle), Carpet(toggle)
  //
  // COMMERCIAL GYM:
  //   'commercial_gym'       → Rooms: Locker rooms, Showers(N), Toilet(block), Lunchroom
  //                            Services: Windows(toggle), Carpet(toggle)
  //
  // COMMERCIAL RETAIL:
  //   'commercial_retail'    → Rooms: Sales floor, Stockroom, Office, Toilet, Circulation
  //                            Services: Windows(toggle), Carpet(toggle)
  //
  // END OF TENANCY:
  //   'eot_residential'      → Rooms: Bedroom(N), Bathroom(N), Kitchen, LivingArea, Laundry
  //                            Services: Windows(toggle), Carpet(toggle)
  //
  // Note: Each property_type has a DEFINED SET of room types and available services.
  // Factory checks property_type first, then conditionally loads toggles and room classes.
  
  // ============================================================
  // WINDOW CLEANING PRICING
  // Applies to: All property_type values (universal service)
  // Toggle: ALWAYS available, ALWAYS toggleable
  // ============================================================
  include_windows_cleaning: true,       // Default: ON (most properties have windows)
  window_large_pane_price: 0,           // Set: Price per large pane (e.g., $5.00)
  window_small_pane_price: 0,           // Set: Price per small pane (e.g., $2.50)
  window_door_pane_price: 0,            // Set: Price per door pane (e.g., $2.00)
  window_ground_floor_surcharge: 0,     // Set: Ground floor extra (typically $0)
  window_two_storey_surcharge: 0,       // Set: 2-storey equipment surcharge (e.g., $100)
  window_extra_staff_rate: 0,           // Set: Extra staff hourly rate (e.g., $50/hr)
  window_extra_staff_threshold: 6,      // Set: Hours before extra staff needed (e.g., 6 hrs)
  
  // ============================================================
  // CARPET CLEANING PRICING
  // Applies to: All property_type values except 'commercial_gym'
  // Toggle: NOT available for gym (no carpet in wet areas)
  // ============================================================
  include_carpet_cleaning: true,        // Default: ON (most properties have carpet)
  carpet_base_2room_price: 120,         // Set: 2-room carpet clean (e.g., $120.00)
  carpet_base_3room_price: 140,         // Set: 3-room carpet clean (e.g., $140.00)
  carpet_base_4room_price: 160,         // Set: 4-room carpet clean (e.g., $160.00)
  carpet_base_5room_price: 200,         // Set: 5-room carpet clean (e.g., $200.00)
  carpet_base_6room_price: 260,         // Set: 6-room carpet clean (e.g., $260.00)
  carpet_stain_removal_price: 40,       // Set: Per stain removal (e.g., $40 each, max 15)
  carpet_protection_price: 40,          // Set: Protection treatment per room (e.g., $40/room)
  carpet_extra_room_price: 25,          // Set: Each additional room beyond base (e.g., $25/room)
  carpet_stairs_price: 40,              // Set: Per flight of stairs (e.g., $40/flight)
  carpet_distance_surcharge_price: 0,   // Set: Outside 12km CBD surcharge (e.g., $30-50)
  carpet_base_2room_hours: 1.5,
  carpet_base_3room_hours: 2.0,
  carpet_base_4room_hours: 2.5,
  carpet_base_5room_hours: 3.0,
  carpet_base_6room_hours: 4.0,
  
  // ============================================================
  // GARDENING & LAWN MAINTENANCE PRICING
  // Applies to: ONLY residential property_type values
  // Toggle: NOT available for commercial (different service providers)
  // ============================================================
  include_gardening_services: false,    // Default: OFF (most cleaning services don't garden)
  gardening_base_small_price: 0,        // Set: Small property base (e.g., $40-60)
  gardening_base_medium_price: 0,       // Set: Medium property base (e.g., $80-120)
  gardening_base_large_price: 0,        // Set: Large property base (e.g., $150-250)
  gardening_base_commercial_price: 0,   // Set: Commercial custom quote (e.g., $500+)
  gardening_lawn_mow_price: 0,          // Set: Per sqm lawn mowing (e.g., $0.15-0.25/sqm)
  gardening_trim_price: 0,              // Set: Per garden bed trimming (e.g., $25-40/bed)
  gardening_hedge_price: 0,             // Set: Per linear meter hedge (e.g., $3-5/m)
  gardening_weed_removal_price: 0,      // Set: Per sqm hand weeding (e.g., $0.50-1.50/sqm)
  gardening_deck_clean_price: 0,        // Set: Per sqm power wash (e.g., $2-4/sqm)
  gardening_quarterly_discount_pct: 10, // Set: % discount for quarterly contracts (typically 10%)
  
  // ============================================================
  // RUBBISH HANDLING PRICING
  // Applies to: All property_type values
  // Toggle: conditionally available (not all properties have rubbish)
  // ============================================================
  rubbish_bin_empty_price: 0,           // Set: Price per bin just emptied into skip (e.g., $2)
  rubbish_bin_dispose_price: 0,         // Set: Price per bin with disposal/dump fee (e.g., $15+)
  rubbish_transport_per_meter: 0,       // Set: Per-meter cost to dumpster (e.g., $0.10)
  
  // ============================================================
  // OFFICE ITEMS PRICING
  // Applies to: ONLY commercial property_type (office, retail, etc.)
  // Available: Only if property_type contains offices
  // ============================================================
  office_private_price: 0,              // Set: Private office cleaning (e.g., $45)
  office_open_plan_price: 0,            // Set: Open-plan desk station (e.g., $25)
  office_boardroom_price: 0,            // Set: Boardroom/conference room (e.g., $75)
  office_reception_price: 0,            // Set: Reception area (e.g., $50)
  
  // ============================================================
  // TOILET & SANITATION PRICING
  // Applies to: ONLY commercial property_type (blocks of toilets)
  // Available: Only if property_type has commercial toilets
  // ============================================================
  toilet_single_price: 0,               // Set: Single toilet/urinal (e.g., $25)
  toilet_stall_price: 0,                // Set: Private toilet stall (e.g., $30)
  toilet_sink_price: 0,                 // Set: Sink/washbasin station (e.g., $20)
  
  // ============================================================
  // CARPARK PRICING
  // Applies to: ONLY commercial property_type
  // Available: Only if property_type has carparks
  // ============================================================
  carpark_open_price: 40,               // Set: Frontage/entry sweep per 100m² block
  carpark_covered_price: 180,           // Set: Full carpark sweep per 500m² block (equipment)
  carpark_street_price: 0,              // Set: Street parking only (info-only; typically $0)
  
  // ============================================================
  // LUNCHROOM / KITCHEN PRICING
  // Applies to: All property_type values (residential kitchens or commercial lunchrooms)
  // ============================================================
  lunchroom_clean_price: 0,             // Set: Full lunchroom/kitchen (e.g., $60)
  lunchroom_microwave_price: 0,         // Set: Microwave interior/exterior (e.g., $15)
  
  // ============================================================
  // CIRCULATION AREAS PRICING
  // Applies to: ONLY commercial property_type
  // Available: Only if property_type has circulation areas (hallways, entries)
  // ============================================================
  circulation_hallway_100m2_price: 0,   // Set: Per 100m² hallway/corridor (e.g., $40)
  circulation_entry_foyer_price: 0,     // Set: Entry/foyer area (e.g., $35)
  
  // ============================================================
  // UTILITY ROOM PRICING
  // Applies to: All property_type values (storage, stairs)
  // ============================================================
  utility_room_price: 0,                // Set: General utility room (e.g., $50)
  utility_staircase_price: 0,           // Set: Staircase flight (e.g., $40)
  
  // ============================================================
  // WAREHOUSE PRICING
  // Applies to: ONLY commercial_warehouse or industrial property_type
  // Available: Only for warehouse/industrial properties
  // ============================================================
  warehouse_area_100m2_price: 0,        // Set: Per 100m² of warehouse (e.g., $60)
  warehouse_shelving_price: 0,          // Set: Per shelving unit (e.g., $25)
  
  // ============================================================
  // TRADE / WORKSHOP PRICING
  // Applies to: ONLY commercial property_type with trade/workshop areas
  // Available: Only for properties with workshops or industrial areas
  // ============================================================
  trade_workbench_price: 0,             // Set: Per workbench (e.g., $40)
  trade_machinery_area_price: 0,        // Set: Per machinery area (e.g., $75)
  trade_tool_storage_price: 0,          // Set: Tool storage area (e.g., $30)
  
  // ============================================================
  // RUBBISH HANDLING PRICING
  // Admin: Different for just-empty vs. full-dispose
  // ============================================================
  rubbish_bin_empty_price: 0,           // Set: Price per bin just emptied into skip (e.g., $2 + GST = $2.30)
                                        // Example: 30 bins × $2 = $60 total
  rubbish_bin_dispose_price: 0,         // Set: Price per bin with disposal/dump fee (e.g., $15+)
                                        // Includes: transport to dumpster, dump fee, labor
  rubbish_transport_per_meter: 0,       // Set: Per-meter cost to dumpster (e.g., $0.10)
  
  // ============================================================
  // OFFICE ITEMS PRICING
  // Admin: Set based on time + labor costs
  // ============================================================
  office_private_price: 0,              // Set: Private office cleaning (e.g., $45)
  office_open_plan_price: 0,            // Set: Open-plan desk station (e.g., $25)
  office_boardroom_price: 0,            // Set: Boardroom/conference room (e.g., $75)
  office_reception_price: 0,            // Set: Reception area (e.g., $50)
  
  // ============================================================
  // TOILET & SANITATION PRICING
  // Admin: Set based on your time per toilet
  // ============================================================
  toilet_single_price: 0,               // Set: Single toilet/urinal (e.g., $25)
  toilet_stall_price: 0,                // Set: Private toilet stall (e.g., $30)
  toilet_sink_price: 0,                 // Set: Sink/washbasin station (e.g., $20)
  
  // ============================================================
  // CARPARK PRICING
  // Admin: Carpark cleaning often minimal or bundled
  // ============================================================
  carpark_open_price: 40,               // Set: Frontage/entry sweep per 100m² block
  carpark_covered_price: 180,           // Set: Full carpark sweep per 500m² block (equipment)
  carpark_street_price: 0,              // Set: Street parking only (info-only; typically $0)
  
  // ============================================================
  // LUNCHROOM / KITCHEN PRICING
  // Admin: Set based on kitchen complexity
  // ============================================================
  lunchroom_clean_price: 0,             // Set: Full lunchroom/kitchen (e.g., $60)
  lunchroom_microwave_price: 0,         // Set: Microwave interior/exterior (e.g., $15)
  
  // ============================================================
  // CIRCULATION AREAS PRICING
  // Admin: Hallways, corridors, entries
  // ============================================================
  circulation_hallway_100m2_price: 0,   // Set: Per 100m² hallway/corridor (e.g., $40)
  circulation_entry_foyer_price: 0,     // Set: Entry/foyer area (e.g., $35)
  
  // ============================================================
  // UTILITY ROOM PRICING
  // Admin: Storage, utility areas, staircases
  // ============================================================
  utility_room_price: 0,                // Set: General utility room (e.g., $50)
  utility_staircase_price: 0,           // Set: Staircase flight (e.g., $40)
  
  // ============================================================
  // WAREHOUSE PRICING
  // Admin: Large area cleaning
  // ============================================================
  warehouse_area_100m2_price: 0,        // Set: Per 100m² of warehouse (e.g., $60)
  warehouse_shelving_price: 0,          // Set: Per shelving unit (e.g., $25)
  
  // ============================================================
  // TRADE / WORKSHOP PRICING
  // Admin: Industrial/workshop areas
  // ============================================================
  workshop_area_100m2_price: 0,         // Set: Per 100m² of workshop (e.g., $70)
  workshop_workbench_price: 0,          // Set: Per workbench (e.g., $30)
  
  // ============================================================
  // OPTIONAL FORM CHOICES PRICING
  // Admin: Discovered during walk-through
  // ============================================================
  optional_desk_tidying_price: 0,       // Set: Desk organization (e.g., $35)
  optional_laundry_service_price: 0,    // Set: Laundry wash/dry/fold (e.g., $40)
  optional_vacuum_rubbish_package_price: 0,  // Set: Budget package (e.g., $80)
  
  // ============================================================
  // HOURLY RATES (for time-based calculations)
  // Admin: Set based on your labor costs
  // ============================================================
  base_hourly_rate: 0,                  // Set: Base staff rate (e.g., $50/hr)
  premium_hourly_rate: 0,               // Set: Premium/skilled staff (e.g., $75/hr)
  additional_staff_hourly_rate: 0,      // Set: Extra staff rate (e.g., $30/hr)
  
  // ============================================================
  // BUSINESS SETTINGS (affect quote calculation)
  // Admin: Tax, thresholds, discounts
  // ============================================================
  tax_rate: 0.15,                       // Set: Tax rate (0.15 = 15% GST equivalent)
  staff_threshold: 7,                   // Set: Hours per staff before extra needed (e.g., 7)
  staff_multiplier_premium: 0.25,       // Set: Premium % if over threshold (0.25 = 25%)
  discount_flat: 0,                     // Set: Flat discount amount (e.g., $50)
  
  // ============================================================
  // DIFFICULTY MULTIPLIERS (for hour calculations)
  // Admin: Rarely changed - affects all job hours
  // ============================================================
  difficulty_easy_multiplier: 0.75,     // Easy = 0.75x (well-maintained)
  difficulty_standard_multiplier: 1.0,  // Standard = 1.0x (normal)
  difficulty_hard_multiplier: 1.5,      // Hard = 1.5x (heavy soiling/stains)
  
  // ============================================================
  // COMMERCIAL-SPECIFIC MODIFIERS
  // Admin: Additional charges for commercial jobs
  // ============================================================
  commercial_difficulty_base: 'standard',  // Set: Default difficulty (easy/standard/hard)
  commercial_buildup_surcharge: 0,         // Set: Extra if heavy buildup (e.g., $10)
  commercial_after_hours_surcharge: 0,     // Set: Extra per hour after-hours (e.g., $25)
  
  // ============================================================
  // FIRST CLASS CITIZEN TOGGLES (Structural - on by default)
  // These determine if entire service sections appear in quotes
  // ============================================================
  include_windows_cleaning: true,          // Set: Window cleaning service included? (default: ON)
  include_carpet_cleaning: true,           // Set: Carpet cleaning service included? (default: ON)
  include_gardening_services: false,       // Set: Gardening/lawn service included? (default: OFF)
                                           // Most cleaning services don't offer gardening
                                           // Gardening specialists or multi-service operators enable this
  
  // ============================================================
  // CARPET CLEANING PRICING (Christchurch)
  // Based on room count tiers + optional extras
  // ============================================================
  // Base pricing (user selects room count in form)
  carpet_base_2room_price: 120,            // Set: 2-room carpet clean (e.g., $120.00)
  carpet_base_3room_price: 140,            // Set: 3-room carpet clean (e.g., $140.00)
  carpet_base_4room_price: 160,            // Set: 4-room carpet clean (e.g., $160.00)
  carpet_base_5room_price: 200,            // Set: 5-room carpet clean (e.g., $200.00)
  carpet_base_6room_price: 260,            // Set: 6-room carpet clean (e.g., $260.00)
  
  // Optional extras (small choices on form)
  carpet_stain_removal_price: 40,          // Set: Per stain removal (e.g., $40 each, max 15)
  carpet_protection_price: 40,             // Set: Protection treatment per room (e.g., $40/room)
  carpet_extra_room_price: 25,             // Set: Each additional room beyond base (e.g., $25/room)
  carpet_stairs_price: 40,                 // Set: Per flight of stairs (e.g., $40/flight)
  
  // Surcharges
  carpet_distance_surcharge_price: 0,      // Set: Outside 12km CBD surcharge (e.g., $30-50)
  
  // Base hours for labor calculation (if parameterized by room count)
  carpet_base_2room_hours: 1.5,
  carpet_base_3room_hours: 2.0,
  carpet_base_4room_hours: 2.5,
  carpet_base_5room_hours: 3.0,
  carpet_base_6room_hours: 4.0,
  
  // ============================================================
  // GARDENING & LAWN MAINTENANCE PRICING
  // Set by gardening specialists or multi-service operators
  // ============================================================
  // Base packages (by property size)
  gardening_base_small_price: 0,           // Set: Small property base (e.g., $40-60)
  gardening_base_medium_price: 0,          // Set: Medium property base (e.g., $80-120)
  gardening_base_large_price: 0,           // Set: Large property base (e.g., $150-250)
  gardening_base_commercial_price: 0,      // Set: Commercial custom quote (e.g., $500+)
  
  // Optional services (parameterized)
  gardening_lawn_mow_price: 0,             // Set: Per sqm lawn mowing (e.g., $0.15-0.25/sqm)
  gardening_trim_price: 0,                 // Set: Per garden bed trimming (e.g., $25-40/bed)
  gardening_hedge_price: 0,                // Set: Per linear meter hedge (e.g., $3-5/m)
  gardening_weed_removal_price: 0,         // Set: Per sqm hand weeding (e.g., $0.50-1.50/sqm)
  gardening_deck_clean_price: 0,           // Set: Per sqm power wash (e.g., $2-4/sqm)
  
  // Discounts/Contract Options
  gardening_quarterly_discount_pct: 10,    // Set: % discount for quarterly contracts (typically 10%)
};

/**
 * HOW THIS WORKS:
 * 
 * When ITEM_DEFINITIONS.js needs a price:
 * 
 *   item.priceSetting = 'window_large_pane_price'
 *   actualPrice = SETTINGS['window_large_pane_price'] ?? SETTINGS_DEFAULTS['window_large_pane_price']
 *   // Returns $5.00 (or whatever user set in Settings)
 * 
 * When user changes price in Settings UI:
 *   SETTINGS['window_large_pane_price'] = 6.00;  // User increases price
 *   Next quote calculation uses $6.00, not $5.00
 *   Code doesn't change. No deployment needed.
 * 
 * This is the "Settings-based pricing" pattern:
 * - Code references setting KEYS, not hardcoded VALUES
 * - User controls VALUES through Settings UI
 * - No code changes needed for price updates
 */

// Export for use in calculator and Settings UI
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SETTINGS_DEFAULTS;
}
