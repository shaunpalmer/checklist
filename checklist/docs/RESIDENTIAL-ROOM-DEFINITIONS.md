# Residential Room Definitions

**Status**: Specification Complete  
**Purpose**: Define all room types and variants for residential cleaning services  
**Two Classifications**: Light Residential vs Deep Residential

---

## Overview

Residential cleaning comes in two distinct types:

| Classification | Type | Focus | Typical Home | Production Rate |
|---|---|---|---|---|
| **Light** | Sprinkle/Maintenance Clean | Quick refresh, routine tidying | Regular homes, weekly cleanings | 400-500 sq ft/hr |
| **Deep** | Full Deep Clean | Thorough cleaning, all appliances, extras | Homes with extras (sauna, outdoor, garage) | 330-400 sq ft/hr |

**Key Difference**: Light residential is simpler items, faster execution. Deep residential includes extra rooms (saunas, garages, outdoor spaces) and more detailed work (inside appliances, outdoor cleaning).

---

## Room Categories & Variants

Residential spaces organize into 7 room categories with multiple variants per category.

### Category 1: BEDROOMS (6 variants)

Bedrooms vary by size, bed configuration, and complexity.

#### Bedroom Variants

| Variant ID | Name | Description | Square Feet | Difficulty | Light/Deep |
|---|---|---|---|---|---|
| `bed_single` | Single Bedroom | Small room, single bed, minimal furniture | 80-120 | basic | Both |
| `bed_master` | Master Bedroom | Large room, king/queen bed, walk-in wardrobe | 200-300 | basic | Both |
| `bed_guest` | Guest Bedroom | Medium room, queen/double bed, basic furniture | 120-180 | basic | Both |
| `bed_bunks` | Bunk Bedroom (Kids) | Multiple bunk beds, toys, storage | 100-150 | basic | Both |
| `bed_loft` | Loft Bedroom | High ceiling room, mezzanine sleeping area | 150-250 | medium | Deep only |
| `bed_nanny` | Nanny/Studio | Compact room with ensuite bathroom | 100-140 | basic | Both |

**Notes**:
- Master bedrooms may have walk-in wardrobe (extra item: dust/wipe wardrobe shelving)
- Kid bedrooms may have toy storage requirements (extra task)
- Loft bedrooms require extra care for high shelving/ceiling fans

---

### Category 2: BATHROOMS (7 variants)

Bathrooms are the most varied room type. Configuration options: shower only, bathtub only, shower+tub, toilet location, double vanity.

#### Bathroom Variants

| Variant ID | Name | Description | Difficulty | Light/Deep | Features |
|---|---|---|---|---|---|
| `bath_single_shower` | Single Shower | Single toilet, shower only, single sink | basic | Both | Toilet, shower enclosure, sink |
| `bath_single_tub` | Single Bathtub | Single toilet, bathtub only, single sink | basic | Both | Toilet, bathtub, sink |
| `bath_single_combo` | Single Combo | Single toilet, shower+tub combo, single sink | medium | Both | Toilet, shower/tub, sink |
| `bath_ensuite` | Ensuite Shower | Off bedroom, shower only, single sink | basic | Both | Toilet, shower, sink, no window |
| `bath_ensuite_tub` | Ensuite Bathtub | Off bedroom, bathtub only, single sink | basic | Both | Toilet, bathtub, sink, no window |
| `bath_double_shower` | Double Shower | Dual toilet (if needed), double shower, double sink | medium | Deep only | Dual toilets, dual showers, double vanity |
| `bath_double_combo` | Double Combo | Dual toilets possible, shower+tub, double sink, heated towel rail | medium | Deep only | Toilet, shower, tub, double vanity, extras |

**Configuration Details**:
- **Single vs Double**: Single = 1 toilet, 1 sink. Double = possible 2 toilets, 2 sinks.
- **Shower vs Tub vs Combo**: Affects scrubbing time and item complexity.
- **Ensuite**: Small, off-bedroom bathroom (often no window, more confined).
- **Shared vs Private**: Some homes have shared family bathroom + private ensuite.
- **Heated Towel Rails**: Extra time (wipe, descale if needed).

