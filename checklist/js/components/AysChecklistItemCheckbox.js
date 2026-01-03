/**
 * AysChecklistItemCheckbox Component
 * 
 * Renders an individual checkbox list item with metadata tags
 * Part of the Ays component family - describes a checklist item with checkbox toggle
 * 
 * Follows Option 2: Component factory approach
 * 
 * Usage:
 *   const item = new AysChecklistItemCheckbox({
 *     itemId: 'kitchen-sinks',
 *     label: 'Sinks and Faucets',
 *     room: 'kitchen',
 *     category: 'basic',
 *     hours: 0.5,
 *     difficulty: 'basic'
 *   });
 *   container.appendChild(item.render());
 *   item.bind();
 */

class AysChecklistItemCheckbox {
  constructor(options = {}) {
    this.itemId = options.itemId || 'item-' + Date.now();
    this.label = options.label || 'Untitled Item';
    this.room = options.room || 'unknown';
    this.category = options.category || 'basic';
    this.hours = options.hours || 0.5;
    this.difficulty = options.difficulty || 'basic';
    this.checked = options.checked || false;
    this.name = options.name || this.room;

    // Internal state
    this.domElement = null;
    this.checkboxElement = null;
  }

  // ===== RENDER: Returns DOM node =====
  render() {
    // Create label wrapper
    this.domElement = document.createElement('label');
    this.domElement.className = 'checklist-item';
    this.domElement.setAttribute('data-item-id', this.itemId);
    this.domElement.setAttribute('data-room', this.room);
    this.domElement.setAttribute('data-category', this.category);
    this.domElement.setAttribute('data-hours', this.hours);
    this.domElement.setAttribute('data-difficulty', this.difficulty);

    // Create checkbox input
    this.checkboxElement = document.createElement('input');
    this.checkboxElement.type = 'checkbox';
    this.checkboxElement.id = this.itemId;
    this.checkboxElement.name = this.name;
    this.checkboxElement.checked = this.checked;

    // Create custom checkbox styling element
    const customCheckbox = document.createElement('span');
    customCheckbox.className = 'checkbox-custom';

    // Create label text
    const labelSpan = document.createElement('span');
    labelSpan.className = 'item-label';
    labelSpan.textContent = this.label;

    // Append to label
    this.domElement.appendChild(this.checkboxElement);
    this.domElement.appendChild(customCheckbox);
    this.domElement.appendChild(labelSpan);

    return this.domElement;
  }

  // ===== BIND: Attach event listeners =====
  bind() {
    if (!this.checkboxElement) {
      console.warn('AysChecklistItemCheckbox: Cannot bind - element not rendered yet');
      return;
    }

    // Listen to change events
    this.checkboxElement.addEventListener('change', (e) => {
      this.checked = e.target.checked;
      this.domElement.setAttribute('data-checked', this.checked);
      
      // Dispatch custom event so parent can track progress
      const event = new CustomEvent('item-changed', {
        detail: {
          itemId: this.itemId,
          checked: this.checked,
          room: this.room
        },
        bubbles: true
      });
      this.domElement.dispatchEvent(event);
    });
  }

  // ===== PUBLIC METHODS =====
  setChecked(checked) {
    this.checked = checked;
    if (this.checkboxElement) {
      this.checkboxElement.checked = checked;
    }
  }

  isChecked() {
    return this.checked;
  }

  getMetadata() {
    return {
      itemId: this.itemId,
      label: this.label,
      room: this.room,
      category: this.category,
      hours: this.hours,
      difficulty: this.difficulty
    };
  }

  /**
   * Update label dynamically
   */
  setLabel(newLabel) {
    this.label = newLabel;
    if (this.domElement) {
      const labelSpan = this.domElement.querySelector('.item-label');
      if (labelSpan) labelSpan.textContent = newLabel;
    }
  }

  /**
   * Get the DOM element
   */
  getElement() {
    return this.domElement;
  }
}
