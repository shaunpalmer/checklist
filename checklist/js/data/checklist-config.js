/**
 * Checklist Configuration Data
 * 
 * This file contains all rooms and checklist items extracted from the hardcoded HTML.
 * Used by the page generator to dynamically create AysDisclosureCard components.
 * 
 * FLEXIBLE ARCHITECTURE:
 * - Specify number of bedrooms/bathrooms needed
 * - Generator creates N rooms automatically
 * - No HTML changes required for different property sizes
 * 
 * Structure:
 * - Each room has: roomId, emoji, title, items array
 * - Each item has: itemId, label, category, hours, [optional fields]
 */

// ========== CONFIGURATION ==========
// Adjust these to match the property being cleaned
const PROPERTY_CONFIG = {
  numBedrooms: 4,      // Change to 5, 7, etc.
  numBathrooms: 4,     // Change to 3, 5, etc.
};

// ========== ITEM TEMPLATES ==========
// Reusable item templates for bedrooms
const BEDROOM_ITEMS_TEMPLATE = [
  { itemId: 'bed{N}-beds', label: 'Beds Made', category: 'beds', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bed{N}-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bed{N}-wood', label: 'Wood Floors Cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bed{N}-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
  { itemId: 'bed{N}-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' }
];

// Reusable item templates for bathrooms
const BATHROOM_ITEMS_TEMPLATE = [
  { itemId: 'bath{N}-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bath{N}-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic' },
  { itemId: 'bath{N}-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bath{N}-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
  { itemId: 'bath{N}-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
  { itemId: 'bath{N}-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic' },
  { itemId: 'bath{N}-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
  { itemId: 'bath{N}-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
  { itemId: 'bath{N}-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' },
  { itemId: 'bath{N}-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic' }
];

// ========== HELPER FUNCTIONS ==========
/**
 * Generate N bedroom sub-rooms from template
 * @param {number} count - Number of bedrooms
 * @returns {Array} Array of bedroom configurations
 */
function generateBedrooms(count) {
  const bedrooms = [];
  for (let i = 1; i <= count; i++) {
    const items = BEDROOM_ITEMS_TEMPLATE.map(item => ({
      ...item,
      itemId: item.itemId.replace('{N}', i),
      label: item.label
    }));
    
    bedrooms.push({
      subRoomId: `bedroom${i}`,
      title: `Bedroom ${i}`,
      items: items
    });
  }
  return bedrooms;
}

/**
 * Generate N bathroom sub-rooms from template
 * @param {number} count - Number of bathrooms
 * @returns {Array} Array of bathroom configurations
 */
function generateBathrooms(count) {
  const bathrooms = [];
  for (let i = 1; i <= count; i++) {
    const items = BATHROOM_ITEMS_TEMPLATE.map(item => ({
      ...item,
      itemId: item.itemId.replace('{N}', i),
      label: item.label
    }));
    
    bathrooms.push({
      subRoomId: `bathroom${i}`,
      title: `Bathroom ${i}`,
      items: items
    });
  }
  return bathrooms;
}

// ========== DYNAMIC CONFIG GENERATION ==========
    {
      roomId: 'kitchen',
      emoji: '🍳',
      title: 'Kitchen',
      items: [
        { itemId: 'kitchen-sinks', label: 'Sinks and Faucets', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-microwave-out', label: 'Microwave (outside)', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-countertops', label: 'Countertops', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-floors', label: 'Floors Mopped', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-baseboards', label: 'Baseboards wiped', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-garbage', label: 'Garbage bags removed', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-stovetop', label: 'Stovetop wiped', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-fridge-out', label: 'Refrig. (outside)', category: 'basic', hours: 0.5 },
        { itemId: 'kitchen-drawers', label: 'Drawers/Pantry (empty & wipe) - $50', category: 'drawer', hours: 1, baseCharge: 50, serviceCode: 'KDRAW', difficulty: 'basic' },
        { itemId: 'kitchen-lights', label: 'Light switches', category: 'basic', hours: 0.5 }
      ]
    },
    {
      roomId: 'living-room',
      emoji: '🛋️',
      title: 'Living Room',
      items: [
        { itemId: 'living-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'living-tile', label: 'Tile cleaned', category: 'floors', hours: 0.3, difficulty: 'basic' },
        { itemId: 'living-walls', label: 'Spot cleaning of walls', category: 'walls', hours: 0.2, difficulty: 'basic' },
        { itemId: 'living-decobing', label: 'Decobing (ceiling/walls)', category: 'high', hours: 0.4, difficulty: 'deep' },
        { itemId: 'living-shelves', label: 'Shelves dusted', category: 'dust', hours: 0.2, difficulty: 'basic' },
        { itemId: 'living-baseboards', label: 'Baseboards', category: 'trim', hours: 0.2, difficulty: 'basic' },
        { itemId: 'living-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.1, difficulty: 'basic' }
      ]
    },
    {
      roomId: 'entryway',
      emoji: '🚪',
      title: 'Entryway',
      items: [
        { itemId: 'entryway-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'entryway-tile', label: 'Tile cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'entryway-wood', label: 'Wood cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'entryway-shelves', label: 'Shelves dusted', category: 'dust', hours: 0.15, difficulty: 'basic' },
        { itemId: 'entryway-baseboards', label: 'Baseboards', category: 'trim', hours: 0.15, difficulty: 'basic' }
      ]
    },
    {
      roomId: 'laundry',
      emoji: '🧺',
      title: 'Laundry Room',
      items: [
        { itemId: 'laundry-sink', label: 'Sink Tub (stainless steel)', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
        { itemId: 'laundry-faucets', label: 'Faucets & Taps wiped', category: 'fixtures', hours: 0.1, difficulty: 'basic' },
        { itemId: 'laundry-machines', label: 'Machines Wiped', category: 'appliances', hours: 0.2, difficulty: 'basic' },
        { itemId: 'laundry-floors', label: 'Floors cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
        { itemId: 'laundry-cabinets', label: 'Cabinets wiped', category: 'surfaces', hours: 0.2, difficulty: 'basic' },
        { itemId: 'laundry-doors', label: 'Cabinet doors & handles', category: 'touchpoints', hours: 0.1, difficulty: 'basic' },
        { itemId: 'laundry-shelves', label: 'Shelving cleaned', category: 'dust', hours: 0.1, difficulty: 'basic' },
        { itemId: 'laundry-baseboards', label: 'Baseboards & Light switches', category: 'trim', hours: 0.1, difficulty: 'basic' }
      ]
    },

    // ==================== BATHROOMS (Dynamic: 1-N) ====================
    {
      roomId: 'bathrooms',
      emoji: '🛁',
      title: `Bathrooms (1-${PROPERTY_CONFIG.numBathrooms})`,
      subRooms: generateBathrooms(PROPERTY_CONFIG.numBathrooms)
    },

    // ==================== BEDROOMS (Dynamic: 1-N) ====================
    {
      roomId: 'bedrooms',
      emoji: '🛏️',
      title: `Bedrooms (1-${PROPERTY_CONFIG.numBedrooms})`,
      subRooms: generateBedrooms(PROPERTY_CONFIG.numBedrooms)
    }
  ]
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHECKLIST_CONFIG;
}