**Consumables** (same across all bathroom variants):
- Toilet rolls (parameterized by toilet count)
- Sanitary bins (if female-used)
- Soap dispensers (parameterized by sink count)
- Hand dryer / paper towel dispenser (parameterized by sink count)
- Mirror/glass cleaner specific items

---

### Category 3: KITCHENS (5 variants)

Kitchens range from tiny galley layouts to large chef's kitchens with multiple appliances.

#### Kitchen Variants

| Variant ID | Name | Description | Difficulty | Light/Deep | Appliances |
|---|---|---|---|---|---|
| `kitchen_small` | Small/Galley | Narrow layout, basic appliances, minimal counter space | basic | Both | Stove, fridge, sink |
| `kitchen_standard` | Standard Kitchen | Medium L-shaped or linear, typical appliances | basic | Both | Stove, fridge, sink, microwave |
| `kitchen_island` | Island Kitchen | Island bench, larger counter space, multiple appliances | medium | Both | Stove, oven, fridge, sink, microwave, dishwasher |
| `kitchen_shift` | Shift/Chef's Kitchen | Commercial-style layout, multiple stations, high-end appliances | medium | Deep only | Double oven, large fridge, prep area, multiple sinks |
| `kitchen_modern_open` | Modern Open-Plan | Open to lounge, high-end finishes, large island | medium | Deep only | Multiple appliances, bar seating, premium surfaces |

**Appliance Notes**:
- Stove/Oven: Can be single or double (parameterized)
- Fridge: Standard or large
- Microwave: Range hood if present
- Dishwasher: Extra time to empty/clean racks
- Benchtop: Stone, timber, laminate (different cleaning methods)
- Backsplash: Tile, glass, or stainless steel

**Inside Appliance Cleaning** (Deep only):
- Oven interior (parameterized: single vs double)
- Fridge interior (wipe shelves, clean coils if accessible)
- Microwave interior (wipe, deodorize)

---

### Category 4: LAUNDRY (4 variants)

Laundry rooms vary by equipment and complexity.

#### Laundry Variants

| Variant ID | Name | Description | Difficulty | Light/Deep | Equipment |
|---|---|---|---|---|---|
| `laundry_basic` | Basic Laundry | Compact space, no major equipment | basic | Both | Shelving, sink (may not have washer/dryer) |
| `laundry_with_tub` | Laundry with Tub | Separate tub, shelving, space for washboard | basic | Both | Tub, shelving, no washer/dryer |
| `laundry_with_washer` | Laundry with Washer | Front-load or top-load washer, shelving | medium | Both | Washer, shelving, sink |
| `laundry_full_station` | Full Laundry Station | Washer, dryer, tub, drying racks, storage | medium | Deep only | Washer, dryer, tub, racks, shelving |

**Equipment Time**:
- Washer exterior: Wipe, clean lint trap
- Dryer exterior: Wipe, clean lint trap
- Tub: Scrub and rinse
- Shelving: Wipe and organize items
- Drying racks: Wipe down

---

### Category 5: LIVING AREAS (7 variants)

Living spaces where family spends time, including circulation and staircases.

#### Living Area Variants

| Variant ID | Name | Description | Difficulty | Light/Deep |
|---|---|---|---|---|
| `living_lounge` | Lounge/Living Room | Seating area, TV area, carpet/hardwood | basic | Both |
| `living_dining` | Dining Room | Dining table, chairs, possibly sideboard | basic | Both |
| `living_family` | Family Room | Multi-purpose room, larger, may have activities | medium | Both |
| `living_entryway` | Entryway/Foyer | Entry hall, shoe storage, coat hooks | basic | Both |
| `living_hallway` | Hallway/Circulation | Connecting spaces, corridors | basic | Both |
| `staircase` | Staircase | Internal stairs (straight, L-shaped, spiral) | medium | Both |
| `staircase_with_lift` | Staircase with Lift | Internal stairs with stair lift installed | hard | Deep only |

