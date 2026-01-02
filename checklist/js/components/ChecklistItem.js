/**
 * ChecklistItem Component
 * 
 * Renders an individual checkbox item with data attributes
 * Follows Option 2: Component factory approach
 * 
 * Usage:
 *   const item = new ChecklistItem({
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

class ChecklistItem {
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
    if (this.checked) {
      this.checkboxElement.checked = true;
    }

    // Create custom checkbox styling element
    const checkboxCustom = document.createElement('span');
    checkboxCustom.className = 'checkbox-custom';

    // Create item label
    const itemLabel = document.createElement('span');
    itemLabel.className = 'item-label';
    itemLabel.textContent = this.label;

    // Create metadata container
    const itemMeta = document.createElement('div');
    itemMeta.className = 'item-meta';

    // Create metadata tags
    const categoryTag = document.createElement('span');
    categoryTag.className = 'item-meta-tag';
    categoryTag.setAttribute('title', 'Category');
    categoryTag.textContent = this.category;

    const hoursTag = document.createElement('span');
    hoursTag.className = 'item-meta-tag';
    hoursTag.setAttribute('title', 'Hours');
    hoursTag.textContent = `${this.hours}h`;

    const difficultyTag = document.createElement('span');
    difficultyTag.className = 'item-meta-tag';
    difficultyTag.setAttribute('title', 'Difficulty');
    difficultyTag.textContent = this.difficulty;

    itemMeta.appendChild(categoryTag);
    itemMeta.appendChild(hoursTag);
    itemMeta.appendChild(difficultyTag);

    // Assemble
    this.domElement.appendChild(this.checkboxElement);
    this.domElement.appendChild(checkboxCustom);
    this.domElement.appendChild(itemLabel);
    this.domElement.appendChild(itemMeta);

    return this.domElement;
  }

  // ===== BIND: Attach event handlers =====
  bind() {
    if (!this.checkboxElement) {
      console.warn('ChecklistItem: render() must be called before bind()');
      return;
    }

    // Attach change listener
    this.checkboxElement.addEventListener('change', (e) => {
      this.handleChange(e);
    });

    // Attach click listener for mic button if present
    this.domElement?.addEventListener('click', (e) => {
      if (e.target.classList.contains('mic-button')) {
        this.handleMicClick(e);
      }
    });
  }

  // ===== EVENT HANDLERS =====
  handleChange(event) {
    this.checked = event.target.checked;

    // Dispatch custom event
    const customEvent = new CustomEvent('item-changed', {
      detail: {
        itemId: this.itemId,
        checked: this.checked,
        room: this.room
      }
    });
    this.domElement?.dispatchEvent(customEvent);
  }

  handleMicClick(event) {
    // For future mic button functionality
    console.log('Mic clicked for item:', this.itemId);
  }

  // ===== UTILITY METHODS =====
  isChecked() {
    return this.checked;
  }

  setChecked(checked) {
    this.checked = checked;
    if (this.checkboxElement) {
      this.checkboxElement.checked = checked;
    }
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
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChecklistItem;
}
