/**
 * AysRoomOrchestrator
 * 
 * Orchestrator component that manages a single room (Bedroom 1, Bathroom 2, Kitchen, etc.)
 * Encapsulates:
 * - Room metadata (id, title, number, emoji, category)
 * - AysDisclosureRoomCard (the collapsible UI container)
 * - Array of checklist items
 * - State tracking (checked count, notes, custom services)
 * - Business logic (serialization, state export/restore, calculations)
 * 
 * Follows OOP Principles:
 * - Single Responsibility: Orchestrates room data + UI rendering + state management
 * - Open/Closed: Extensible for custom fields without modification
 * - Liskov Substitution: Interchangeable room types (bedroom, bathroom, kitchen, etc.)
 * - Interface Segregation: Provides only necessary public methods
 * - Dependency Inversion: Depends on abstractions (AysDisclosureRoomCard), not concrete UI
 * 
 * Flow:
 *   1. AysChecklistFormFactory creates AysRoomOrchestrator instances
 *   2. AysRoomOrchestrator creates and manages AysDisclosureRoomCard (UI)
 *   3. User interacts with card, orchestrator tracks state
 *   4. AysQuoteEnvelope collects orchestrator data at submit time
 */

class AysRoomOrchestrator {
  constructor(config) {
    // Metadata
    this.id = config.roomId || `room-${Date.now()}`;
    this.title = config.title || 'Untitled Room';
    this.number = config.number || 1;
    this.emoji = config.emoji || '🏠';
    this.category = config.category || 'general'; // bedroom, bathroom, kitchen, etc.
    
    // Components
    this.card = null; // AysDisclosureRoomCard instance
    this.items = config.items || []; // Array of item configs
    
    // State tracking
    this.state = {
      isOpen: false,
      checkedCount: 0,
      totalCount: this.items.length,
      notes: '',
      customServices: [], // Additional services for this room
      timestamp: null
    };
    
    // Internal references for state management
    this._cardElement = null;
    this._itemCheckboxes = [];
  }

  /**
   * Create and render this room's AysDisclosureRoomCard
   * @returns {HTMLElement} The rendered card element
   */
  render() {
    if (!this.card) {
      // Create disclosure card with this room's items
      this.card = new AysDisclosureRoomCard({
        roomId: this.id,
        title: `${this.emoji} ${this.title}`,
        items: this.items
      });
    }

    this._cardElement = this.card.render();
    this.card.bind();

    // Store reference to checkboxes for state tracking
    this._itemCheckboxes = this._cardElement.querySelectorAll('input[type="checkbox"]');

    return this._cardElement;
  }

  /**
   * Get the current checked state of all items in this room
   * @returns {Array} Array of { itemId, label, checked, hours, category }
   */
  getCheckedItems() {
    const checked = [];
    this._itemCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const label = checkbox.nextElementSibling?.textContent || '';
        const itemId = checkbox.id || checkbox.name;
        const hours = parseFloat(checkbox.dataset.hours) || 0;
        const category = checkbox.dataset.category || '';

        checked.push({
          itemId,
          label,
          checked: true,
          hours,
          category
        });
      }
    });
    return checked;
  }

  /**
   * Serialize this room to JSON
   * Includes metadata + all item states + notes
   * Used by AysQuoteEnvelope to build final quote packet
   * @returns {Object} Serializable room object
   */
  serialize() {
    return {
      roomId: this.id,
      category: this.category,
      title: this.title,
      number: this.number,
      emoji: this.emoji,
      items: this.getCheckedItems(),
      state: {
        checkedCount: this.getCheckedItems().length,
        totalCount: this.state.totalCount,
        notes: this.state.notes,
        customServices: this.state.customServices,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Update notes for this room (e.g., staff observations, special instructions)
   * @param {string} notes
   */
  setNotes(notes) {
    this.state.notes = notes;
  }

  /**
   * Add a custom service to this room (e.g., deep clean, extra)
   * @param {Object} service { serviceId, label, charge }
   */
  addCustomService(service) {
    if (!this.state.customServices.find(s => s.serviceId === service.serviceId)) {
      this.state.customServices.push(service);
    }
  }

  /**
   * Get progress percentage for this room
   * @returns {number} 0-100
   */
  getProgress() {
    if (this.state.totalCount === 0) return 100;
    return Math.round((this.getCheckedItems().length / this.state.totalCount) * 100);
  }

  /**
   * Get total hours for checked items in this room
   * @returns {number}
   */
  getTotalHours() {
    return this.getCheckedItems().reduce((sum, item) => sum + (item.hours || 0), 0);
  }

  /**
   * Restore state from localStorage/saved data
   * @param {Object} savedState { itemId: checked, ... }
   */
  restoreState(savedState) {
    if (!savedState || !this._itemCheckboxes.length) return;

    this._itemCheckboxes.forEach((checkbox) => {
      const itemId = checkbox.id || checkbox.name;
      if (savedState[itemId]) {
        checkbox.checked = true;
      }
    });
  }

  /**
   * Export item state keyed by itemId for localStorage
   * @returns {Object} { 'bedroom-1-window-sills': true, ... }
   */
  exportItemState() {
    const state = {};
    this._itemCheckboxes.forEach((checkbox) => {
      const itemId = checkbox.id || checkbox.name;
      if (checkbox.checked) {
        state[itemId] = true;
      }
    });
    return state;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysRoomOrchestrator;
}