**Notes**:
- Lounge/Dining often together in modern homes
- Carpet vs hardwood affects time (carpet more intensive)
- Family rooms may have toys/storage bins
- Entryways may have built-in shoe storage (extra)
- **Staircases**: 2+ story properties REQUIRE staircase. Includes: tread cleaning, baseboard wipe, bannister polish/wipe, underside dust
- **Stair Lift**: Extra time for lift mechanism cleaning, rail wipes, chair check (deep only, expensive homes)

---

### Category 6: BASEMENT SPACES (8 variants)

Basements are common in multi-level properties (2-story, split-level, multi-level homes) and are deep residential only. These rooms have special considerations: lower light, potential moisture, concrete floors.

#### Basement Variants

| Variant ID | Name | Description | Difficulty | Light/Deep | Typical Features |
|---|---|---|---|---|---|
| `basement_recreation` | Recreation Area | Playroom, lounge, TV room | medium | Deep only | Carpet, finished walls, lighting |
| `basement_pool_area` | Pool Area | Indoor or basement pool surround | hard | Deep only | Tile, moisture, pool maintenance area |
| `basement_wine_cellar` | Wine Cellar | Climate controlled, racking, shelving | medium | Deep only | Shelving, racks, temperature control equipment |
| `basement_laundry_station` | Laundry Station | Washer, dryer, tub, drying racks | medium | Deep only | Laundry equipment, shelving, sink |
| `basement_storage` | Storage/Utility | Shelving, boxes, general storage | basic | Deep only | Shelving, dust-heavy, organized racks |
| `basement_utility_room` | Utility Room | Boiler, water heater, electrical panel | hard | Deep only | Equipment, pipes, heat management |
| `basement_home_theater` | Home Theater | Media room, seating, acoustic panels | medium | Deep only | Specialized surfaces, electronics, seating |
| `basement_gym` | Home Gym | Exercise equipment, mirror walls, flooring | medium | Deep only | Equipment, mirrors, specialty flooring |

**Basement Special Handling**:
- **Moisture**: Check for dampness, mold prevention focus
- **Concrete Floors**: Sweep thoroughly before mop (dust-heavy)
- **Low Ceilings**: Extra care near pipes, beams
- **Lighting**: Often dim, need careful inspection
- **Temperature/Humidity**: Wine cellars and storage require special attention
- **Equipment**: Boiler rooms and laundry stations have machinery to work around

**Factory Rule**: Basements only in Deep Residential. Typically 1-3 basement rooms in luxury homes. More common in 2+ story properties.

---

### Category 7: UTILITY & SPECIAL ROOMS (6 variants)

Extra rooms and special-purpose spaces (mostly Deep Residential).

#### Utility Variants

| Variant ID | Name | Description | Difficulty | Light/Deep |
|---|---|---|---|---|
| `utility_garage_attached` | Attached Garage | Garage attached to home, vehicles/storage | medium | Deep only |
| `utility_garage_separate` | Separate Garage | Detached garage, vehicles/storage | medium | Deep only |
| `utility_storage` | Storage/Pantry | Pantry shelving, storage closet | basic | Both |
| `utility_laundry_closet` | Laundry Closet | Compact laundry in closet, stacked washer/dryer | basic | Both |
| `utility_sauna` | Sauna Room | Steam/dry sauna, benches, special flooring | medium | Deep only |
| `utility_steam_room` | Steam Room | Commercial-style steam room, benches | medium | Deep only |

**Special Handling**:
- Garages: May need floor sweep/mop (optional), shelf organization
- Sauna: Special care for wood, benches, tiles
- Steam room: High moisture, mold prevention focus
- Storage: Organization, dust removal, shelf wipes
- Laundry closet: Compact space, appliance wipes

