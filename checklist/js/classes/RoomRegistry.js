/**
 * RoomRegistry - Central mapping from roomType to Room class
 */

const AysRoomRegistry = (function() {
  const registry = {};

  function register(roomType, roomClass) {
    if (!roomType || !roomClass) return;
    registry[roomType] = roomClass;
  }

  function get(roomType) {
    if (!roomType) return null;
    return registry[roomType] || registry[roomType.toLowerCase()] || null;
  }

  return {
    register,
    get
  };
})();

// Register core room classes
if (typeof Bedroom !== 'undefined') AysRoomRegistry.register('Bedroom', Bedroom);
if (typeof Bathroom !== 'undefined') AysRoomRegistry.register('Bathroom', Bathroom);
if (typeof Kitchen !== 'undefined') AysRoomRegistry.register('Kitchen', Kitchen);
if (typeof LivingArea !== 'undefined') AysRoomRegistry.register('LivingArea', LivingArea);
if (typeof Laundry !== 'undefined') AysRoomRegistry.register('Laundry', Laundry);
if (typeof Office !== 'undefined') AysRoomRegistry.register('Office', Office);
if (typeof Reception !== 'undefined') AysRoomRegistry.register('Reception', Reception);
if (typeof Boardroom !== 'undefined') AysRoomRegistry.register('Boardroom', Boardroom);
if (typeof Lunchroom !== 'undefined') AysRoomRegistry.register('Lunchroom', Lunchroom);
if (typeof Circulation !== 'undefined') AysRoomRegistry.register('Circulation', Circulation);
if (typeof SalesFloor !== 'undefined') AysRoomRegistry.register('SalesFloor', SalesFloor);
if (typeof Stockroom !== 'undefined') AysRoomRegistry.register('Stockroom', Stockroom);
if (typeof LockerRoom !== 'undefined') AysRoomRegistry.register('LockerRoom', LockerRoom);
if (typeof Shower !== 'undefined') AysRoomRegistry.register('Shower', Shower);
if (typeof Warehouse !== 'undefined') AysRoomRegistry.register('Warehouse', Warehouse);
if (typeof LoadingDock !== 'undefined') AysRoomRegistry.register('LoadingDock', LoadingDock);
if (typeof Carpark !== 'undefined') AysRoomRegistry.register('Carpark', Carpark);
if (typeof Toilet !== 'undefined') AysRoomRegistry.register('Toilet', Toilet);
if (typeof RubbishHandling !== 'undefined') AysRoomRegistry.register('RubbishHandling', RubbishHandling);
if (typeof Utility !== 'undefined') AysRoomRegistry.register('Utility', Utility);
if (typeof Staircase !== 'undefined') AysRoomRegistry.register('Staircase', Staircase);
if (typeof TradeWorkshop !== 'undefined') AysRoomRegistry.register('TradeWorkshop', TradeWorkshop);
if (typeof Entryway !== 'undefined') AysRoomRegistry.register('Entryway', Entryway);
if (typeof Basement !== 'undefined') AysRoomRegistry.register('Basement', Basement);
if (typeof UtilitySpecial !== 'undefined') AysRoomRegistry.register('UtilitySpecial', UtilitySpecial);
if (typeof HomeOffice !== 'undefined') AysRoomRegistry.register('HomeOffice', HomeOffice);
if (typeof Outdoor !== 'undefined') AysRoomRegistry.register('Outdoor', Outdoor);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysRoomRegistry;
}
