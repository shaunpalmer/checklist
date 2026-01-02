/**
 * Checklist Configuration Data
 * 
 * This file contains all rooms and checklist items extracted from the hardcoded HTML.
 * Used by the page generator to dynamically create AysDisclosureCard components.
 * 
 * Structure:
 * - Each room has: roomId, emoji, title, items array
 * - Each item has: itemId, label, category, hours, [optional fields]
 */

const CHECKLIST_CONFIG = {
  rooms: [
    // ==================== BASIC ROOMS ====================
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

    // ==================== BATHROOMS (1-4) ====================
    {
      roomId: 'bathrooms',
      emoji: '🛁',
      title: 'Bathrooms (1-4)',
      subRooms: [
        {
          subRoomId: 'bathroom1',
          title: 'Bathroom 1',
          items: [
            { itemId: 'bath1-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath1-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic' },
            { itemId: 'bath1-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath1-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath1-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath1-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath1-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath1-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath1-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' },
            { itemId: 'bath1-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bathroom2',
          title: 'Bathroom 2',
          items: [
            { itemId: 'bath2-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath2-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic' },
            { itemId: 'bath2-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath2-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath2-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath2-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath2-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath2-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath2-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' },
            { itemId: 'bath2-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bathroom3',
          title: 'Bathroom 3',
          items: [
            { itemId: 'bath3-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath3-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic' },
            { itemId: 'bath3-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath3-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath3-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath3-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath3-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath3-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath3-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' },
            { itemId: 'bath3-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bathroom4',
          title: 'Bathroom 4',
          items: [
            { itemId: 'bath4-sink', label: 'Sinks and Faucets', category: 'fixtures', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath4-tub', label: 'Tub/Shower', category: 'shower', hours: 0.3, difficulty: 'basic' },
            { itemId: 'bath4-toilet', label: 'Toilet Bowl & Tank', category: 'toilet', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath4-mirrors', label: 'Mirrors cleaned', category: 'glass', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath4-counter', label: 'Countertops', category: 'surfaces', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath4-cabinets', label: 'Cabinets (outside)', category: 'cabinets', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath4-floors', label: 'Floors Mopped', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bath4-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bath4-lights', label: 'Light switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' },
            { itemId: 'bath4-trash', label: 'Remove Trash Bags', category: 'trash', hours: 0.05, difficulty: 'basic' }
          ]
        }
      ]
    },

    // ==================== BEDROOMS (1-4) ====================
    {
      roomId: 'bedrooms',
      emoji: '🛏️',
      title: 'Bedrooms (1-4)',
      subRooms: [
        {
          subRoomId: 'bedroom1',
          title: 'Bedroom 1',
          items: [
            { itemId: 'bed1-beds', label: 'Beds Made', category: 'beds', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed1-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed1-wood', label: 'Wood Floors Cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed1-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bed1-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bedroom2',
          title: 'Bedroom 2',
          items: [
            { itemId: 'bed2-beds', label: 'Beds Made', category: 'beds', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed2-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed2-wood', label: 'Wood Floors Cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed2-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bed2-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bedroom3',
          title: 'Bedroom 3',
          items: [
            { itemId: 'bed3-beds', label: 'Beds Made', category: 'beds', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed3-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed3-wood', label: 'Wood Floors Cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed3-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bed3-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' }
          ]
        },
        {
          subRoomId: 'bedroom4',
          title: 'Bedroom 4',
          items: [
            { itemId: 'bed4-beds', label: 'Beds Made', category: 'beds', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed4-carpet', label: 'Carpet Vacuum', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed4-wood', label: 'Wood Floors Cleaned', category: 'floors', hours: 0.2, difficulty: 'basic' },
            { itemId: 'bed4-baseboards', label: 'Baseboards Wiped', category: 'trim', hours: 0.1, difficulty: 'basic' },
            { itemId: 'bed4-lights', label: 'Light Switches', category: 'touchpoints', hours: 0.05, difficulty: 'basic' }
          ]
        }
      ]
    }
  ]
};

// Export for use in generators
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHECKLIST_CONFIG;
}