---

### Category 8: HOME OFFICE (3 variants)

Home offices are increasingly common and can appear in both residential light and deep, though deep homes tend to have more elaborate setups.

#### Home Office Variants

| Variant ID | Name | Description | Difficulty | Light/Deep |
|---|---|---|---|---|
| `office_compact` | Compact Home Office | Small desk, shelving, single chair | basic | Both |
| `office_standard` | Standard Home Office | Desk, shelving, filing, computer area, lounge chair | medium | Both |
| `office_large` | Large Home Office | Multiple desks, extensive shelving, meeting area, premium finishes | medium | Deep only |

**Special Handling**:
- Computer equipment: Wipe surfaces, avoid liquid near electronics
- Desk organization: Arrange papers, office supplies
- Shelving: Dust books, organize files
- Monitors/equipment: Screen wipe (dry cloth only)
- Premium finishes: Different cleaning methods for wood vs glass vs laminate

---

### Category 9: OUTDOOR (4 variants)

External cleaning areas (Deep Residential).

#### Outdoor Variants

| Variant ID | Name | Description | Difficulty | Light/Deep |
|---|---|---|---|---|
| `outdoor_patio` | Patio/Courtyard | Paved area, possibly furniture | medium | Deep only |
| `outdoor_deck` | Deck/Balcony | Wooden or composite deck, railings | medium | Deep only |
| `outdoor_garden_shed` | Garden Shed | Small storage shed, basic cleaning | basic | Deep only |
| `outdoor_pool_area` | Pool Area | Pool surround, loungers, pool maintenance (basic) | medium | Deep only |

**Outdoor Notes**:
- Patio: Sweep, mop or pressure wash (if available)
- Deck: Sweep, wipe railings, check for splinters
- Shed: Sweep, wipe surfaces, organize tools
- Pool: Basic surround cleaning (not pool chemistry)

---

## Room Composition Rules

### Light Residential Homes

