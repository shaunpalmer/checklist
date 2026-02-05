/**
 * PropertyServiceOrchestrator.js - Orchestrates Property-Wide Services
 * 
 * Similar role to AysRoomOrchestrator, but for PropertyService instances.
 * 
 * Responsibilities:
 * 1. Manage service instance and its state
 * 2. Create/manage disclosure card UI component
 * 3. Handle parameter updates and recalculation
 * 4. Serialize/restore service state
 * 5. Calculate totals (hours, cost) with all factors
 * 
 * Key Difference from AysRoomOrchestrator:
 * - Services are property-wide (not room-based)
 * - Single service, not multiple instances
 * - Parameterized by user form choices (not variants)
 * - No sub-features; parameters drive item generation
 * 
 * Lifecycle:
 * 1. Factory creates PropertyService instance (if Settings enabled)
 * 2. PropertyServiceOrchestrator wraps it
 * 3. Disclosure card renders parameters and items
 * 4. User updates parameters
 * 5. Orchestrator recalculates and updates UI
 * 6. On submit, serialize() for quote
 */

class PropertyServiceOrchestrator {
  /**
   * Constructor for PropertyServiceOrchestrator
   * @param {PropertyService} service - Service instance to manage
   * @param {Object} config - Configuration
   */
  constructor(service, config = {}) {
    if (!service || !service.serviceId) {
      throw new Error('PropertyServiceOrchestrator requires a PropertyService instance');
    }

    this.service = service;
    this.disclosure = null;        // PropertyServiceDisclosure instance (created on render)
    this.config = config;          // Additional configuration
    this.isExpanded = config.isExpanded !== false;  // Disclosure card open by default
  }

  /**
   * Create and return disclosure card UI component
   * This is the main entry point for UI rendering
   * @returns {HTMLElement} DOM element (disclosure card)
   */
  render() {
    // If disclosure already exists, return its DOM
    if (this.disclosure && this.disclosure.domElement) {
      return this.disclosure.domElement;
    }

    // Create new disclosure component
    // Note: PropertyServiceDisclosure is built separately
    // For now, return a placeholder that shows the structure
    const disclosure = new PropertyServiceDisclosure(this.service, {
      orchestrator: this,
      isExpanded: this.isExpanded
    });

    this.disclosure = disclosure;
    return disclosure.render();
  }

