/**
 * AysDisclosureRoomCard Component
 * 
 * Renders a collapsible details/summary card (disclosure pattern)
 * Follows Option 2: Component factory + small classes
 * 
 * Usage:
 *   const card = new AysDisclosureRoomCard({
 *     roomId: 'kitchen',
 *     title: 'Kitchen',
 *     emoji: '🍳',
 *     checkedCount: 2,
 *     totalCount: 5,
 *     items: [...]
 *   });
 *   document.getElementById('container').appendChild(card.render());
 *   card.bind();
 */

class AysDisclosureRoomCard {
  constructor(options = {}) {
    this.roomId = options.roomId || 'unknown';
    this.title = options.title || 'Section';
    this.emoji = options.emoji || '📋';
    this.items = options.items || []; // Array of AysChecklistItemCheckbox configs
    this.checkedCount = options.checkedCount || 0;
    this.totalCount = options.totalCount || this.items.length;
    this.animationClass = options.animationClass || 'slide-open';
    
    // Internal state
    this.domElement = null;
    this.summaryElement = null;
    this.progressBarElement = null;
    this.progressBadgeElement = null;
    this.itemsContainerElement = null;
    this.calculateProgress();
  }

  // Calculate progress percentage
  calculateProgress() {
    this.progressPercent = this.totalCount > 0 ? Math.round((this.checkedCount / this.totalCount) * 100) : 0;
  }

