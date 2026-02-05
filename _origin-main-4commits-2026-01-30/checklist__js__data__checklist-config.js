/**
 * Checklist Configuration - REFACTORED
 * 
 * ARCHITECTURE:
 * - AysPropertyType is the SOURCE OF TRUTH for property structure
 * - This file EXTENDS AysPropertyType with room item definitions
 * - Dynamic config generation based on selected property_type + size parameters
 * 
 * USAGE:
 *   // Load with 3-bedroom residential
 *   CHECKLIST_CONFIG = AysChecklistConfigBuilder
 *     .forPropertyType('residential_3bed')
 *     .withBedroomCount(3)
 *     .withBathroomCount(2)
 *     .build();
 * 
 *   // Load with 6-office commercial
 *   CHECKLIST_CONFIG = AysChecklistConfigBuilder
 *     .forPropertyType('commercial_office')
 *     .withOfficeCount(6)
 *     .build();
 */

// ============================================================
// ITEM TEMPLATES - Reusable across property types
// ============================================================

const BEDROOM_ITEMS_TEMPLATE = [
  { 
    itemId: 'bed{N}-beds', 
    label: 'Beds Made', 
    category: 'beds', 
    hours: 0.2, 
    difficulty: 'basic',
    workType: 'labor',
    skillLevel: 'basic',
    description: 'Change linens, make bed, organize pillows',
    products: [],
    staffCount: 1
  },
  { 
    itemId: 'bed{N}-carpet', 
    label: 'Carpet Vacuum', 
    category: 'floors', 
    hours: 0.2, 
    difficulty: 'basic',
    workType: 'labor',
    skillLevel: 'basic',
    description: 'Vacuum carpet thoroughly',
    products: ['vacuum_cleaner'],
    staffCount: 1
  },
  { 
    itemId: 'bed{N}-wood', 
    label: 'Wood Floors Cleaned', 
    category: 'floors', 
    hours: 0.2, 
    difficulty: 'basic',
    workType: 'labor',
    skillLevel: 'basic',
    description: 'Sweep and mop wood floors',
    products: ['wood_cleaner', 'mop'],
    staffCount: 1
  },
  { 
    itemId: 'bed{N}-baseboards', 
    label: 'Baseboards Wiped', 
    category: 'trim', 
    hours: 0.1, 
    difficulty: 'basic',
    workType: 'labor',
    skillLevel: 'basic',
    description: 'Wipe baseboards to remove dust and marks',
    products: ['microfiber_cloth'],
    staffCount: 1
  },
  { 
    itemId: 'bed{N}-lights', 
    label: 'Light Switches', 
    category: 'touchpoints', 
    hours: 0.05, 
    difficulty: 'basic',
    workType: 'labor',
    skillLevel: 'basic',
    description: 'Wipe light switches and outlet covers',
    products: ['disinfectant', 'cloth'],
    staffCount: 1
  }
];