  /**
   * Update a service parameter (e.g., rooms changed from 3 to 4)
   * Recalculates items and updates UI
   * @param {string} paramName - Parameter name (e.g., 'roomCount')
   * @param {any} value - New value
   */
  updateParameter(paramName, value) {
    // Update the service
    this.service.updateParameter(paramName, value);

    // Validate
    const validation = this.service.validateParameters?.();
    if (validation && !validation.valid) {
      console.warn('Invalid parameters:', validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Update disclosure UI if it exists
    if (this.disclosure) {
      this.disclosure.updateParameter(paramName, value);
      this.disclosure.updateDisplay();
    }

    return {
      success: true,
      totalHours: this.service.getTotalHours(),
      totalCost: this.service.getTotalCost(),
      summary: this.service.getSummary()
    };
  }

  /**
   * Toggle item checked state
   * @param {string} itemId - Item ID to toggle
   * @param {boolean} checked - Check state
   */
  toggleItem(itemId, checked) {
    const notes = this.service.itemState.get(itemId)?.notes || '';
    this.service.setItemState(itemId, checked, notes);

    // Update display
    if (this.disclosure) {
      this.disclosure.updateDisplay();
    }
  }

  /**
   * Add notes to an item
   * @param {string} itemId - Item ID
   * @param {string} notes - Notes text
   */
  addItemNotes(itemId, notes) {
    const state = this.service.itemState.get(itemId);
    if (state) {
      state.notes = notes;
    } else {
      this.service.setItemState(itemId, false, notes);
    }

    if (this.disclosure) {
      this.disclosure.updateDisplay();
    }
  }

  /**
   * Add a custom service discovered during walk-through
   * @param {Object} customService - {label, hours, price, notes}
   * @returns {Object} The added service
   */
  addCustomService(customService) {
    const service = this.service.addCustomService(customService);

    if (this.disclosure) {
      this.disclosure.updateDisplay();
    }

    return service;
  }

  /**
   * Get the service label
   * @returns {string} Display label
   */
  getLabel() {
    return this.service.getLabel();
  }

  /**
   * Get the service emoji
   * @returns {string} Emoji character
   */
  getEmoji() {
    return this.service.getEmoji();
  }

  /**
   * Get summary of service with current parameters
   * @returns {string} Human-readable summary
   */
  getSummary() {
    return this.service.getSummary();
  }

  /**
   * Get all rendered items
   * @returns {Array<Object>} All items (base + optional + custom)
   */
  getItems() {
    return this.service.renderItems();
  }

  /**
   * Get checked items only
   * @returns {Array<Object>} Checked items
   */
  getCheckedItems() {
    return this.service.getCheckedItems();
  }

  /**
   * Get total hours
   * @returns {number} Total hours (all checked items)
   */
  getTotalHours() {
    return this.service.getTotalHours();
  }

  /**
   * Get total cost
   * @returns {number} Total cost (all checked items)
   */
  getTotalCost() {
    return this.service.getTotalCost();
  }

  /**
   * Get progress percentage (checked items / total items)
   * @returns {number} Progress 0-100
   */
  getProgress() {
    const allItems = this.service.renderItems();
    if (allItems.length === 0) return 100;

    const checkedItems = this.service.getCheckedItems();
    return Math.round((checkedItems.length / allItems.length) * 100);
  }

  /**
   * Serialize service for quote/export
   * Returns clean JSON representation
   * @returns {Object} Serialized service data
   */
  serialize() {
    return this.service.serialize();
  }

  /**
   * Restore service state from serialized data
   * Used when loading a saved quote
   * @param {Object} data - Serialized service data
   */
  restoreState(data) {
    this.service.restoreState(data);

    if (this.disclosure) {
      this.disclosure.updateDisplay();
    }
  }

  /**
   * Toggle disclosure card open/closed
   */
  toggle() {
    this.isExpanded = !this.isExpanded;

    if (this.disclosure) {
      this.disclosure.toggle();
    }
  }

  /**
   * Open disclosure card
   */
  open() {
    this.isExpanded = true;

    if (this.disclosure) {
      this.disclosure.open();
    }
  }

  /**
   * Close disclosure card
   */
  close() {
    this.isExpanded = false;

    if (this.disclosure) {
      this.disclosure.close();
    }
  }

  /**
   * Get display state (for form header/summary)
   * @returns {Object} Display information
   */
  getDisplayState() {
    return {
      serviceId: this.service.serviceId,
      serviceType: this.service.serviceType,
      label: this.getLabel(),
      emoji: this.getEmoji(),
      summary: this.getSummary(),
      isExpanded: this.isExpanded,
      progress: this.getProgress(),
      totalHours: this.getTotalHours(),
      totalCost: this.getTotalCost(),
      itemCount: this.service.renderItems().length,
      checkedCount: this.service.getCheckedItems().length
    };
  }
}

/**
 * PropertyServiceDisclosure.js - UI Component for PropertyService
 * 
 * Renders a disclosure/details card for parameterized services
 * Similar to AysDisclosureRoomCard but for property-wide services
 * 
 * Structure:
 * <details>
 *   <summary>Window Cleaning: 2-storey, 8 large panes, ...</summary>
 *   <div class="service-content">
 *     <!-- Parameter inputs -->
 *     <div class="service-parameters">
 *       <label>Building Height: <select>...</select></label>
 *       <label>Large Panes: <input type="number" /></label>
 *       <!-- etc. -->
 *     </div>
 *     <!-- Items checklist -->
 *     <div class="service-items">
 *       <div class="item">
 *         <input type="checkbox" />
 *         <label>Large window pane (8 ├ù $50)</label>
 *       </div>
 *       <!-- etc. -->
 *     </div>
 *   </div>
 * </details>
 */
class PropertyServiceDisclosure {
  /**
   * Constructor for PropertyServiceDisclosure
   * @param {PropertyService} service - Service instance to display
   * @param {Object} config - Configuration
   */
  constructor(service, config = {}) {
    this.service = service;
    this.orchestrator = config.orchestrator;
    this.isExpanded = config.isExpanded !== false;
    this.domElement = null;
    this.summaryElements = null;
  }

  /**
   * Render the disclosure card
   * @returns {HTMLElement} Disclosure DOM element
   */
  render() {
    // Create root details element
    const details = document.createElement('details');
    details.className = 'ays-property-service-disclosure';
    details.open = this.isExpanded;

    // Create summary
    const summary = document.createElement('summary');
    summary.className = 'service-summary';
    this.summaryElements = this.createSummaryElements();
    summary.appendChild(this.summaryElements.emoji);
    summary.appendChild(this.summaryElements.label);
    summary.appendChild(this.summaryElements.summaryText);
    summary.appendChild(this.summaryElements.stats);
    details.appendChild(summary);

    // Create content container
    const content = document.createElement('div');
    content.className = 'service-content';

    // Add parameter inputs
    const paramsDiv = this.renderParameters();
    content.appendChild(paramsDiv);

    // Add items checklist
    const itemsDiv = this.renderItems();
    content.appendChild(itemsDiv);

    details.appendChild(content);
    this.domElement = details;

    return details;
  }

  /**
   * Render parameter input controls
   * Customized per service type (carpet vs. windows)
   * @returns {HTMLElement} Parameters container
   */
  renderParameters() {
    const div = document.createElement('div');
    div.className = 'service-parameters';

    // Service-specific parameter rendering
    // This is overridden by service subclasses or handled here generically
    // For now, render generic number inputs for each parameter

    Object.keys(this.service.parameters).forEach(paramName => {
      const value = this.service.parameters[paramName];
      const label = this.toLabel(paramName);

      const field = document.createElement('div');
      field.className = 'parameter-field';

      const labelEl = document.createElement('label');
      labelEl.textContent = label;

      const input = document.createElement('input');
      input.type = 'number';
      input.value = value;
      input.min = '0';
      input.addEventListener('change', (e) => {
        this.orchestrator?.updateParameter(paramName, parseInt(e.target.value, 10));
      });

      field.appendChild(labelEl);
      field.appendChild(input);
      div.appendChild(field);
    });

    return div;
  }

  /**
   * Render items checklist
   * @returns {HTMLElement} Items container
   */
  renderItems() {
    const div = document.createElement('div');
    div.className = 'service-items';

    const items = this.service.renderItems();

    if (items.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-message';
      empty.textContent = 'No items for this service';
      div.appendChild(empty);
      return div;
    }

    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'service-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `service-item-${item.itemId}`;
      const state = this.service.itemState.get(item.itemId);
      checkbox.checked = state?.checked === true;
      checkbox.addEventListener('change', (e) => {
        this.orchestrator?.toggleItem(item.itemId, e.target.checked);
      });

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.className = 'item-label';

      const title = document.createElement('span');
      title.className = 'item-title';
      title.textContent = item.label;

      const hours = document.createElement('span');
      hours.className = 'item-hours';
      hours.textContent = `${(item.hours || 0).toFixed(1)}h`;

      label.appendChild(title);
      label.appendChild(hours);

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(label);
      div.appendChild(itemDiv);
    });

    return div;
  }

