/**
 * Checklist Page Generator
 * 
 * Converts CHECKLIST_CONFIG data into rendered AysDisclosureCard components.
 * Handles:
 * - Single-room cards (Kitchen, Living Room, etc.)
 * - Multi-bathroom/bedroom cards with subsections
 * - Progress tracking and state management
 */

class ChecklistPageGenerator {
  constructor(containerId = 'rooms-container') {
    this.containerId = containerId;
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
   * Create single-room disclosure card
   * @private
   */
  _createSingleRoomCard(room, container) {
    const card = new AysDisclosureCard({
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
      const card = new AysDisclosureCard({
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
   * Get all cards that have been generated
   * @returns {Array<AysDisclosureCard>}
   */
  getCards() {
    return this.cards;
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
