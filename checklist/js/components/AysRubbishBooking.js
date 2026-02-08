/**
 * AysRubbishBooking Component
 *
 * Inline add-on rendered after all room cards.
 * Converts the standalone rubbish-booking.html form into a
 * vanilla ES6 component following the project's pattern:
 *   constructor(options) → render() → bind()
 *
 * Features:
 *  - <details>/<summary> toggle with CSS transition (no jQuery)
 *  - Conditional "Other" inputs on selects with data-has-other
 *  - Photo upload toggle
 *  - Hoarding assessment auto-detect:
 *      • type === 'Hoarder waste' → open section directly
 *      • trailerLoads >= 2        → show warning banner
 *
 * Data model exposed via serialize():
 *   { enabled, trailerLoads, rubbishType, rubbishLocation,
 *     rubbishAccess, preferredTime, rubbishVolume, photos[],
 *     hoarding: { skipBins, estHours, rooms, severity, notes } }
 *
 * @see RUBBISH-EOT-INTEGRATION-PLAN.md
 */

class AysRubbishBooking {
  constructor(options = {}) {
    this.serviceType = options.serviceType || 'eot';
    this.animationSpeed = options.animationSpeed || 200; // ms

    // Internal DOM refs
    this.el = null;
    this.detailsEl = null;
    this.contentEl = null;
    this.hoardingWarningEl = null;
    this.hoardingSectionEl = null;
    this.photoUploadsEl = null;
  }

  // ================================================================
  //  RENDER — returns a real DOM node
  // ================================================================
  render() {
    this.el = document.createElement('div');
    this.el.className = 'rubbish-booking';
    this.el.setAttribute('data-component', 'AysRubbishBooking');

    // Section heading
    const heading = document.createElement('p');
    heading.className = 'rubbish-booking__section-heading';
    heading.textContent = 'Additional Services';
    this.el.appendChild(heading);

    // Details/summary toggle
    this.detailsEl = document.createElement('details');
    this.detailsEl.className = 'rubbish-toggle';
    this.detailsEl.id = 'rubbishToggle';

    const summary = document.createElement('summary');
    const toggleLabel = document.createElement('span');
    toggleLabel.className = 'rubbish-toggle__label';
    toggleLabel.innerHTML = '<span class="rubbish-toggle__icon">🗑️</span> Yes, I need rubbish taken away';
    summary.appendChild(toggleLabel);
    this.detailsEl.appendChild(summary);

    // Content wrapper (for transition)
    this.contentEl = document.createElement('div');
    this.contentEl.className = 'rubbish-content';

    const inner = document.createElement('div');
    inner.className = 'rubbish-content__inner';

    // ---- Build form sections ----
    const form = document.createElement('div');
    form.className = 'rubbish-form';

    form.appendChild(this._buildTrailerLoads());
    form.appendChild(this._buildSectionTitle('Rubbish Details'));
    form.appendChild(this._buildRubbishType());
    form.appendChild(this._buildRubbishLocation());
    form.appendChild(this._buildRubbishAccess());
    form.appendChild(this._buildSectionTitle('Scheduling'));
    form.appendChild(this._buildPreferredTime());
    form.appendChild(this._buildSectionTitle('Volume'));
    form.appendChild(this._buildVolumeGrid());
    form.appendChild(this._buildSectionTitle('Photos (Optional)'));
    form.appendChild(this._buildPhotoUpload());

    inner.appendChild(form);

    // ---- Hoarding warning banner ----
    this.hoardingWarningEl = this._buildHoardingWarning();
    inner.appendChild(this.hoardingWarningEl);

    // ---- Hoarding assessment section ----
    this.hoardingSectionEl = this._buildHoardingSection();
    inner.appendChild(this.hoardingSectionEl);

    this.contentEl.appendChild(inner);
    this.detailsEl.appendChild(this.contentEl);
    this.el.appendChild(this.detailsEl);

    return this.el;
  }

