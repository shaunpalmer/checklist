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
    this.control = options.control;
    this.variantKey = options.variantKey || options.optionsKey;
    this.defaultVariant = options.defaultVariant;

    // Optional pricing + quote metadata (used by checklist-script.js quote calculator)
    this.baseCharge = options.baseCharge;
    this.settingsKey = options.settingsKey;
    this.serviceCode = options.serviceCode;
    this.variantType = options.variantType;
    this.optionsKey = options.optionsKey;
    this.variantOptions = options.variantOptions;
    this.itemHash = options.itemHash;
    this.itemDetails = options.itemDetails;

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

    if (this.baseCharge !== undefined && this.baseCharge !== null && this.baseCharge !== '') {
      this.domElement.setAttribute('data-base-charge', this.baseCharge);
    }
    if (this.settingsKey) {
      this.domElement.setAttribute('data-settings-key', this.settingsKey);
    }
    if (this.serviceCode) {
      this.domElement.setAttribute('data-service-code', this.serviceCode);
    }
    if (this.control) {
      this.domElement.setAttribute('data-control', this.control);
    }
    if (this.variantType) {
      this.domElement.setAttribute('data-variant-type', this.variantType);
    }
    const optionsKey = this.optionsKey || this.variantKey;
    if (optionsKey) {
      this.domElement.setAttribute('data-options-key', optionsKey);
      this.domElement.setAttribute('data-variant-key', optionsKey);
    }
    if (this.defaultVariant) {
      this.domElement.setAttribute('data-default-variant', this.defaultVariant);
    }
    if (this.itemHash) {
      this.domElement.setAttribute('data-item-hash', this.itemHash);
    }
    if (this.itemDetails) {
      this.domElement.setAttribute('data-item-details', this.itemDetails);
    }

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

    // Optional variant dropdown (e.g., ovens, floor type)
    let variantSelect = null;
    const optionsKeyForSelect = this.optionsKey || this.variantKey;
    const wantsSelect = this.control === 'checkbox+select' || this.variantType === 'dropdown';
    if (wantsSelect && optionsKeyForSelect) {
      const options = Array.isArray(this.variantOptions)
        ? this.variantOptions
        : (window.VARIANTS && Array.isArray(window.VARIANTS[optionsKeyForSelect])
          ? window.VARIANTS[optionsKeyForSelect]
          : []);

      variantSelect = document.createElement('select');
      variantSelect.className = 'variant-dropdown';
      variantSelect.hidden = true;
      variantSelect.disabled = true;
      variantSelect.setAttribute('data-options-select', optionsKeyForSelect);

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose option...';
      variantSelect.appendChild(placeholder);

      options.forEach((opt) => {
        if (!opt) return;
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        variantSelect.appendChild(option);
      });
    }

    // Append to label
    this.domElement.appendChild(this.checkboxElement);
    this.domElement.appendChild(customCheckbox);
    this.domElement.appendChild(labelSpan);
    if (variantSelect) {
      this.domElement.appendChild(variantSelect);

      const isFloorVariant = optionsKeyForSelect === 'floor_types' || optionsKeyForSelect === 'floor_variants';
      if (this.control === 'checkbox+select' && isFloorVariant) {
        const applySelect = document.createElement('select');
        applySelect.className = 'variant-apply-scope';
        applySelect.setAttribute('aria-label', 'Apply floor type to other rooms');

        const placeholderApply = document.createElement('option');
        placeholderApply.value = '';
        placeholderApply.textContent = 'Apply to…';
        applySelect.appendChild(placeholderApply);

        const optRoomType = document.createElement('option');
        optRoomType.value = 'room-type';
        optRoomType.textContent = 'Apply to all of this room type';
        applySelect.appendChild(optRoomType);

        const optAll = document.createElement('option');
        optAll.value = 'all-rooms';
        optAll.textContent = 'Apply to all rooms';
        applySelect.appendChild(optAll);

        this.domElement.appendChild(applySelect);
      }
    }

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