  /**
   * Convert parameter name to human-readable label
   * @param {string} paramName - Parameter name (camelCase)
   * @returns {string} Human-readable label
   */
  toLabel(paramName) {
    const labels = {
      'roomCount': 'Room Count',
      'stainCount': 'Number of Stains',
      'protectionRooms': 'Protection Rooms',
      'extraRooms': 'Extra Rooms',
      'stairFlights': 'Stair Flights',
      'buildingHeight': 'Building Height',
      'largePaneCount': 'Large Panes',
      'smallPaneCount': 'Small Panes',
      'doorPaneCount': 'Door Panes'
    };
    return labels[paramName] || paramName;
  }

  /**
   * Update the display after changes
   */
  updateDisplay() {
    if (!this.domElement) return;

    // Update summary
    if (!this.summaryElements) {
      const summary = this.domElement.querySelector('.service-summary');
      if (summary) {
        this.summaryElements = this.createSummaryElements();
        summary.replaceChildren(
          this.summaryElements.emoji,
          this.summaryElements.label,
          this.summaryElements.summaryText,
          this.summaryElements.stats
        );
      }
    }

    if (this.summaryElements) {
      this.summaryElements.emoji.textContent = this.service.getEmoji();
      this.summaryElements.label.textContent = this.service.getLabel();
      this.summaryElements.summaryText.textContent = this.service.getSummary();
      this.summaryElements.stats.textContent = this.formatStats();
    }
  }

  /**
   * Create summary element nodes
   * @returns {Object} Summary element references
   */
  createSummaryElements() {
    const emoji = document.createElement('span');
    emoji.className = 'service-emoji';
    emoji.textContent = this.service.getEmoji();

    const label = document.createElement('span');
    label.className = 'service-label';
    label.textContent = this.service.getLabel();

    const summaryText = document.createElement('span');
    summaryText.className = 'service-summary-text';
    summaryText.textContent = this.service.getSummary();

    const stats = document.createElement('span');
    stats.className = 'service-stats';
    stats.textContent = this.formatStats();

    return {
      emoji,
      label,
      summaryText,
      stats
    };
  }

  /**
   * Format summary stats string
   * @returns {string} Stats summary
   */
  formatStats() {
    return `${this.service.getTotalHours().toFixed(1)}h ┬╖ $${this.service.getTotalCost().toFixed(2)}`;
  }

  /**
   * Update a parameter and refresh display
   * @param {string} paramName - Parameter name
   * @param {any} value - New value
   */
  updateParameter(paramName, value) {
    this.service.parameters[paramName] = value;
  }

  /**
   * Toggle disclosure open/closed
   */
  toggle() {
    this.isExpanded = !this.isExpanded;
    if (this.domElement) {
      this.domElement.open = this.isExpanded;
    }
  }

  /**
   * Open disclosure
   */
  open() {
    this.isExpanded = true;
    if (this.domElement) {
      this.domElement.open = true;
    }
  }

  /**
   * Close disclosure
   */
  close() {
    this.isExpanded = false;
    if (this.domElement) {
      this.domElement.open = false;
    }
  }
}

// Export for use in factory
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PropertyServiceOrchestrator,
    PropertyServiceDisclosure
  };
}
