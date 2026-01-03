/**
 * AysRoomSection
 * 
 * Represents a single room (Bedroom 1, Bathroom 2, Kitchen, etc.)
 * as a composite object containing:
 * - Metadata (id, title, number, emoji, category)
 * - AysDisclosureCard (the collapsible container)
 * - Array of AysListItemCheckbox items
 * - State tracking (checked count, notes, pricing)
 * 
 * SOLID Principles:
 * - Single Responsibility: Manages one room's data + rendering
 * - Open/Closed: Extensible for custom fields without modification
 * - Liskov Substitution: Interchangeable room types (bedroom, bathroom, kitchen)
 * - Interface Segregation: Provides only necessary public methods
 * - Dependency Inversion: Depends on abstractions (card, items), not concrete UI
 */

class AysRoomSection {
  constructor(config) {
    // Metadata
    this.id = config.roomId || `room-${Date.now()}`;
    this.title = config.title || 'Untitled Room';
    this.number = config.number || 1;
    this.emoji = config.emoji || '🏠';
    this.category = config.category || 'general'; // bedroom, bathroom, kitchen, etc.
    
    // Components
    this.card = null; // AysDisclosureCard instance
    this.items = config.items || []; // Array of AysListItemCheckbox
    
    // State
    this.state = {
      isOpen: false,
      checkedCount: 0,
      totalCount: this.items.length,
      notes: '',
      customServices: [], // Additional services for this room
      timestamp: null
    };
    
    // References for state management
    this._cardElement = null;
    this._itemCheckboxes = [];
  }

  /**
   * Create and render this room's AysDisclosureCard
   * @returns {HTMLElement} The rendered card element
   */
  render() {
    if (!this.card) {
      // Create disclosure card with this room's items
      this.card = new AysDisclosureCard({
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
   * Update notes for this room (e.g., staff observations)
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