**Mandatory Rooms** (must have at least one of each):
1. At least 1 bedroom (single or master)
2. At least 1 bathroom (single shower or ensuite)
3. Kitchen (any variant except Chef's or Modern Open)
4. Living area (lounge or dining or family)
5. Hallway/circulation

**Optional Rooms**:
- Extra bedrooms (guest, nanny, loft)
- Extra bathrooms (double, ensuite)
- Laundry (any variant)
- Storage/utility rooms
- Home office

**Factory Rule**: Light residential typically has 3-4 bedrooms, 1-2 bathrooms, 1 kitchen, 1-2 living areas. No special rooms (sauna, garage). No outdoor areas.

### Deep Residential Homes

**Mandatory Rooms** (same as Light):
1. At least 1 bedroom
2. At least 1 bathroom
3. Kitchen
4. Living area
5. Hallway

**Optional Rooms** (all of the above, plus):
- Sauna or steam room
- Attached or separate garage
- Wine cellar or office
- Outdoor spaces (patio, deck, pool area)
- Premium kitchen variants (shift/chef's, modern open)
- Extra laundry stations
- Double bathrooms with premium fixtures

**Factory Rule**: Deep residential can have 4+ bedrooms, 2-3 bathrooms, premium kitchens, garages, outdoor areas, and special rooms. Much more flexible.

---

## Room Discovery Pattern

When a user selects **Residential** service type:

1. **Ask Classification**: "Is this a Light or Deep clean?"
   - Light: "Sprinkle/maintenance clean for regular homes"
   - Deep: "Full deep clean including extras (garage, sauna, outdoor areas)"

2. **Preset Templates** (optional quick-start):
   - "2BR/1BA Apartment" (Light)
   - "3BR/2BA House" (Light)
   - "4BR/2BA House + Garage" (Deep)
   - "5BR/3BA Luxury Home" (Deep)
   - "Custom Room Selection"

3. **Custom Discovery** (if user chooses):
   - Present room categories
   - Let user select variants per category
   - Build room list dynamically

---

## Summary Table

| Category | Light Variants | Deep Variants | Total | Notes |
|---|---|---|---|---|
| Bedrooms | 5 (single, master, guest, bunks, nanny) | +loft (6 total) | 6 | Master bedroom most common |
| Bathrooms | 4 (single shower, tub, combo, ensuite) | +double shower, double combo (7 total) | 7 | Combo takes longer |
| Kitchens | 3 (small, standard, island) | +shift, modern open (5 total) | 5 | Chef's kitchen adds complexity |
| Laundry | 3 (basic, with tub, with washer) | +full station (4 total) | 4 | Often optional in light |
| Living Areas | 5 + staircase, staircase_with_lift (7 total) | 7 | 7 | Staircases mandatory for 2+ story |
| Basements | 0 (none in light) | 8 (recreation, pool, wine cellar, laundry, storage, utility, theater, gym) | 8 | Deep only, multi-level properties |
| Utility | 2 (storage, laundry closet) | +garage (x2), sauna, steam (6 total) | 6 | Garage/sauna in deep only |
| Home Office | 2 (compact, standard) | +large (3 total) | 3 | Both light and deep |
| Outdoor | 0 (none in light) | 4 (patio, deck, shed, pool) | 4 | Deep only |
| **TOTAL** | **~24-29 variants** | **~51 variants** | **~51** | Light is subset of deep |

---

## Production Rate Impact

| Factor | Impact | Time Multiplier |
|---|---|---|
| Light Residential | Simpler items, fewer rooms | 1.0x (baseline: 400-500 sq ft/hr) |
| Deep Residential | More rooms, special areas, extras | 1.15-1.25x slower (330-380 sq ft/hr) |
| Garage/Outdoor | Floor work, weather-dependent | +0.5 hr per area |
| Sauna/Steam | Specialty care required | +0.75 hr per area |
| Double bathrooms | Extra fixtures and consumables | +0.25 hr per extra bathroom |

---

## Next Steps

1. **ITEM_DEFINITIONS.md**: Define specific items per room variant (duration, difficulty, consumables)
2. **Room.js**: Build Room base class with residential-specific logic
3. **AysChecklistFormFactory**: Integrate residential discovery flow
4. **UI**: Show room templates and custom selection

---

## Examples

### Light Residential: 3BR/1BA House
```
Bedrooms: 
  - Master Bedroom (200 sq ft)
  - Guest Bedroom (120 sq ft)
  - Single Bedroom (100 sq ft)
Bathrooms:
  - Single Combo (40 sq ft)
Kitchen:
  - Standard Kitchen (120 sq ft)
Living Areas:
  - Lounge (150 sq ft)
  - Dining (100 sq ft)
  - Hallway (80 sq ft)
Laundry:
  - Basic Laundry (40 sq ft)

Total: ~950 sq ft
Production: 400 sq ft/hr = 2.4 hours labor
```

### Deep Residential: 4BR/2BA House + Garage
```
Bedrooms:
  - Master Bedroom (250 sq ft)
  - Guest Bedroom (140 sq ft)
  - Single Bedroom (100 sq ft)
  - Loft Bedroom (180 sq ft)
Bathrooms:
  - Ensuite (30 sq ft)
  - Double Combo (50 sq ft)
Kitchen:
  - Island Kitchen (180 sq ft)
Living Areas:
  - Family Room (200 sq ft)
  - Dining (120 sq ft)
  - Entryway (60 sq ft)
  - Hallway (80 sq ft)
Laundry:
  - Full Station (50 sq ft)
Utility:
  - Attached Garage (400 sq ft)
Outdoor:
  - Deck (120 sq ft)

Total: ~1,880 sq ft
Production: 360 sq ft/hr (1.2x slower) = 5.2 hours labor
```

---

**Status**: Ready for ITEM_DEFINITIONS.md creation
