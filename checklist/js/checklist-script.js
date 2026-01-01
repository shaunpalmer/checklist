/**
 * End of Tenancy Checklist
 * jQuery/Vanilla JS interactions
 * Print, PDF, localStorage persistence, progress tracking
 */

(function($) {
  'use strict';

  const STORAGE_KEYS = {
    progress: 'checklist_progress',
    crew: 'checklist_crew',
    date: 'checklist_date',
    serviceType: 'checklist_service_type',
    settings: 'checklist_settings',
    variantSelections: 'checklist_variant_selections',
    customItems: 'checklist_custom_items_v1',
    changeLog: 'checklist_change_log',
    snapshotFallback: 'checklist_snapshot_latest',
    clientContext: 'checklist_client_context'
  };

  const CHANGE_LOG_MAX_ENTRIES = 2000;

  // ======== SMOOTH ANIMATION HELPERS ========
  const ANIMATION_DURATION = 200; // ms - adjust 50-150 to taste

  function animateOpen($panel) {
    $panel.stop(true, true);
    const startHeight = 0;
    const endHeight = $panel.get(0).scrollHeight;

    $panel
      .css({ height: startHeight })
      .animate(
        { height: endHeight },
        ANIMATION_DURATION,
        'swing',
        function () {
          $panel.css({ height: 'auto' }); // let it auto-size after
        }
      );
  }

  function animateClose($panel) {
    $panel.stop(true, true);

    $panel.animate(
      { height: 0 },
      ANIMATION_DURATION,
      'swing'
    );
  }

  const Checklist = {
    /**
     * Initialize the checklist
     */
    init: function() {
      this.initAdminView();
      this.cacheDOM();
      this.applySettingsToUI();
      this.initCustomItems();
      this.initRoomProgressBars();
      this.initEventWorker();
      this.initSyncStatusUI();
      this.normalizePhase1Attributes();
      this.bindEvents();
      this.initVoiceDictationMicButtons();
      this.restoreSnapshotBestEffort();
      this.restoreClientContextBestEffort();
      this.loadProgress();
      this.updateAllProgress();
    },

    // ======== CUSTOM ITEMS (Custom Service tab) ========
    initAdminView: function() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const adminParam = String(params.get('admin') || '').trim().toLowerCase();
        const wantsAdmin = ['1', 'true', 'yes', 'on'].includes(adminParam);

        const storageKey = 'checklist_admin_view';
        const storedAdmin = localStorage.getItem(storageKey) === '1';

        if (wantsAdmin) {
          localStorage.setItem(storageKey, '1');
        }

        const enabled = wantsAdmin || storedAdmin;
        if (enabled && document.body) {
          document.body.classList.add('view-admin');
        }
      } catch {
        // ignore
      }
    },

    isAdminView: function() {
      return !!(document.body && document.body.classList.contains('view-admin'));
    },

    escapeHtml: function(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    },

    loadCustomItems: function() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.customItems);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch {
        return [];
      }
    },

    saveCustomItems: function(items) {
      localStorage.setItem(STORAGE_KEYS.customItems, JSON.stringify(items));
      this.saveSnapshot();
    },

    newCustomItemId: function() {
      return `ci_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    },

    hashCustomItem: function(description, details) {
      const input = `${String(description ?? '').trim()}|${String(details ?? '').trim()}`;
      let hash = 2166136261;
      for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return `fnv1a_${(hash >>> 0).toString(16)}`;
    },

    getCustomItemsSnapshot: function() {
      return this.loadCustomItems()
        .filter((it) => it && !it.archived)
        .map((it) => ({
          item_id: it.id,
          hash: it.hash,
          description: it.description,
          details: it.details
        }));
    },

    resetCustomItemEditor: function() {
      $('#custom-item-id').val('');
      $('#custom-item-description').val('');
      $('#custom-item-details').val('');
      $('#custom-item-internal-notes').val('');
    },

    initCustomItems: function() {
      this.renderCustomItems();

      $(document).on('click', '#btn-clear-custom-item', () => {
        this.resetCustomItemEditor();
      });

      $(document).on('click', '#btn-save-custom-item', () => {
        if (!this.isAdminView()) return;

        const editId = String($('#custom-item-id').val() || '').trim();
        const description = String($('#custom-item-description').val() || '').trim();
        const details = String($('#custom-item-details').val() || '').trim();
        const internalNotes = String($('#custom-item-internal-notes').val() || '').trim();

        if (!description) {
          alert('Please enter an item label.');
          return;
        }

        const items = this.loadCustomItems();
        const activeCount = items.filter((it) => it && !it.archived).length;
        if (!editId && activeCount >= 10) {
          alert('You can have up to 10 active custom items. Archive one to add another.');
          return;
        }
        const hash = this.hashCustomItem(description, details);

        if (editId) {
          const index = items.findIndex((it) => it && it.id === editId);
          if (index >= 0) {
            items[index] = {
              ...items[index],
              description,
              details,
              hash,
              internal_notes: this.isAdminView() ? internalNotes : (items[index].internal_notes || ''),
              updated_at: new Date().toISOString()
            };
          }
        } else {
          items.push({
            id: this.newCustomItemId(),
            description,
            details,
            hash,
            internal_notes: this.isAdminView() ? internalNotes : '',
            archived: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        this.saveCustomItems(items);
        this.resetCustomItemEditor();
        this.renderCustomItems();
      });

      $(document).on('click', '[data-action="custom-item-edit"]', (e) => {
        e.preventDefault();
        if (!this.isAdminView()) return;
        const id = $(e.currentTarget).attr('data-id');
        const items = this.loadCustomItems();
        const item = items.find((it) => it && it.id === id);
        if (!item) return;

        $('#custom-item-id').val(item.id);
        $('#custom-item-description').val(item.description || '');
        $('#custom-item-details').val(item.details || '');
        $('#custom-item-internal-notes').val(item.internal_notes || '');
      });

      $(document).on('click', '[data-action="custom-item-archive"]', (e) => {
        e.preventDefault();
        if (!this.isAdminView()) return;
        const id = $(e.currentTarget).attr('data-id');
        const items = this.loadCustomItems();
        const index = items.findIndex((it) => it && it.id === id);
        if (index < 0) return;
        items[index] = { ...items[index], archived: true, updated_at: new Date().toISOString() };
        this.saveCustomItems(items);
        this.renderCustomItems();
      });

      $(document).on('click', '[data-action="custom-item-unarchive"]', (e) => {
        e.preventDefault();
        if (!this.isAdminView()) return;
        const id = $(e.currentTarget).attr('data-id');
        const items = this.loadCustomItems();
        const index = items.findIndex((it) => it && it.id === id);
        if (index < 0) return;

        const activeCount = items.filter((it) => it && !it.archived).length;
        if (activeCount >= 10) {
          alert('You can have up to 10 active custom items. Archive one to restore another.');
          return;
        }
        items[index] = { ...items[index], archived: false, updated_at: new Date().toISOString() };
        this.saveCustomItems(items);
        this.renderCustomItems();
      });
    },

    renderCustomItems: function() {
      const $container = $('#custom-items-checklist');
      if ($container.length === 0) return;

      const items = this.loadCustomItems();
      const toTs = (it) => {
        const candidate = (it && (it.updated_at || it.created_at)) ? String(it.updated_at || it.created_at) : '';
        const t = Date.parse(candidate);
        return Number.isFinite(t) ? t : 0;
      };

      const visible = items
        .filter((it) => it && !it.archived)
        .slice()
        .sort((a, b) => toTs(b) - toTs(a));
      const archived = items
        .filter((it) => it && it.archived)
        .slice()
        .sort((a, b) => toTs(b) - toTs(a));

      const parts = [];
      visible.forEach((item) => {
        const safeLabel = this.escapeHtml(item.description);
        const safeDetails = this.escapeHtml(item.details);
        const safeHash = this.escapeHtml(item.hash);
        const checkboxId = `custom_${item.id}`;

        parts.push(`
          <div>
            <label class="checklist-item" data-room="custom-items" data-category="custom" data-difficulty="basic" data-hours="0.5" data-base-charge="0" data-item-hash="${safeHash}" data-item-details="${safeDetails}">
              <input type="checkbox" id="${this.escapeHtml(checkboxId)}" />
              <span class="checkbox-custom"></span>
              <span class="item-label">${safeLabel}</span>
            </label>
            ${item.details ? `
              <details class="ays-acc" style="margin-top: 6px;">
                <summary class="summary-header">Details</summary>
                <div class="room-details" style="padding: 10px;">
                  <div style="white-space: pre-wrap;">${safeDetails}</div>
                </div>
              </details>
            ` : ''}
            ${(this.isAdminView() && item.internal_notes) ? `
              <details class="ays-acc" style="margin-top: 6px;">
                <summary class="summary-header">Internal</summary>
                <div class="room-details" style="padding: 10px;">
                  <div style="white-space: pre-wrap;">${this.escapeHtml(item.internal_notes)}</div>
                </div>
              </details>
            ` : ''}
            ${this.isAdminView() ? `
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button type="button" class="btn btn-secondary" data-action="custom-item-edit" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px;">Edit</button>
                <button type="button" class="btn btn-secondary" data-action="custom-item-archive" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px;">Archive</button>
              </div>
            ` : ''}
          </div>
        `);
      });

      if (this.isAdminView() && archived.length) {
        parts.push(`
          <details class="ays-acc" style="margin-top: var(--space-md);">
            <summary class="summary-header">Archived custom items</summary>
            <div class="room-details" style="padding: 10px;">
              <div style="display: grid; gap: 10px;">
                ${archived.map((item) => {
                  return `
                    <div style="display:flex; justify-content: space-between; gap: 10px; align-items: center;">
                      <div>${this.escapeHtml(item.description)}</div>
                      <button type="button" class="btn btn-secondary" data-action="custom-item-unarchive" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px;">Restore</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </details>
        `);
      }

      $container.html(parts.join(''));
      this.cacheDOM();
      this.updateAllProgress();
    },

    setAddressEditEnabled: function(enabled) {
      const on = enabled === true;
      this._addressEditEnabled = on;

      const ids = [
        '#quote-address-line1',
        '#quote-address-line2',
        '#quote-suburb',
        '#quote-city',
        '#quote-region',
        '#quote-postcode',
        '#quote-country'
      ];

      ids.forEach((sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        if (on) {
          el.removeAttribute('readonly');
        } else {
          el.setAttribute('readonly', 'readonly');
        }

        // Keep mic button in sync (don’t let it “edit” when locked)
        const $wrap = $(el).closest('.voice-wrap');
        const $btn = $wrap.find('.mic-btn').first();
        if ($btn.length) {
          $btn.prop('disabled', !on);
          $btn.attr('aria-disabled', (!on).toString());
        }
      });

      const $toggleBtn = $('#btn-toggle-address-edit');
      if ($toggleBtn.length) {
        $toggleBtn.text(on ? 'Lock address' : 'Edit address');
      }

      if (typeof this.announce === 'function') {
        this.announce(on ? 'Address editing enabled.' : 'Address editing locked.');
      }
    },

    getLeadDataBestEffort: function() {
      // Integration hooks (WordPress can inject one of these on page render)
      const candidates = [];
      try {
        candidates.push(window.__CHECKLIST_LEAD__);
        candidates.push(window.__LEAD_DATA__);
        candidates.push(window.LeadData);
      } catch (_) {
        // ignore
      }

      // localStorage hooks (lead form or WP can store)
      const storageKeys = [
        'checklist_lead_data',
        'wp_lead_data',
        'lead_data'
      ];
      for (const key of storageKeys) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          candidates.push(parsed);
        } catch (_) {
          // ignore
        }
      }

      // URL query param hook (e.g., checklist-modern.html?lead_name=...)
      try {
        const params = new URLSearchParams(window.location.search || '');
        const fromParams = {
          name: params.get('lead_name') || params.get('name') || null,
          email: params.get('lead_email') || params.get('email') || null,
          phone: params.get('lead_phone') || params.get('phone') || null,
          address_line1: params.get('lead_address_line1') || params.get('address_line1') || null,
          address_line2: params.get('lead_address_line2') || params.get('address_line2') || null,
          suburb: params.get('lead_suburb') || params.get('suburb') || null,
          city: params.get('lead_city') || params.get('city') || null,
          region: params.get('lead_region') || params.get('region') || null,
          postcode: params.get('lead_postcode') || params.get('postcode') || null,
          country: params.get('lead_country') || params.get('country') || null
        };
        const hasAny = Object.values(fromParams).some(v => (v || '').toString().trim() !== '');
        if (hasAny) candidates.push(fromParams);
      } catch (_) {
        // ignore
      }

      // Pick the first object that looks usable
      const normalize = (obj) => {
        if (!obj || typeof obj !== 'object') return null;

        // Support common lead sources + your CPT meta keys (ays_*)
        const name = (obj.name || obj.client_name || obj.full_name || obj.ays_name || '').toString().trim();
        const email = (obj.email || obj.client_email || obj.ays_email || '').toString().trim();
        const phone = (obj.phone || obj.client_phone || obj.mobile || obj.ays_phone || '').toString().trim();
        const notes = (obj.notes || obj.lead_notes || obj.ays_notes || '').toString().trim();

        const bookingDate = (obj.booking_date || obj.ays_booking_date || '').toString().trim();
        const bookingTime = (obj.booking_time || obj.ays_booking_time || '').toString().trim();

        const addr = obj.address && typeof obj.address === 'object' ? obj.address : obj;
        // Some sources only have a single address string
        const address_line1 = (addr.address_line1 || addr.line1 || addr.street || addr.ays_address || addr.address || '').toString().trim();
        const address_line2 = (addr.address_line2 || addr.line2 || '').toString().trim();
        const suburb = (addr.suburb || addr.address_suburb || '').toString().trim();
        const city = (addr.city || addr.town || '').toString().trim();
        const region = (addr.region || addr.state || addr.province || '').toString().trim();
        const postcode = (addr.postcode || addr.zip || addr.postal_code || '').toString().trim();
        const country = (addr.country || addr.country_name || '').toString().trim();

        const hasAny = !!(name || email || phone || address_line1 || suburb || city || region || postcode || country);
        if (!hasAny) return null;

        return {
          name: name || null,
          email: email || null,
          phone: phone || null,
          notes: notes || null,
          booking_date: bookingDate || null,
          booking_time: bookingTime || null,
          address: {
            address_line1: address_line1 || null,
            address_line2: address_line2 || null,
            suburb: suburb || null,
            city: city || null,
            region: region || null,
            postcode: postcode || null,
            country: country || null
          }
        };
      };

      for (const c of candidates) {
        const n = normalize(c);
        if (n) return n;
      }

      return null;
    },

    applyLeadDataToQuoteForm: function(lead) {
      if (!lead || typeof lead !== 'object') return false;

      // Only fill blanks — never clobber user-entered data
      const fillIfEmpty = (selector, value) => {
        if (value === undefined || value === null || value === '') return;
        const $el = $(selector);
        if (!$el.length) return;
        const cur = ($el.val() || '').toString().trim();
        if (cur) return;
        $el.val(value);
      };

      fillIfEmpty('#quote-client-name', lead.name);
      fillIfEmpty('#quote-client-email', lead.email);
      fillIfEmpty('#quote-client-phone', lead.phone);

      // Optional convenience: capture lead notes into internal quote notes (only if empty)
      fillIfEmpty('#quote-notes', lead.notes);

      // Optional: carry lead booking date into quote booking date (if present)
      fillIfEmpty('#quote-booking-date', lead.booking_date);

      const addr = lead.address || {};
      fillIfEmpty('#quote-address-line1', addr.address_line1);
      fillIfEmpty('#quote-address-line2', addr.address_line2);
      fillIfEmpty('#quote-suburb', addr.suburb);
      fillIfEmpty('#quote-city', addr.city);
      fillIfEmpty('#quote-region', addr.region);
      fillIfEmpty('#quote-postcode', addr.postcode);
      fillIfEmpty('#quote-country', addr.country);

      // If anything important is still missing, enable enrichment
      const missing = [
        '#quote-client-name',
        '#quote-client-email',
        '#quote-client-phone',
        '#quote-address-line1',
        '#quote-city',
        '#quote-country'
      ].some((sel) => {
        const v = ($(sel).val() || '').toString().trim();
        return !v;
      });
      if (missing) {
        this.setAddressEditEnabled(true);
      }

      // Persist minimal context so subsequent events tie to this capture
      this.persistClientContext({
        client_id: null,
        population_id: ($('#quote-population-id').val() || '').toString().trim() || null,
        quote_id: ($('#quote-id').val() || '').toString().trim() || null,
        name: ($('#quote-client-name').val() || '').toString().trim() || null,
        email: ($('#quote-client-email').val() || '').toString().trim() || null,
        phone: ($('#quote-client-phone').val() || '').toString().trim() || null,
        address: {
          address_line1: ($('#quote-address-line1').val() || '').toString().trim() || null,
          address_line2: ($('#quote-address-line2').val() || '').toString().trim() || null,
          suburb: ($('#quote-suburb').val() || '').toString().trim() || null,
          city: ($('#quote-city').val() || '').toString().trim() || null,
          region: ($('#quote-region').val() || '').toString().trim() || null,
          postcode: ($('#quote-postcode').val() || '').toString().trim() || null,
          country: ($('#quote-country').val() || '').toString().trim() || null
        }
      });

      this.enqueueEvent({
        type: 'lead_data_used',
        ts: new Date().toISOString(),
        context: { page: location.pathname, serviceType: this.getActiveServiceType() },
        payload: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          notes: lead.notes || null,
          booking_date: lead.booking_date || null,
          booking_time: lead.booking_time || null,
          address: lead.address || null
        }
      });
      this.scheduleSnapshot(0);
      this.flushEventQueue();

      if (typeof this.announce === 'function') {
        this.announce(missing ? 'Lead data applied. Address editing enabled for missing details.' : 'Lead data applied.');
      }

      return true;
    },

    scheduleAddressUpdateEvent: function() {
      const self = this;
      if (this._addressUpdateTimer) clearTimeout(this._addressUpdateTimer);
      this._addressUpdateTimer = setTimeout(() => {
        const populationId = ($('#quote-population-id').val() || '').toString().trim() || null;
        const payload = {
          population_id: populationId,
          address_line1: ($('#quote-address-line1').val() || '').toString().trim() || null,
          address_line2: ($('#quote-address-line2').val() || '').toString().trim() || null,
          suburb: ($('#quote-suburb').val() || '').toString().trim() || null,
          city: ($('#quote-city').val() || '').toString().trim() || null,
          region: ($('#quote-region').val() || '').toString().trim() || null,
          postcode: ($('#quote-postcode').val() || '').toString().trim() || null,
          country: ($('#quote-country').val() || '').toString().trim() || null
        };

        self.enqueueEvent({
          type: 'address_update',
          ts: new Date().toISOString(),
          context: { page: location.pathname, serviceType: self.getActiveServiceType() },
          payload
        });

        self.scheduleSnapshot(250);
        self.flushEventQueue();
      }, 600);
    },

    initVoiceDictationMicButtons: function() {
      const self = this;

      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

      const safeAnnounce = (text) => {
        try {
          if (typeof self.announce === 'function') self.announce(text);
        } catch (e) {
          // no-op
        }
      };

      const getFieldLabel = (el) => {
        const id = el && el.id;
        if (!id) return 'field';
        const $label = $('label[for="' + id + '"]');
        const labelText = ($label.text() || '').trim();
        return labelText || 'field';
      };

      const wrapFieldWithMic = (el, mode, options) => {
        if (!el || el.dataset.voiceMicReady === '1') return;
        const allowReadOnly = !!(options && options.allowReadOnly);
        if (el.disabled) return;
        if (el.readOnly && !allowReadOnly) return;

        const tag = (el.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') return;

        // Avoid attaching to date/datetime/number inputs
        if (tag === 'input') {
          const type = (el.getAttribute('type') || 'text').toLowerCase();
          if (['date', 'datetime-local', 'time', 'number', 'range', 'file', 'password'].includes(type)) return;
        }

        const $el = $(el);

        // Preserve layout: wrap only the control
        const $wrap = $('<div class="voice-wrap"></div>');
        $el.before($wrap);
        $wrap.append($el);

        const labelText = getFieldLabel(el);
        const $btn = $(
          '<button type="button" class="mic-btn" aria-pressed="false"></button>'
        );
        $btn.text('🎤');
        $btn.attr('aria-label', 'Dictate into ' + labelText);
        $btn.data('voice-target', el);
        $btn.data('voice-mode', mode || 'insert');
        $wrap.append($btn);

        el.dataset.voiceMicReady = '1';
      };

      const insertTextAtCaret = (el, text) => {
        const value = el.value || '';
        const start = typeof el.selectionStart === 'number' ? el.selectionStart : value.length;
        const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : value.length;

        const before = value.slice(0, start);
        const after = value.slice(end);

        // Add a separating space if needed
        const needsSpace = before && !/\s$/.test(before) && text && !/^\s/.test(text);
        const toInsert = (needsSpace ? ' ' : '') + text;

        el.value = before + toInsert + after;

        const newPos = (before + toInsert).length;
        try {
          el.setSelectionRange(newPos, newPos);
        } catch (e) {
          // no-op
        }
      };

      const appendTextToEnd = (el, text, separator) => {
        const existing = (el.value || '');
        const trimmedExisting = existing.trim();
        const sep = (separator === '\n') ? '\n' : ' ';

        if (!trimmedExisting) {
          el.value = text;
        } else if (sep === '\n') {
          const needsNewline = existing.length > 0 && !/\n$/.test(existing);
          el.value = existing + (needsNewline ? '\n' : '') + text;
        } else {
          const needsSpace = existing.length > 0 && !/\s$/.test(existing);
          el.value = existing + (needsSpace ? ' ' : '') + text;
        }

        // Keep cursor at the end
        const endPos = el.value.length;
        try {
          el.setSelectionRange(endPos, endPos);
        } catch (e) {
          // no-op
        }
      };

      const setListeningUI = ($btn, isListening) => {
        $btn.toggleClass('is-listening', !!isListening);
        $btn.attr('aria-pressed', isListening ? 'true' : 'false');
      };

      let activeRecognition = null;
      let $activeButton = null;
      let activeTarget = null;

      const stopActive = () => {
        try {
          if (activeRecognition) activeRecognition.stop();
        } catch (e) {
          // no-op
        }
        activeRecognition = null;
        activeTarget = null;
        if ($activeButton) {
          setListeningUI($activeButton, false);
          $activeButton = null;
        }
      };

      const startRecognition = (targetEl, mode, $btn) => {
        if (!SpeechRecognitionCtor) {
          targetEl && targetEl.focus && targetEl.focus();
          safeAnnounce('Voice recognition is not available in this browser. Use your keyboard mic to dictate.');
          return;
        }

        // Toggle off if clicking the active mic
        if ($activeButton && $btn && $activeButton.get(0) === $btn.get(0)) {
          stopActive();
          return;
        }

        stopActive();

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = (navigator.language || 'en-US');

        activeRecognition = recognition;
        activeTarget = targetEl;
        $activeButton = $btn;
        setListeningUI($btn, true);
        safeAnnounce('Listening.');

        recognition.onresult = (event) => {
          const result = event && event.results && event.results[0] && event.results[0][0];
          const transcript = (result && result.transcript ? result.transcript : '').trim();
          if (!transcript || !activeTarget) return;

          const effectiveMode = (mode || 'insert');
          if (effectiveMode === 'replace') {
            activeTarget.value = transcript;
            // Keep cursor at end
            try {
              const endPos = activeTarget.value.length;
              activeTarget.setSelectionRange(endPos, endPos);
            } catch (e) {
              // no-op
            }
          } else if (effectiveMode === 'append') {
            appendTextToEnd(activeTarget, transcript, ' ');
          } else {
            insertTextAtCaret(activeTarget, transcript);
          }

          activeTarget.dispatchEvent(new Event('input', { bubbles: true }));
          activeTarget.dispatchEvent(new Event('change', { bubbles: true }));

          // Special case: the client search box uses `keyup` to trigger autocomplete.
          // Dictation should still produce suggestions without requiring extra typing.
          if (activeTarget && activeTarget.id === 'quote-client-search') {
            const q = (activeTarget.value || '').trim();
            if (q.length > 2 && typeof self.searchClients === 'function') {
              self.searchClients(q);
            } else {
              $('#quote-client-suggestions').slideUp(200);
            }
          }
          safeAnnounce('Inserted dictated text.');
        };

        recognition.onerror = (event) => {
          const err = (event && event.error) ? String(event.error) : 'unknown error';
          safeAnnounce('Voice input error: ' + err + '.');
        };

        recognition.onend = () => {
          stopActive();
        };

        try {
          recognition.start();
        } catch (e) {
          stopActive();
          safeAnnounce('Unable to start voice input.');
        }
      };

      // Attach mic buttons to key identity fields
      const replaceSelectors = [
        '#crew-name',
        '#quote-client-search',
        '#quote-client-name',
        '#quote-client-email',
        '#quote-client-phone',
        '#custom-item-description'
      ];
      replaceSelectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) wrapFieldWithMic(el, 'replace');
      });

      // Address fields (readonly in UI, but dictation can still fill programmatically)
      const addressReplaceSelectors = [
        '#quote-address-line1',
        '#quote-address-line2',
        '#quote-suburb',
        '#quote-city',
        '#quote-region',
        '#quote-postcode',
        '#quote-country'
      ];
      addressReplaceSelectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) wrapFieldWithMic(el, 'replace', { allowReadOnly: true });
      });

      // Attach mic buttons to obvious notes/message fields
      const insertSelectors = [
        '#quote-email-message',
        '#quote-sms-message',
        '#custom-item-details'
      ];
      insertSelectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) wrapFieldWithMic(el, 'insert');
      });

      // Custom items internal notes: append (matches note taking)
      const customNotesEl = document.querySelector('#custom-item-internal-notes');
      if (customNotesEl) wrapFieldWithMic(customNotesEl, 'append');

      // Notes fields: append to end (matches real-world note taking)
      const notesAppendSelectors = [
        '#special-notes',
        '#res-notes-area',
        '#quote-notes'
      ];
      notesAppendSelectors.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) wrapFieldWithMic(el, 'append');
      });

      // Catch-all: any textarea that looks like a notes field
      $('textarea').each(function() {
        const id = (this.id || '').toLowerCase();
        const placeholder = (this.getAttribute('placeholder') || '').toLowerCase();
        if (id.includes('notes') || placeholder.includes('notes') || placeholder.includes('requests')) {
          wrapFieldWithMic(this, 'append');
        }
      });

      // Click handler
      $(document).off('click.voiceMic', '.mic-btn');
      $(document).on('click.voiceMic', '.mic-btn', function() {
        const $btn = $(this);
        const targetEl = $btn.data('voice-target');
        const mode = $btn.data('voice-mode');
        if (!targetEl) return;
        startRecognition(targetEl, mode, $btn);
      });
    },

    applySettingsToUI: function() {
      const settings = this.getSettings();
      if (!settings || typeof settings !== 'object') return;

      const applyIfPresent = (selector, key) => {
        const $el = $(selector);
        if (!$el.length) return;
        if (settings[key] === undefined || settings[key] === null || settings[key] === '') return;
        $el.val(settings[key]);
      };

      applyIfPresent('#setting-base-hourly-rate', 'base_hourly_rate');
      applyIfPresent('#setting-premium-hourly-rate', 'premium_hourly_rate');
      applyIfPresent('#setting-tax-rate', 'tax_rate');
      applyIfPresent('#setting-staff-multiplier', 'staff_multiplier');
      applyIfPresent('#setting-staff-extra-hourly-rate', 'staff_extra_hourly_rate');
      applyIfPresent('#setting-staff-threshold', 'staff_threshold');
      applyIfPresent('#setting-currency', 'currency');
      applyIfPresent('#setting-customer-id-prefix', 'customer_id_prefix');

      // Theme
      if (settings.theme === 'dark' || settings.theme === 'light') {
        this.applyTheme(settings.theme);
        $('#setting-theme-dark').prop('checked', settings.theme === 'dark');
      }

      applyIfPresent('#setting-discount-percent', 'discount_percent');
      applyIfPresent('#setting-discount-fixed', 'discount_fixed');

      applyIfPresent('#surcharge-single-oven', 'surcharge_single_oven');
      applyIfPresent('#surcharge-double-oven', 'surcharge_double_oven');
      applyIfPresent('#surcharge-windows', 'surcharge_windows');
      applyIfPresent('#surcharge-carpet', 'surcharge_carpet');
      applyIfPresent('#surcharge-drawers', 'surcharge_drawers');
      applyIfPresent('#surcharge-garage', 'surcharge_garage');
      applyIfPresent('#service-api-endpoint', 'service_api_endpoint');
    },

    applyTheme: function(theme) {
      const t = (theme || '').toString();
      if (t !== 'dark' && t !== 'light') return;
      document.documentElement.setAttribute('data-theme', t);
    },

    /**
     * Cache DOM elements for performance
     */
    cacheDOM: function() {
      this.$wrapper = $('.checklist-wrapper');
      this.$items = $('.checklist-item input[type="checkbox"]');
      this.$details = $('details');
      this.$printBtn = $('#btn-print');
      this.$downloadBtn = $('#btn-download-pdf');
      this.$completeBtn = $('#btn-complete-all');
      this.$resetBtn = $('#btn-reset');
      this.$crewInput = $('#crew-name');
      this.$dateInput = $('#checklist-date');
    },

    initRoomProgressBars: function() {
      this.$details.each(function() {
        const $details = $(this);
        const $summaryHeader = $details.find('summary .summary-header').first();
        if (!$summaryHeader.length) return;
        if ($summaryHeader.find('.room-progressbar').length) return;

        // Insert between title and badge
        const $badge = $summaryHeader.find('.progress-badge').first();
        const $bar = $('<span class="room-progressbar" aria-hidden="true"><span class="room-progressbar-fill"></span></span>');
        if ($badge.length) $bar.insertBefore($badge);
        else $summaryHeader.append($bar);
      });
    },

    getActiveServiceType: function() {
      const $selected = $('.tab.is-tab-selected');
      const serviceType = $selected.data('service');
      return serviceType || 'end-of-tenancy';
    },

    appendChangeLog: function(entry) {
      try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.changeLog) || '[]');
        current.push({
          ...entry,
          ts: entry.ts || new Date().toISOString(),
          serviceType: entry.serviceType || this.getActiveServiceType()
        });
        const trimmed = current.length > CHANGE_LOG_MAX_ENTRIES ? current.slice(-CHANGE_LOG_MAX_ENTRIES) : current;
        localStorage.setItem(STORAGE_KEYS.changeLog, JSON.stringify(trimmed));
      } catch (e) {
        console.warn('Error writing change log:', e);
      }
    },

    getClientContext: function() {
      // Prefer live form values (quotes tab), fall back to persisted context
      const live = {
        client_id: ($('#quote-client-id').val() || '').toString().trim() || null,
        population_id: ($('#quote-population-id').val() || '').toString().trim() || null,
        quote_id: ($('#quote-id').val() || '').toString().trim() || null
      };

      if (live.client_id || live.population_id) return live;

      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.clientContext) || 'null');
        if (stored && (stored.client_id || stored.population_id)) {
          return {
            client_id: stored.client_id || null,
            population_id: stored.population_id || null,
            quote_id: stored.quote_id || null
          };
        }
      } catch (_) {
        // ignore
      }

      return live;
    },

    persistClientContext: function(client) {
      if (!client || typeof client !== 'object') return;
      try {
        localStorage.setItem(STORAGE_KEYS.clientContext, JSON.stringify(client));
      } catch (e) {
        console.warn('Persist client context failed:', e);
      }
    },

    scheduleSaveProgress: function() {
      const self = this;
      if (this._saveProgressTimer) {
        clearTimeout(this._saveProgressTimer);
      }
      this._saveProgressTimer = setTimeout(function() {
        self.saveProgress();
      }, 100);
    },

    initEventWorker: function() {
      this._eventWorker = null;
      this._flushTimer = null;
      this._snapshotTimer = null;
      this._lastFlushResult = null;

      if (!(window && 'Worker' in window)) return;

      try {
        this._eventWorker = new Worker('js/event-worker.js');

        this._eventWorker.onmessage = (e) => {
          const msg = e.data || {};
          if (msg.op === 'load_snapshot' && msg.ok && msg.record && msg.record.snapshot) {
            this.applySnapshot(msg.record.snapshot);
          }

          if (msg.op === 'flush') {
            this._lastFlushResult = msg;
            if (msg.ok) {
              if (typeof msg.delivered === 'number' && msg.delivered > 0) {
                this.setSyncStatus('synced', `Synced (${msg.delivered})`);
              } else {
                this.setSyncStatus('synced', 'Synced');
              }
              return;
            }

            if (msg.reason === 'no-endpoint') {
              this.setSyncStatus('local', 'Saved locally (no endpoint)');
              return;
            }
            if (msg.reason === 'offline') {
              this.setSyncStatus('offline', 'Offline (queued)');
              return;
            }
            this.setSyncStatus('queued', 'Queued (retrying)');
          }
        };

        const settings = this.getSettings();
        this._eventWorker.postMessage({
          op: 'config',
          config: {
            endpoint: settings?.service_api_endpoint || null
          }
        });

        // Restore latest snapshot from IndexedDB (if any)
        this._eventWorker.postMessage({ op: 'load_snapshot' });

        window.addEventListener('online', () => {
          this.flushEventQueue();
        });

        window.addEventListener('offline', () => {
          this.setSyncStatus('offline', 'Offline (queued)');
        });

        window.addEventListener('pagehide', () => {
          this.saveSnapshot();
          this.flushEventQueue();
        });

        // Periodic small flush when online (no aggressive polling)
        this._flushTimer = setInterval(() => {
          if (navigator.onLine === true) {
            this.flushEventQueue();
          }
        }, 10000);

        // Initial status hint
        if (navigator.onLine !== true) {
          this.setSyncStatus('offline', 'Offline (queued)');
        } else {
          const st = this.getSettings() || {};
          if (!st.service_api_endpoint) {
            this.setSyncStatus('local', 'Saved locally (no endpoint)');
          }
        }
      } catch (e) {
        console.warn('Event worker init failed:', e);
        this._eventWorker = null;
      }
    },

    getSettings: function() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null');
      } catch {
        return null;
      }
    },

    initSyncStatusUI: function() {
      if ($('#sync-status').length) return;

      const $contentInfo = $('contentinfo').first();
      const $footer = $('footer').first();
      const $target = $contentInfo.length ? $contentInfo : $footer;

      const $status = $('<span id="sync-status" role="status" aria-live="polite" aria-atomic="true" style="margin-left: 8px; font-size: 12px;"></span>');
      if ($target.length) {
        $target.append($status);
      } else {
        this.$wrapper.append($('<div id="sync-status" role="status" aria-live="polite" aria-atomic="true" style="margin-top: 8px; font-size: 12px;"></div>'));
      }

      this.setSyncStatus('local', 'Saved locally');
    },

    setSyncStatus: function(state, text) {
      const $el = $('#sync-status');
      if (!$el.length) return;
      $el.attr('data-state', state || '');
      $el.text(text || '');
      this.announce(text || '');
    },

    announce: function(text) {
      const $aria = $('#aria-status');
      if (!$aria.length) return;
      // Clear then set to ensure repeated messages are announced.
      $aria.text('');
      window.setTimeout(() => $aria.text((text || '').toString()), 10);
    },

    normalizePhase1Attributes: function() {
      // Ensure every checklist item has baseline data-* so pricing/totals work everywhere.
      $('.checklist-item').each(function() {
        const $item = $(this);
        const $cb = $item.find('input[type="checkbox"]').first();
        if (!$cb.length) return;

        const id = ($cb.attr('id') || '').toString();
        if (id && !$item.attr('data-item-id')) {
          $item.attr('data-item-id', id);
        }

        if (!$item.attr('data-room')) {
          const room = $cb.closest('details').data('room');
          if (room) $item.attr('data-room', room);
        }

        if (!$item.attr('data-category')) {
          $item.attr('data-category', 'basic');
        }

        if (!$item.attr('data-hours')) {
          $item.attr('data-hours', '0.5');
        }

        if (!$item.attr('data-difficulty')) {
          $item.attr('data-difficulty', 'basic');
        }
      });
    },

    updateVariantDropdownVisibility: function($item, checked) {
      const $dropdown = $item.find('.variant-dropdown');
      if (!$dropdown.length) return;

      if (checked) {
        $dropdown.show();

        // Oven: default to Single so it prices correctly without extra taps.
        const variantType = ($item.data('variantType') || '').toString();
        const optionsKey = ($item.data('optionsKey') || '').toString();
        if (variantType === 'dropdown' && optionsKey === 'oven_variants') {
          const current = ($dropdown.val() || '').toString();
          if (!current) {
            if ($dropdown.find('option[value="single-1"]').length) {
              $dropdown.val('single-1').trigger('change');
            } else if ($dropdown.find('option[value="single"]').length) {
              $dropdown.val('single').trigger('change');
            }
          }
        }
      } else {
        $dropdown.hide();
      }
    },

    ensureQuoteStatusUI: function() {
      if ($('#quote-status').length) return;
      const $btn = $('#btn-generate-quote');
      if ($btn.length) {
        $btn.after('<div id="quote-status" role="status" aria-live="polite" aria-atomic="true" style="margin-top: 8px; font-size: 12px;"></div>');
      }
    },

    setQuoteStatus: function(text) {
      this.ensureQuoteStatusUI();
      const $el = $('#quote-status');
      if (!$el.length) return;
      $el.text(text || '');
      this.announce(text || '');
    },

    formatCurrency: function(amount, currency) {
      const n = Number(amount);
      const safe = Number.isFinite(n) ? n : 0;
      const c = (currency || 'USD').toString().toUpperCase();
      // Keep it simple; use NZ$ to avoid ambiguity with AUD/USD.
      const symbol = c === 'NZD' ? 'NZ$' : '$';
      return symbol + safe.toFixed(2);
    },

    computeLinePrice: function(item, computed, currency) {
      const hours = Number(item.hours);
      const safeHours = Number.isFinite(hours) ? hours : 0;
      const difficulty = (item.difficulty || 'basic').toString();
      const rate = difficulty === 'deep' ? computed.premiumRate : computed.baseRate;
      let labor = safeHours * (Number.isFinite(rate) ? rate : 0);

      // If a job triggers multi-staff pricing, keep line pricing consistent with totals.
      // Preferred model: add an extra hourly rate per additional staff member.
      const staffApplied = computed?.staff_applied === true;
      const staffCount = parseInt(computed?.staff_count, 10);
      const extraHourlyRate = parseFloat(computed?.staff_extra_hourly_rate);
      if (staffApplied && Number.isFinite(staffCount) && staffCount > 1 && Number.isFinite(extraHourlyRate) && extraHourlyRate > 0) {
        labor = labor + (safeHours * extraHourlyRate * (staffCount - 1));
      } else {
        // Legacy model: percent premium applied to labor
        const staffMultiplier = parseFloat(computed?.staff_multiplier);
        if (staffApplied && Number.isFinite(staffMultiplier) && staffMultiplier > 0) {
          labor = labor * (1 + (staffMultiplier / 100));
        }
      }

      const surcharge = Number(item.charge_amount);
      const safeSurcharge = Number.isFinite(surcharge) ? surcharge : 0;
      const total = labor + safeSurcharge;
      return this.formatCurrency(total, currency);
    },

    renderQuoteLineItems: function(computed, currency) {
      const $container = $('#quote-line-items');
      const $count = $('#quote-scope-count');
      if (!$container.length) return;

      const items = (computed && Array.isArray(computed.items)) ? computed.items : [];
      $count.text(items.length + ' items');

      if (!items.length) {
        $container.html('<p style="margin: 0; color: var(--color-secondary);">No items selected yet.</p>');
        return;
      }

      const byRoom = {};
      for (const it of items) {
        const room = (it.room || 'general').toString();
        if (!byRoom[room]) byRoom[room] = [];
        byRoom[room].push(it);
      }

      const roomOrder = Object.keys(byRoom).sort();
      const parts = [];
      for (const room of roomOrder) {
        parts.push(
          '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border);">' +
            '<div style="display: flex; justify-content: space-between; align-items: baseline;">' +
              '<strong style="color: var(--color-secondary);">' + room.replace(/-/g, ' ') + '</strong>' +
              '<span style="color: var(--color-secondary); font-size: 12px;">' + byRoom[room].length + ' items</span>' +
            '</div>' +
            '<div style="margin-top: 8px;"></div>' +
          '</div>'
        );

        for (const it of byRoom[room]) {
          const label = (it.label || '').toString();
          const variant = (it.variant_selected || '').toString();
          const desc = variant ? (label + ' (' + variant + ')') : label;
          const price = this.computeLinePrice(it, computed, currency);
          parts.push(
            '<div style="display:flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed var(--color-border);">' +
              '<span style="color: var(--color-primary);">' +
                $('<div/>').text(desc).html() +
              '</span>' +
              '<span style="white-space: nowrap; font-weight: 600;">' + price + '</span>' +
            '</div>'
          );
        }
      }

      $container.html(parts.join(''));
    },

    emitRoomPacket: function($details) {
      const room = $details.data('room');
      if (!room) return;

      const items = [];
      $details.find('.checklist-item').each((_, el) => {
        const $item = $(el);
        const $checkbox = $item.find('input[type="checkbox"]').first();
        if (!$checkbox.length) return;
        if (!$checkbox.is(':checked')) return;

        const id = $checkbox.attr('id') || null;
        const itemId = $item.attr('data-item-id') || id;
        const label = $item.find('.item-label').text().trim() || ($item.text() || '').trim();

        items.push({
          item_id: itemId,
          checkbox_id: id,
          label: (label || '').slice(0, 200),
          hours: parseFloat($item.attr('data-hours') || '0') || 0,
          difficulty: ($item.attr('data-difficulty') || '').toString() || null,
          category: ($item.attr('data-category') || '').toString() || null,
          selected_variant: ($item.attr('data-selected-variant') || '').toString() || null
        });
      });

      this.enqueueEvent({
        type: 'room_packet',
        ts: new Date().toISOString(),
        context: { page: location.pathname, serviceType: this.getActiveServiceType() },
        payload: {
          room,
          items_count: items.length,
          items,
          snapshot: this.buildSnapshot()
        }
      });

      if (navigator.onLine === true) {
        this.flushEventQueue();
      }
    },

    enqueueEvent: function(event) {
      const enriched = { ...event };
      const ctx = this.getClientContext();
      enriched.context = {
        ...(event.context || {}),
        client_id: ctx.client_id,
        population_id: ctx.population_id,
        quote_id: ctx.quote_id
      };

      // Always keep a local change log for packet-building (worker is for durability + sync)
      this.appendChangeLog(enriched);

      if (navigator.onLine !== true) {
        this.setSyncStatus('offline', 'Offline (queued)');
      } else {
        const st = this.getSettings() || {};
        if (!st.service_api_endpoint) {
          this.setSyncStatus('local', 'Saved locally (no endpoint)');
        } else {
          this.setSyncStatus('queued', 'Queued');
        }
      }

      if (this._eventWorker) {
        this._eventWorker.postMessage({ op: 'capture', event: enriched });
      }
    },

    flushEventQueue: function() {
      if (!this._eventWorker) return;
      this._eventWorker.postMessage({ op: 'flush', online: navigator.onLine === true });
    },

    buildSnapshot: function() {
      const progress = {};
      $('.checklist-item input[type="checkbox"]').each(function() {
        const id = $(this).attr('id');
        if (!id) return;
        progress[id] = $(this).is(':checked');
      });

      let variantSelections = {};
      try {
        variantSelections = JSON.parse(localStorage.getItem(STORAGE_KEYS.variantSelections) || '{}');
      } catch {
        variantSelections = {};
      }

      const client = {
        client_id: ($('#quote-client-id').val() || '').toString().trim() || null,
        population_id: ($('#quote-population-id').val() || '').toString().trim() || null,
        name: ($('#quote-client-name').val() || '').toString().trim() || null,
        email: ($('#quote-client-email').val() || '').toString().trim() || null,
        phone: ($('#quote-client-phone').val() || '').toString().trim() || null,
        address: {
          population_id: ($('#quote-population-id').val() || '').toString().trim() || null,
          address_line1: ($('#quote-address-line1').val() || '').toString().trim() || null,
          address_line2: ($('#quote-address-line2').val() || '').toString().trim() || null,
          suburb: ($('#quote-suburb').val() || '').toString().trim() || null,
          city: ($('#quote-city').val() || '').toString().trim() || null,
          region: ($('#quote-region').val() || '').toString().trim() || null,
          postcode: ($('#quote-postcode').val() || '').toString().trim() || null,
          country: ($('#quote-country').val() || '').toString().trim() || null
        }
      };

      return {
        schema: 1,
        updated_at: new Date().toISOString(),
        serviceType: this.getActiveServiceType(),
        crew: this.$crewInput.val(),
        date: this.$dateInput.val(),
        client,
        progress,
        variantSelections,
        customItemsSnapshot: this.getCustomItemsSnapshot()
      };
    },

    saveSnapshot: function() {
      const snapshot = this.buildSnapshot();

      // Always keep a small local fallback (for quick restore if worker isn't ready)
      try {
        localStorage.setItem(STORAGE_KEYS.snapshotFallback, JSON.stringify(snapshot));
      } catch (e) {
        console.warn('Snapshot fallback write failed:', e);
      }

      if (this._eventWorker) {
        this._eventWorker.postMessage({ op: 'save_snapshot', snapshot });
      }
    },

    scheduleSnapshot: function(delayMs) {
      if (this._snapshotTimer) clearTimeout(this._snapshotTimer);
      this._snapshotTimer = setTimeout(() => {
        this.saveSnapshot();
      }, delayMs);
    },

    applySnapshot: function(snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return;

      // Switch tab first so DOM cache aligns
      if (snapshot.serviceType) {
        this.switchServiceTab(snapshot.serviceType);
      }

      if (typeof snapshot.crew === 'string') this.$crewInput.val(snapshot.crew);
      if (typeof snapshot.date === 'string') this.$dateInput.val(snapshot.date);

      if (snapshot.progress && typeof snapshot.progress === 'object') {
        for (const id in snapshot.progress) {
          const $checkbox = $('#' + id);
          if ($checkbox.length) {
            $checkbox.prop('checked', !!snapshot.progress[id]);
          }
        }
      }

      if (snapshot.variantSelections && typeof snapshot.variantSelections === 'object') {
        try {
          localStorage.setItem(STORAGE_KEYS.variantSelections, JSON.stringify(snapshot.variantSelections));
        } catch (_) {
          // ignore
        }

        for (const checkboxId in snapshot.variantSelections) {
          const $checkbox = $('#' + checkboxId);
          if (!$checkbox.length) continue;
          const $item = $checkbox.closest('.checklist-item');
          const $dropdown = $item.find('.variant-dropdown');
          if (!$dropdown.length) continue;
          const selected = snapshot.variantSelections[checkboxId] || '';
          $dropdown.val(selected);
          $item.attr('data-selected-variant', selected);
        }
      }

      // Restore Custom Items (best-effort). Snapshot contains a public-safe subset.
      if (Array.isArray(snapshot.customItemsSnapshot)) {
        const existing = this.loadCustomItems();
        const hasExisting = Array.isArray(existing) && existing.some((it) => it && !it.archived);

        if (!hasExisting && snapshot.customItemsSnapshot.length) {
          const ts = (typeof snapshot.updated_at === 'string' && snapshot.updated_at) ? snapshot.updated_at : new Date().toISOString();

          const restored = snapshot.customItemsSnapshot
            .map((s) => {
              if (!s || typeof s !== 'object') return null;
              const id = (s.item_id || s.id || '').toString().trim();
              const description = (s.description || '').toString().trim();
              const details = (s.details || '').toString().trim();
              if (!id || !description) return null;
              const hash = (s.hash || '').toString().trim() || this.hashCustomItem(description, details);
              return {
                id,
                description,
                details,
                hash,
                internal_notes: '',
                archived: false,
                created_at: ts,
                updated_at: ts
              };
            })
            .filter(Boolean);

          try {
            localStorage.setItem(STORAGE_KEYS.customItems, JSON.stringify(restored));
          } catch (_) {
            // ignore
          }
        }

        // Ensure UI reflects latest stored custom items
        this.renderCustomItems();
      }

      if (snapshot.client && typeof snapshot.client === 'object') {
        if (snapshot.client.client_id) $('#quote-client-id').val(snapshot.client.client_id);
        if (snapshot.client.population_id) {
          $('#quote-population-id').val(snapshot.client.population_id);
          $('#display-population-id').text(snapshot.client.population_id);
        }
        if (snapshot.client.name) $('#quote-client-name').val(snapshot.client.name);
        if (snapshot.client.email) $('#quote-client-email').val(snapshot.client.email);
        if (snapshot.client.phone) $('#quote-client-phone').val(snapshot.client.phone);

        const addr = snapshot.client.address || {};
        if (addr.address_line1) $('#quote-address-line1').val(addr.address_line1);
        if (addr.address_line2) $('#quote-address-line2').val(addr.address_line2);
        if (addr.suburb) $('#quote-suburb').val(addr.suburb);
        if (addr.city) $('#quote-city').val(addr.city);
        if (addr.region) $('#quote-region').val(addr.region);
        if (addr.postcode) $('#quote-postcode').val(addr.postcode);
        if (addr.country) $('#quote-country').val(addr.country);
      }

      this.scheduleSaveProgress();
      this.updateAllProgress();
    },

    restoreClientContextBestEffort: function() {
      const raw = localStorage.getItem(STORAGE_KEYS.clientContext);
      if (!raw) return;
      try {
        const client = JSON.parse(raw);
        if (!client || typeof client !== 'object') return;

        if (client.client_id) $('#quote-client-id').val(client.client_id);
        if (client.population_id) {
          $('#quote-population-id').val(client.population_id);
          $('#display-population-id').text(client.population_id);
        }
        if (client.name) $('#quote-client-name').val(client.name);
        if (client.email) $('#quote-client-email').val(client.email);
        if (client.phone) $('#quote-client-phone').val(client.phone);

        if (client.address && typeof client.address === 'object') {
          const addr = client.address;
          if (addr.address_line1) $('#quote-address-line1').val(addr.address_line1);
          if (addr.address_line2) $('#quote-address-line2').val(addr.address_line2);
          if (addr.suburb) $('#quote-suburb').val(addr.suburb);
          if (addr.city) $('#quote-city').val(addr.city);
          if (addr.region) $('#quote-region').val(addr.region);
          if (addr.postcode) $('#quote-postcode').val(addr.postcode);
          if (addr.country) $('#quote-country').val(addr.country);
        }
      } catch (e) {
        console.warn('Client context restore failed:', e);
      }
    },

    getVariantQuote: function(optionsKey, selected, settings) {
      if (!optionsKey || !selected) return null;

      // Mirror DATA-REFERENCE.md (locked model)
      const VARIANTS = {
        window_variants: {
          '2br': { price: 65, hours: 2.0 },
          '3br': { price: 85, hours: 2.0 },
          '4br': { price: 110, hours: 2.0 },
          '2story': { price: 40, hours: 1.0 }
        },
        carpet_variants: {
          '1-2': { price: 52, hours: 1.5 },
          '3-4': { price: 80, hours: 2.0 },
          '5-6': { price: 110, hours: 2.5 },
          '7plus': { price: 145, hours: 3.0 }
        }
      };

      // Dynamic variants: tie to Settings inputs so pricing stays editable
      if (optionsKey === 'oven_variants') {
        const st = (settings && typeof settings === 'object') ? settings : {};
        const single = parseFloat(st.surcharge_single_oven);
        const double = parseFloat(st.surcharge_double_oven);
        const singlePrice = Number.isFinite(single) ? single : 150;
        const doublePrice = Number.isFinite(double) ? double : 200;

        // Accept legacy values: 'single' | 'double'
        if (selected === 'single') return { price: singlePrice, meta: { type: 'single', count: 1 } };
        if (selected === 'double') return { price: doublePrice, meta: { type: 'double', count: 1 } };

        // New format: 'single-2' | 'double-3'
        const parts = (selected || '').toString().split('-');
        const type = (parts[0] || '').toString();
        const countRaw = parseInt(parts[1], 10);
        const count = Number.isFinite(countRaw) && countRaw > 0 ? countRaw : 1;

        if (type === 'single') return { price: singlePrice * count, meta: { type: 'single', count } };
        if (type === 'double') return { price: doublePrice * count, meta: { type: 'double', count } };
        return null;
      }

      const group = VARIANTS[optionsKey];
      if (!group) return null;
      return group[selected] || null;
    },

    collectQuoteLineItems: function() {
      let selections = {};
      try {
        selections = JSON.parse(localStorage.getItem(STORAGE_KEYS.variantSelections) || '{}');
      } catch {
        selections = {};
      }

      const settings = this.getSettings() || {};
      const baseRate = parseFloat($('#setting-base-hourly-rate').val()) || parseFloat(settings.base_hourly_rate) || 50;
      const premiumRate = parseFloat($('#setting-premium-hourly-rate').val()) || parseFloat(settings.premium_hourly_rate) || 75;

      const items = [];
      let totalHours = 0;
      let baseHours = 0;
      let premiumHours = 0;
      let surcharges = 0;

      this.$items.filter(':checked').each((_, el) => {
        const $checkbox = $(el);
        const id = $checkbox.attr('id');
        const $label = $checkbox.closest('.checklist-item');

        const labelText = $label.find('.item-label').text().trim();
        const room = ($label.data('room') || $checkbox.closest('details').data('room') || '').toString() || null;
        const category = ($label.data('category') || '').toString() || null;
        const serviceCode = ($label.data('serviceCode') || '').toString() || null;
        const settingsKey = ($label.data('settingsKey') || '').toString() || null;
        const difficulty = ($label.data('difficulty') || 'basic').toString();

        let hours = parseFloat($label.data('hours'));
        if (!Number.isFinite(hours)) hours = 0.5;

        let selectedVariant = selections[id] || $label.find('.variant-dropdown').val() || '';
        selectedVariant = (selectedVariant || '').toString();

        // Charge model
        let chargeAmount = 0;
        const baseChargeAttr = parseFloat($label.data('baseCharge'));
        const baseCharge = Number.isFinite(baseChargeAttr) ? baseChargeAttr : 0;

        const variantType = ($label.data('variantType') || '').toString();
        const optionsKey = ($label.data('optionsKey') || '').toString();

        let effectiveServiceCode = serviceCode;
        let effectiveSettingsKey = settingsKey;
        let effectiveLabel = labelText;

        if (variantType === 'dropdown' && selectedVariant) {
          const variant = this.getVariantQuote(optionsKey, selectedVariant, settings);
          if (variant) {
            chargeAmount = variant.price;
            // Variant may override timing
            if (Number.isFinite(variant.hours)) hours = variant.hours;
          } else {
            chargeAmount = baseCharge;
          }

          // Special-case oven so single/double selection is represented in packet + UI
          if (optionsKey === 'oven_variants') {
            const meta = (variant && variant.meta && typeof variant.meta === 'object') ? variant.meta : {};
            const type = (meta.type || '').toString();
            const countRaw = parseInt(meta.count, 10);
            const count = Number.isFinite(countRaw) && countRaw > 0 ? countRaw : 1;

            if (type === 'single') {
              effectiveServiceCode = count > 1 ? ('OC(S)x' + count) : 'OC(S)';
              effectiveSettingsKey = 'surcharge_single_oven';
              effectiveLabel = count > 1 ? ('Oven (inside) - Single x' + count) : 'Oven (inside) - Single';
            } else if (type === 'double') {
              effectiveServiceCode = count > 1 ? ('OC(D)x' + count) : 'OC(D)';
              effectiveSettingsKey = 'surcharge_double_oven';
              effectiveLabel = count > 1 ? ('Oven (inside) - Double x' + count) : 'Oven (inside) - Double';
            }
          }
        } else if (settingsKey) {
          const fromSettings = parseFloat(settings[settingsKey]);
          chargeAmount = Number.isFinite(fromSettings) ? fromSettings : baseCharge;
        } else {
          chargeAmount = baseCharge;
        }

        if (chargeAmount > 0) surcharges += chargeAmount;

        totalHours += hours;
        if (difficulty === 'deep') {
          premiumHours += hours;
        } else {
          baseHours += hours;
        }

        items.push({
          id,
          room,
          category,
          label: effectiveLabel,
          checked: true,
          hours,
          difficulty,
          service_code: effectiveServiceCode || null,
          settings_key: effectiveSettingsKey || null,
          variant_selected: selectedVariant || null,
          charge_amount: chargeAmount > 0 ? chargeAmount : null,
          item_hash: ($label.data('itemHash') || '').toString() || null,
          item_details: ($label.data('itemDetails') || '').toString() || null
        });
      });

      const baseHourlyCost = baseHours * baseRate;
      const premiumHourlyCost = premiumHours * premiumRate;
      const hourlyCost = baseHourlyCost + premiumHourlyCost;

      return {
        items,
        totalHours,
        hourlyCost,
        surcharges,
        baseRate,
        premiumRate
      };
    },

    getClientEventLog: function(clientId) {
      if (!clientId) return [];
      try {
        const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.changeLog) || '[]');
        if (!Array.isArray(events)) return [];
        const filtered = events.filter(e => e && e.context && e.context.client_id === clientId);
        return filtered.length > 500 ? filtered.slice(-500) : filtered;
      } catch {
        return [];
      }
    },

    restoreSnapshotBestEffort: function() {
      // Quick synchronous restore from localStorage fallback; worker restore will follow async.
      const raw = localStorage.getItem(STORAGE_KEYS.snapshotFallback);
      if (!raw) return;
      try {
        const snapshot = JSON.parse(raw);
        this.applySnapshot(snapshot);
      } catch (e) {
        console.warn('Snapshot restore failed:', e);
      }
    },

    /**
     * Bind event handlers
     */
    bindEvents: function() {
      const self = this;

      // ======== TAB SWITCHING ========
      // Handle service type tabs
      $(document).on('click', '.tab', function() {
        const serviceType = $(this).data('service');
        self.switchServiceTab(serviceType);
      });

      // Checkbox change - delegated so tab switching still works
      $(document)
        .off('change.checklist', '.checklist-item input[type="checkbox"]')
        .on('change.checklist', '.checklist-item input[type="checkbox"]', function() {
          const $checkbox = $(this);
          const id = $checkbox.attr('id');
          const checked = $checkbox.is(':checked');
          const $details = $checkbox.closest('details');
          const room = $details.data('room');
          const label = $checkbox.closest('.checklist-item').find('.item-label').text().trim();

          self.updateVariantDropdownVisibility($checkbox.closest('.checklist-item'), checked);

          self.enqueueEvent({
            type: 'checkbox',
            ts: new Date().toISOString(),
            context: { page: location.pathname, serviceType: self.getActiveServiceType() },
            payload: { id, checked, room, label }
          });

          self.scheduleSaveProgress();
          self.scheduleSnapshot(250);
          self.updateProgress($details);
          self.updateAllProgress();
        });

      // Details open/close with smooth height animation
      this.$details.on('toggle', function(e) {
        const $details = $(this);
        const $content = $details.find('.room-details');
        
        if (this.open) {
          animateOpen($content);
        } else {
          animateClose($content);
        }
        
        self.saveProgress();

        // Emit a small batch for this room when the section closes
        if (!this.open && $details.data('room')) {
          self.emitRoomPacket($details);
        }

        // When a section is interacted with, snapshot it shortly after.
        self.scheduleSnapshot(250);
      });

      // Print button
      if (this.$printBtn.length) {
        this.$printBtn.on('click', function(e) {
          e.preventDefault();
          self.print();
        });
      }

      // Download PDF button
      if (this.$downloadBtn.length) {
        this.$downloadBtn.on('click', function(e) {
          e.preventDefault();
          self.downloadPDF();
        });
      }

      // Complete all button
      if (this.$completeBtn.length) {
        this.$completeBtn.on('click', function(e) {
          e.preventDefault();
          self.completeAll();
        });
      }

      // Reset all button
      if (this.$resetBtn.length) {
        this.$resetBtn.on('click', function(e) {
          e.preventDefault();
          if (confirm('Are you sure? This will uncheck all items.')) {
            self.resetAll();
          }
        });
      }

      // Meta field changes (crew name, date)
      this.$crewInput.on('change', function() {
        self.saveMeta();
        self.scheduleSnapshot(250);
        self.enqueueEvent({
          type: 'meta',
          ts: new Date().toISOString(),
          context: { page: location.pathname, serviceType: self.getActiveServiceType() },
          payload: { field: 'crew', value: self.$crewInput.val() }
        });
      });
      this.$dateInput.on('change', function() {
        self.saveMeta();
        self.scheduleSnapshot(250);
        self.enqueueEvent({
          type: 'meta',
          ts: new Date().toISOString(),
          context: { page: location.pathname, serviceType: self.getActiveServiceType() },
          payload: { field: 'date', value: self.$dateInput.val() }
        });
      });

      // Variant dropdowns (inside checklist items)
      $(document)
        .off('change.checklistVariant', '.checklist-item .variant-dropdown')
        .on('change.checklistVariant', '.checklist-item .variant-dropdown', function() {
          const $select = $(this);
          const $item = $select.closest('.checklist-item');
          const checkboxId = $item.find('input[type="checkbox"]').attr('id');
          const selected = $select.val();

          $item.attr('data-selected-variant', selected || '');

          try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.variantSelections) || '{}');
            current[checkboxId] = selected;
            localStorage.setItem(STORAGE_KEYS.variantSelections, JSON.stringify(current));
          } catch (e) {
            console.warn('Error saving variant selection:', e);
          }

          self.enqueueEvent({
            type: 'variant',
            ts: new Date().toISOString(),
            context: { page: location.pathname, serviceType: self.getActiveServiceType() },
            payload: { id: checkboxId, selected }
          });

          self.scheduleSnapshot(250);
        });

      // ======== QUOTES TAB HANDLERS ========
      // Handle customer selection
      $(document).on('change', '#quote-customer-id', function() {
        if ($(this).val() === 'new') {
          $('#new-customer-form').slideDown(200);
        } else {
          $('#new-customer-form').slideUp(200);
        }
      });

      // Client search (autocomplete)
      $(document).on('keyup', '#quote-client-search', function() {
        const query = $(this).val().trim();
        if (query.length > 2) {
          self.searchClients(query);
        } else {
          $('#quote-client-suggestions').slideUp(200);
        }
      });

      // Use lead data button
      $(document).on('click', '#btn-use-lead-data', function(e) {
        e.preventDefault();
        const lead = self.getLeadDataBestEffort();
        if (!lead) {
          if (typeof self.announce === 'function') {
            self.announce('No lead data found.');
          }
          alert('No lead data found yet. Integration options: inject window.__CHECKLIST_LEAD__, store localStorage checklist_lead_data, or pass ?lead_name=... params.');
          return;
        }

        const ok = self.applyLeadDataToQuoteForm(lead);
        if (!ok) {
          alert('Lead data was found but could not be applied.');
        }
      });

      // Add new client button
      $(document).on('click', '#btn-add-new-client', function(e) {
        e.preventDefault();

        // Clear current client context and open an “on-site capture” flow (no modal)
        $('#quote-client-id').val('');
        $('#quote-population-id').val('');
        $('#display-population-id').text('-');

        $('#quote-client-search').val('');
        $('#quote-client-suggestions').slideUp(200);

        $('#quote-client-name').val('');
        $('#quote-client-email').val('');
        $('#quote-client-phone').val('');

        $('#quote-address-line1').val('');
        $('#quote-address-line2').val('');
        $('#quote-suburb').val('');
        $('#quote-city').val('');
        $('#quote-region').val('');
        $('#quote-postcode').val('');
        $('#quote-country').val('');

        self.persistClientContext({
          client_id: null,
          population_id: null,
          quote_id: ($('#quote-id').val() || '').toString().trim() || null
        });

        // For a new client, allow address enrichment immediately
        self.setAddressEditEnabled(true);

        $('#quote-client-name').focus();
      });

      // Toggle address editing (enrichment)
      $(document).on('click', '#btn-toggle-address-edit', function(e) {
        e.preventDefault();
        const next = !(self._addressEditEnabled === true);
        self.setAddressEditEnabled(next);
      });

      // When address is editable, any changes should be queued for sync
      $(document).on('input change', '#quote-address-line1, #quote-address-line2, #quote-suburb, #quote-city, #quote-region, #quote-postcode, #quote-country', function() {
        if (self._addressEditEnabled !== true) return;
        self.scheduleAddressUpdateEvent();
      });

      // Generate quote button
      $(document).on('click', '#btn-generate-quote', function(e) {
        e.preventDefault();
        self.generateQuote();
      });

      // Send quote option buttons
      $(document).on('click', '.send-quote-option', function(e) {
        e.preventDefault();
        const method = $(this).data('method');
        self.selectQuoteSendMethod(method);
      });

      // Send email quote
      $(document).on('click', '#btn-send-email-quote', function(e) {
        e.preventDefault();
        self.sendEmailQuote();
      });

      // Send SMS quote
      $(document).on('click', '#btn-send-sms-quote', function(e) {
        e.preventDefault();
        self.sendSmsQuote();
      });

      // Schedule quote
      $(document).on('click', '#btn-schedule-quote', function(e) {
        e.preventDefault();
        self.scheduleQuote();
      });

      // Copy link button
      $(document).on('click', '#btn-copy-link', function(e) {
        e.preventDefault();
        const link = $('#quote-share-link').val();
        navigator.clipboard.writeText(link).then(() => {
          alert('Quote link copied to clipboard!');
        });
      });

      // SMS message character counter
      $(document).on('keyup', '#quote-sms-message', function() {
        const chars = $(this).val().length;
        $('#sms-char-count').text(chars);
        if (chars > 160) {
          $('#sms-char-count').css('color', '#d32f2f');
        } else {
          $('#sms-char-count').css('color', 'inherit');
        }
      });

      // Email validation
      $(document).on('change', '#quote-client-email', function() {
        const email = $(this).val();
        if (!email) {
          $('#email-required-msg').show();
        } else {
          $('#email-required-msg').hide();
        }
      });

      // ======== SETTINGS TAB HANDLERS ========
      // Save settings button
      $(document).on('click', '#btn-save-settings', function(e) {
        e.preventDefault();
        self.saveSettings();
      });

      // Reset settings button
      $(document).on('click', '#btn-reset-settings', function(e) {
        e.preventDefault();
        if (confirm('Reset all settings to defaults?')) {
          self.resetSettings();
        }
      });

      // Theme toggle (apply immediately and persist)
      $(document)
        .off('change.checklistTheme', '#setting-theme-dark')
        .on('change.checklistTheme', '#setting-theme-dark', function() {
          const dark = $(this).is(':checked');
          const theme = dark ? 'dark' : 'light';
          self.applyTheme(theme);

          // Persist immediately so it survives refresh even if user doesn't click Save.
          try {
            const current = self.getSettings() || {};
            current.theme = theme;
            localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(current));
          } catch (_) {
            // ignore
          }
        });
    },

    /**
     * Save checkbox states to localStorage
     */
    saveProgress: function() {
      const progress = {};
      this.$items.each(function() {
        const id = $(this).attr('id');
        if (id) {
          progress[id] = $(this).is(':checked');
        }
      });
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    },

    /**
     * Load checkbox states from localStorage
     */
    loadProgress: function() {
      const saved = localStorage.getItem(STORAGE_KEYS.progress);
      if (saved) {
        try {
          const progress = JSON.parse(saved);
          for (const id in progress) {
            const $checkbox = $('#' + id);
            if ($checkbox.length) {
              $checkbox.prop('checked', progress[id]);

              // Restore variant dropdown visibility if present
              const $item = $checkbox.closest('.checklist-item');
              const $dropdown = $item.find('.variant-dropdown');
              if ($dropdown.length) {
                if (progress[id]) {
                  $dropdown.show();
                } else {
                  $dropdown.hide();
                }
              }
            }
          }
        } catch (e) {
          console.warn('Error loading progress:', e);
        }
      }

      // Restore saved variant selections
      try {
        const selections = JSON.parse(localStorage.getItem(STORAGE_KEYS.variantSelections) || '{}');
        for (const checkboxId in selections) {
          const $checkbox = $('#' + checkboxId);
          if (!$checkbox.length) continue;
          const $item = $checkbox.closest('.checklist-item');
          const $dropdown = $item.find('.variant-dropdown');
          if (!$dropdown.length) continue;
          $dropdown.val(selections[checkboxId] || '');
          $item.attr('data-selected-variant', selections[checkboxId] || '');
        }
      } catch (e) {
        console.warn('Error restoring variant selections:', e);
      }

      // Load meta info
      const crew = localStorage.getItem(STORAGE_KEYS.crew);
      const date = localStorage.getItem(STORAGE_KEYS.date);
      if (crew) this.$crewInput.val(crew);
      if (date) this.$dateInput.val(date);
    },

    /**
     * Save meta info (crew name, date)
     */
    saveMeta: function() {
      localStorage.setItem(STORAGE_KEYS.crew, this.$crewInput.val());
      localStorage.setItem(STORAGE_KEYS.date, this.$dateInput.val());
    },

    /**
     * Update progress for a specific room
     */
    updateProgress: function($detailsElem) {
      const $checkboxes = $detailsElem.find('input[type="checkbox"]');
      const total = $checkboxes.length;
      const checked = $checkboxes.filter(':checked').length;

      const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
      const $barFill = $detailsElem.find('.room-progressbar-fill');
      if ($barFill.length) {
        $barFill.css('width', percent + '%');
      }
      
      const $badge = $detailsElem.find('.progress-badge');
      if ($badge.length) {
        $badge.text(checked + '/' + total);
      }

      // Visual feedback: highlight if complete
      if (checked === total && total > 0) {
        $detailsElem.attr('data-complete', 'true');
      } else {
        $detailsElem.removeAttr('data-complete');
      }
    },

    /**
     * Update progress for all rooms
     */
    updateAllProgress: function() {
      const self = this;
      this.$details.each(function() {
        self.updateProgress($(this));
      });

      // Overall progress
      const totalItems = this.$items.length;
      const checkedItems = this.$items.filter(':checked').length;
      const overallPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
      
      // Update overall badge if present
      const $overallBadge = $('.overall-progress');
      if ($overallBadge.length) {
        $overallBadge.text(overallPercent + '% Complete');
      }
    },

    /**
     * Complete all checkboxes
     */
    completeAll: function() {
      this.$items.prop('checked', true).trigger('change');
    },

    /**
     * Reset all checkboxes
     */
    resetAll: function() {
      this.$items.prop('checked', false).trigger('change');
      localStorage.removeItem(STORAGE_KEYS.progress);
    },

    /**
     * Print the checklist
     */
    print: function() {
      window.print();
    },

    /**
     * Download as PDF
     * Uses html2pdf library (fallback to print if not available)
     */
    downloadPDF: function() {
      const self = this;
      const crew = this.$crewInput.val() || 'Cleaning Crew';
      const date = this.$dateInput.val() || new Date().toLocaleDateString();
      const filename = `Checklist_${crew}_${date}.pdf`;

      // Check if html2pdf is available
      if (typeof html2pdf !== 'undefined') {
        const element = this.$wrapper[0];
        const opt = {
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        html2pdf().set(opt).from(element).save();
      } else {
        // Fallback: use print dialog with save to PDF
        console.warn('html2pdf not loaded. Using print dialog instead.');
        this.print();
      }
    },

    /**
     * Export as JSON (for development/testing)
     */
    exportJSON: function() {
      const data = {
        crew: this.$crewInput.val(),
        date: this.$dateInput.val(),
        checklist: {}
      };

      this.$details.each(function() {
        const room = $(this).attr('data-room');
        data.checklist[room] = [];
        $(this).find('input[type="checkbox"]').each(function() {
          data.checklist[room].push({
            id: $(this).attr('id'),
            label: $(this).siblings('.item-label').text(),
            checked: $(this).is(':checked')
          });
        });
      });

      return JSON.stringify(data, null, 2);
    },

    /**
     * Switch between service tabs (End of Tenancy, Commercial, Custom)
     */
    switchServiceTab: function(serviceType) {
      // Update tab UI
      $('.tab').removeClass('is-tab-selected');
      $('.tab[data-service="' + serviceType + '"]').addClass('is-tab-selected');

      // Hide all service content tabs
      $('.service-tab-content').removeClass('is-active');

      // Show selected service content tab
      $('#service-' + serviceType).addClass('is-active');

      // Save preference to localStorage
      localStorage.setItem(STORAGE_KEYS.serviceType, serviceType);

      // Re-cache DOM elements for the active tab
      this.cacheDOM();
      this.updateAllProgress();
    },

    /**
     * Search for existing clients
     * NOTE: Real API should return: client_id, population_id, full address
     */
    searchClients: function(query) {
      // Mock data - replace with real API call to /api/clients/search
      // Real API MUST return: client_id, population_id, and full address fields
      const mockClients = [
        { 
          client_id: 'C001', 
          population_id: 1847,
          name: 'Alice Williams', 
          email: 'alice@email.com', 
          phone: '(555) 123-4567',
          address_line1: '15 Spurks Ave',
          address_line2: null,
          suburb: 'Canterbury',
          city: 'Christchurch',
          region: 'Canterbury',
          postcode: '8042',
          country: 'New Zealand'
        },
        { 
          client_id: 'C002', 
          population_id: 1848,
          name: 'Bob Smith', 
          email: 'bob@email.com', 
          phone: '(555) 234-5678',
          address_line1: '42 Main Street',
          address_line2: null,
          suburb: 'Fendalton',
          city: 'Christchurch',
          region: 'Canterbury',
          postcode: '8015',
          country: 'New Zealand'
        },
        { 
          client_id: 'C003', 
          population_id: 1849,
          name: 'Carol Johnson', 
          email: 'carol@email.com', 
          phone: '(555) 345-6789',
          address_line1: '99 Park Lane',
          address_line2: 'Apartment 2B',
          suburb: 'Merivale',
          city: 'Christchurch',
          region: 'Canterbury',
          postcode: '8014',
          country: 'New Zealand'
        }
      ];

      const results = mockClients.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      );

      const $suggestions = $('#quote-client-suggestions');
      $suggestions.html('');

      if (results.length > 0) {
        results.forEach(client => {
          const html = `
            <div class="client-suggestion" 
                 data-client-id="${client.client_id}"
                 data-population-id="${client.population_id}">
              <strong>${client.name}</strong><br/>
              <small>${client.email} | ${client.phone}</small><br/>
              <small>${client.address_line1}${client.address_line2 ? ', ' + client.address_line2 : ''}, ${client.suburb}</small>
            </div>
          `;
          $suggestions.append(html);
        });
        $suggestions.slideDown(200);

        // Handle client selection - STORE BOTH IDs AND FULL ADDRESS
        $('.client-suggestion').on('click', function() {
          const clientId = $(this).data('client-id');
          const populationId = $(this).data('population-id');
          const client = results.find(c => c.client_id === clientId);
          
          if (client) {
            // Store IDs as hidden inputs for later inclusion in quote packet
            $('#quote-client-id').val(client.client_id);
            $('#quote-population-id').val(client.population_id);
            $('#display-population-id').text(client.population_id);  // ← Display population_id
            
            // Fill visible form fields
            $('#quote-client-name').val(client.name);
            $('#quote-client-email').val(client.email);
            $('#quote-client-phone').val(client.phone);
            $('#quote-client-search').val(client.name);
            
            // Fill address fields (full structure)
            $('#quote-address-line1').val(client.address_line1 || '');
            $('#quote-address-line2').val(client.address_line2 || '');
            $('#quote-suburb').val(client.suburb || '');
            $('#quote-city').val(client.city || '');
            $('#quote-region').val(client.region || '');
            $('#quote-postcode').val(client.postcode || '');
            $('#quote-country').val(client.country || '');

            // Persist client context so all taps/events can be tied back to the client
            self.persistClientContext({
              client_id: client.client_id,
              population_id: client.population_id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              address: {
                population_id: client.population_id,
                address_line1: client.address_line1,
                address_line2: client.address_line2,
                suburb: client.suburb,
                city: client.city,
                region: client.region,
                postcode: client.postcode,
                country: client.country
              }
            });

            self.enqueueEvent({
              type: 'client_selected',
              ts: new Date().toISOString(),
              context: { page: location.pathname, serviceType: self.getActiveServiceType() },
              payload: { client_id: client.client_id, population_id: client.population_id }
            });

            self.scheduleSnapshot(0);
            
            $suggestions.slideUp(200);
          }
        });
      }
    },

    /**
     * Select quote send method
     */
    selectQuoteSendMethod: function(method) {
      // Hide all send options
      $('#email-send-details, #sms-send-details, #later-send-details, #copy-send-details').slideUp(200);

      // Show selected method
      if (method === 'email') {
        $('#email-send-details').slideDown(200);
      } else if (method === 'sms') {
        $('#sms-send-details').slideDown(200);
      } else if (method === 'later') {
        $('#later-send-details').slideDown(200);
      } else if (method === 'copy') {
        $('#copy-send-details').slideDown(200);
      }
    },

    /**
     * Generate quote from checked items
     * CRITICAL: Captures client_id and population_id for database storage
     */
    generateQuote: function() {
      const clientEmail = $('#quote-client-email').val();
      const clientId = $('#quote-client-id').val();
      const populationId = $('#quote-population-id').val();

      // Estimate-first: do not block quote calculation.
      // Client/email is only required for sending and for building a client-attached quote packet.
      if (!clientEmail) $('#email-required-msg').show();
      else $('#email-required-msg').hide();

      const settings = this.getSettings() || {};
      const taxRate = parseFloat($('#setting-tax-rate').val()) || parseFloat(settings.tax_rate) || 15;
      const currency = ($('#setting-currency').val() || settings.currency || 'USD').toString();

      const computed = this.collectQuoteLineItems();
      const checkedItems = computed.items.length;
      const totalHours = computed.totalHours;
      const staffThreshold = parseFloat($('#setting-staff-threshold').val()) || parseFloat(settings.staff_threshold) || 7;
      const staffMultiplier = parseFloat($('#setting-staff-multiplier').val()) || parseFloat(settings.staff_multiplier) || 25;
      const staffExtraHourlyRate = parseFloat($('#setting-staff-extra-hourly-rate').val()) || parseFloat(settings.staff_extra_hourly_rate) || 0;

      const thresholdIsValid = Number.isFinite(staffThreshold) && staffThreshold > 0;
      const staffCount = thresholdIsValid ? Math.max(1, Math.ceil(totalHours / staffThreshold)) : 1;
      const staffApplied = staffCount > 1;

      // Preferred staffing model: add another person to the hourly math.
      // Legacy fallback: apply a percent premium to labor once threshold is exceeded.
      const useExtraHourly = staffApplied && Number.isFinite(staffExtraHourlyRate) && staffExtraHourlyRate > 0;
      const useLegacyMultiplier = !useExtraHourly && Number.isFinite(staffThreshold) && totalHours > staffThreshold && Number.isFinite(staffMultiplier) && staffMultiplier > 0;

      const baseCostRaw = computed.hourlyCost;
      const baseCost = useExtraHourly
        ? (baseCostRaw + (totalHours * staffExtraHourlyRate * (staffCount - 1)))
        : (useLegacyMultiplier ? (baseCostRaw * (1 + (staffMultiplier / 100))) : baseCostRaw);
      const surcharges = computed.surcharges;
      const subtotalBeforeDiscount = baseCost + surcharges;

      const discountPercent = parseFloat($('#setting-discount-percent').val());
      const discountFixed = parseFloat($('#setting-discount-fixed').val());
      const pct = Number.isFinite(discountPercent) ? Math.max(0, Math.min(50, discountPercent)) : Math.max(0, Math.min(50, parseFloat(settings.discount_percent) || 0));
      const fixed = Number.isFinite(discountFixed) ? Math.max(0, discountFixed) : Math.max(0, parseFloat(settings.discount_fixed) || 0);

      const percentAmount = subtotalBeforeDiscount * (pct / 100);
      const rawDiscount = percentAmount + fixed;
      const discountAmount = Math.min(subtotalBeforeDiscount, Math.max(0, rawDiscount));

      const subtotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;

      // Attach staff info so line-item pricing stays consistent with total.
      computed.staff_threshold = staffThreshold;
      computed.staff_multiplier = staffMultiplier;
      computed.staff_extra_hourly_rate = staffExtraHourlyRate;
      computed.staff_count = staffCount;
      computed.staff_mode = useExtraHourly ? 'extra_hourly' : (useLegacyMultiplier ? 'multiplier' : 'none');
      computed.staff_applied = staffApplied && (useExtraHourly || useLegacyMultiplier);
      
      // Generate quote ID
      const quoteId = 'Q-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Store quote ID
      $('#quote-id').val(quoteId);
      
      // Update quote summary display
      $('#quote-items-count').text(checkedItems);
      $('#quote-hours-total').text(totalHours.toFixed(1));

      const taxLabel = `GST (${taxRate}%):`;
      $('#quote-tax-label').text(taxLabel);
      $('#quote-tax-label-detail').text(taxLabel);

      $('#quote-base-cost').text(this.formatCurrency(baseCost, currency));
      $('#quote-surcharges').text(this.formatCurrency(surcharges, currency));
      $('#quote-subtotal').text(this.formatCurrency(subtotal, currency));
      $('#quote-subtotal-detail').text(this.formatCurrency(subtotal, currency));
      $('#quote-tax').text(this.formatCurrency(tax, currency));
      $('#quote-tax-detail').text(this.formatCurrency(tax, currency));
      $('#quote-total').text(this.formatCurrency(total, currency));

      const $discountRow = $('#quote-discount-row');
      const $discount = $('#quote-discount');
      if ($discountRow.length && $discount.length) {
        if (discountAmount > 0) {
          $discount.text('-' + this.formatCurrency(discountAmount, currency));
          $discountRow.css('display', 'flex');
        } else {
          $discount.text('-' + this.formatCurrency(0, currency));
          $discountRow.hide();
        }
      }

      // Client-friendly scope list (description + line price)
      this.renderQuoteLineItems(computed, currency);
      
      // Pre-fill messages
      const clientName = $('#quote-client-name').val() || 'Valued Client';
      const crewName = $('#crew-name').val() || 'Our Team';
      const defaultMessage = `Hi ${clientName},\n\nHere's your cleaning quote:\n\nTotal Cost: ${this.formatCurrency(total, currency)}\nEstimated Time: ${totalHours.toFixed(1)} hours\n\nPlease let us know if you'd like to proceed or have any questions.\n\nThank you,\n${crewName}`;
      $('#quote-email-message').val(defaultMessage);
      
      const smsMessage = `Hi ${clientName}, your quote is ready! Total: ${this.formatCurrency(total, currency)}. Can you confirm?`;
      $('#quote-sms-message').val(smsMessage);
      
      // Generate shareable link
      $('#quote-share-link').val('https://quotes.yoursystem.com/q/' + quoteId);
      
      // BUILD COMPLETE JSON PACKET FOR STORAGE
      const quotePacket = {
        envelope: {
          id: quoteId,
          type: 'quote',
          version: '1.0',
          timestamp: new Date().toISOString()
        },
        client: {
          client_id: clientId,
          name: clientName,
          email: clientEmail,
          phone: $('#quote-client-phone').val(),
          population_id: populationId
        },
        address: {
          population_id: populationId,
          address_line1: $('#quote-address-line1').val(),
          address_line2: $('#quote-address-line2').val(),
          suburb: $('#quote-suburb').val(),
          city: $('#quote-city').val(),
          region: $('#quote-region').val(),
          postcode: $('#quote-postcode').val(),
          country: $('#quote-country').val()
        },
        service: {
          service_type: this.getActiveServiceType(),
          booking_date: $('#checklist-date').val() || null
        },
        quote: {
          quote_id: quoteId,
          items_count: checkedItems,
          estimated_hours: totalHours,
          base_cost: baseCost,
          surcharges: surcharges,
          subtotal_before_discount: subtotalBeforeDiscount,
          discount_percent: pct,
          discount_fixed: fixed,
          discount_amount: discountAmount,
          subtotal: subtotal,
          tax_rate: taxRate,
          tax_amount: tax,
          total: total,
          currency,
          generated_at: new Date().toISOString()
        },
        items: computed.items,
        staffing: {
          threshold_hours: staffThreshold,
          multiplier_percent: staffMultiplier,
          extra_hourly_rate: staffExtraHourlyRate,
          staff_count: staffCount,
          mode: computed.staff_mode,
          applied: computed.staff_applied === true
        },
        crew: {
          crew_name: $('#crew-name').val() || null
        },
        interactions: {
          event_log: this.getClientEventLog(clientId)
        },
        snapshot: this.buildSnapshot(),
        status: {
          generated: true,
          sent: false,
          accepted: false,
          invoiced: false
        }
      };
      
      // Store packet in hidden field for submission
      $('#quote-packet').val(JSON.stringify(quotePacket));

      const hasClientContext = !!(clientId && populationId);
      if (hasClientContext) {
        // Persist client context (including quote_id) so later taps remain tied
        this.persistClientContext({
          client_id: clientId,
          population_id: populationId,
          quote_id: quoteId,
          name: clientName,
          email: clientEmail,
          phone: $('#quote-client-phone').val(),
          address: quotePacket.address
        });

        // Record the final packet as a single event so sync can deliver the full envelope
        this.enqueueEvent({
          type: 'quote_packet',
          ts: new Date().toISOString(),
          context: { page: location.pathname, serviceType: this.getActiveServiceType() },
          payload: quotePacket
        });
        this.flushEventQueue();
        this.scheduleSnapshot(0);

        this.setQuoteStatus('Quote ready. Total: ' + this.formatCurrency(total, currency) + ' | Quote ID: ' + quoteId);
      } else {
        // Preview-only event: useful for audit/history without requiring client lookup.
        this.enqueueEvent({
          type: 'quote_preview',
          ts: new Date().toISOString(),
          context: { page: location.pathname, serviceType: this.getActiveServiceType() },
          payload: {
            quote_id: quoteId,
            currency,
            totals: { items_count: checkedItems, estimated_hours: totalHours, subtotal_before_discount: subtotalBeforeDiscount, discount_percent: pct, discount_fixed: fixed, discount_amount: discountAmount, subtotal, tax, total },
            items: computed.items
          }
        });
        this.scheduleSnapshot(0);

        this.setQuoteStatus('Estimate ready. Total: ' + this.formatCurrency(total, currency) + ' | Add client + address to send.');
      }
    },

    /**
     * Send email quote
     * Includes client_id and population_id in submission
     */
    sendEmailQuote: function() {
      const email = $('#quote-client-email').val();
      const clientId = $('#quote-client-id').val();
      const populationId = $('#quote-population-id').val();
      const subject = $('#quote-email-subject').val();
      const message = $('#quote-email-message').val();
      const quotePacket = $('#quote-packet').val();
      
      if (!email) {
        alert('Please enter an email address');
        return;
      }

      if (!message) {
        alert('Please enter a message');
        return;
      }
      
      if (!clientId || !populationId) {
        alert('⚠️ Quote not properly generated.\n\nPlease click "Calculate Quote" first.');
        return;
      }

      // In production, this makes AJAX call with COMPLETE packet
      console.log('Sending email with quote packet:');
      let packetObj = null;
      try {
        packetObj = JSON.parse(quotePacket);
        if (packetObj && packetObj.status && typeof packetObj.status === 'object') {
          packetObj.status.sent = true;
        }
        packetObj.delivery = { method: 'email', subject, ts: new Date().toISOString() };
        $('#quote-packet').val(JSON.stringify(packetObj));
      } catch (_) {
        // ignore
      }

      if (packetObj) console.log(packetObj);

      this.enqueueEvent({
        type: 'quote_sent',
        ts: new Date().toISOString(),
        context: { page: location.pathname, serviceType: this.getActiveServiceType() },
        payload: { method: 'email', subject }
      });
      this.flushEventQueue();
      this.scheduleSnapshot(0);
      
      alert('✅ Quote email ready to send to ' + email + '!\n\nClient ID: ' + clientId + '\nPopulation ID: ' + populationId + '\n\nSubject: ' + subject);
    },

    /**
     * Send SMS quote
     * Includes client_id and population_id in submission
     */
    sendSmsQuote: function() {
      const phone = $('#quote-client-phone').val();
      const clientId = $('#quote-client-id').val();
      const populationId = $('#quote-population-id').val();
      const message = $('#quote-sms-message').val();
      const quotePacket = $('#quote-packet').val();
      
      if (!phone) {
        alert('Please enter a phone number');
        return;
      }

      if (!message) {
        alert('Please enter a message');
        return;
      }
      
      if (!clientId || !populationId) {
        alert('⚠️ Quote not properly generated.\n\nPlease click "Calculate Quote" first.');
        return;
      }

      if (message.length > 160) {
        alert('SMS message too long! (' + message.length + ' characters). Keep under 160.');
        return;
      }

      console.log('Sending SMS with quote packet:');
      let packetObj = null;
      try {
        packetObj = JSON.parse(quotePacket);
        if (packetObj && packetObj.status && typeof packetObj.status === 'object') {
          packetObj.status.sent = true;
        }
        packetObj.delivery = { method: 'sms', ts: new Date().toISOString() };
        $('#quote-packet').val(JSON.stringify(packetObj));
      } catch (_) {
        // ignore
      }

      if (packetObj) console.log(packetObj);

      this.enqueueEvent({
        type: 'quote_sent',
        ts: new Date().toISOString(),
        context: { page: location.pathname, serviceType: this.getActiveServiceType() },
        payload: { method: 'sms' }
      });
      this.flushEventQueue();
      this.scheduleSnapshot(0);
      
      alert('✅ Quote SMS ready to send to ' + phone + '!\n\nClient ID: ' + clientId + '\nPopulation ID: ' + populationId);
    },

    /**
     * Schedule quote for later
     */
    scheduleQuote: function() {
      const datetime = $('#quote-send-datetime').val();
      
      if (!datetime) {
        alert('Please select a date and time');
        return;
      }

      console.log('Quote scheduled for:', datetime);
      alert('✅ Quote scheduled to send at ' + datetime + '!');
    },

    /**
     * Send quote (old function - kept for compatibility)
     */
    sendQuote: function() {
      const customerId = $('#quote-customer-id').val();
      const total = $('#quote-total').text();
      
      if (!customerId || customerId === 'new') {
        alert('Please select or create a customer first.');
        return;
      }
      
      alert('Quote sent to customer ' + customerId + '\nTotal: ' + total);
    },

    /**
     * Save settings to localStorage
     */
    saveSettings: function() {
      const settings = {
        base_hourly_rate: $('#setting-base-hourly-rate').val(),
        premium_hourly_rate: $('#setting-premium-hourly-rate').val(),
        tax_rate: $('#setting-tax-rate').val(),
        staff_multiplier: $('#setting-staff-multiplier').val(),
        staff_extra_hourly_rate: $('#setting-staff-extra-hourly-rate').val(),
        staff_threshold: $('#setting-staff-threshold').val(),
        currency: $('#setting-currency').val(),
        customer_id_prefix: $('#setting-customer-id-prefix').val(),
        theme: $('#setting-theme-dark').is(':checked') ? 'dark' : 'light',
        discount_percent: $('#setting-discount-percent').val(),
        discount_fixed: $('#setting-discount-fixed').val(),
        surcharge_single_oven: $('#surcharge-single-oven').val(),
        surcharge_double_oven: $('#surcharge-double-oven').val(),
        surcharge_windows: $('#surcharge-windows').val(),
        surcharge_carpet: $('#surcharge-carpet').val(),
        surcharge_drawers: $('#surcharge-drawers').val(),
        surcharge_garage: $('#surcharge-garage').val(),
        service_api_endpoint: $('#service-api-endpoint').val()
      };
      
      localStorage.setItem('checklist_settings', JSON.stringify(settings));

      this.applyTheme(settings.theme);

      if (this._eventWorker) {
        this._eventWorker.postMessage({
          op: 'config',
          config: {
            endpoint: settings.service_api_endpoint || null
          }
        });
        this.flushEventQueue();
      }
      alert('Settings saved successfully!');
    },

    /**
     * Reset settings to defaults
     */
    resetSettings: function() {
      $('#setting-base-hourly-rate').val('50');
      $('#setting-premium-hourly-rate').val('75');
      $('#setting-tax-rate').val('15');
      $('#setting-staff-multiplier').val('25');
      $('#setting-staff-extra-hourly-rate').val('30');
      $('#setting-staff-threshold').val('7');
      $('#setting-currency').val('USD');
      $('#setting-customer-id-prefix').val('CUST');
      $('#setting-theme-dark').prop('checked', false);
      $('#setting-discount-percent').val('0');
      $('#setting-discount-fixed').val('0');
      $('#surcharge-single-oven').val('150');
      $('#surcharge-double-oven').val('200');
      $('#surcharge-windows').val('65');
      $('#surcharge-carpet').val('52');
      $('#surcharge-drawers').val('50');
      $('#surcharge-garage').val('100');
      $('#service-api-endpoint').val('');
      
      localStorage.removeItem('checklist_settings');

      // Return to explicit light theme after reset.
      this.applyTheme('light');
      alert('Settings reset to defaults!');
    }
  };

  /**
   * Carpet Cleaning Dropdown Handler
   * Handles room count selection and displays pricing
   */
  function initCarpetCleaningDropdowns() {
    // Carpet pricing map (will be replaced with dynamic PHP data)
    // Format: "C{rooms}": price
    const carpetPrices = {
      'C1': 80.00,
      'C2': 104.35,
      'C3': 115.74,
      'C4': 180.13,
      'C5': 173.91,
      'C6': 260.00,
      'C7': 300.00
    };

    // Handle all carpet dropdown changes
    $(document).on('change', '[data-service="carpet-cleaning"]', function() {
      const selectedValue = $(this).val();
      const dropdownId = $(this).attr('id');
      const priceDisplayId = dropdownId.replace('carpet-cleaning-', 'carpet-price-');
      const $priceDisplay = $('#' + priceDisplayId);

      if (selectedValue && carpetPrices[selectedValue]) {
        const price = carpetPrices[selectedValue];
        $priceDisplay.text('Price: $' + price.toFixed(2));
        
        // Store selection in data attribute for quote building
        $(this).data('selected-price', price);
        $(this).data('selected-code', selectedValue);
        
        console.log('Carpet selected: ' + selectedValue + ' = $' + price.toFixed(2));
      } else {
        $priceDisplay.text('Price: --');
        $(this).data('selected-price', null);
        $(this).data('selected-code', null);
      }
    });
  }

  /**
   * Windows Cleaning Dropdown Handler
   * Handles property type selection and displays pricing
   */
  function initWindowsCleaningDropdowns() {
    // Windows pricing map (will be replaced with dynamic PHP data)
    // Format: "W{variant}": price
    const windowsPrices = {
      'W2BR': 140.00,
      'W3BR': 170.00,
      'W4BR': 200.00,
      'W5BR': 230.00,
      'W2S3B': 290.00,
      'W2S4B': 330.00,
      'W2S5B': 350.00
    };

    // Handle all windows dropdown changes
    $(document).on('change', '[data-service="windows-cleaning"]', function() {
      const selectedValue = $(this).val();
      const dropdownId = $(this).attr('id');
      const priceDisplayId = dropdownId.replace('windows-cleaning-', 'windows-price-');
      const $priceDisplay = $('#' + priceDisplayId);

      if (selectedValue && windowsPrices[selectedValue]) {
        const price = windowsPrices[selectedValue];
        $priceDisplay.text('Price: $' + price.toFixed(2));
        
        // Store selection in data attribute for quote building
        $(this).data('selected-price', price);
        $(this).data('selected-code', selectedValue);
        
        console.log('Windows selected: ' + selectedValue + ' = $' + price.toFixed(2));
      } else {
        $priceDisplay.text('Price: --');
        $(this).data('selected-price', null);
        $(this).data('selected-code', null);
      }
    });
  }

  /**
   * Initialize on DOM ready
   */
  $(document).ready(function() {
    Checklist.init();
    initCarpetCleaningDropdowns();
    initWindowsCleaningDropdowns();
  });

  // ============================================================================
  // DESIGN PATTERNS LIBRARY
  // ============================================================================
  // Single-responsibility objects: variant handling, room templates,
  // custom items persistence, snapshot management.

  const VariantManager = {
    variants: {
      oven: {
        single: { hours: 1.5, charge: 150, label: 'Single Oven' },
        double: { hours: 1.5, charge: 200, label: 'Double Oven' },
        commercial: { hours: 2.5, charge: 400, label: 'Commercial Oven' }
      },
      windows: {
        '2br': { hours: 2.0, charge: 65, label: '2BR' },
        '3br': { hours: 2.0, charge: 85, label: '3BR' },
        '4br': { hours: 2.0, charge: 110, label: '4BR' },
        '2story': { hours: 1.0, charge: 40, label: '2-Story' }
      }
    },
    getPrice(type, variant) {
      const group = this.variants[type];
      return group ? group[variant] : null;
    },
    calculateLineCost(type, variant, baseRate) {
      const spec = this.getPrice(type, variant);
      return spec ? (spec.hours * baseRate) + spec.charge : 0;
    }
  };

  const CustomItemsStore = {
    key: 'checklist_custom_items_v1',
    load() {
      try {
        const raw = localStorage.getItem(this.key);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('CustomItemsStore.load error:', e);
        return [];
      }
    },
    save(items) {
      try {
        localStorage.setItem(this.key, JSON.stringify(items));
        return true;
      } catch (e) {
        console.error('CustomItemsStore.save error:', e);
        return false;
      }
    },
    add(item) {
      const items = this.load();
      items.push({
        id: `ci_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false,
        ...item
      });
      return this.save(items) ? items : null;
    },
    update(id, updates) {
      const items = this.load();
      const idx = items.findIndex(it => it && it.id === id);
      if (idx < 0) return null;
      items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
      return this.save(items) ? items : null;
    },
    archive(id) {
      return this.update(id, { archived: true });
    },
    getActive() {
      const items = this.load();
      return items.filter(it => it && !it.archived).sort((a, b) => {
        const aTs = Date.parse(a.updated_at || a.created_at || 0);
        const bTs = Date.parse(b.updated_at || b.created_at || 0);
        return bTs - aTs;
      });
    },
    getActiveCount() {
      return this.getActive().length;
    }
  };

  const SnapshotBuilder = {
    build(state) {
      return {
        schema: 1,
        timestamp: new Date().toISOString(),
        crew: (state && state.crew) || '',
        date: (state && state.date) || '',
        service_type: (state && state.serviceType) || 'end-of-tenancy',
        checklist_state: (state && state.checklistState) || {},
        custom_items: (state && state.customItems) || [],
        client_context: (state && state.clientContext) || {}
      };
    },
    restore(snapshot) {
      if (!snapshot) return null;
      return {
        crew: snapshot.crew || '',
        date: snapshot.date || '',
        serviceType: snapshot.service_type || 'end-of-tenancy',
        checklistState: snapshot.checklist_state || {},
        customItems: snapshot.custom_items || [],
        clientContext: snapshot.client_context || {}
      };
    }
  };

  // Expose globally for testing
  window.Checklist = Checklist;
  window.VariantManager = VariantManager;
  window.CustomItemsStore = CustomItemsStore;
  window.SnapshotBuilder = SnapshotBuilder;

})(jQuery);
