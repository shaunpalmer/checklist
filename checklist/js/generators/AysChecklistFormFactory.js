/**
 * AysChecklistFormFactory
 * 
 * Converts CHECKLIST_CONFIG data into rendered AysDisclosureRoomCard components.
 * Handles:
 * - Single-room cards (Kitchen, Living Room, etc.)
 * - Multi-bathroom/bedroom cards with subsections
 * - Progress tracking and state management
 */

class AysChecklistFormFactory {
  constructor(containerId = 'rooms-container', propertyWideContainerId = 'property-wide-container') {
    this.containerId = containerId;
    this.propertyWideContainerId = propertyWideContainerId;
    this.cards = [];
  }

  /**
   * Generate all room cards from config
   * @param {Object} config - CHECKLIST_CONFIG object
   * @returns {HTMLElement} Container with all rendered cards
   */
  generate(config) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id '${this.containerId}' not found`);
      return null;
    }

    this._renderPropertyWideItems(config);

    // Process each room in config
    config.rooms.forEach(room => {
      if (room.subRooms) {
        // Multi-room card (Bathrooms, Bedrooms)
        this._createMultiRoomCard(room, container);
      } else {
        // Single-room card
        this._createSingleRoomCard(room, container);
      }
    });

    return container;
  }

  /**
   * Render property-wide checklist items in a dedicated section
   * @private
   */
  _renderPropertyWideItems(config) {
    const propertyWideContainer = document.getElementById(this.propertyWideContainerId);
    if (!propertyWideContainer) {
      return;
    }

    propertyWideContainer.innerHTML = '';

    const items = Array.isArray(config.propertyWide) ? config.propertyWide : [];
    if (items.length === 0) {
      return;
    }

    const card = new AysDisclosureRoomCard({
      roomId: 'property-wide',
      title: '🏠 Property-wide Items',
      items: items
    });

    const element = card.render();
    propertyWideContainer.appendChild(element);
    card.bind();

    this.cards.push(card);
    console.log(`✓ Created property-wide card (${items.length} items)`);
  }

  /**
   * Create single-room disclosure card
   * @private
   */
  _createSingleRoomCard(room, container) {
    const card = new AysDisclosureRoomCard({
      roomId: room.roomId,
      title: `${room.emoji} ${room.title}`,
      items: room.items
    });

    const element = card.render();
    container.appendChild(element);
    card.bind();

    this.cards.push(card);
    console.log(`✓ Created card: ${room.title} (${room.items.length} items)`);
  }

  /**
   * Create multi-room disclosure card (with subsections)
   * Now creates a SEPARATE card for each sub-room (Bedroom 1, 2, etc.)
   * This enables:
   * - Individual progress tracking per bedroom/bathroom
   * - Worker accountability ("Which bedroom did you clean?")
   * - Accurate pricing per room
   * @private
   */
  _createMultiRoomCard(room, container) {
    // Create a SEPARATE card for each sub-room
    room.subRooms.forEach(subRoom => {
      const card = new AysDisclosureRoomCard({
        roomId: subRoom.subRoomId,  // Use subRoomId for unique identification
        title: `${room.emoji} ${subRoom.title}`,  // e.g., "🛏️ Bedroom 1"
        items: subRoom.items
      });

      const element = card.render();
      container.appendChild(element);
      card.bind();

      this.cards.push(card);
      console.log(`✓ Created card: ${subRoom.title} (${subRoom.items.length} items)`);
    });
  }

  /**
   * Clear all cards and regenerate from new config
   * Called when property type changes (e.g., user changes from residential_3bed to commercial_gym)
   * CRITICAL: Called AFTER property type change is saved to PROPERTY_CONFIG
   * @param {Object} config - New CHECKLIST_CONFIG object
   * @returns {Array<AysDisclosureRoomCard>} New cards
   */
  regenerate(config) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id '${this.containerId}' not found for regeneration`);
      return [];
    }

    console.log(`[AysChecklistFormFactory] Regenerating with property type: ${config.propertyType || 'unknown'}`);

    // Clear existing cards
    container.innerHTML = '';
    this.cards = [];

    // Generate new cards with new config
    return this.generate(config);
  }

  /**
   * Get total progress across all cards
   * @returns {Object} {checked: number, total: number, percentage: number}
   */
  getProgress() {
    let totalChecked = 0;
    let totalItems = 0;

    this.cards.forEach(card => {
      const items = card.element.querySelectorAll('input[type="checkbox"]');
      items.forEach(checkbox => {
        totalItems++;
        if (checkbox.checked) totalChecked++;
      });
    });

    return {
      checked: totalChecked,
      total: totalItems,
      percentage: totalItems ? Math.round((totalChecked / totalItems) * 100) : 0
    };
  }

  /**
   * Reset all cards to unchecked state
   */
  resetAll() {
    this.cards.forEach(card => {
      const items = card.element.querySelectorAll('input[type="checkbox"]');
      items.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    console.log('✓ All items reset');
  }
}