  // ===== RENDER: Returns DOM node (not string!) =====
  render() {
    // Create main details element
    this.domElement = document.createElement('details');
    this.domElement.setAttribute('data-room', this.roomId);
    this.domElement.classList.add(this.animationClass);

    // Create summary
    const summary = document.createElement('summary');
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'summary-header';

    // Room title
    const roomTitle = document.createElement('span');
    roomTitle.className = 'room-title';
    roomTitle.textContent = `${this.emoji} ${this.title}`;

    // Progress bar
    this.progressBarElement = document.createElement('span');
    this.progressBarElement.className = 'room-progressbar';
    this.progressBarElement.setAttribute('aria-hidden', 'true');
    
    const progressFill = document.createElement('span');
    progressFill.className = 'room-progressbar-fill';
    progressFill.style.width = `${this.progressPercent}%`;
    progressFill.style.background = this.progressPercent === 100 ? 'var(--color-success)' : 'var(--color-accent)';
    progressFill.style.transition = 'width 0.3s ease';
    
    this.progressBarElement.appendChild(progressFill);

    // Progress badge
    this.progressBadgeElement = document.createElement('span');
    this.progressBadgeElement.className = 'progress-badge';
    this.progressBadgeElement.textContent = `${this.checkedCount}/${this.totalCount}`;

    // Select All button
    this.selectAllButton = document.createElement('button');
    this.selectAllButton.type = 'button';
    this.selectAllButton.className = 'select-all-btn';
    this.selectAllButton.textContent = '☑ All';
    this.selectAllButton.title = 'Select all items in this room';
    this.selectAllButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent details toggle
      this.toggleSelectAll();
    });

    // Assemble summary
    summaryHeader.appendChild(roomTitle);
    summaryHeader.appendChild(this.progressBarElement);
    summaryHeader.appendChild(this.progressBadgeElement);
    summaryHeader.appendChild(this.selectAllButton);
    summary.appendChild(summaryHeader);

    // Create room details container
    const roomDetails = document.createElement('div');
    roomDetails.className = 'room-details';

    // Create checklist items container
    this.itemsContainerElement = document.createElement('div');
    this.itemsContainerElement.className = 'checklist-items';

    // Render items (as DOM nodes)
    this.items.forEach(itemConfig => {
      const item = new AysChecklistItemCheckbox(itemConfig);
      this.itemsContainerElement.appendChild(item.render());
      item.bind();
    });

    // Assemble
    roomDetails.appendChild(this.itemsContainerElement);
    this.domElement.appendChild(summary);
    this.domElement.appendChild(roomDetails);

    return this.domElement;
  }

  // ===== BIND: Attach event handlers =====
  bind() {
    if (!this.domElement) {
      console.warn('AysDisclosureRoomCard: render() must be called before bind()');
      return;
    }

    // Attach change listeners to all checkboxes
    const checkboxes = this.domElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleItemChecked(e));
    });
  }

  // ===== EVENT HANDLERS =====
  handleItemChecked(event) {
    // Recount checked items
    const checkboxes = this.domElement.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    this.updateProgress(checked, this.totalCount);
    this.updateSelectAllButton();
  }

  // ===== SELECT ALL TOGGLE =====
  toggleSelectAll() {
    if (!this.domElement) return;

    const checkboxes = this.domElement.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    // Toggle: if all checked, uncheck all; otherwise check all
    const newState = !allChecked;

    checkboxes.forEach(cb => {
      if (cb.checked !== newState) {
        cb.checked = newState;
        // Trigger change event so other listeners (autosave, etc.) fire
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Update progress
    const checked = newState ? checkboxes.length : 0;
    this.updateProgress(checked, this.totalCount);
    this.updateSelectAllButton();
  }

  // ===== UPDATE SELECT ALL BUTTON STATE =====
  updateSelectAllButton() {
    if (!this.selectAllButton || !this.domElement) return;

    const checkboxes = this.domElement.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    if (allChecked && checkboxes.length > 0) {
      this.selectAllButton.textContent = '☐ None';
      this.selectAllButton.title = 'Deselect all items in this room';
      this.selectAllButton.dataset.allSelected = 'true';
    } else {
      this.selectAllButton.textContent = '☑ All';
      this.selectAllButton.title = 'Select all items in this room';
      this.selectAllButton.dataset.allSelected = 'false';
    }
  }

  // ===== UPDATE PROGRESS =====
  updateProgress(checkedCount, totalCount) {
    this.checkedCount = checkedCount;
    this.totalCount = totalCount;
    this.calculateProgress();

    // Update progress badge
    if (this.progressBadgeElement) {
      this.progressBadgeElement.textContent = `${this.checkedCount}/${this.totalCount}`;
    }

    // Update progress bar
    if (this.progressBarElement) {
      const fill = this.progressBarElement.querySelector('.room-progressbar-fill');
      if (fill) {
        fill.style.width = `${this.progressPercent}%`;
        fill.style.background = this.progressPercent === 100 ? 'var(--color-success)' : 'var(--color-accent)';
      }
    }

    // Dispatch custom event for parent components
    const event = new CustomEvent('progress-updated', {
      detail: {
        roomId: this.roomId,
        checkedCount: this.checkedCount,
        totalCount: this.totalCount,
        progressPercent: this.progressPercent
      }
    });
    this.domElement?.dispatchEvent(event);
  }

  // ===== UTILITY METHODS =====
  addItem(itemConfig) {
    if (!this.itemsContainerElement) {
      console.warn('AysDisclosureRoomCard: Cannot add item before render()');
      return;
    }

    const item = new AysChecklistItemCheckbox(itemConfig);
    this.itemsContainerElement.appendChild(item.render());
    item.bind();

    this.items.push(itemConfig);
    this.totalCount++;
    this.bind(); // Re-bind to include new item
  }

  removeItem(itemId) {
    if (!this.itemsContainerElement) return;

    const element = this.itemsContainerElement.querySelector(`[data-item-id="${itemId}"]`);
    if (element) {
      element.remove();
      this.items = this.items.filter(item => item.itemId !== itemId);
      this.totalCount--;
      this.bind();
    }
  }

  open() {
    if (this.domElement) {
      this.domElement.setAttribute('open', '');
    }
  }

  close() {
    if (this.domElement) {
      this.domElement.removeAttribute('open');
    }
  }

  toggle() {
    if (this.domElement) {
      if (this.domElement.hasAttribute('open')) {
        this.close();
      } else {
        this.open();
      }
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysDisclosureRoomCard;
}