  // ================================================================
  //  BIND — attach event listeners (call after DOM append)
  // ================================================================
  bind() {
    if (!this.el) {
      console.warn('AysRubbishBooking: render() must be called before bind()');
      return;
    }

    // "Other" select handling — show/hide specify inputs
    const otherSelects = this.el.querySelectorAll('select[data-has-other]');
    otherSelects.forEach(select => {
      select.addEventListener('change', () => this._handleOtherSelect(select));
    });

    // Photo toggle
    const photoCheck = this.el.querySelector('#rb-uploadPhotosCheck');
    if (photoCheck) {
      photoCheck.addEventListener('change', () => this._handlePhotoToggle(photoCheck));
    }

    // Hoarding detection — trailer loads + rubbish type
    const trailerSelect = this.el.querySelector('#rb-trailerLoads');
    const typeSelect = this.el.querySelector('#rb-rubbishType');
    if (trailerSelect) trailerSelect.addEventListener('change', () => this._checkHoarding());
    if (typeSelect) typeSelect.addEventListener('change', () => this._checkHoarding());

    // Hoarding warning → open button
    const openBtn = this.el.querySelector('#rb-openHoardingBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this._showHoardingSection();
        this.hoardingSectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  // ================================================================
  //  SERIALIZE — collect all form data for save / quote
  // ================================================================
  serialize() {
    if (!this.el) return null;

    const val = (id) => {
      const el = this.el.querySelector(`#${id}`);
      return el ? el.value : '';
    };

    const checked = (id) => {
      const el = this.el.querySelector(`#${id}`);
      return el ? el.checked : false;
    };

    const radioVal = (name) => {
      const selected = this.el.querySelector(`input[name="${name}"]:checked`);
      return selected ? selected.value : '';
    };

    // Resolve "Other" values
    const resolveOther = (selectId, otherId) => {
      const v = val(selectId);
      if (v === 'Other') {
        const otherInput = this.el.querySelector(`#${otherId} input`);
        return otherInput ? otherInput.value : '';
      }
      return v;
    };

    const isEnabled = this.detailsEl && this.detailsEl.hasAttribute('open');
    const isHoarding = this.hoardingSectionEl &&
      this.hoardingSectionEl.classList.contains('rubbish-hoarding--visible');

    return {
      enabled: isEnabled,
      trailerLoads: parseInt(val('rb-trailerLoads'), 10) || 1,
      rubbishType: resolveOther('rb-rubbishType', 'rb-rubbishTypeOther'),
      rubbishLocation: resolveOther('rb-rubbishLocation', 'rb-rubbishLocationOther'),
      rubbishAccess: resolveOther('rb-rubbishAccess', 'rb-rubbishAccessOther'),
      preferredTime: val('rb-preferredTime'),
      rubbishVolume: parseInt(radioVal('rb_rubbish_volume'), 10) || 1,
      uploadPhotos: checked('rb-uploadPhotosCheck'),
      hoarding: isHoarding ? {
        skipBins: radioVal('rb_skip_bins'),
        estHours: radioVal('rb_est_hours'),
        rooms: val('rb-hoardRooms'),
        severity: val('rb-hoardSeverity'),
        notes: val('rb-hoardNotes')
      } : null
    };
  }

  // ================================================================
  //  RESTORE STATE — re-hydrate from saved data
  // ================================================================
  restoreState(data) {
    if (!this.el || !data) return;

    const setVal = (id, value) => {
      const el = this.el.querySelector(`#${id}`);
      if (el) el.value = value;
    };

    const setChecked = (id, state) => {
      const el = this.el.querySelector(`#${id}`);
      if (el) el.checked = state;
    };

    const setRadio = (name, value) => {
      const radio = this.el.querySelector(`input[name="${name}"][value="${value}"]`);
      if (radio) radio.checked = true;
    };

    if (data.enabled) {
      this.detailsEl.setAttribute('open', '');
    }

    setVal('rb-trailerLoads', data.trailerLoads);
    setVal('rb-rubbishType', data.rubbishType);
    setVal('rb-rubbishLocation', data.rubbishLocation);
    setVal('rb-rubbishAccess', data.rubbishAccess);
    setVal('rb-preferredTime', data.preferredTime);
    setRadio('rb_rubbish_volume', data.rubbishVolume);

    if (data.uploadPhotos) {
      setChecked('rb-uploadPhotosCheck', true);
      this._handlePhotoToggle(this.el.querySelector('#rb-uploadPhotosCheck'));
    }

    if (data.hoarding) {
      setRadio('rb_skip_bins', data.hoarding.skipBins);
      setRadio('rb_est_hours', data.hoarding.estHours);
      setVal('rb-hoardRooms', data.hoarding.rooms);
      setVal('rb-hoardSeverity', data.hoarding.severity);
      setVal('rb-hoardNotes', data.hoarding.notes);
      this._showHoardingSection();
    }

    // Re-run hoarding check to sync UI state
    this._checkHoarding();
  }

  // ================================================================
  //  PRIVATE — Form field builders
  // ================================================================

  /** Section divider */
  _buildSectionTitle(text) {
    const p = document.createElement('p');
    p.className = 'rubbish-form__section-title';
    p.textContent = text;
    return p;
  }

  /** Trailer loads select (1–6) */
  _buildTrailerLoads() {
    const wrap = document.createElement('div');
    wrap.className = 'rubbish-form__trailer-loads';

    const group = this._buildFormGroup('How many trailer loads does it take?', false);
    const select = document.createElement('select');
    select.id = 'rb-trailerLoads';
    select.name = 'trailer_loads';
    for (let i = 1; i <= 6; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} load${i > 1 ? 's' : ''}`;
      select.appendChild(opt);
    }
    group.appendChild(select);
    wrap.appendChild(group);
    return wrap;
  }

  /** Rubbish type select with "Other" */
  _buildRubbishType() {
    const types = [
      'Household', 'Garden waste', 'Renovation rubbish',
      'Office waste', 'Hoarder waste', 'Other'
    ];
    return this._buildSelectWithOther(
      'rb-rubbishType', 'rubbish_type',
      'What type of rubbish do you have?', types, true
    );
  }

  /** Rubbish location select with "Other" */
  _buildRubbishLocation() {
    const locations = [
      'Driveway', 'Inside the house/building',
      'Under the house/building', 'Back of the building',
      'In a storage facility', 'Other'
    ];
    return this._buildSelectWithOther(
      'rb-rubbishLocation', 'rubbish_location',
      'Where is your rubbish located?', locations, true
    );
  }

  /** Rubbish access select with "Other" */
  _buildRubbishAccess() {
    const options = ['Easy access', 'Limited site access', 'Other'];
    return this._buildSelectWithOther(
      'rb-rubbishAccess', 'rubbish_access',
      'Access to the rubbish?', options, true
    );
  }

  /** Preferred time select */
  _buildPreferredTime() {
    const times = [
      '8am - 10am', '10am - 12pm', '12pm - 2pm',
      '2pm - 5:30pm', 'After hours'
    ];
    const group = this._buildFormGroup('What time of the day would be best?', true);
    const select = document.createElement('select');
    select.id = 'rb-preferredTime';
    select.name = 'preferred_time';
    select.setAttribute('aria-required', 'true');
    times.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      if (i === 0) opt.selected = true;
      select.appendChild(opt);
    });
    group.appendChild(select);
    return group;
  }

  /** Volume radio grid (1–9 m³) */
  _buildVolumeGrid() {
    const group = this._buildFormGroup('How much rubbish do you want to get rid of?', true);
    const grid = document.createElement('div');
    grid.className = 'rubbish-volume-grid';
    for (let i = 1; i <= 9; i++) {
      const item = document.createElement('div');
      item.className = 'rubbish-volume-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'rb_rubbish_volume';
      radio.id = `rb-vol${i}`;
      radio.value = i;
      if (i === 1) radio.checked = true;

      const label = document.createElement('label');
      label.setAttribute('for', `rb-vol${i}`);
      label.textContent = `${i}m³`;

      item.appendChild(radio);
      item.appendChild(label);
      grid.appendChild(item);
    }
    group.appendChild(grid);
    return group;
  }

  /** Photo upload checkbox + 5 file inputs */
  _buildPhotoUpload() {
    const frag = document.createDocumentFragment();

    // Checkbox
    const checkGroup = document.createElement('div');
    checkGroup.className = 'rubbish-form__group';
    const checkWrap = document.createElement('div');
    checkWrap.className = 'rubbish-checkbox-group';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'upload_photos';
    cb.id = 'rb-uploadPhotosCheck';
    cb.value = 'yes';

    const cbLabel = document.createElement('label');
    cbLabel.setAttribute('for', 'rb-uploadPhotosCheck');
    cbLabel.textContent = 'Yes, I can upload photos of the rubbish (optional — helps us give more accurate quotes).';

    checkWrap.appendChild(cb);
    checkWrap.appendChild(cbLabel);
    checkGroup.appendChild(checkWrap);
    frag.appendChild(checkGroup);

    // File inputs (hidden initially)
    this.photoUploadsEl = document.createElement('div');
    this.photoUploadsEl.className = 'rubbish-photo-uploads';
    this.photoUploadsEl.id = 'rb-photoUploads';

    const uploadGrid = document.createElement('div');
    uploadGrid.className = 'rubbish-photo-uploads__grid';
    for (let i = 1; i <= 5; i++) {
      const item = document.createElement('div');
      item.className = 'rubbish-photo-uploads__item';

      const label = document.createElement('label');
      label.setAttribute('for', `rb-photo${i}`);
      label.textContent = `Photo ${i}`;

      const input = document.createElement('input');
      input.type = 'file';
      input.name = `photo_${i}`;
      input.id = `rb-photo${i}`;
      input.accept = 'image/*';

      item.appendChild(label);
      item.appendChild(input);
      uploadGrid.appendChild(item);
    }
    this.photoUploadsEl.appendChild(uploadGrid);
    frag.appendChild(this.photoUploadsEl);

    return frag;
  }

  // ================================================================
  //  PRIVATE — Hoarding section builders
  // ================================================================

  /** Warning banner (soft nudge, >= 2 loads) */
  _buildHoardingWarning() {
    const el = document.createElement('div');
    el.className = 'rubbish-hoarding-warning';
    el.id = 'rb-hoardingWarning';

    const icon = document.createElement('span');
    icon.className = 'rubbish-hoarding-warning__icon';
    icon.textContent = '⚠️';

    const text = document.createElement('span');
    text.className = 'rubbish-hoarding-warning__text';
    text.textContent = 'This looks like it could be a larger job. Need skip bins or extra hours?';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rubbish-hoarding-warning__btn';
    btn.id = 'rb-openHoardingBtn';
    btn.textContent = 'Open Hoarding Assessment';

    el.appendChild(icon);
    el.appendChild(text);
    el.appendChild(btn);
    return el;
  }

  /** Full hoarding assessment section */
  _buildHoardingSection() {
    const section = document.createElement('div');
    section.className = 'rubbish-hoarding';
    section.id = 'rb-hoardingSection';

    // Header
    const header = document.createElement('div');
    header.className = 'rubbish-hoarding__header';

    const hIcon = document.createElement('span');
    hIcon.className = 'rubbish-hoarding__icon';
    hIcon.textContent = '⚠️';

    const h3 = document.createElement('h3');
    h3.textContent = 'Hoarding Assessment';

    const tag = document.createElement('span');
    tag.className = 'rubbish-hoarding__tag';
    tag.textContent = 'Large Job';

    header.appendChild(hIcon);
    header.appendChild(h3);
    header.appendChild(tag);
    section.appendChild(header);

    // Note
    const note = document.createElement('p');
    note.className = 'rubbish-hoarding__note';
    note.textContent = 'Hoarding jobs typically require 30–40+ hours and at least one skip bin. ' +
      'The details below help us scope the work and give you an accurate quote. ' +
      'Skip bins handle the heavy/bulky waste that won\'t fit on standard trailer loads.';
    section.appendChild(note);

    // Form fields
    const form = document.createElement('div');
    form.className = 'rubbish-hoarding__form';

    // Skip bins (radio cards)
    form.appendChild(this._buildSkipBins());

    // Estimated hours (radio cards)
    form.appendChild(this._buildEstHours());

    // Row: rooms + severity
    const row = document.createElement('div');
    row.className = 'rubbish-hoarding__form-row';
    row.appendChild(this._buildHoardRooms());
    row.appendChild(this._buildHoardSeverity());
    form.appendChild(row);

    // Notes
    form.appendChild(this._buildHoardNotes());

    section.appendChild(form);
    return section;
  }

  /** Skip bins radio cards */
  _buildSkipBins() {
    const group = this._buildFormGroup('How many skip bins will you need?', true);
    const desc = document.createElement('p');
    desc.className = 'rubbish-form__field-desc';
    desc.textContent = 'Most hoarding jobs need at least 1 skip. Skips hold roughly 3–4m³ of heavy waste.';
    group.appendChild(desc);

    const grid = document.createElement('div');
    grid.className = 'rubbish-skip-grid';

    const bins = [
      { value: '1', label: '1 Skip', sub: 'Standard' },
      { value: '2', label: '2 Skips', sub: 'Heavy job' },
      { value: '3', label: '3 Skips', sub: 'Major job' },
      { value: '4+', label: '4+ Skips', sub: 'We\'ll assess' }
    ];

    bins.forEach((b, i) => {
      const item = document.createElement('div');
      item.className = 'rubbish-skip-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'rb_skip_bins';
      radio.id = `rb-skip${b.value.replace('+', 'plus')}`;
      radio.value = b.value;
      if (i === 0) radio.checked = true;

      const label = document.createElement('label');
      label.setAttribute('for', radio.id);
      label.textContent = b.label;

      const small = document.createElement('small');
      small.textContent = b.sub;
      label.appendChild(small);

      item.appendChild(radio);
      item.appendChild(label);
      grid.appendChild(item);
    });

    group.appendChild(grid);
    return group;
  }

  /** Estimated hours radio cards */
  _buildEstHours() {
    const group = this._buildFormGroup('Estimated hours for the job?', false);
    const desc = document.createElement('p');
    desc.className = 'rubbish-form__field-desc';
    desc.textContent = 'Your best guess — we\'ll confirm after an on-site visit.';
    group.appendChild(desc);

    const grid = document.createElement('div');
    grid.className = 'rubbish-hours-grid';

    const hours = ['10', '20', '30', '40', '50+'];
    hours.forEach((h, i) => {
      const item = document.createElement('div');
      item.className = 'rubbish-hours-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'rb_est_hours';
      radio.id = `rb-hrs${h.replace('+', 'plus')}`;
      radio.value = h;
      if (i === 0) radio.checked = true;

      const label = document.createElement('label');
      label.setAttribute('for', radio.id);
      label.textContent = `~${h} hrs`;

      item.appendChild(radio);
      item.appendChild(label);
      grid.appendChild(item);
    });

    group.appendChild(grid);
    return group;
  }

  /** Rooms affected select */
  _buildHoardRooms() {
    const group = this._buildFormGroup('How many rooms affected?', false);
    const select = document.createElement('select');
    select.id = 'rb-hoardRooms';
    select.name = 'hoard_rooms';

    const opts = [
      { value: '1-2', text: '1–2 rooms' },
      { value: '3-4', text: '3–4 rooms' },
      { value: '5-6', text: '5–6 rooms' },
      { value: 'whole-property', text: 'Whole property' }
    ];
    opts.forEach((o, i) => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.text;
      if (i === 3) opt.selected = true; // default: whole property
      select.appendChild(opt);
    });

    group.appendChild(select);
    return group;
  }

  /** Severity select */
  _buildHoardSeverity() {
    const group = this._buildFormGroup('Severity level?', false);
    const select = document.createElement('select');
    select.id = 'rb-hoardSeverity';
    select.name = 'hoard_severity';

    const opts = [
      { value: 'light', text: 'Light — clutter, some bags' },
      { value: 'moderate', text: 'Moderate — packed rooms' },
      { value: 'severe', text: 'Severe — floor to ceiling' },
      { value: 'extreme', text: 'Extreme — unsafe/hazardous' }
    ];
    opts.forEach((o, i) => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.text;
      if (i === 1) opt.selected = true; // default: moderate
      select.appendChild(opt);
    });

    group.appendChild(select);
    return group;
  }

  /** Additional notes input */
  _buildHoardNotes() {
    const group = this._buildFormGroup('Anything else we should know?', false);
    const desc = document.createElement('p');
    desc.className = 'rubbish-form__field-desc';
    desc.textContent = 'Hazards, pets, access issues, items to keep, etc.';
    group.appendChild(desc);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'rb-hoardNotes';
    input.name = 'hoard_notes';
    input.placeholder = 'e.g. Second floor only, narrow hallway, keep photo albums...';
    group.appendChild(input);
    return group;
  }

  // ================================================================
  //  PRIVATE — Generic helpers
  // ================================================================

  /** Build a labelled form group wrapper */
  _buildFormGroup(labelText, required) {
    const group = document.createElement('div');
    group.className = 'rubbish-form__group';

    const label = document.createElement('label');
    label.textContent = labelText;
    if (required) {
      const star = document.createElement('span');
      star.className = 'rubbish-form__required';
      star.textContent = '*';
      label.appendChild(star);
    }
    group.appendChild(label);
    return group;
  }

  /** Build a select with an "Other" conditional text input */
  _buildSelectWithOther(selectId, name, labelText, options, required) {
    const group = this._buildFormGroup(labelText, required);

    const select = document.createElement('select');
    select.id = selectId;
    select.name = name;
    if (required) select.setAttribute('aria-required', 'true');
    select.setAttribute('data-has-other', 'true');

    options.forEach((o, i) => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      if (i === 0) opt.selected = true;
      select.appendChild(opt);
    });
    group.appendChild(select);

    // Hidden "Other" input
    const otherDiv = document.createElement('div');
    otherDiv.className = 'rubbish-other-specify';
    otherDiv.id = `${selectId}Other`;

    const otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.name = `${name}_other`;
    otherInput.placeholder = `Please specify...`;
    otherInput.disabled = true;
    otherDiv.appendChild(otherInput);
    group.appendChild(otherDiv);

    return group;
  }

  // ================================================================
  //  PRIVATE — Event handlers
  // ================================================================

  /** Show/hide "Other" text input based on select value */
  _handleOtherSelect(select) {
    const otherId = select.id + 'Other';
    const otherDiv = this.el.querySelector(`#${otherId}`);
    if (!otherDiv) return;

    if (select.value === 'Other') {
      otherDiv.classList.add('rubbish-other-specify--visible');
      const input = otherDiv.querySelector('input');
      if (input) {
        input.disabled = false;
        input.focus();
      }
    } else {
      otherDiv.classList.remove('rubbish-other-specify--visible');
      const input = otherDiv.querySelector('input');
      if (input) {
        input.disabled = true;
        input.value = '';
      }
    }
  }

  /** Toggle photo upload fields */
  _handlePhotoToggle(checkbox) {
    if (!this.photoUploadsEl) return;
    if (checkbox.checked) {
      this.photoUploadsEl.classList.add('rubbish-photo-uploads--visible');
    } else {
      this.photoUploadsEl.classList.remove('rubbish-photo-uploads--visible');
    }
  }

  /** Hoarding auto-detect logic */
  _checkHoarding() {
    const typeSelect = this.el.querySelector('#rb-rubbishType');
    const loadsSelect = this.el.querySelector('#rb-trailerLoads');
    if (!typeSelect || !loadsSelect) return;

    const rubbishType = typeSelect.value;
    const trailerLoads = parseInt(loadsSelect.value, 10);
    const isHoarder = (rubbishType === 'Hoarder waste');
    const isLargeJob = (trailerLoads >= 2);

    if (isHoarder) {
      // Hoarder waste — skip warning, open section directly
      this._hideWarning();
      this._showHoardingSection();
    } else if (isLargeJob) {
      // 2+ loads — show warning banner, don't auto-open section
      this._showWarning();
    } else {
      // Neither — hide everything
      this._hideWarning();
      this._hideHoardingSection();
    }
  }

  _showWarning() {
    if (this.hoardingWarningEl) {
      this.hoardingWarningEl.classList.add('rubbish-hoarding-warning--visible');
    }
  }

  _hideWarning() {
    if (this.hoardingWarningEl) {
      this.hoardingWarningEl.classList.remove('rubbish-hoarding-warning--visible');
    }
  }

  _showHoardingSection() {
    if (this.hoardingSectionEl) {
      this.hoardingSectionEl.classList.add('rubbish-hoarding--visible');
    }
  }

  _hideHoardingSection() {
    if (this.hoardingSectionEl) {
      this.hoardingSectionEl.classList.remove('rubbish-hoarding--visible');
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysRubbishBooking;
}