const BATHROOM_ITEMS_TEMPLATE = [
  { itemId: 'bath{N}-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean and polish sinks and faucets', products: ['bathroom_cleaner', 'cloth'], staffCount: 1 },
  { itemId: 'bath{N}-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Scrub and clean tub or shower stall', products: ['bathroom_cleaner', 'scrub_brush'], staffCount: 1 },
  { itemId: 'bath{N}-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean interior bowl and exterior tank', products: ['toilet_cleaner', 'toilet_brush'], staffCount: 1 },
  { itemId: 'bath{N}-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean mirrors and glass surfaces', products: ['glass_cleaner', 'cloth'], staffCount: 1 },
  { itemId: 'bath{N}-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe and sanitize counter surfaces', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
  { itemId: 'bath{N}-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe external cabinet surfaces', products: ['microfiber_cloth'], staffCount: 1 },
  { itemId: 'bath{N}-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Mop tile or vinyl floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
  { itemId: 'bath{N}-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe baseboards to remove dust and splashes', products: ['microfiber_cloth'], staffCount: 1 },
  { itemId: 'bath{N}-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe light switches and outlet covers', products: ['disinfectant', 'cloth'], staffCount: 1 },
  { itemId: 'bath{N}-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Remove and replace trash bags', products: ['trash_bags'], staffCount: 1 }
];

const SHOWER_ITEMS_TEMPLATE = [
  { itemId: 'shower{N}-stalls', label: 'Shower Stalls', category: 'shower', hours: 0.5, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Scrub and clean shower stalls', products: ['bathroom_cleaner', 'scrub_brush'], staffCount: 1 },
  { itemId: 'shower{N}-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean mirrors and glass partitions', products: ['glass_cleaner', 'cloth'], staffCount: 1 },
  { itemId: 'shower{N}-hooks', label: 'Hooks & Rails', category: 'fixtures', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe hooks, rails, and fixtures', products: ['microfiber_cloth'], staffCount: 1 }
];

const OFFICE_ITEMS_TEMPLATE = [
  { itemId: 'office{N}-desks', label: 'Desks Wiped', category: 'surfaces', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe down desks and work surfaces', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
  { itemId: 'office{N}-chairs', label: 'Chairs Wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe office chairs and seating', products: ['microfiber_cloth'], staffCount: 1 },
  { itemId: 'office{N}-floor', label: 'Carpet Vacuum', category: 'floors', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Vacuum carpets and floors', products: ['vacuum_cleaner'], staffCount: 1 },
  { itemId: 'office{N}-trash', label: 'Remove Trash', category: 'trash', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Empty waste baskets and replace liners', products: ['trash_bags'], staffCount: 1 },
  { itemId: 'office{N}-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe light switches and handles', products: ['disinfectant', 'cloth'], staffCount: 1 }
];

// ============================================================
// STATIC ROOM DEFINITIONS (same across all property types)
// ============================================================

const KITCHEN_ROOM = {
  roomId: 'kitchen',
  emoji: '≡ƒì│',
  title: 'Kitchen',
  items: [
    { itemId: 'kitchen-sinks', label: 'Sinks and Faucets', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Clean and polish sinks and faucets', products: ['kitchen_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-microwave-out', label: 'Microwave (outside)', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Wipe exterior of microwave', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-countertops', label: 'Countertops', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Wipe and sanitize counter surfaces', products: ['kitchen_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-floors', label: 'Floors Mopped', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Mop kitchen floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'kitchen-baseboards', label: 'Baseboards wiped', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Wipe kitchen baseboards', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'kitchen-garbage', label: 'Garbage bags removed', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Remove and replace garbage bags', products: ['trash_bags'], staffCount: 1 },
    { itemId: 'kitchen-stovetop', label: 'Stovetop wiped', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Clean and wipe stovetop surface', products: ['kitchen_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-fridge-out', label: 'Refrig. (outside)', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Wipe exterior of refrigerator', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-drawers', label: 'Drawers/Pantry (empty & wipe) - $50', category: 'drawer', hours: 1, baseCharge: 50, serviceCode: 'KDRAW', difficulty: 'basic', workType: 'labor', skillLevel: 'intermediate', description: 'Empty and wipe drawers and pantry shelves', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'kitchen-lights', label: 'Light switches', category: 'basic', hours: 0.5, workType: 'labor', skillLevel: 'basic', description: 'Wipe light switches and handles', products: ['disinfectant', 'cloth'], staffCount: 1 }
  ]
};

const LIVING_AREA_ROOM = {
  roomId: 'living-room',
  emoji: '≡ƒ¢ï∩╕Å',
  title: 'Living Room',
  items: [
    { itemId: 'living-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Vacuum carpet thoroughly', products: ['vacuum_cleaner'], staffCount: 1 },
    { itemId: 'living-tile', label: 'Tile cleaned', category: 'floors', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean tile floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'living-walls', label: 'Spot cleaning of walls', category: 'walls', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Spot clean walls for marks and scuffs', products: ['wall_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'living-decobing', label: 'Decobing (ceiling/walls)', category: 'high', hours: 0.4, difficulty: 'deep', workType: 'labor', skillLevel: 'intermediate', description: 'Remove cobwebs from ceiling and walls', products: ['duster'], staffCount: 1 },
    { itemId: 'living-shelves', label: 'Shelves dusted', category: 'dust', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Dust shelves and surfaces', products: ['microfiber_cloth', 'duster'], staffCount: 1 },
    { itemId: 'living-baseboards', label: 'Baseboards', category: 'trim', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe baseboards', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'living-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe light switches', products: ['disinfectant', 'cloth'], staffCount: 1 }
  ]
};

const ENTRYWAY_ROOM = {
  roomId: 'entryway',
  emoji: '≡ƒÜ¬',
  title: 'Entryway',
  items: [
    { itemId: 'entryway-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Vacuum entryway carpet', products: ['vacuum_cleaner'], staffCount: 1 },
    { itemId: 'entryway-tile', label: 'Tile cleaned', category: 'floors', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean tile floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'entryway-wood', label: 'Wood cleaned', category: 'floors', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean and polish wood floors', products: ['wood_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'entryway-shelves', label: 'Shelves dusted', category: 'dust', hours: 0.15, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Dust shelves and decorative items', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'entryway-baseboards', label: 'Baseboards', category: 'trim', hours: 0.15, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe baseboards', products: ['microfiber_cloth'], staffCount: 1 }
  ]
};

const LAUNDRY_ROOM = {
  roomId: 'laundry',
  emoji: '≡ƒº║',
  title: 'Laundry Room',
  items: [
    { itemId: 'laundry-sink', label: 'Sink Tub (stainless steel)', category: 'fixtures', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean stainless steel sink/tub', products: ['stainless_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'laundry-faucets', label: 'Faucets & Taps wiped', category: 'fixtures', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Polish faucets and taps', products: ['chrome_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'laundry-machines', label: 'Machines Wiped', category: 'appliances', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe exterior of washer and dryer', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'laundry-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean and dry laundry room floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'laundry-cabinets', label: 'Cabinets wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe cabinet surfaces', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'laundry-doors', label: 'Cabinet doors & handles', category: 'touchpoints', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe cabinet doors and handles', products: ['disinfectant', 'cloth'], staffCount: 1 },
    { itemId: 'laundry-shelves', label: 'Shelving cleaned', category: 'dust', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Dust shelves', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'laundry-baseboards', label: 'Baseboards & Light switches', category: 'trim', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe baseboards and light switches', products: ['microfiber_cloth'], staffCount: 1 }
  ]
};

const LUNCHROOM_ROOM = {
  roomId: 'lunchroom',
  emoji: '≡ƒì┤',
  title: 'Lunchroom',
  items: [
    { itemId: 'lunchroom-tables', label: 'Tables Wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe and sanitize lunch tables', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'lunchroom-chairs', label: 'Chairs Wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe chairs', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'lunchroom-fridge', label: 'Refrigerator (outside)', category: 'appliances', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe refrigerator exterior', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'lunchroom-sink', label: 'Sink/Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean sink and faucets', products: ['bathroom_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'lunchroom-floors', label: 'Floors Cleaned', category: 'floors', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Mop lunchroom floors', products: ['floor_cleaner', 'mop'], staffCount: 1 }
  ]
};

const CIRCULATION_ROOM = {
  roomId: 'circulation',
  emoji: '≡ƒÜ╢',
  title: 'Circulation (Hallways/Entry)',
  items: [
    { itemId: 'circ-carpets', label: 'Carpets Vacuumed', category: 'floors', hours: 0.5, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Vacuum all carpets in hallways', products: ['vacuum_cleaner'], staffCount: 1 },
    { itemId: 'circ-tile', label: 'Tile Floors Cleaned', category: 'floors', hours: 0.5, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean tile floors throughout circulation areas', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'circ-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe baseboards in hallways', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'circ-doors', label: 'Door handles & frames', category: 'touchpoints', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe door handles and frames', products: ['disinfectant', 'cloth'], staffCount: 1 },
    { itemId: 'circ-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.1, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe light switches', products: ['disinfectant', 'cloth'], staffCount: 1 }
  ]
};

const RECEPTION_ROOM = {
  roomId: 'reception',
  emoji: '≡ƒô₧',
  title: 'Reception/Front Desk',
  items: [
    { itemId: 'reception-desk', label: 'Reception Desk Wiped', category: 'surfaces', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe and sanitize reception desk', products: ['surface_cleaner', 'cloth'], staffCount: 1 },
    { itemId: 'reception-chairs', label: 'Waiting Area Chairs', category: 'surfaces', hours: 0.2, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Wipe waiting area seating', products: ['microfiber_cloth'], staffCount: 1 },
    { itemId: 'reception-floors', label: 'Floors Cleaned', category: 'floors', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean reception area floors', products: ['floor_cleaner', 'mop'], staffCount: 1 },
    { itemId: 'reception-windows', label: 'Windows & Glass Doors', category: 'glass', hours: 0.3, difficulty: 'basic', workType: 'labor', skillLevel: 'basic', description: 'Clean windows and glass doors', products: ['glass_cleaner', 'cloth'], staffCount: 1 }
  ]
};
// ============================================================
// HELPER FUNCTIONS - Generate N instances of templated rooms
// ============================================================

function generateRoomInstances(template, count, roomType) {
  const rooms = [];
  for (let i = 1; i <= count; i++) {
    const items = template.map(item => ({
      ...item,
      itemId: item.itemId.replace('{N}', i),
      label: item.label
    }));
    
    const title = {
      'Bedroom': `Bedroom ${i}`,
      'Bathroom': `Bathroom ${i}`,
      'Shower': `Shower ${i}`,
      'Office': `Office ${i}`
    }[roomType] || `${roomType} ${i}`;

    const emoji = {
      'Bedroom': '≡ƒ¢Å∩╕Å',
      'Bathroom': '≡ƒ¢ü',
      'Shower': '≡ƒÜ┐',
      'Office': '≡ƒÆ╝'
    }[roomType] || '≡ƒôï';

    rooms.push({
      subRoomId: `${roomType.toLowerCase()}${i}`,
      title: title,
      emoji: emoji,
      items: items
    });
  }
  return rooms;
}

// ============================================================
// ROOM CLASS-BASED GENERATION
// ============================================================

const ROOM_TYPE_KEYS = {
  Bedroom: 'bedroom',
  Bathroom: 'bathroom',
  Kitchen: 'kitchen',
  LivingArea: 'living_area',
  Laundry: 'laundry',
  Entryway: 'entryway',
  Basement: 'basement',
  UtilitySpecial: 'utility_special',
  HomeOffice: 'home_office',
  Outdoor: 'outdoor',
  Office: 'office',
  Reception: 'reception',
  Boardroom: 'boardroom',
  Lunchroom: 'lunchroom',
  Circulation: 'circulation',
  SalesFloor: 'sales_floor',
  Stockroom: 'stockroom',
  LockerRoom: 'locker_room',
  LoadingDock: 'loading_dock',
  Warehouse: 'warehouse',
  Carpark: 'carpark',
  Staircase: 'staircase',
  Utility: 'utility',
  TradeWorkshop: 'trade'
};

const ROOM_EMOJI = {
  Bedroom: '≡ƒ¢Å∩╕Å',
  Bathroom: '≡ƒ¢ü',
  Kitchen: '≡ƒì│',
  LivingArea: '≡ƒ¢ï∩╕Å',
  Laundry: '≡ƒº║',
  Entryway: '≡ƒÜ¬',
  Basement: '≡ƒº▒',
  UtilitySpecial: 'ΓÜÖ∩╕Å',
  HomeOffice: '≡ƒºæΓÇì≡ƒÆ╗',
  Outdoor: '≡ƒî┐',
  Office: '≡ƒÆ╝',
  Reception: '≡ƒô₧',
  Boardroom: '≡ƒôè',
  Lunchroom: '≡ƒì╜∩╕Å',
  Circulation: '≡ƒÜ╢',
  SalesFloor: '≡ƒ¢ì∩╕Å',
  Stockroom: '≡ƒôª',
  LockerRoom: '≡ƒº╝',
  LoadingDock: '≡ƒÜÜ',
  Warehouse: '≡ƒôª',
  Carpark: '≡ƒà┐∩╕Å',
  Staircase: '≡ƒ¬£',
  Utility: 'ΓÜÖ∩╕Å',
  TradeWorkshop: '≡ƒöº',
  Shower: '≡ƒÜ┐',
  Toilet: '≡ƒÜ╜'
};

const ROOM_TEMPLATES = {
  Bedroom: typeof BEDROOM_ITEMS_TEMPLATE !== 'undefined' ? BEDROOM_ITEMS_TEMPLATE : [],
  Bathroom: typeof BATHROOM_ITEMS_TEMPLATE !== 'undefined' ? BATHROOM_ITEMS_TEMPLATE : [],
  Kitchen: typeof KITCHEN_ROOM !== 'undefined' ? KITCHEN_ROOM.items : [],
  LivingArea: typeof LIVING_AREA_ROOM !== 'undefined' ? LIVING_AREA_ROOM.items : [],
  Laundry: typeof LAUNDRY_ROOM !== 'undefined' ? LAUNDRY_ROOM.items : [],
  Shower: typeof SHOWER_ITEMS_TEMPLATE !== 'undefined' ? SHOWER_ITEMS_TEMPLATE : [],
  Office: typeof OFFICE_ITEMS_TEMPLATE !== 'undefined' ? OFFICE_ITEMS_TEMPLATE : []
};

function resolveServiceType(propertyType) {
  if (!propertyType) return 'residential';
  if (propertyType.startsWith('commercial')) return 'commercial';
  if (propertyType.startsWith('eot') || propertyType === 'end-of-tenancy' || propertyType === 'end_of_tenancy') {
    return 'eot';
  }
  return 'residential';
}

function createRoomItems(roomType, number, serviceType) {
  if (typeof AysRoomRegistry === 'undefined') return null;
  const RoomClass = AysRoomRegistry.get(roomType);
  if (!RoomClass) return null;

  const roomKey = ROOM_TYPE_KEYS[roomType] || roomType.toLowerCase();
  const room = new RoomClass({
    roomId: `${roomKey}_${number}`,
    roomType: roomKey,
    serviceType,
    variant: 'standard',
    number
  });
  return room.renderItems();
}

function buildRoomInstances(roomType, count, serviceType) {
  const itemsFromClass = createRoomItems(roomType, 1, serviceType);
  if (!itemsFromClass) {
    return generateRoomInstances(ROOM_TEMPLATES[roomType] || [], count, roomType);
  }

  const rooms = [];
  for (let i = 1; i <= count; i++) {
    const items = createRoomItems(roomType, i, serviceType);
    rooms.push({
      subRoomId: `${roomType.toLowerCase()}${i}`,
      title: `${roomType} ${i}`,
      emoji: ROOM_EMOJI[roomType] || '≡ƒôï',
      items: items
    });
  }
  return rooms;
}

function buildSingleRoom(roomType, serviceType, titleOverride = null) {
  const items = createRoomItems(roomType, 1, serviceType);
  if (!items) return null;

  const roomId = roomType.toLowerCase();
  const title = titleOverride || roomType.replace(/([A-Z])/g, ' $1').trim();
  return {
    roomId,
    emoji: ROOM_EMOJI[roomType] || '≡ƒôï',
    title,
    items
  };
}

// ============================================================
// CONFIG BUILDER - Fluent interface for building configs
// ============================================================

class AysChecklistConfigBuilder {
  constructor(propertyType) {
    this.propertyType = propertyType;
    this.typeConfig = AysPropertyType.getType(propertyType);
    
    if (!this.typeConfig) {
      throw new Error(`Invalid property type: ${propertyType}`);
    }

    // Initialize with NULL defaults (user MUST provide, except for fixed-count rooms)
    // This prevents assumptions about building structure
    this.params = {
      numBedrooms: null,
      numBathrooms: null,
      numFloors: null,
      numOfficesPerFloor: null,
      numOffices: null,
      numShowers: null,
      numLoadingDocks: null,
      numAdminOffices: null
    };
  }

  static forPropertyType(typeName) {
    return new AysChecklistConfigBuilder(typeName);
  }

  withBedroomCount(count) {
    // Validate and warn about commercial threshold
    if (this.typeConfig.config.minBedrooms && this.typeConfig.config.maxBedrooms) {
      if (count < this.typeConfig.config.minBedrooms) {
        throw new Error(
          `Bedroom count ${count} below minimum for ${this.propertyType}. ` +
          `Minimum: ${this.typeConfig.config.minBedrooms}`
        );
      }
      if (count > this.typeConfig.config.maxBedrooms) {
        // Warn but don't prevent ΓÇö let user proceed if they want
        this.warnings = this.warnings || [];
        this.warnings.push({
          type: 'commercial_threshold',
          severity: 'warning',
          message: `Property with ${count} bedrooms exceeds residential limit (${this.typeConfig.config.maxBedrooms}). Consider using commercial pricing instead.`,
          suggestion: 'Switch to commercial_office type for properties this large'
        });
      }
    }
    this.params.numBedrooms = count;
    return this;
  }

  withBathroomCount(count) {
    // Validate range for residential types
    if (this.typeConfig.config.minBathrooms && this.typeConfig.config.maxBathrooms) {
      if (count < this.typeConfig.config.minBathrooms || count > this.typeConfig.config.maxBathrooms) {
        throw new Error(
          `Bathroom count ${count} out of range for ${this.propertyType}. ` +
          `Allowed: ${this.typeConfig.config.minBathrooms}-${this.typeConfig.config.maxBathrooms}`
        );
      }
    }
    this.params.numBathrooms = count;
    return this;
  }

  // Multi-story office building (5 floors ├ù 6 offices per floor)
  withMultiStoryOffice(numFloors, officesPerFloor) {
    this.params.numFloors = numFloors;
    this.params.numOfficesPerFloor = officesPerFloor;
    this.params.numOffices = numFloors * officesPerFloor;
    return this;
  }

  // Single-floor office (just 6 offices total)
  withOfficeCount(count) {
    this.params.numOffices = count;
    this.params.numFloors = null;
    this.params.numOfficesPerFloor = null;
    return this;
  }

  // Gym/Fitness center showers
  withShowerCount(count) {
    this.params.numShowers = count;
    return this;
  }

  // Warehouse loading docks
  withLoadingDockCount(count) {
    this.params.numLoadingDocks = count;
    return this;
  }

  // Warehouse admin offices
  withAdminOfficeCount(count) {
    this.params.numAdminOffices = count;
    return this;
  }

  build() {
    // Validate required parameters are set
    for (const roomSpec of this.typeConfig.rooms) {
      if (roomSpec.type === 'Bedroom' && roomSpec.count === null && this.params.numBedrooms === null) {
        throw new Error('Bedrooms required but not specified. Call withBedroomCount()');
      }
      if (roomSpec.type === 'Bathroom' && roomSpec.count === null && this.params.numBathrooms === null) {
        throw new Error('Bathrooms required but not specified. Call withBathroomCount()');
      }
      if (roomSpec.type === 'Office' && roomSpec.count === null && this.params.numOffices === null) {
        throw new Error('Office count required but not specified. Call withOfficeCount() or withMultiStoryOffice()');
      }
      if (roomSpec.type === 'Shower' && roomSpec.count === null && this.params.numShowers === null) {
        throw new Error('Shower count required but not specified. Call withShowerCount()');
      }
      if (roomSpec.type === 'LoadingDock' && roomSpec.count === null && this.params.numLoadingDocks === null) {
        throw new Error('Loading dock count required but not specified. Call withLoadingDockCount()');
      }
    }

    const rooms = [];
    const serviceType = resolveServiceType(this.propertyType);
    this.serviceType = serviceType;
    
    // Add rooms based on property type configuration
    for (const roomSpec of this.typeConfig.rooms) {
      if (roomSpec.type === 'Bedroom' && roomSpec.count === null) {
        rooms.push({
          roomId: 'bedrooms',
          emoji: '≡ƒ¢Å∩╕Å',
          title: `Bedrooms (1-${this.params.numBedrooms})`,
          subRooms: buildRoomInstances('Bedroom', this.params.numBedrooms, serviceType)
        });
      } else if (roomSpec.type === 'Bathroom' && roomSpec.count === null) {
        rooms.push({
          roomId: 'bathrooms',
          emoji: '≡ƒ¢ü',
          title: `Bathrooms (1-${this.params.numBathrooms})`,
          subRooms: buildRoomInstances('Bathroom', this.params.numBathrooms, serviceType)
        });
      } else if (roomSpec.type === 'Kitchen') {
        const room = buildSingleRoom('Kitchen', serviceType, 'Kitchen');
        rooms.push(room || KITCHEN_ROOM);
      } else if (roomSpec.type === 'LivingArea') {
        const room = buildSingleRoom('LivingArea', serviceType, 'Living Room');
        rooms.push(room || LIVING_AREA_ROOM);
      } else if (roomSpec.type === 'Laundry') {
        const room = buildSingleRoom('Laundry', serviceType, 'Laundry Room');
        rooms.push(room || LAUNDRY_ROOM);
      } else if (roomSpec.type === 'Shower') {
        rooms.push({
          roomId: 'showers',
          emoji: '≡ƒÜ┐',
          title: `Showers (1-${this.params.numShowers})`,
          subRooms: buildRoomInstances('Shower', this.params.numShowers, serviceType)
        });
      } else if (roomSpec.type === 'Office') {
        // Multi-story: show floors
        if (this.params.numFloors) {
          rooms.push({
            roomId: 'offices',
            emoji: '≡ƒÆ╝',
            title: `Offices (${this.params.numFloors} floors ├ù ${this.params.numOfficesPerFloor} offices = ${this.params.numOffices} total)`,
            subRooms: this._generateMultiStoryOffices()
          });
        } else {
          // Single floor
          rooms.push({
            roomId: 'offices',
            emoji: '≡ƒÆ╝',
            title: `Offices (1-${this.params.numOffices})`,
            subRooms: buildRoomInstances('Office', this.params.numOffices, serviceType)
          });
        }
      } else if (roomSpec.type === 'Reception') {
        const room = buildSingleRoom('Reception', serviceType, 'Reception/Front Desk');
        rooms.push(room || RECEPTION_ROOM);
      } else if (roomSpec.type === 'Lunchroom') {
        const room = buildSingleRoom('Lunchroom', serviceType, 'Lunchroom');
        rooms.push(room || LUNCHROOM_ROOM);
      } else if (roomSpec.type === 'Circulation') {
        const room = buildSingleRoom('Circulation', serviceType, 'Circulation (Hallways/Entry)');
        rooms.push(room || CIRCULATION_ROOM);
      } else if (roomSpec.type === 'SalesFloor') {
        const room = buildSingleRoom('SalesFloor', serviceType, 'Sales Floor');
        rooms.push(room || {
          roomId: 'sales-floor',
          emoji: '≡ƒ¢ì∩╕Å',
          title: 'Sales Floor',
          items: []
        });
      } else if (roomSpec.type === 'Stockroom') {
        const room = buildSingleRoom('Stockroom', serviceType, 'Stockroom');
        rooms.push(room || {
          roomId: 'stockroom',
          emoji: '≡ƒôª',
          title: 'Stockroom',
          items: []
        });
      } else if (roomSpec.type === 'LockerRoom') {
        if (roomSpec.count && roomSpec.count > 1) {
          rooms.push({
            roomId: 'locker-rooms',
            emoji: '≡ƒº╝',
            title: `Locker Rooms (1-${roomSpec.count})`,
            subRooms: buildRoomInstances('LockerRoom', roomSpec.count, serviceType)
          });
        } else {
          const room = buildSingleRoom('LockerRoom', serviceType, 'Locker Room');
          rooms.push(room || {
            roomId: 'locker-room',
            emoji: '≡ƒº╝',
            title: 'Locker Room',
            items: []
          });
        }
      } else if (roomSpec.type === 'LoadingDock') {
        rooms.push({
          roomId: 'loading-docks',
          emoji: '≡ƒÜÜ',
          title: `Loading Docks (1-${this.params.numLoadingDocks})`,
          subRooms: buildRoomInstances('LoadingDock', this.params.numLoadingDocks, serviceType)
        });
      } else if (roomSpec.type === 'Toilet') {
        rooms.push({
          roomId: 'toilets',
          emoji: '≡ƒÜ╜',
          title: 'Restrooms',
          items: [
            { itemId: 'toilet-stalls', label: 'Stalls Cleaned', category: 'fixtures', hours: 0.5, difficulty: 'basic' },
            { itemId: 'toilet-sinks', label: 'Sinks & Faucets', category: 'fixtures', hours: 0.3, difficulty: 'basic' },
            { itemId: 'toilet-mirrors', label: 'Mirrors Cleaned', category: 'glass', hours: 0.2, difficulty: 'basic' },
            { itemId: 'toilet-floors', label: 'Floors Mopped', category: 'floors', hours: 0.3, difficulty: 'basic' },
            { itemId: 'toilet-trash', label: 'Trash Removed', category: 'trash', hours: 0.1, difficulty: 'basic' }
          ]
        });
      } else if (roomSpec.type === 'Warehouse') {
        const room = buildSingleRoom('Warehouse', serviceType, 'Warehouse Floor');
        rooms.push(room || {
          roomId: 'warehouse',
          emoji: '≡ƒôª',
          title: 'Warehouse Floor',
          items: [
            { itemId: 'warehouse-floors', label: 'Concrete Floors Swept', category: 'floors', hours: 1, difficulty: 'basic' },
            { itemId: 'warehouse-shelving', label: 'Shelving Wiped', category: 'surfaces', hours: 1, difficulty: 'basic' },
            { itemId: 'warehouse-trash', label: 'Trash Removed', category: 'trash', hours: 0.5, difficulty: 'basic' }
          ]
        });
      }
    }

    const propertyWideItems = ITEM_DEFINITIONS?.[serviceType]?.property_wide?.standard;
    if (Array.isArray(propertyWideItems) && propertyWideItems.length > 0) {
      rooms.unshift({
        roomId: 'property-wide',
        emoji: '≡ƒÅá',
        title: 'Property-wide',
        items: propertyWideItems
      });
    }

    return {
      propertyType: this.propertyType,
      params: this.params,
      rooms: rooms,
      warnings: this.warnings || []  // UI can read and display these
    };
  }

  /**
   * Generate multi-story office structure
   * Example: 5 floors with 6 offices per floor
   * Organized as: Floor 1 (Offices 1-6), Floor 2 (Offices 7-12), etc.
   */
  _generateMultiStoryOffices() {
    const floors = [];
    let officeCounter = 1;

    for (let floor = 1; floor <= this.params.numFloors; floor++) {
      const floorOffices = [];
      const startOffice = officeCounter;

      for (let office = 0; office < this.params.numOfficesPerFloor; office++) {
        const items = createRoomItems('Office', officeCounter, this.serviceType) || OFFICE_ITEMS_TEMPLATE.map(item => ({
          ...item,
          itemId: item.itemId.replace('{N}', officeCounter),
          label: item.label
        }));

        floorOffices.push({
          subRoomId: `office${officeCounter}`,
          title: `Office ${officeCounter}`,
          emoji: '≡ƒÆ╝',
          items: items
        });

        officeCounter++;
      }

      floors.push({
        subRoomId: `floor${floor}`,
        title: `Floor ${floor} (Offices ${startOffice}-${officeCounter - 1})`,
        emoji: '≡ƒÅó',
        items: floorOffices  // Nested sub-rooms
      });
    }

    return floors;
  }

// ============================================================
// DEFAULT CONFIG - Loaded on page init
// ============================================================

// DEFAULT: Residential (3-10 bedrooms) - defaults to 3 bed, 2 bath
let CHECKLIST_CONFIG = AysChecklistConfigBuilder
  .forPropertyType('residential')
  .withBedroomCount(3)
  .withBathroomCount(2)
  .build();

// ============================================================
// PROPERTY CONFIG - User-adjustable parameters
// ============================================================

const PROPERTY_CONFIG = {
  property_type: 'residential',
  
  // Size parameters (changed by user via Settings)
  numBedrooms: 3,           // Default for residential
  numBathrooms: 2,          // Default for residential
  numFloors: null,
  numOfficesPerFloor: null,
  numOffices: null,
  numShowers: null,
  numLoadingDocks: null,
  numAdminOffices: null,

  /**
   * Update property type and rebuild config
   * Called when user changes property type in Settings
   * 
   * RESIDENTIAL USAGE (Parametric - 3 to 10 bedrooms):
   *   // 5-bedroom house, 3 bathrooms
   *   PROPERTY_CONFIG.setPropertyType('residential', { 
   *     numBedrooms: 5,
   *     numBathrooms: 3 
   *   })
   *   
   *   // 10-bedroom mansion, 5 bathrooms
   *   PROPERTY_CONFIG.setPropertyType('residential', { 
   *     numBedrooms: 10,
   *     numBathrooms: 5 
   *   })
   * 
   * RESIDENTIAL USAGE (Preset types - fixed bedroom count):
   *   // Preset: exactly 3 bedrooms, 2 bathrooms
   *   PROPERTY_CONFIG.setPropertyType('residential_3bed')
   *   
   *   // Preset: exactly 4 bedrooms, 2 bathrooms
   *   PROPERTY_CONFIG.setPropertyType('residential_4bed')
   * 
   * COMMERCIAL OFFICE USAGE:
   *   // Single-floor office with 6 offices
   *   PROPERTY_CONFIG.setPropertyType('commercial_office', { numOffices: 6 })
   *   
   *   // Multi-story office (5 floors, 6 per floor)
   *   PROPERTY_CONFIG.setPropertyType('commercial_office', { 
   *     numFloors: 5, 
   *     numOfficesPerFloor: 6 
   *   })
   */
  setPropertyType: function(typeName, sizeParams = {}) {
    if (!AysPropertyType.isValidType(typeName)) {
      console.error(`Invalid property type: ${typeName}`);
      return;
    }

    this.property_type = typeName;
    
    // Create builder for the new type
    const builder = AysChecklistConfigBuilder.forPropertyType(typeName);
    const typeConfig = AysPropertyType.getType(typeName);

    // Apply residential parameters
    if (sizeParams.numBedrooms) {
      builder.withBedroomCount(sizeParams.numBedrooms);
      this.numBedrooms = sizeParams.numBedrooms;
    } else if (typeConfig.config.numBedrooms) {
      // Use preset default
      builder.withBedroomCount(typeConfig.config.numBedrooms);
      this.numBedrooms = typeConfig.config.numBedrooms;
    }
    
    if (sizeParams.numBathrooms) {
      builder.withBathroomCount(sizeParams.numBathrooms);
      this.numBathrooms = sizeParams.numBathrooms;
    } else if (typeConfig.config.numBathrooms) {
      // Use preset default
      builder.withBathroomCount(typeConfig.config.numBathrooms);
      this.numBathrooms = typeConfig.config.numBathrooms;
    }

    // Apply commercial office parameters
    if (sizeParams.numFloors && sizeParams.numOfficesPerFloor) {
      builder.withMultiStoryOffice(sizeParams.numFloors, sizeParams.numOfficesPerFloor);
      this.numFloors = sizeParams.numFloors;
      this.numOfficesPerFloor = sizeParams.numOfficesPerFloor;
      this.numOffices = sizeParams.numFloors * sizeParams.numOfficesPerFloor;
    } else if (sizeParams.numOffices) {
      builder.withOfficeCount(sizeParams.numOffices);
      this.numOffices = sizeParams.numOffices;
      this.numFloors = null;
      this.numOfficesPerFloor = null;
    }

    // Apply gym parameters
    if (sizeParams.numShowers) {
      builder.withShowerCount(sizeParams.numShowers);
      this.numShowers = sizeParams.numShowers;
    }

    // Apply warehouse parameters
    if (sizeParams.numLoadingDocks) {
      builder.withLoadingDockCount(sizeParams.numLoadingDocks);
      this.numLoadingDocks = sizeParams.numLoadingDocks;
    }
    if (sizeParams.numAdminOffices) {
      builder.withAdminOfficeCount(sizeParams.numAdminOffices);
      this.numAdminOffices = sizeParams.numAdminOffices;
    }

    // Build and update global config
    try {
      CHECKLIST_CONFIG = builder.build();
    } catch (error) {
      console.error(`Config build error for ${typeName}:`, error.message);
      throw error;
    }

    return CHECKLIST_CONFIG;
  },

  /**
   * Get the current checklist configuration
   * Returns the globally-built CHECKLIST_CONFIG object
   * Used by factory regeneration when property type changes
   * @returns {Object} Current CHECKLIST_CONFIG
   */
  getConfig: function() {
    return CHECKLIST_CONFIG;
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHECKLIST_CONFIG,
    PROPERTY_CONFIG,
    AysChecklistConfigBuilder
  };
}

/**
 * Helper for UI layer to manage commercial threshold warning label
 * Call this whenever config changes to show/hide the red warning
 */
function updateCommercialWarningLabel() {
  let warningLabel = document.getElementById('commercial-threshold-warning');
  
  if (!CHECKLIST_CONFIG.warnings || CHECKLIST_CONFIG.warnings.length === 0) {
    // No warnings ΓÇö remove label if it exists
    if (warningLabel) {
      warningLabel.remove();
    }
    return;
  }

  // Find commercial_threshold warning
  const commercialWarning = CHECKLIST_CONFIG.warnings.find(w => w.type === 'commercial_threshold');
  
  if (!commercialWarning) {
    // Warning cleared ΓÇö remove label
    if (warningLabel) {
      warningLabel.remove();
    }
    return;
  }

  // Create or update warning label
  if (!warningLabel) {
    warningLabel = document.createElement('div');
    warningLabel.id = 'commercial-threshold-warning';
    warningLabel.style.cssText = `
      background-color: #fff3cd;
      border: 2px solid #ff6b6b;
      border-radius: 4px;
      padding: 12px;
      margin: 10px 0;
      color: #d32f2f;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    warningLabel.innerHTML = `
      <span style="font-size: 20px;">ΓÜá∩╕Å</span>
      <div>
        <strong>${commercialWarning.message}</strong>
        <div style="font-size: 12px; font-weight: normal; margin-top: 4px; color: #666;">
          ${commercialWarning.suggestion}
        </div>
      </div>
    `;
    
    // Insert at top of settings panel (or adjust selector as needed)
    const settingsPanel = document.querySelector('[data-settings-panel]') || document.body;
    settingsPanel.insertBefore(warningLabel, settingsPanel.firstChild);
  } else {
    warningLabel.style.display = 'flex';
  }
}
