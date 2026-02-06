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
    clientContext: 'checklist_client_context',
    currentQuoteId: 'ays_current_quote_id'
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
      this.initSettingsTabs();
      this.registerServiceWorker();
      this.cacheDOM();
      this.applySettingsToUI();
      this.updateEndpointBanner();
      this.initCustomItems();
      this.initRoomProgressBars();
      this.initEventWorker();
      this.initSyncStatusUI();
      this.normalizePhase1Attributes();
      this.bindEvents();
      this.initGeneratedRoomsForTabs();
      this.initAdminDiagnostics();
      this.initQuickPropertyTypeSelector();
      this.initGlobalServiceTypeSelector();
      this.initFloorDefaultsPanel();
      this.initEndpointFromUrl();
      this.initFirstRunSetup();
      this.initVoiceDictationMicButtons();
      this.restoreSnapshotBestEffort();
      this.initQuoteStorage();
      this.initQuoteManager();
      this.restoreClientContextBestEffort();
      this.loadProgress();
      this.updateAllProgress();
      this.updateClientSummary();
      this.updateSystemStatus();
      
      // Listen for online/offline events to update System tab
      window.addEventListener('online', () => this.updateSystemStatus());
      window.addEventListener('offline', () => this.updateSystemStatus());
      
      // CRITICAL: Initialize service toggle renderer
      // MUST wait for ITEM_DEFINITIONS to load before rendering toggles
      // If this fails, the entire polymorphic property system cascades down
      this.initServiceToggleRenderer();
    },

    /**
     * Initialize Settings tab navigation (Property/Pricing/Production/Surcharges/Services/System)
     */
    initSettingsTabs: function() {
      const settingsTabButtons = document.querySelectorAll('.settings-tab-button');
      const settingsTabContents = document.querySelectorAll('.settings-tab-content');

      if (!settingsTabButtons.length || !settingsTabContents.length) {
        return;
      }

      const showSettingsTab = (tabName) => {
        settingsTabContents.forEach(content => {
          content.classList.remove('is-active');
          content.style.display = 'none';
        });

        const activeContent = document.querySelector(`.settings-tab-content[data-tab="${tabName}"]`);
        if (activeContent) {
          activeContent.classList.add('is-active');
          activeContent.style.display = 'block';
        }

        settingsTabButtons.forEach(btn => {
          const isActive = btn.getAttribute('data-tab') === tabName;
          btn.classList.toggle('is-active', isActive);
          btn.style.borderBottomColor = isActive ? 'var(--color-accent)' : 'transparent';
          if (isActive) {
            btn.style.color = 'var(--color-secondary)';
          }
        });

        if (tabName === 'system' && typeof Checklist !== 'undefined' && Checklist.updateSystemStatus) {
          Checklist.updateSystemStatus();
        }
        
        // Refresh quote list when Manage Quotes tab is shown
        if (tabName === 'manage-quotes' && typeof Checklist !== 'undefined' && Checklist.renderQuoteList) {
          Checklist.renderQuoteList();
        }
      };

      settingsTabButtons.forEach(button => {
        button.addEventListener('click', function() {
          const tabName = this.getAttribute('data-tab');
          showSettingsTab(tabName);
        });
      });

      let initialTab = null;
      settingsTabButtons.forEach(btn => {
        if (!initialTab && btn.classList.contains('is-active')) {
          initialTab = btn.getAttribute('data-tab');
        }
      });

      if (!initialTab) {
        initialTab = settingsTabButtons[0].getAttribute('data-tab');
      }

      showSettingsTab(initialTab);
    },

    /**
     * Update header banner when endpoint is not configured
     */
    updateEndpointBanner: function() {
      const banner = document.getElementById('endpoint-banner');
      if (!banner) return;
      const settings = this.getSettings() || {};
      if (settings.service_api_endpoint) {
        banner.classList.remove('is-visible');
        banner.textContent = '';
        return;
      }
      banner.classList.add('is-visible');
      banner.textContent = 'Not connected — set your endpoint to enable sync.';
    },

    /**
     * Update System tab status indicators (connection, last sync, pending count)
     * Called on init, after sync, and on online/offline events
     */
    updateSystemStatus: function() {
      const connectionEl = document.getElementById('system-connection-status');
      const lastSyncEl = document.getElementById('system-last-sync');
      const pendingEl = document.getElementById('system-pending-count');
      
      // Connection status
      if (connectionEl) {
        const settings = this.getSettings() || {};
        const hasEndpoint = !!settings.service_api_endpoint;
        const isOnline = navigator.onLine;
        
        connectionEl.classList.remove('status-unknown', 'status-online', 'status-offline', 'status-syncing');
        
        if (!hasEndpoint) {
          connectionEl.textContent = 'Not configured';
          connectionEl.classList.add('status-unknown');
        } else if (!isOnline) {
          connectionEl.textContent = 'Offline';
          connectionEl.classList.add('status-offline');
        } else {
          connectionEl.textContent = 'Online';
          connectionEl.classList.add('status-online');
        }
      }
      
      // Last sync timestamp
      if (lastSyncEl) {
        const lastSync = localStorage.getItem('checklist_last_sync');
        if (lastSync) {
          try {
            const date = new Date(lastSync);
            lastSyncEl.textContent = date.toLocaleString();
          } catch (e) {
            lastSyncEl.textContent = lastSync;
          }
        } else {
          lastSyncEl.textContent = 'Never';
        }
      }
      
      // Pending items count (from event worker outbox)
      if (pendingEl) {
        // Request count from event worker if available
        if (this._eventWorker) {
          // Worker will respond via message handler
          this._eventWorker.postMessage({ op: 'status' });
        } else {
          pendingEl.textContent = '0';
        }
      }
    },

    initFirstRunSetup: function() {
      const input = document.getElementById('first-run-endpoint');
      const btnTest = document.getElementById('first-run-test');
      const btnSave = document.getElementById('first-run-save');
      const btnOffline = document.getElementById('first-run-offline');
      const status = document.getElementById('first-run-status');

      const setStatus = (text, ok) => {
        if (!status) return;
        status.textContent = text || '';
        status.style.color = ok ? 'var(--color-accent)' : 'var(--color-secondary)';
      };

      const normalizeEndpoint = (value) => {
        const trimmed = (value || '').toString().trim();
        if (!trimmed) return '';
        return trimmed.replace(/\/+$/, '');
      };

      const hasEndpoint = async () => {
        const local = (this.getSettings() || {}).service_api_endpoint;
        if (local) return local;
        const idbValue = await this.getEndpointFromIdb();
        return idbValue || '';
      };

      const applyEndpoint = async (endpoint) => {
        if (!endpoint) return;
        await this.saveEndpointToIdb(endpoint);
        const settings = this.getSettings() || {};
        const next = { ...settings, service_api_endpoint: endpoint };
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
        $('#service-api-endpoint').val(endpoint);
        $('#system-service-api-endpoint').val(endpoint);
        this.updateEndpointBanner();
        if (this._eventWorker) {
          this._eventWorker.postMessage({ op: 'config', config: { endpoint } });
          this.flushEventQueue();
        }
      };

      const testEndpoint = async () => {
        const endpoint = normalizeEndpoint(input?.value || '');
        if (!endpoint) {
          setStatus('Enter a valid endpoint URL.', false);
          btnSave.disabled = true;
          return;
        }

        setStatus('Testing connection…', true);
        try {
          const res = await fetch(endpoint + '/health', { method: 'GET' });
          if (!res.ok) throw new Error('Health check failed');
          setStatus('Connection OK.', true);
          btnSave.disabled = false;
        } catch (e) {
          setStatus('Connection failed. Check the URL.', false);
          btnSave.disabled = true;
        }
      };

      const saveAndContinue = async () => {
        const endpoint = normalizeEndpoint(input?.value || '');
        if (!endpoint) return;
        await applyEndpoint(endpoint);
        this.setSyncStatus('queued', 'Endpoint configured. Syncing…');
        setStatus('Endpoint saved. Syncing…', true);
      };

      const continueOffline = () => {
        this.setSyncStatus('local', 'Saved locally (no endpoint)');
        setStatus('Offline mode enabled.', true);
        this.updateEndpointBanner();
      };

      btnTest?.addEventListener('click', testEndpoint);
      btnSave?.addEventListener('click', saveAndContinue);
      btnOffline?.addEventListener('click', continueOffline);

      hasEndpoint().then((endpoint) => {
        if (endpoint) {
          applyEndpoint(endpoint).then(() => {
            this.updateEndpointBanner();
            if (input) input.value = endpoint;
            btnSave && (btnSave.disabled = false);
            setStatus('Endpoint loaded.', true);
          });
        } else {
          this.updateEndpointBanner();
          setStatus('Endpoint not set. Sync is disabled.', false);
        }
      });
    },

    initAdminDiagnostics: function() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const enabled = (params.get('admin') === '1') || (params.get('debug') === '1');
        if (!enabled) return;

        if (this._adminDiag && this._adminDiag.enabled) return;

        const panel = document.createElement('pre');
        panel.id = 'ays-admin-diagnostics';
        panel.style.position = 'fixed';
        panel.style.right = '12px';
        panel.style.bottom = '12px';
        panel.style.zIndex = '99999';
        panel.style.maxWidth = '420px';
        panel.style.maxHeight = '45vh';
        panel.style.overflow = 'auto';
        panel.style.padding = '10px';
        panel.style.margin = '0';
        panel.style.border = '1px solid var(--color-border)';
        panel.style.borderRadius = 'var(--radius-md)';
        panel.style.background = 'var(--color-white)';
        panel.style.color = 'var(--color-primary)';
        panel.style.fontSize = '12px';
        panel.style.lineHeight = '1.35';
        panel.style.boxShadow = 'var(--shadow-md)';

        const state = {
          enabled: true,
          panel,
          lines: [],
          log: (line) => {
            const ts = new Date().toLocaleTimeString();
            state.lines.push(`[${ts}] ${String(line)}`);
            // Keep last ~200 lines
            if (state.lines.length > 200) state.lines.splice(0, state.lines.length - 200);
            panel.textContent = state.lines.join('\n');
          },
          snapshot: () => {
            const activeService = (typeof this.getActiveServiceType === 'function') ? this.getActiveServiceType() : 'unknown';
            const containerId = this._generatorContainerByService && this._generatorContainerByService[activeService];
            const containerEl = containerId ? document.getElementById(containerId) : null;
            const cfg = this._getCurrentGeneratedConfig && this._getCurrentGeneratedConfig();
            const roomsCount = (cfg && Array.isArray(cfg.rooms)) ? cfg.rooms.length : 'n/a';
            const hasFactory = (typeof AysChecklistFormFactory !== 'undefined');
            const hasGenerator = !!(this._generatorsByService && this._generatorsByService[activeService]);
            const generatedDetailsCount = containerEl ? containerEl.querySelectorAll('details').length : 'n/a';
            const legacyId = 'legacy-rooms-' + activeService;
            const legacyEl = document.getElementById(legacyId);
            const legacyVisible = legacyEl ? (legacyEl.style.display !== 'none') : 'n/a';

            state.log('--- STATUS ---');
            state.log(`activeService=${activeService}`);
            state.log(`containerId=${containerId || 'n/a'} containerFound=${!!containerEl}`);
            state.log(`generatedDetailsCount=${generatedDetailsCount}`);
            state.log(`AysChecklistFormFactoryLoaded=${hasFactory}`);
            state.log(`generatorInstanceForService=${hasGenerator}`);
            state.log(`configRooms=${roomsCount}`);
            state.log(`legacyEl(${legacyId})=${!!legacyEl} legacyVisible=${legacyVisible}`);
          }
        };

        this._adminDiag = state;
        document.body.appendChild(panel);
        state.log('Admin diagnostics enabled');

        window.addEventListener('error', (e) => {
          const msg = e && e.message ? e.message : 'Unknown error';
          state.log(`ERROR: ${msg}`);
        });

        window.addEventListener('unhandledrejection', (e) => {
          const reason = (e && e.reason) ? e.reason : 'Unknown rejection';
          const msg = (reason && reason.message) ? reason.message : String(reason);
          state.log(`UNHANDLED: ${msg}`);
        });

        // Snapshot a few times during initial load.
        setTimeout(() => state.snapshot(), 50);
        setTimeout(() => state.snapshot(), 500);
        setTimeout(() => state.snapshot(), 2000);
      } catch (_) {
        // Never break the app for diagnostics.
      }
    },

    initGeneratedRoomsForTabs: function() {
      // Keep generator instances per service tab so we can render into different containers.
      // IMPORTANT: We keep Settings as the source-of-truth, and just swap the active generator.
      this._generatorContainerByService = {
        'end-of-tenancy': 'rooms-container',
        'residential': 'rooms-container-residential',
        'commercial': 'rooms-container-commercial'
      };

      this._floorSummaryContainerByService = {
        'end-of-tenancy': 'floor-summary-container',
        'residential': 'floor-summary-container-residential',
        'commercial': 'floor-summary-container-commercial'
      };

      this._generatorsByService = this._generatorsByService || {};

      Object.entries(this._generatorContainerByService).forEach(([service, containerId]) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (this._generatorsByService[service]) return;
        if (typeof AysChecklistFormFactory === 'undefined') return;
        this._generatorsByService[service] = new AysChecklistFormFactory(containerId);
      });

      // Ensure the currently active tab has the correct generator selected.
      this.setActiveChecklistGenerator(this.getActiveServiceType());
    },

    _escapeHtml: function(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    _waitFor: function(checkFn, options) {
      const opts = options || {};
      const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : 5000;
      const intervalMs = typeof opts.intervalMs === 'number' ? opts.intervalMs : 50;

      return new Promise((resolve, reject) => {
        const started = Date.now();

        const tick = () => {
          let value = null;
          try {
            value = checkFn();
          } catch (e) {
            reject(e);
            return;
          }

          if (value) {
            resolve(value);
            return;
          }

          if (Date.now() - started >= timeoutMs) {
            reject(new Error('Timed out waiting for prerequisites'));
            return;
          }

          setTimeout(tick, intervalMs);
        };

        tick();
      });
    },

    _getCurrentGeneratedConfig: function() {
      if (typeof PROPERTY_CONFIG !== 'undefined' && typeof PROPERTY_CONFIG.getConfig === 'function') {
        return PROPERTY_CONFIG.getConfig();
      }
      if (typeof CHECKLIST_CONFIG !== 'undefined') {
        return CHECKLIST_CONFIG;
      }
      return null;
    },

    buildChecklistConfigFor: function(serviceType, propertyTypeKey) {
      if (typeof AysChecklistConfigBuilder === 'undefined' || typeof PROPERTY_CONFIG === 'undefined') {
        return this._getCurrentGeneratedConfig();
      }

      const baseType = propertyTypeKey || PROPERTY_CONFIG.property_type || 'residential';
      let targetType = baseType;

      if (serviceType === 'commercial') {
        targetType = baseType.startsWith('commercial') ? baseType : 'commercial_office';
      } else if (serviceType === 'end-of-tenancy') {
        targetType = baseType.startsWith('eot') ? baseType : 'eot_residential';
      } else if (serviceType === 'residential') {
        targetType = baseType.startsWith('residential') ? baseType : 'residential';
      }

      try {
        const builder = AysChecklistConfigBuilder.forPropertyType(targetType);

        if (PROPERTY_CONFIG.numBedrooms) builder.withBedroomCount(PROPERTY_CONFIG.numBedrooms);
        if (PROPERTY_CONFIG.numBathrooms) builder.withBathroomCount(PROPERTY_CONFIG.numBathrooms);

        if (PROPERTY_CONFIG.numFloors && PROPERTY_CONFIG.numOfficesPerFloor) {
          builder.withMultiStoryOffice(PROPERTY_CONFIG.numFloors, PROPERTY_CONFIG.numOfficesPerFloor);
        } else if (PROPERTY_CONFIG.numOffices) {
          builder.withOfficeCount(PROPERTY_CONFIG.numOffices);
        }

        if (PROPERTY_CONFIG.numShowers) builder.withShowerCount(PROPERTY_CONFIG.numShowers);
        if (PROPERTY_CONFIG.numLoadingDocks) builder.withLoadingDockCount(PROPERTY_CONFIG.numLoadingDocks);
        if (PROPERTY_CONFIG.numAdminOffices) builder.withAdminOfficeCount(PROPERTY_CONFIG.numAdminOffices);

        const rawDefaults = this.getFloorDefaultsFromStorage();
        const normalizedDefaults = this.normalizeFloorDefaults(rawDefaults);
        if (normalizedDefaults && typeof builder.withFloorDefaults === 'function') {
          builder.withFloorDefaults(normalizedDefaults);
        }

        return builder.build();
      } catch (err) {
        console.warn('[Checklist] Per-tab config build failed, falling back to global config:', err);
        return this._getCurrentGeneratedConfig();
      }
    },

    getFloorDefaultsFromStorage: function() {
      try {
        return JSON.parse(localStorage.getItem('checklist_floor_defaults') || 'null');
      } catch (_) {
        return null;
      }
    },

    normalizeFloorDefaults: function(rawDefaults) {
      if (!rawDefaults || typeof rawDefaults !== 'object') return null;

      const map = {};
      const assign = (keys, value) => {
        if (!value) return;
        keys.forEach((key) => {
          map[key] = value;
        });
      };

      assign(['bedroom'], rawDefaults.bedroom);
      assign(['bathroom', 'toilet', 'toilets', 'shower'], rawDefaults.bathroom);
      assign(['living_area', 'living-room', 'living'], rawDefaults.living);
      assign(['kitchen', 'lunchroom'], rawDefaults.kitchen);
      assign(['circulation', 'entryway', 'hallway'], rawDefaults.hallway);
      assign(['warehouse'], rawDefaults.warehouse);
      assign(['office', 'reception', 'boardroom', 'sales-floor', 'stockroom'], rawDefaults.office);

      return Object.keys(map).length ? map : null;
    },

    _waitForGeneratedConfigWithRooms: function() {
      return this._waitFor(() => {
        const cfg = this._getCurrentGeneratedConfig();
        return (cfg && Array.isArray(cfg.rooms)) ? cfg : null;
      }, { timeoutMs: 8000, intervalMs: 50 });
    },

    _renderGeneratedRoomsForService: function(serviceType, containerId, containerEl, configOverride) {
      this._pendingGeneratedRenderToken = (this._pendingGeneratedRenderToken || 0) + 1;
      const token = this._pendingGeneratedRenderToken;

      const ensureFactoryLoaded = () => (typeof AysChecklistFormFactory !== 'undefined') ? true : null;

      return this._waitFor(ensureFactoryLoaded, { timeoutMs: 8000, intervalMs: 50 })
        .then(() => {
          if (configOverride && Array.isArray(configOverride.rooms)) return configOverride;
          return this._waitForGeneratedConfigWithRooms();
        })
        .then((config) => {
          // Ignore stale renders if the user switched tabs quickly.
          if (token !== this._pendingGeneratedRenderToken) return null;

          this._generatorsByService = this._generatorsByService || {};
          if (!this._generatorsByService[serviceType]) {
            this._generatorsByService[serviceType] = new AysChecklistFormFactory(containerId);
          }

          const generator = this._generatorsByService[serviceType];
          window.checklistGenerator = generator;

          // Regenerate into the correct container.
          generator.regenerate(config);

          if (typeof this.initRoomProgressBars === 'function') {
            this.initRoomProgressBars();
          }
          if (typeof this.updateFloorSummary === 'function') {
            this.updateFloorSummary();
          }

          // Option A (safer): only hide legacy hardcoded rooms after generated rooms are present.
          // We also strip IDs inside the legacy container to prevent duplicate IDs interfering with
          // selectors/labels, while still keeping the markup available as a fallback.
          const hasGeneratedRooms = !!(
            containerEl &&
            containerEl.querySelector &&
            // Generated cards include a progress bar element; legacy markup does not.
            containerEl.querySelector('.room-progressbar, .room-progressbar-fill')
          );

          if (hasGeneratedRooms) {
            const legacyEl = document.getElementById('legacy-rooms-' + serviceType);
            if (legacyEl) {
              // Avoid repeated work on re-renders.
              if (legacyEl.dataset.aysLegacyDisabled !== '1') {
                legacyEl.dataset.aysLegacyDisabled = '1';

                // Remove IDs under legacy to avoid duplicates with generated content.
                legacyEl.querySelectorAll('[id]').forEach((el) => {
                  el.removeAttribute('id');
                });
              }

              legacyEl.style.display = 'none';
            }
          }

          return true;
        })
        .catch((err) => {
          if (token !== this._pendingGeneratedRenderToken) return null;
          const msg = (err && err.message) ? err.message : String(err);
          if (containerEl) {
            containerEl.innerHTML = `<p><strong>Generated rooms error:</strong> ${this._escapeHtml(msg)}</p>`;
          }
          return null;
        });
    },

    setActiveChecklistGenerator: function(serviceType) {
      const containerId = this._generatorContainerByService && this._generatorContainerByService[serviceType];
      if (!containerId) return;

      const containerEl = document.getElementById(containerId);
      if (!containerEl) return;

      // Show deterministic status while waiting for prerequisites in large pages.
      containerEl.innerHTML = '<p>Loading generated rooms…</p>';

      // Promise-based render (no try/catch). Errors are surfaced in the container.
      const propertyType = (typeof PROPERTY_CONFIG !== 'undefined' && PROPERTY_CONFIG.property_type)
        ? PROPERTY_CONFIG.property_type
        : null;
      const config = this.buildChecklistConfigFor(serviceType, propertyType);
      this._renderGeneratedRoomsForService(serviceType, containerId, containerEl, config);
    },

    initQuickPropertyTypeSelector: function() {
      const quickSelect = document.getElementById('property-type-quick');
      const settingsSelect = document.getElementById('setting-property-type');
      if (!quickSelect || !settingsSelect) return;
      if (quickSelect.dataset.aysQuickPropertyTypeInit === '1') return;
      quickSelect.dataset.aysQuickPropertyTypeInit = '1';

      const syncOptionsFromSettings = () => {
        try {
          // Clone options from Settings so we never drift
          quickSelect.innerHTML = '';
          Array.from(settingsSelect.options).forEach((opt) => {
            const copy = document.createElement('option');
            copy.value = opt.value;
            copy.textContent = opt.textContent;
            quickSelect.appendChild(copy);
          });
        } catch (_) {
          // ignore
        }
      };

      const syncValueFromSettings = () => {
        if (!settingsSelect.value) return;
        quickSelect.value = settingsSelect.value;
      };

      syncOptionsFromSettings();
      syncValueFromSettings();

      // When user changes the quick selector, update Settings and trigger existing wiring
      quickSelect.addEventListener('change', () => {
        settingsSelect.value = quickSelect.value;
        settingsSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // When Settings changes (restore, user edits settings tab), reflect it in quick selector
      settingsSelect.addEventListener('change', () => {
        syncOptionsFromSettings();
        syncValueFromSettings();
      });

      // In case Settings is hydrated after Checklist.init, resync shortly after load
      setTimeout(() => {
        syncOptionsFromSettings();
        syncValueFromSettings();
      }, 0);
    },

    /**
     * Initialize Global Service Type Selector
     * Controls which items appear in checklist forms across all tabs.
     * Syncs with tab selection and updates indicator.
     */
    initGlobalServiceTypeSelector: function() {
      const selector = document.getElementById('global-service-type');
      const container = document.querySelector('.service-type-selector');
      const indicator = document.getElementById('service-type-indicator');
      const indicatorText = indicator?.querySelector('.indicator-text');
      
      if (!selector) {
        console.warn('[Checklist] Global service type selector not found');
        return;
      }
      
      // Prevent double-init
      if (selector.dataset.aysGlobalServiceInit === '1') return;
      selector.dataset.aysGlobalServiceInit = '1';
      
      const SERVICE_LABELS = {
        'eot': 'EOT Mode',
        'residential': 'Residential Mode',
        'commercial': 'Commercial Mode',
        'custom': 'Custom Mode'
      };
      
      const TAB_TO_SERVICE = {
        'end-of-tenancy': 'eot',
        'residential': 'residential',
        'commercial': 'commercial',
        'custom': 'custom',
        'quotes': null, // Don't change on quotes tab
        'settings': null // Don't change on settings tab
      };
      
      const SERVICE_TO_TAB = {
        'eot': 'end-of-tenancy',
        'residential': 'residential',
        'commercial': 'commercial',
        'custom': 'custom'
      };
      
      const updateIndicator = (serviceType) => {
        if (container) {
          container.dataset.service = serviceType;
        }
        if (indicatorText) {
          indicatorText.textContent = SERVICE_LABELS[serviceType] || 'Unknown';
        }
      };
      
      const switchToTab = (tabDataService) => {
        // Find and click the corresponding tab
        const tab = document.querySelector(`.tab[data-service="${tabDataService}"]`);
        if (tab && !tab.classList.contains('is-tab-selected')) {
          tab.click();
        }
      };
      
      // When user changes the dropdown
      const self = this;
      selector.addEventListener('change', () => {
        const serviceType = selector.value;
        updateIndicator(serviceType);
        
        // Switch to the corresponding tab
        const tabDataService = SERVICE_TO_TAB[serviceType];
        if (tabDataService) {
          switchToTab(tabDataService);
        }
        
        // PHASE 2: Trigger form rebuild using existing factory pattern
        // Maps: eot → end-of-tenancy, residential → residential, etc.
        if (typeof window.checklistGenerator !== 'undefined') {
          const propertyType = (typeof PROPERTY_CONFIG !== 'undefined') 
            ? PROPERTY_CONFIG.property_type 
            : null;
          const newConfig = self.buildChecklistConfigFor(tabDataService, propertyType);
          
          if (newConfig && newConfig.rooms) {
            window.checklistGenerator.regenerate(newConfig);
            console.log(`[Checklist] Form rebuilt for ${serviceType} with ${newConfig.rooms.length} rooms`);
            
            // Re-init room progress bars after regeneration
            if (typeof self.initRoomProgressBars === 'function') {
              self.initRoomProgressBars();
            }
          }
        }
        
        // Save to snapshot (existing flow)
        this.saveSnapshot();
        
        console.log('[Checklist] Service type changed to:', serviceType);
      });
      
      // Sync when tabs are clicked (for EOT/Residential/Commercial/Custom)
      document.querySelectorAll('.tab[data-service]').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabService = tab.dataset.service;
          const mappedService = TAB_TO_SERVICE[tabService];
          
          // Only sync if it's a content tab (not quotes/settings)
          if (mappedService && selector.value !== mappedService) {
            selector.value = mappedService;
            updateIndicator(mappedService);
          }
        });
      });
      
      // Initialize indicator on load
      updateIndicator(selector.value);
      
      // Restore from active tab on load
      const activeTab = document.querySelector('.tab.is-tab-selected');
      if (activeTab) {
        const tabService = activeTab.dataset.service;
        const mappedService = TAB_TO_SERVICE[tabService];
        if (mappedService) {
          selector.value = mappedService;
          updateIndicator(mappedService);
        }
      }
    },

    getFloorVariantOptions: function() {
      if (window.VARIANTS && Array.isArray(window.VARIANTS.floor_types)) {
        return window.VARIANTS.floor_types;
      }
      if (window.VARIANTS && Array.isArray(window.VARIANTS.floor_variants)) {
        return window.VARIANTS.floor_variants;
      }
      return [
        { value: 'carpet', label: 'Carpet' },
        { value: 'lino', label: 'Lino/Vinyl' },
        { value: 'tile', label: 'Tile' },
        { value: 'wood', label: 'Wood' },
        { value: 'concrete', label: 'Concrete/Sealed' },
        { value: 'other', label: 'Other' }
      ];
    },

    initFloorDefaultsPanel: function() {
      const panel = document.getElementById('floor-defaults-panel');
      if (!panel) return;
      if (panel.dataset.aysFloorDefaultsInit === '1') return;
      panel.dataset.aysFloorDefaultsInit = '1';

      const selects = panel.querySelectorAll('select[data-floor-default]');
      if (!selects.length) return;

      const options = this.getFloorVariantOptions();
      selects.forEach((select) => {
        if (select.options && select.options.length > 1) return;
        select.innerHTML = '<option value="">Select default…</option>';
        options.forEach((opt) => {
          if (!opt) return;
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          select.appendChild(option);
        });
      });

      const stored = this.getFloorDefaultsFromStorage() || {};
      selects.forEach((select) => {
        const key = select.dataset.floorDefault;
        if (key && stored[key]) {
          select.value = stored[key];
        }
      });

      const applyDefaults = () => {
        const next = {};
        selects.forEach((select) => {
          const key = select.dataset.floorDefault;
          const value = (select.value || '').toString();
          if (key && value) next[key] = value;
        });

        try {
          localStorage.setItem('checklist_floor_defaults', JSON.stringify(next));
        } catch (e) {
          console.warn('[Checklist] Failed to save floor defaults:', e);
        }

        if (typeof window.checklistGenerator !== 'undefined') {
          const activeService = this.getActiveServiceType();
          const propertyType = (typeof PROPERTY_CONFIG !== 'undefined') ? PROPERTY_CONFIG.property_type : null;
          const newConfig = this.buildChecklistConfigFor(activeService, propertyType);
          window.checklistGenerator.regenerate(newConfig);
        }
      };

      const applyBtn = document.getElementById('btn-apply-floor-defaults');
      if (applyBtn) {
        applyBtn.addEventListener('click', applyDefaults);
      }

      panel.addEventListener('change', applyDefaults);
    },

    initEndpointFromUrl: function() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const endpoint = (params.get('endpoint') || '').toString().trim();
        if (!endpoint) return;

        const settings = this.getSettings() || {};
        if (settings.service_api_endpoint === endpoint) return;

        const next = { ...settings, service_api_endpoint: endpoint };
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));

        const $input = $('#service-api-endpoint');
        if ($input.length) $input.val(endpoint);
        const $systemInput = $('#system-service-api-endpoint');
        if ($systemInput.length) $systemInput.val(endpoint);

        if (this._eventWorker) {
          this._eventWorker.postMessage({
            op: 'config',
            config: { endpoint }
          });
          this.flushEventQueue();
        }

        this.setSyncStatus('queued', 'Endpoint configured. Syncing…');
      } catch (e) {
        console.warn('[Checklist] Failed to apply endpoint from URL:', e);
      }
    },

    getEndpointFromIdb: function() {
      return new Promise((resolve) => {
        if (!('indexedDB' in window)) return resolve(null);

        const req = indexedDB.open('checklist_app_config', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'key' });
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('config', 'readonly');
          const store = tx.objectStore('config');
          const getReq = store.get('endpoint');
          getReq.onsuccess = () => {
            resolve(getReq.result?.value || null);
            db.close();
          };
          getReq.onerror = () => {
            resolve(null);
            db.close();
          };
        };
        req.onerror = () => resolve(null);
      });
    },

    saveEndpointToIdb: function(endpoint) {
      return new Promise((resolve) => {
        if (!('indexedDB' in window)) return resolve(false);

        const req = indexedDB.open('checklist_app_config', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'key' });
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('config', 'readwrite');
          const store = tx.objectStore('config');
          store.put({ key: 'endpoint', value: endpoint });
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            resolve(false);
          };
        };
        req.onerror = () => resolve(false);
      });
    },


    /**
     * Initialize service toggle renderer for current property type
     * WAITS for ITEM_DEFINITIONS to load (defensive for slow networks)
     * If this fails, service selection doesn't work → wrong items appear in checklist
     */
    initServiceToggleRenderer: function() {
      // Check if renderer exists
      if (typeof AysServiceToggleRenderer === 'undefined') {
        console.error('[Checklist] AysServiceToggleRenderer not loaded');
        return;
      }

      // Render toggles (waits for ITEM_DEFINITIONS to load)
      AysServiceToggleRenderer.render()
        .then(() => {
          console.log('[Checklist] Service toggles rendered successfully');
        })
        .catch((error) => {
          console.error('[Checklist] Failed to render service toggles:', error);
          // Error is already displayed in the UI by the renderer
        });
    },

    /**
     * Listen for property type changes and regenerate checklist
     * When user selects different property type in settings → factory regenerates with new config
     * CRITICAL: Called AFTER user changes property type, saves it to PROPERTY_CONFIG
     * SAVES to localStorage so next page load remembers their choice
     * @private
     */
    onPropertyTypeChanged: function(newPropertyType, params) {
      console.log(`[Checklist] Property type changed to: ${newPropertyType}`, params);

      // Regenerate checklist with new property type config
      if (typeof window.checklistGenerator !== 'undefined') {
        const activeService = this.getActiveServiceType();
        const newConfig = this.buildChecklistConfigFor(activeService, newPropertyType);
        window.checklistGenerator.regenerate(newConfig);

        console.log(`[Checklist] Checklist regenerated with ${newConfig.rooms.length} rooms`);
        
        // SAVE property config to localStorage so next load remembers this choice
        try {
          const configToSave = {
            property_type: newPropertyType,
            params: params || {},
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('checklist_property_config', JSON.stringify(configToSave));
          console.log('[Checklist] Property config saved to localStorage:', configToSave);
        } catch (error) {
          console.warn('[Checklist] Failed to save property config to localStorage:', error);
        }
        
        // Also regenerate service toggles for new property type
        if (typeof AysServiceToggleRenderer !== 'undefined') {
          AysServiceToggleRenderer.render()
            .then(() => {
              console.log('[Checklist] Service toggles updated for new property type');
            })
            .catch((error) => {
              console.error('[Checklist] Failed to update toggles:', error);
            });
        }
      }
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
        console.log('[DEBUG] loadCustomItems - localStorage key:', STORAGE_KEYS.customItems, 'value length:', raw ? raw.length : 0);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
      } catch {
        console.log('[DEBUG] loadCustomItems - ERROR parsing JSON from localStorage');
        return [];
      }
    },

    saveCustomItems: function(items) {
      try {
        const json = JSON.stringify(items);
        console.log('[DEBUG] saveCustomItems - saving', items.length, 'items (', json.length, 'bytes) to localStorage');
        localStorage.setItem(STORAGE_KEYS.customItems, json);
        console.log('[DEBUG] saveCustomItems - localStorage write successful');
        this.saveSnapshot();
      } catch(e) {
        console.error('[DEBUG] saveCustomItems - ERROR:', e);
      }
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
        console.log('[DEBUG] Save button clicked');
        if (!this.isAdminView()) {
          console.log('[DEBUG] Not in admin view, aborting save');
          return;
        }
        console.log('[DEBUG] Admin view confirmed, proceeding');

        const editId = String($('#custom-item-id').val() || '').trim();
        const description = String($('#custom-item-description').val() || '').trim();
        const details = String($('#custom-item-details').val() || '').trim();
        const internalNotes = String($('#custom-item-internal-notes').val() || '').trim();

        console.log('[DEBUG] Form values:', { editId, description, details, internalNotes });

        if (!description) {
          alert('Please enter an item label.');
          return;
        }

        const items = this.loadCustomItems();
        console.log('[DEBUG] Loaded items from storage:', items.length);
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

        console.log('[DEBUG] Calling saveCustomItems with', items.length, 'items');
        this.saveCustomItems(items);
        console.log('[DEBUG] saveCustomItems completed');
        
        console.log('[DEBUG] Calling resetCustomItemEditor');
        this.resetCustomItemEditor();
        console.log('[DEBUG] resetCustomItemEditor completed');
        
        console.log('[DEBUG] Calling renderCustomItems');
        this.renderCustomItems();
        console.log('[DEBUG] renderCustomItems completed');
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

      $(document).on('click', '[data-action="custom-item-delete"]', (e) => {
        e.preventDefault();
        if (!this.isAdminView()) return;
        const id = $(e.currentTarget).attr('data-id');
        if (!confirm('Are you sure you want to permanently delete this item? This cannot be undone.')) {
          return;
        }
        const items = this.loadCustomItems();
        const filteredItems = items.filter((it) => it && it.id !== id);
        this.saveCustomItems(filteredItems);
        this.renderCustomItems();
      });
    },

    renderCustomItems: function() {
      console.log('[DEBUG] renderCustomItems called');
      const $container = $('#custom-items-checklist');
      console.log('[DEBUG] Looking for #custom-items-checklist:', $container.length > 0 ? 'FOUND' : 'NOT FOUND');
      if ($container.length === 0) {
        console.log('[DEBUG] Container not found, returning early');
        return;
      }

      const items = this.loadCustomItems();
      console.log('[DEBUG] renderCustomItems - loaded', items.length, 'items from storage');
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
                <button type="button" class="btn btn-secondary" data-action="custom-item-delete" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px; background-color: #dc3545; border-color: #dc3545;">Delete</button>
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
                      <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-secondary" data-action="custom-item-unarchive" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px;">Restore</button>
                        <button type="button" class="btn btn-secondary" data-action="custom-item-delete" data-id="${this.escapeHtml(item.id)}" style="padding: 6px 10px; font-size: 12px; background-color: #dc3545; border-color: #dc3545;">Delete</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </details>
        `);
      }

      $container.html(parts.join(''));
      console.log('[DEBUG] renderCustomItems - injected', parts.length, 'items into HTML');
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

      applyIfPresent('#setting-carpark-open-price', 'carpark_open_price');
      applyIfPresent('#setting-carpark-covered-price', 'carpark_covered_price');

      applyIfPresent('#surcharge-single-oven', 'surcharge_single_oven');
      applyIfPresent('#surcharge-double-oven', 'surcharge_double_oven');
      applyIfPresent('#surcharge-windows', 'surcharge_windows');
      applyIfPresent('#surcharge-carpet', 'surcharge_carpet');
      applyIfPresent('#surcharge-drawers', 'surcharge_drawers');
      applyIfPresent('#surcharge-garage', 'surcharge_garage');
      applyIfPresent('#service-api-endpoint', 'service_api_endpoint');
      applyIfPresent('#system-service-api-endpoint', 'service_api_endpoint');
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

          // Handle status response for System tab pending count
          if (msg.op === 'status') {
            const pendingEl = document.getElementById('system-pending-count');
            if (pendingEl && typeof msg.pending === 'number') {
              pendingEl.textContent = String(msg.pending);
            }
          }

          if (msg.op === 'flush') {
            this._lastFlushResult = msg;
            
            // Update last sync timestamp on successful sync
            if (msg.ok && typeof msg.delivered === 'number' && msg.delivered > 0) {
              localStorage.setItem('checklist_last_sync', new Date().toISOString());
              this.updateSystemStatus();
            }
            
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

        const settings = this.getSettings() || {};
        this._eventWorker.postMessage({
          op: 'config',
          config: {
            endpoint: settings.service_api_endpoint || null
          }
        });

        // Restore latest snapshot from IndexedDB (if any)
        this._eventWorker.postMessage({ op: 'load_snapshot' });

        window.addEventListener('online', () => {
          this.flushEventQueue();
        });

        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.flushEventQueue();
          }
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
        $dropdown.prop('hidden', false);
        $dropdown.prop('disabled', false);
        $dropdown.removeAttr('style');

        // Oven: default to Single so it prices correctly without extra taps.
        const variantType = ($item.data('variantType') || '').toString();
        const optionsKey = ($item.data('optionsKey') || '').toString();
        const defaultVariant = ($item.data('defaultVariant') || '').toString();
        if (variantType === 'dropdown' && optionsKey === 'oven_variants') {
          const current = ($dropdown.val() || '').toString();
          if (!current) {
            if ($dropdown.find('option[value="single-1"]').length) {
              $dropdown.val('single-1').trigger('change');
            } else if ($dropdown.find('option[value="single"]').length) {
              $dropdown.val('single').trigger('change');
            }
          }
        } else {
          const current = ($dropdown.val() || '').toString();
          if (!current) {
            if (defaultVariant && $dropdown.find(`option[value="${defaultVariant}"]`).length) {
              $dropdown.val(defaultVariant).trigger('change');
            } else {
              const firstOption = $dropdown.find('option').not('[value=""]').first();
              if (firstOption.length) {
                $dropdown.val(firstOption.val()).trigger('change');
              }
            }
          }
        }
      } else {
        $dropdown.prop('hidden', true);
        $dropdown.prop('disabled', true);
        this.updateFloorActionLabel($item, '', false);
      }
    },

    isFloorControlItem: function($item) {
      if (!$item || !$item.length) return false;
      const optionsKey = ($item.data('optionsKey') || $item.data('variantKey') || '').toString();
      if (optionsKey === 'floor_types' || optionsKey === 'floor_variants') return true;
      const label = ($item.find('.item-label').text() || '').toLowerCase();
      return label.indexOf('floor') !== -1;
    },

    getFloorActionForVariant: function(variant) {
      const key = (variant || '').toString().toLowerCase();
      if (!key) return null;
      if (key === 'carpet') return 'Vacuum';
      if (key === 'concrete') return 'Sweep + Mop';
      if (['lino', 'vinyl', 'tile', 'wood', 'other'].includes(key)) return 'Mop';
      return null;
    },

    updateFloorActionLabel: function($item, selectedVariant, checked) {
      if (!this.isFloorControlItem($item)) return;

      const $label = $item.find('.item-label');
      if (!$label.length) return;

      let baseLabel = ($item.attr('data-base-label') || '').toString();
      if (!baseLabel) {
        baseLabel = ($label.text() || '').toString();
        $item.attr('data-base-label', baseLabel);
      }

      const cleanBase = baseLabel.replace(/\s*\(.*\)\s*$/, '').trim();
      if (!checked) {
        $label.text(baseLabel);
        $item.removeAttr('data-floor-action');
        return;
      }

      const action = this.getFloorActionForVariant(selectedVariant);
      if (!action) {
        $label.text(baseLabel);
        $item.removeAttr('data-floor-action');
        return;
      }

      $label.text(`${cleanBase} (${action})`);
      $item.attr('data-floor-action', action);
    },

    updateFloorSummary: function() {
      const serviceType = this.getActiveServiceType();
      const containerId = this._floorSummaryContainerByService && this._floorSummaryContainerByService[serviceType];
      if (!containerId) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const $scope = $('.service-tab-content.is-active');
      if (!$scope.length) return;

      const counts = {};
      const labelMap = {};
      const options = this.getFloorVariantOptions();
      options.forEach((opt) => {
        if (opt && opt.value) labelMap[opt.value] = opt.label || opt.value;
      });

      $scope.find('.checklist-item').each((_, el) => {
        const $item = $(el);
        const optionsKey = ($item.data('optionsKey') || $item.data('variantKey') || '').toString();
        if (optionsKey !== 'floor_types' && optionsKey !== 'floor_variants') return;

        const checked = $item.find('input[type="checkbox"]').is(':checked');
        if (!checked) return;

        let selected = ($item.attr('data-selected-variant') || '').toString();
        if (!selected) selected = ($item.find('.variant-dropdown').val() || '').toString();
        if (!selected) selected = ($item.data('defaultVariant') || '').toString();
        if (!selected) return;

        counts[selected] = (counts[selected] || 0) + 1;
      });

      const entries = Object.entries(counts);
      if (!entries.length) {
        container.innerHTML = '';
        return;
      }

      const lines = entries
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => `<li><strong>${this._escapeHtml(labelMap[key] || key)}</strong>: ${count}</li>`)
        .join('');

      container.innerHTML = `
        <div class="room-section floor-summary-card">
          <details open>
            <summary>
              <div class="summary-header">
                <span class="room-title">🧾 Floors Summary</span>
                <span class="progress-badge">${entries.length} types</span>
              </div>
            </summary>
            <div class="room-details">
              <ul class="floor-summary-list">${lines}</ul>
            </div>
          </details>
        </div>
      `;
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
      if (navigator.onLine === true) {
        const st = this.getSettings() || {};
        if (st.service_api_endpoint) {
          this.setSyncStatus('syncing', 'Syncing…');
        }
      }
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
        schema: 2,
        updated_at: new Date().toISOString(),
        serviceType: this.getActiveServiceType(),
        globalServiceType: ($('#global-service-type').val() || '').toString().trim() || 'eot',
        propertyConfig: this._getCurrentPropertyConfig(),
        crew: this.$crewInput.val(),
        date: this.$dateInput.val(),
        client,
        quoteServiceType: ($('#quote-service-type').val() || '').toString().trim() || null,
        bookingDate: ($('#quote-booking-date').val() || '').toString().trim() || null,
        progress,
        variantSelections,
        customItemsSnapshot: this.getCustomItemsSnapshot()
      };
    },

    saveSnapshot: function() {
      const self = this;
      const snapshot = this.buildSnapshot();
      let currentQuoteId = this.getCurrentQuoteId();

      // If no quote exists yet, create one first (handles race with initQuoteStorage)
      if (!currentQuoteId && typeof QuoteStorage !== 'undefined' && QuoteStorage.isReady()) {
        console.log('[Checklist] saveSnapshot: No current quote, creating one first');
        this.createQuoteFromCurrentState().then(function(saved) {
          // Now save with the new ID
          self._saveSnapshotWithId(saved.id, snapshot);
        }).catch(function(err) {
          console.warn('[Checklist] Failed to create quote for snapshot:', err);
          // Still save to localStorage as fallback
          self._saveSnapshotToLocalStorage(null, snapshot);
        });
        return;
      }

      this._saveSnapshotWithId(currentQuoteId, snapshot);
    },

    /**
     * Internal: Save snapshot to localStorage only
     * @private
     */
    _saveSnapshotToLocalStorage: function(draftId, snapshot) {
      try {
        localStorage.setItem(STORAGE_KEYS.snapshotFallback, JSON.stringify({
          draftId: draftId,
          snapshot: snapshot
        }));
      } catch (e) {
        console.warn('Snapshot fallback write failed:', e);
      }
    },

    /**
     * Internal: Save snapshot to all storage locations with given ID
     * @private
     */
    _saveSnapshotWithId: function(currentQuoteId, snapshot) {
      // Always keep a small local fallback (for quick restore if worker isn't ready)
      // CRITICAL: Wrap with draftId so we can verify on restore that it matches
      this._saveSnapshotToLocalStorage(currentQuoteId, snapshot);

      // 1. Hot backup to worker (fire-and-forget, non-blocking)
      if (this._eventWorker) {
        this._eventWorker.postMessage({ op: 'save_snapshot', snapshot });
      }

      // 2. Persist to current quote in QuoteStorage (async, parallel)
      // DEFENSIVE: Only write if QuoteStorage is fully initialized
      if (currentQuoteId && typeof QuoteStorage !== 'undefined') {
        if (QuoteStorage.isReady()) {
          QuoteStorage.updateSnapshot(currentQuoteId, snapshot).catch(function(err) {
            // Non-fatal: log but don't interrupt. Worker backup is the safety net.
            console.warn('[Checklist] QuoteStorage save failed:', err.message || err);
          });
        } else {
          // Attempt reconnect - init() is idempotent and returns cached promise
          QuoteStorage.init().then(function() {
            return QuoteStorage.updateSnapshot(currentQuoteId, snapshot);
          }).catch(function(err) {
            // Still non-fatal - we have localStorage + worker backups
            console.warn('[Checklist] QuoteStorage reconnect/save failed:', err.message || err);
          });
        }
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

      // 1. Switch tab using normal method (handles UI + generator setup)
      if (snapshot.serviceType) {
        this.switchServiceTab(snapshot.serviceType);
      }

      // 2. REBUILD ROOMS with snapshot's property config
      // This ensures DOM has the exact room structure that was saved.
      // switchServiceTab may have built rooms with CURRENT settings, but we need
      // to rebuild with the SAVED settings from the snapshot.
      if (snapshot.propertyConfig || snapshot.serviceType) {
        this._rebuildRoomsForSnapshot(snapshot);
      }

      // 3. Re-cache DOM after rebuild (selectors may have changed)
      this.cacheDOM();

      if (typeof snapshot.crew === 'string') this.$crewInput.val(snapshot.crew);
      if (typeof snapshot.date === 'string') this.$dateInput.val(snapshot.date);

      // 4. Apply checkbox states with logging to identify missing elements
      let restoredCount = 0;
      let missingCount = 0;
      if (snapshot.progress && typeof snapshot.progress === 'object') {
        for (const id in snapshot.progress) {
          const $checkbox = $('#' + id);
          if ($checkbox.length) {
            $checkbox.prop('checked', !!snapshot.progress[id]);
            if (snapshot.progress[id]) restoredCount++;
          } else {
            missingCount++;
            // Only log first 5 missing to avoid console spam
            if (missingCount <= 5) {
              console.warn('[applySnapshot] Checkbox not found:', id);
            }
          }
        }
      }

      if (missingCount > 0) {
        console.warn('[applySnapshot] ' + missingCount + ' checkboxes not found, ' + restoredCount + ' restored');
      } else if (restoredCount > 0) {
        console.log('[applySnapshot] Successfully restored ' + restoredCount + ' checkbox states');
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
        
        // Update preview text in client card header
        this.updateClientSummary();
      }

      // Restore quote service type and booking date
      if (snapshot.quoteServiceType) {
        $('#quote-service-type').val(snapshot.quoteServiceType);
      }
      if (snapshot.bookingDate) {
        $('#quote-booking-date').val(snapshot.bookingDate);
      }
      
      // Restore global service type selector
      if (snapshot.globalServiceType) {
        const globalSelector = document.getElementById('global-service-type');
        const container = document.querySelector('.service-type-selector');
        const indicatorText = document.querySelector('#service-type-indicator .indicator-text');
        
        if (globalSelector) {
          globalSelector.value = snapshot.globalServiceType;
          
          // Update indicator
          if (container) {
            container.dataset.service = snapshot.globalServiceType;
          }
          if (indicatorText) {
            const labels = {
              'eot': 'EOT Mode',
              'residential': 'Residential Mode',
              'commercial': 'Commercial Mode',
              'custom': 'Custom Mode'
            };
            indicatorText.textContent = labels[snapshot.globalServiceType] || 'Unknown';
          }
        }
      }

      this.scheduleSaveProgress();
      this.updateAllProgress();
    },

    /**
     * Rebuild room DOM to match a snapshot's property configuration.
     * Called during hydration to ensure checkboxes exist before we try to check them.
     * @param {Object} snapshot - The snapshot being applied
     * @private
     */
    _rebuildRoomsForSnapshot: function(snapshot) {
      const serviceType = snapshot.serviceType || this.getActiveServiceType();
      
      // Get property config from snapshot, or fall back to current global config
      const propertyConfig = snapshot.propertyConfig || this._getCurrentPropertyConfig();
      
      // Build config using the builder
      try {
        const config = this._buildConfigForHydration(serviceType, propertyConfig);
        if (!config || !Array.isArray(config.rooms)) {
          console.warn('[_rebuildRoomsForSnapshot] Invalid config generated');
          return;
        }

        // CRITICAL: Increment the render token to cancel any pending async rebuild.
        // Without this, switchServiceTab()'s async rebuild would complete AFTER our
        // sync rebuild and overwrite the correct rooms. See: _renderGeneratedRoomsForService()
        this._pendingGeneratedRenderToken = (this._pendingGeneratedRenderToken || 0) + 1;

        // Get or create factory for this service type
        this._generatorsByService = this._generatorsByService || {};
        const containerId = 'generated-rooms-' + serviceType;
        if (!this._generatorsByService[serviceType]) {
          this._generatorsByService[serviceType] = new AysChecklistFormFactory(containerId);
        }

        const generator = this._generatorsByService[serviceType];
        generator.regenerate(config);

        // Re-init progress bars after rebuild
        if (typeof this.initRoomProgressBars === 'function') {
          this.initRoomProgressBars();
        }
        
        // Recalculate totals after rebuild
        if (typeof this.updateAllProgress === 'function') {
          this.updateAllProgress();
        }
        if (typeof this.updateFloorSummary === 'function') {
          this.updateFloorSummary();
        }

        console.log('[_rebuildRoomsForSnapshot] Rebuilt ' + config.rooms.length + ' rooms for:', serviceType);
      } catch (err) {
        console.error('[_rebuildRoomsForSnapshot] Failed to rebuild:', err);
      }
    },

    /**
     * Get current property configuration from PROPERTY_CONFIG global or defaults.
     * @returns {Object} Property configuration object
     * @private
     */
    _getCurrentPropertyConfig: function() {
      // Use global PROPERTY_CONFIG if available
      if (typeof PROPERTY_CONFIG !== 'undefined') {
        return {
          property_type: PROPERTY_CONFIG.property_type || 'residential',
          numBedrooms: PROPERTY_CONFIG.numBedrooms || 3,
          numBathrooms: PROPERTY_CONFIG.numBathrooms || 2,
          numFloors: PROPERTY_CONFIG.numFloors || null,
          numOfficesPerFloor: PROPERTY_CONFIG.numOfficesPerFloor || null,
          numOffices: PROPERTY_CONFIG.numOffices || null,
          numShowers: PROPERTY_CONFIG.numShowers || null,
          numLoadingDocks: PROPERTY_CONFIG.numLoadingDocks || null,
          numAdminOffices: PROPERTY_CONFIG.numAdminOffices || null
        };
      }
      
      // Fallback defaults
      return {
        property_type: 'residential',
        numBedrooms: 3,
        numBathrooms: 2
      };
    },

    /**
     * Build a CHECKLIST_CONFIG for hydration purposes.
     * @param {string} serviceType - The service type (end-of-tenancy, residential, commercial)
     * @param {Object} propertyConfig - Property configuration from snapshot
     * @returns {Object|null} Config object or null on failure
     * @private
     */
    _buildConfigForHydration: function(serviceType, propertyConfig) {
      if (typeof AysChecklistConfigBuilder === 'undefined') {
        console.warn('[_buildConfigForHydration] AysChecklistConfigBuilder not loaded');
        return null;
      }

      // Determine the correct property type based on service and stored config
      const baseType = propertyConfig.property_type || 'residential';
      let targetType = baseType;

      if (serviceType === 'commercial') {
        targetType = baseType.startsWith('commercial') ? baseType : 'commercial_office';
      } else if (serviceType === 'end-of-tenancy') {
        targetType = baseType.startsWith('eot') ? baseType : 'eot_residential';
      } else if (serviceType === 'residential') {
        targetType = baseType.startsWith('residential') ? baseType : 'residential';
      }

      try {
        const builder = AysChecklistConfigBuilder.forPropertyType(targetType);

        if (propertyConfig.numBedrooms) builder.withBedroomCount(propertyConfig.numBedrooms);
        if (propertyConfig.numBathrooms) builder.withBathroomCount(propertyConfig.numBathrooms);

        if (propertyConfig.numFloors && propertyConfig.numOfficesPerFloor) {
          builder.withMultiStoryOffice(propertyConfig.numFloors, propertyConfig.numOfficesPerFloor);
        } else if (propertyConfig.numOffices) {
          builder.withOfficeCount(propertyConfig.numOffices);
        }

        if (propertyConfig.numShowers) builder.withShowerCount(propertyConfig.numShowers);
        if (propertyConfig.numLoadingDocks) builder.withLoadingDockCount(propertyConfig.numLoadingDocks);
        if (propertyConfig.numAdminOffices) builder.withAdminOfficeCount(propertyConfig.numAdminOffices);

        // Get floor defaults from storage if available
        const rawDefaults = this.getFloorDefaultsFromStorage();
        const normalizedDefaults = this.normalizeFloorDefaults(rawDefaults);
        if (normalizedDefaults && typeof builder.withFloorDefaults === 'function') {
          builder.withFloorDefaults(normalizedDefaults);
        }

        return builder.build();
      } catch (err) {
        console.error('[_buildConfigForHydration] Build failed:', err);
        return null;
      }
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
        
        // Update preview text after restoring
        this.updateClientSummary();
      } catch (e) {
        console.warn('Client context restore failed:', e);
      }
    },

    // ======== QUOTE MANAGEMENT HELPERS ========

    /**
     * Get the current working quote ID.
     * @returns {string|null}
     */
    getCurrentQuoteId: function() {
      return localStorage.getItem(STORAGE_KEYS.currentQuoteId) || null;
    },

    /**
     * Set the current working quote ID.
     * @param {string|null} id
     */
    setCurrentQuoteId: function(id) {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.currentQuoteId, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.currentQuoteId);
      }
      // Update header display
      this.updateQuoteIdDisplay(id);
    },

    /**
     * Update the Quote ID badge in the header.
     * @param {string|null} id - The quote ID or null
     */
    updateQuoteIdDisplay: function(id) {
      var badge = document.getElementById('current-quote-id');
      if (badge) {
        badge.textContent = id ? '#' + id : '---';
        badge.title = id ? 'Quote ID: ' + id : 'No active quote';
      }
    },

    /**
     * Start a new quote: save current if needed, clear form, create new quote.
     * @returns {Promise<Object>} The new quote
     */
    startNewQuote: function() {
      var self = this;
      
      // DEFENSIVE: Check both existence AND ready state
      if (typeof QuoteStorage === 'undefined' || !QuoteStorage.isReady()) {
        return Promise.reject(new Error('QuoteStorage not ready'));
      }

      // Save current state first
      var currentId = this.getCurrentQuoteId();
      var savePromise = currentId 
        ? QuoteStorage.updateSnapshot(currentId, this.buildSnapshot())
        : Promise.resolve();

      return savePromise
        .catch(function(err) {
          console.warn('[Checklist] Failed to save current quote before new:', err);
        })
        .then(function() {
          // Clear form to defaults
          self.clearForm();
          
          // Create new quote from empty state
          var snapshot = self.buildSnapshot();
          var quote = QuoteStorage.createQuote(snapshot);
          
          return QuoteStorage.save(quote).then(function(saved) {
            self.setCurrentQuoteId(saved.id);
            console.log('[Checklist] Started new quote:', saved.id);
            return saved;
          });
        });
    },

    /**
     * Load a quote by ID into the form.
     * @param {number|string} quoteId - Quote ID (will be parsed to integer)
     * @returns {Promise<Object>} The loaded quote
     */
    loadQuote: function(quoteId) {
      var self = this;
      
      // CRITICAL: IndexedDB uses integer keys with autoIncrement
      // DOM attributes return strings, so we must parse to int
      var numericId = parseInt(quoteId, 10);
      if (isNaN(numericId)) {
        return Promise.reject(new Error('Invalid quote ID: ' + quoteId));
      }
      
      // DEFENSIVE: Check both existence AND ready state
      if (typeof QuoteStorage === 'undefined' || !QuoteStorage.isReady()) {
        return Promise.reject(new Error('QuoteStorage not ready'));
      }

      // Save current state first
      var currentId = this.getCurrentQuoteId();
      var currentNumericId = currentId ? parseInt(currentId, 10) : null;
      var savePromise = (currentNumericId && currentNumericId !== numericId)
        ? QuoteStorage.updateSnapshot(currentNumericId, this.buildSnapshot())
        : Promise.resolve();

      return savePromise
        .catch(function(err) {
          console.warn('[Checklist] Failed to save current quote before load:', err);
        })
        .then(function() {
          return QuoteStorage.get(numericId);
        })
        .then(function(quote) {
          if (!quote) {
            throw new Error('Quote not found: ' + quoteId);
          }
          
          // Apply the snapshot to restore form state
          if (quote.snapshot) {
            self.applySnapshot(quote.snapshot);
          }
          
          self.setCurrentQuoteId(quote.id);
          
          // CRITICAL: Update localStorage fallback with loaded quote's snapshot
          // This ensures localStorage and currentQuoteId stay in sync after load
          try {
            localStorage.setItem(STORAGE_KEYS.snapshotFallback, JSON.stringify({
              draftId: quote.id,
              snapshot: quote.snapshot
            }));
          } catch (e) {
            console.warn('[Checklist] Failed to update localStorage after load:', e);
          }
          
          console.log('[Checklist] Loaded quote:', quote.id, quote.displayName);
          return quote;
        });
    },

    /**
     * Clear the form to start fresh.
     */
    clearForm: function() {
      // Clear checkboxes
      this.$wrapper.find('.checklist-item input[type="checkbox"]').prop('checked', false);
      
      // Clear client fields
      $('#quote-client-id').val('');
      $('#quote-population-id').val('');
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
      
      // Clear variant selections
      localStorage.removeItem(STORAGE_KEYS.variantSelections);
      this.$wrapper.find('.variant-dropdown').val('');
      
      // Reset date to today
      this.$dateInput.val(new Date().toISOString().split('T')[0]);
      
      // Clear crew
      this.$crewInput.val('');
      
      // Clear client context
      localStorage.removeItem(STORAGE_KEYS.clientContext);
    },

    // ======== QUOTE MANAGER UI ========

    /**
     * Initialize the Manage Quotes panel in Settings.
     * Binds events and renders initial list.
     */
    initQuoteManager: function() {
      var self = this;
      var container = document.getElementById('quote-list-container');
      
      if (!container) {
        console.log('[Checklist] Quote list container not found, skipping QuoteManager init');
        return;
      }

      // Update header quote ID display
      this.updateQuoteIdDisplay(this.getCurrentQuoteId());

      // Render initial list
      this.renderQuoteList();

      // Bind New Quote button
      $('#btn-new-quote').on('click', function() {
        self.startNewQuote()
          .then(function() {
            self.renderQuoteList();
            // Switch to main tab to work on the new quote
            self.announce('New quote started');
          })
          .catch(function(err) {
            console.error('[Checklist] Failed to start new quote:', err);
            alert('Failed to start new quote. Please try again.');
          });
      });

      // Bind header New Quote button (+)
      $('#btn-new-quote-header').on('click', function() {
        self.startNewQuote()
          .then(function() {
            self.renderQuoteList();
            self.announce('New quote started');
          })
          .catch(function(err) {
            console.error('[Checklist] Failed to start new quote:', err);
            alert('Failed to start new quote. Please try again.');
          });
      });

      // Bind Sync All button
      $('#btn-sync-all-quotes').on('click', function() {
        self.flushEventQueue();
        self.announce('Syncing all quotes...');
      });

      // Bind bulk action apply
      $('#btn-apply-bulk-action').on('click', function() {
        self.applyBulkQuoteAction();
      });

      // Bind select all checkbox
      $('#quote-select-all').on('change', function() {
        var checked = $(this).prop('checked');
        $('#quote-list-container input[type="checkbox"]').prop('checked', checked);
      });

      // Delegate click on quote panel summary (load quote)
      $(container).on('click', '.quote-panel-load-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var quoteId = $(this).closest('.quote-panel').attr('data-quote-id');
        if (quoteId) {
          self.loadQuote(quoteId)
            .then(function() {
              self.renderQuoteList();
              // Switch to the service tab to work on the quote
              var serviceTab = document.querySelector('.service-tabs .tab.is-active');
              if (serviceTab) {
                serviceTab.click();
              }
              self.announce('Quote loaded');
            })
            .catch(function(err) {
              console.error('[Checklist] Failed to load quote:', err);
              alert('Failed to load quote. Please try again.');
            });
        }
      });

      // Delegate click on delete button
      $(container).on('click', '.quote-panel-delete-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var quoteId = $(this).closest('.quote-panel').attr('data-quote-id');
        if (quoteId && confirm('Delete this quote? This cannot be undone.')) {
          self.deleteQuote(quoteId);
        }
      });

      console.log('[Checklist] QuoteManager initialized');
    },

    /**
     * Render the quote list from IndexedDB.
     * Waits for QuoteStorage to be ready if needed.
     */
    renderQuoteList: function() {
      var self = this;
      var container = document.getElementById('quote-list-container');
      
      if (!container) {
        console.warn('[Checklist] Quote list container not found');
        return;
      }
      
      // Check if QuoteStorage exists
      if (typeof QuoteStorage === 'undefined') {
        container.innerHTML = '<p style="color: var(--color-secondary); padding: var(--space-md); text-align: center;">Quote storage not available.</p>';
        return;
      }

      // If not ready yet, wait for it
      if (!QuoteStorage.isReady()) {
        container.innerHTML = '<p style="color: var(--color-secondary); padding: var(--space-md); text-align: center;">Loading quotes...</p>';
        
        // Wait for QuoteStorage to be ready, then render
        QuoteStorage.whenReady()
          .then(function() {
            self.renderQuoteList();  // Recursive call now that it's ready
          })
          .catch(function(err) {
            console.error('[Checklist] QuoteStorage failed to init:', err);
            container.innerHTML = '<p style="color: #ef4444; padding: var(--space-md); text-align: center;">Failed to load quote storage.</p>';
          });
        return;
      }

      QuoteStorage.getAll({ sortBy: 'updatedAt', sortOrder: 'desc' })
        .then(function(quotes) {
          if (!quotes || quotes.length === 0) {
            container.innerHTML = '<p style="color: var(--color-secondary); padding: var(--space-md); text-align: center; font-style: italic;">No quotes yet. Click "➕ New Quote" to get started.</p>';
            return;
          }

          var currentId = self.getCurrentQuoteId();
          var currentNumericId = currentId ? parseInt(currentId, 10) : null;
          var html = quotes.map(function(quote) {
            return self.buildQuotePanelHTML(quote, quote.id === currentNumericId);
          }).join('');
          
          container.innerHTML = html;
        })
        .catch(function(err) {
          console.error('[Checklist] Failed to load quotes:', err);
          container.innerHTML = '<p style="color: #ef4444; padding: var(--space-md); text-align: center;">Failed to load quotes. Please refresh the page.</p>';
        });
    },

    /**
     * Build HTML for a single quote panel.
     * @param {Object} quote - Quote object from QuoteStorage
     * @param {boolean} isCurrent - Whether this is the currently active quote
     * @returns {string} HTML string
     */
    buildQuotePanelHTML: function(quote, isCurrent) {
      var statusColors = {
        draft: '#f59e0b',
        synced: '#22c55e',
        syncing: '#3b82f6',
        error: '#ef4444'
      };
      
      var serviceLabels = {
        'end-of-tenancy': 'EOT',
        'residential': 'Res',
        'commercial': 'Comm'
      };

      var status = quote.status || 'draft';
      var statusColor = statusColors[status] || statusColors.draft;
      var serviceLabel = serviceLabels[quote.serviceType] || 'Quote';
      var displayName = quote.displayName || '(untitled)';
      var timeAgo = this.formatTimeAgo(quote.updatedAt);
      var statusLabel = status.toUpperCase();
      
      // Highlight current quote
      var borderStyle = isCurrent 
        ? 'border: 2px solid ' + statusColor + '; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);'
        : 'border: 2px solid ' + statusColor + ';';
      
      var currentBadge = isCurrent 
        ? '<span style="font-size: 10px; padding: 2px 6px; background: #3b82f6; color: white; border-radius: 4px; margin-left: 8px;">CURRENT</span>'
        : '';

      return '<details class="quote-panel" data-quote-id="' + this.escapeHtml(quote.id) + '" data-status="' + status + '" style="' + borderStyle + ' border-radius: 8px; margin-bottom: 8px;">' +
        '<summary style="display: flex; gap: 12px; align-items: center; padding: 12px; cursor: pointer; list-style: none;">' +
          '<input type="checkbox" class="quote-checkbox" onclick="event.stopPropagation()" />' +
          '<span style="color: ' + statusColor + ';">●</span>' +
          '<span style="font-weight: 600; flex: 1;">' + this.escapeHtml(displayName) + currentBadge + '</span>' +
          '<span style="font-size: 12px; padding: 2px 8px; background: var(--color-light); border-radius: 4px;">' + serviceLabel + '</span>' +
          '<span style="font-size: 11px; padding: 2px 10px; background: ' + statusColor + '; color: white; border-radius: 12px;">' + statusLabel + '</span>' +
          '<span style="font-size: 12px; color: var(--color-secondary);">' + timeAgo + '</span>' +
          '<span class="quote-chevron">▸</span>' +
        '</summary>' +
        '<div style="padding: 16px; border-top: 1px solid var(--color-border); background: var(--color-light);">' +
          this.buildQuoteDetailsHTML(quote, isCurrent) +
        '</div>' +
      '</details>';
    },

    /**
     * Build the expanded details HTML for a quote panel.
     * @param {Object} quote
     * @param {boolean} isCurrent
     * @returns {string} HTML string
     */
    buildQuoteDetailsHTML: function(quote, isCurrent) {
      var snapshot = quote.snapshot || {};
      var client = snapshot.client || {};
      
      // Address can be at snapshot.address OR snapshot.client.address
      var address = snapshot.address || client.address || {};
      
      var addressLines = [
        address.line1 || address.address_line1,
        address.line2 || address.address_line2,
        address.suburb,
        address.city,
        address.postcode
      ].filter(Boolean).join(', ') || '(no address)';

      var clientName = client.name || snapshot.clientId || '(no name)';
      var clientEmail = client.email || '';
      var clientPhone = client.phone || '';
      
      var loadBtnText = isCurrent ? '✓ Currently Editing' : '📂 Load This Quote';
      var loadBtnDisabled = isCurrent ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';

      return '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-md);">' +
          '<div>' +
            '<div style="font-size: 11px; color: var(--color-secondary); text-transform: uppercase; margin-bottom: 4px;">Client</div>' +
            '<div style="font-weight: 500;">' + this.escapeHtml(clientName) + '</div>' +
            (clientEmail ? '<div style="font-size: 13px; color: var(--color-secondary);">' + this.escapeHtml(clientEmail) + '</div>' : '') +
            (clientPhone ? '<div style="font-size: 13px; color: var(--color-secondary);">' + this.escapeHtml(clientPhone) + '</div>' : '') +
          '</div>' +
          '<div>' +
            '<div style="font-size: 11px; color: var(--color-secondary); text-transform: uppercase; margin-bottom: 4px;">Address</div>' +
            '<div style="font-size: 13px;">' + this.escapeHtml(addressLines) + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; gap: var(--space-sm);">' +
          '<button type="button" class="btn btn-primary quote-panel-load-btn" ' + loadBtnDisabled + '>' + loadBtnText + '</button>' +
          '<button type="button" class="btn btn-secondary quote-panel-delete-btn" style="color: #ef4444;">🗑️ Delete</button>' +
        '</div>';
    },

    /**
     * Format a timestamp as relative time (e.g., "2 hours ago", "yesterday").
     * @param {string} isoString - ISO timestamp
     * @returns {string}
     */
    formatTimeAgo: function(isoString) {
      if (!isoString) return '';
      
      var date = new Date(isoString);
      var now = new Date();
      var diffMs = now - date;
      var diffMins = Math.floor(diffMs / 60000);
      var diffHours = Math.floor(diffMs / 3600000);
      var diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return diffMins + ' min ago';
      if (diffHours < 24) return diffHours + ' hour' + (diffHours === 1 ? '' : 's') + ' ago';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return diffDays + ' days ago';
      
      // Fallback to date
      return date.toLocaleDateString();
    },

    /**
     * Delete a quote and refresh the list.
     * @param {number|string} quoteId - Quote ID (will be parsed to integer)
     */
    deleteQuote: function(quoteId) {
      var self = this;
      
      // CRITICAL: IndexedDB uses integer keys with autoIncrement
      var numericId = parseInt(quoteId, 10);
      if (isNaN(numericId)) {
        alert('Invalid quote ID');
        return;
      }
      
      if (typeof QuoteStorage === 'undefined' || !QuoteStorage.isReady()) {
        alert('Quote storage not ready. Please try again.');
        return;
      }

      // If deleting current quote, clear current ID
      var currentId = this.getCurrentQuoteId();
      var currentNumericId = currentId ? parseInt(currentId, 10) : null;
      
      QuoteStorage.remove(numericId)
        .then(function() {
          if (numericId === currentNumericId) {
            self.setCurrentQuoteId(null);
            // Create a new quote so user isn't left with nothing
            return self.createQuoteFromCurrentState();
          }
        })
        .then(function() {
          self.renderQuoteList();
          self.announce('Quote deleted');
        })
        .catch(function(err) {
          console.error('[Checklist] Failed to delete quote:', err);
          alert('Failed to delete quote. Please try again.');
        });
    },

    /**
     * Apply the selected bulk action to checked quotes.
     */
    applyBulkQuoteAction: function() {
      var self = this;
      var action = $('#quote-bulk-action').val();
      
      if (!action) {
        alert('Please select an action.');
        return;
      }

      var selectedIds = [];
      $('#quote-list-container .quote-checkbox:checked').each(function() {
        var id = $(this).closest('.quote-panel').attr('data-quote-id');
        // CRITICAL: Parse to integer for IndexedDB
        if (id) selectedIds.push(parseInt(id, 10));
      });

      if (selectedIds.length === 0) {
        alert('Please select at least one quote.');
        return;
      }

      if (action === 'delete') {
        if (!confirm('Delete ' + selectedIds.length + ' quote(s)? This cannot be undone.')) {
          return;
        }
        
        QuoteStorage.removeMany(selectedIds)
          .then(function(count) {
            // If we deleted the current quote, create a new one
            var currentId = self.getCurrentQuoteId();
            var currentNumericId = currentId ? parseInt(currentId, 10) : null;
            if (currentNumericId && selectedIds.indexOf(currentNumericId) !== -1) {
              self.setCurrentQuoteId(null);
              return self.createQuoteFromCurrentState();
            }
          })
          .then(function() {
            self.renderQuoteList();
            self.announce(selectedIds.length + ' quote(s) deleted');
            $('#quote-bulk-action').val('');
            $('#quote-select-all').prop('checked', false);
          })
          .catch(function(err) {
            console.error('[Checklist] Bulk delete failed:', err);
            alert('Some quotes could not be deleted. Please try again.');
          });
      } else if (action === 'sync') {
        // For now, just trigger a general sync
        self.flushEventQueue();
        self.announce('Syncing...');
        $('#quote-bulk-action').val('');
        $('#quote-select-all').prop('checked', false);
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
        },
        floor_variants: {
          carpet: { price: 0 },
          wood: { price: 0 },
          lino: { price: 0 },
          tile: { price: 0 }
        },
        floor_types: {
          carpet: { price: 0 },
          wood: { price: 0 },
          lino: { price: 0 },
          tile: { price: 0 },
          concrete: { price: 0 },
          other: { price: 0 }
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

      const group = VARIANTS[optionsKey] || VARIANTS.floor_variants;
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
        const parsed = JSON.parse(raw);
        
        // CRITICAL: Verify draftId matches current quote to prevent cross-quote contamination
        // Supports both old format (raw snapshot) and new format (wrapped with draftId)
        const currentQuoteId = this.getCurrentQuoteId();
        let snapshot;
        
        if (parsed && typeof parsed.draftId !== 'undefined' && parsed.snapshot) {
          // New wrapped format
          // Use == for comparison to handle number vs string (IndexedDB returns number, localStorage returns string)
          if (String(parsed.draftId) !== String(currentQuoteId)) {
            console.log('[Checklist] Snapshot draftId mismatch (stored:', parsed.draftId, 'current:', currentQuoteId, '), skipping restore');
            return;
          }
          snapshot = parsed.snapshot;
        } else {
          // Legacy format (raw snapshot without draftId) - allow it for migration
          console.log('[Checklist] Legacy snapshot format, applying without ID verification');
          snapshot = parsed;
        }
        
        this.applySnapshot(snapshot);
      } catch (e) {
        console.warn('Snapshot restore failed:', e);
      }
    },

    /**
     * Verify quote storage is ready and current quote exists (if set).
     * DOES NOT create a new quote eagerly - that happens on first save.
     * This prevents orphan records when users just open the page without doing anything.
     */
    initQuoteStorage: function() {
      var self = this;
      
      // DEFENSIVE: Check QuoteStorage exists
      if (typeof QuoteStorage === 'undefined') {
        return;
      }

      // Wait for QuoteStorage to be ready (handles async timing)
      QuoteStorage.whenReady().then(function() {
        var currentId = self.getCurrentQuoteId();
        
        if (currentId) {
          // Verify quote still exists
          QuoteStorage.get(currentId).then(function(quote) {
            if (!quote) {
              // Quote was deleted - clear the stale ID
              // New quote will be created lazily on first save
              console.log('[Checklist] Quote', currentId, 'not found, clearing stale ID');
              self.setCurrentQuoteId(null);
            } else {
              console.log('[Checklist] Current quote verified:', currentId);
            }
          }).catch(function(err) {
            console.warn('[Checklist] Quote check failed:', err);
          });
        } else {
          // No current quote - that's fine, will be created on first save
          // This is LAZY creation - no orphan records
          console.log('[Checklist] No current quote, will create on first save');
        }
      }).catch(function(err) {
        console.warn('[Checklist] QuoteStorage init failed:', err);
      });
    },

    /**
     * Create a quote from the current form state and set it as current.
     * @returns {Promise<Object>}
     */
    createQuoteFromCurrentState: function() {
      var self = this;
      
      // DEFENSIVE: Check both existence AND ready state
      if (typeof QuoteStorage === 'undefined' || !QuoteStorage.isReady()) {
        return Promise.reject(new Error('QuoteStorage not ready'));
      }

      var snapshot = this.buildSnapshot();
      var quote = QuoteStorage.createQuote(snapshot);
      
      return QuoteStorage.save(quote).then(function(saved) {
        self.setCurrentQuoteId(saved.id);
        console.log('[Checklist] Created quote from current state:', saved.id, saved.displayName);
        return saved;
      }).catch(function(err) {
        console.error('[Checklist] Failed to create quote:', err);
        throw err;
      });
    },

    /**
     * Enable swipe/drag horizontal scrolling for the service tabs.
     * CSS overflow does most of the work; this adds "drag strip" behavior and
     * prevents accidental tab clicks when the user is dragging.
     */
    initServiceTabsScroller: function() {
      const tabsContainer = document.querySelector('.service-tabs');
      if (!tabsContainer) return;
      if (tabsContainer.dataset.aysTabsScrollerInit === '1') return;
      tabsContainer.dataset.aysTabsScrollerInit = '1';

      // Touch devices already get good momentum scrolling via CSS overflow.
      // We only add "drag-to-scroll" for mouse users.
      tabsContainer.classList.add('is-draggable');

      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let didMove = false;
      const MOVE_THRESHOLD = 6;

      const getClientX = (e) => {
        if (e && e.touches && e.touches.length) return e.touches[0].clientX;
        return e.clientX;
      };

      const onDown = (e) => {
        // Drag-to-scroll is for mouse/trackpad. Touch should use native overflow scrolling.
        // In device emulation, the mouse may be reported as a touch pointer; using mouse
        // events (below) ensures this still works while testing.
        if (typeof e.button === 'number' && e.button !== 0) return;
        isDown = true;
        didMove = false;
        startX = getClientX(e);
        startScrollLeft = tabsContainer.scrollLeft;
        tabsContainer.classList.add('is-dragging');
      };

      const onMove = (e) => {
        if (!isDown) return;
        const x = getClientX(e);
        const dx = x - startX;
        if (!didMove && Math.abs(dx) > MOVE_THRESHOLD) didMove = true;
        if (!didMove) return;

        tabsContainer.scrollLeft = startScrollLeft - dx;
        if (e.cancelable) e.preventDefault();
      };

      const onUp = () => {
        isDown = false;
        tabsContainer.classList.remove('is-dragging');
      };

      // Mouse drag (works in desktop + mobile emulation)
      tabsContainer.addEventListener('mousedown', onDown, { passive: true });
      tabsContainer.addEventListener('mousemove', onMove, { passive: false });
      window.addEventListener('mouseup', onUp, { passive: true });

      // Edge-fade affordance: indicate overflow + hide fades when at ends
      let rafPending = false;
      const updateOverflowClasses = () => {
        rafPending = false;
        const maxScrollLeft = tabsContainer.scrollWidth - tabsContainer.clientWidth;
        const hasOverflow = maxScrollLeft > 1;
        tabsContainer.classList.toggle('has-overflow', hasOverflow);

        if (!hasOverflow) {
          tabsContainer.classList.remove('is-at-start');
          tabsContainer.classList.remove('is-at-end');
          return;
        }

        const left = tabsContainer.scrollLeft;
        tabsContainer.classList.toggle('is-at-start', left <= 1);
        tabsContainer.classList.toggle('is-at-end', left >= maxScrollLeft - 1);
      };

      const scheduleOverflowUpdate = () => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(updateOverflowClasses);
      };

      // Initial + ongoing updates
      updateOverflowClasses();
      tabsContainer.addEventListener('scroll', scheduleOverflowUpdate, { passive: true });
      window.addEventListener('resize', scheduleOverflowUpdate, { passive: true });

      // If the user was dragging, don't treat the following click as a tab activation.
      // Capture phase so it runs before the delegated .tab click handler.
      tabsContainer.addEventListener(
        'click',
        (e) => {
          if (!didMove) return;
          e.stopPropagation();
          e.preventDefault();
          didMove = false;
        },
        true
      );
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

      // Enable swipe/drag scrolling for the tab strip
      this.initServiceTabsScroller();

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
          const $item = $checkbox.closest('.checklist-item');

          self.updateVariantDropdownVisibility($item, checked);
          if (!checked) {
            const $dropdown = $item.find('.variant-dropdown');
            if ($dropdown.length) {
              $dropdown.val('');
              $item.attr('data-selected-variant', '');
              self.updateFloorActionLabel($item, '', false);
              try {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.variantSelections) || '{}');
                delete current[id];
                localStorage.setItem(STORAGE_KEYS.variantSelections, JSON.stringify(current));
              } catch (_) {
                // ignore
              }
            }
          }

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
          self.updateFloorSummary();
        });

      // Details open/close with smooth height animation
      $(document)
        .off('toggle.checklistDetails', 'details')
        .on('toggle.checklistDetails', 'details', function() {
          const $details = $(this);
          const $content = $details.find('.room-details');

          if (!$content.length) return;

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

          const isChecked = $item.find('input[type="checkbox"]').is(':checked');
          self.updateFloorActionLabel($item, selected, isChecked);
          self.scheduleSnapshot(250);
          self.updateFloorSummary();
        });

      // Apply floor type to other rooms
      $(document)
        .off('change.checklistVariantApply', '.checklist-item .variant-apply-scope')
        .on('change.checklistVariantApply', '.checklist-item .variant-apply-scope', function() {
          const $select = $(this);
          const scope = ($select.val() || '').toString();
          if (!scope) return;

          const $item = $select.closest('.checklist-item');
          const $checkbox = $item.find('input[type="checkbox"]');
          const checked = $checkbox.is(':checked');
          const optionsKey = ($item.data('optionsKey') || $item.data('variantKey') || '').toString();
          const selectedVariant = ($item.attr('data-selected-variant') || $item.find('.variant-dropdown').val() || '').toString();

          const roomId = ($item.closest('details').data('room') || '').toString();
          const roomType = roomId.replace(/-\d+$/, '').replace(/\d+$/, '');

          const $scopeRoot = $('.service-tab-content.is-active');
          $scopeRoot.find('.checklist-item').each((_, el) => {
            const $targetItem = $(el);
            if ($targetItem.is($item)) return;

            const targetOptionsKey = ($targetItem.data('optionsKey') || $targetItem.data('variantKey') || '').toString();
            if (targetOptionsKey !== optionsKey) return;

            const targetRoomId = ($targetItem.closest('details').data('room') || '').toString();
            const targetRoomType = targetRoomId.replace(/-\d+$/, '').replace(/\d+$/, '');

            if (scope === 'room-type' && targetRoomType !== roomType) return;

            const $targetCheckbox = $targetItem.find('input[type="checkbox"]');
            if ($targetCheckbox.length) {
              $targetCheckbox.prop('checked', checked).trigger('change');
            }

            if (checked && selectedVariant) {
              const $targetDropdown = $targetItem.find('.variant-dropdown');
              if ($targetDropdown.length && $targetDropdown.find(`option[value="${selectedVariant}"]`).length) {
                $targetDropdown.val(selectedVariant).trigger('change');
              }
            }
          });

          $select.val('');
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

      // ======== CLIENT FIELDS AUTO-SAVE ========
      // Save client context as user types — don't wait for "Generate Quote"
      const clientFieldSelectors = [
        '#quote-client-name',
        '#quote-client-email', 
        '#quote-client-phone',
        '#quote-address-line1',
        '#quote-address-line2',
        '#quote-suburb',
        '#quote-city',
        '#quote-region',
        '#quote-postcode',
        '#quote-country'
      ].join(', ');

      let clientSaveTimeout = null;
      const scheduleClientSave = function() {
        if (clientSaveTimeout) clearTimeout(clientSaveTimeout);
        clientSaveTimeout = setTimeout(function() {
          self.persistClientContext({
            client_id: ($('#quote-client-id').val() || '').toString().trim() || null,
            population_id: ($('#quote-population-id').val() || '').toString().trim() || null,
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
          // Also update the summary display in Quote section
          self.updateClientSummary();
        }, 300); // 300ms debounce
      };

      $(document).on('input change', clientFieldSelectors, scheduleClientSave);
    },

    /**
     * Update client summary display in Quote section and preview text
     */
    updateClientSummary: function() {
      const name = ($('#quote-client-name').val() || '').toString().trim();
      const phone = ($('#quote-client-phone').val() || '').toString().trim();
      const email = ($('#quote-client-email').val() || '').toString().trim();
      
      const addr1 = ($('#quote-address-line1').val() || '').toString().trim();
      const suburb = ($('#quote-suburb').val() || '').toString().trim();
      const city = ($('#quote-city').val() || '').toString().trim();
      const postcode = ($('#quote-postcode').val() || '').toString().trim();
      
      const addressParts = [addr1, suburb, city, postcode].filter(Boolean);
      const address = addressParts.length ? addressParts.join(', ') : '';
      
      // Update Quote section summary
      $('#summary-client-name').text(name || '—');
      $('#summary-client-phone').text(phone || '—');
      $('#summary-client-email').text(email || '—');
      $('#summary-client-address').text(address || '—');
      
      // Update collapsed card preview
      if (name) {
        $('#client-preview').text(name + (phone ? ' • ' + phone : ''));
      } else {
        $('#client-preview').text('New Client');
      }
      
      // Update address preview
      if (address) {
        $('#address-preview').text(address.length > 40 ? address.substring(0, 40) + '…' : address);
      } else {
        $('#address-preview').text('Tap to add');
      }
    },

    /**
     * Save checkbox states to localStorage
     */
    saveProgress: function() {
      // Use fresh selector — cached this.$items may be stale after room rebuild
      const $checkboxes = $('.checklist-item input[type="checkbox"]');
      
      // Guard: skip if no checkboxes exist yet (DOM not ready)
      if ($checkboxes.length === 0) return;
      
      const progress = {};
      $checkboxes.each(function() {
        const id = $(this).attr('id');
        if (id) {
          progress[id] = $(this).prop('checked');
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
                  $dropdown.prop('hidden', false);
                  $dropdown.prop('disabled', false);
                  $dropdown.removeAttr('style');
                } else {
                  $dropdown.prop('hidden', true);
                  $dropdown.prop('disabled', true);
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
          const isChecked = $checkbox.is(':checked');
          this.updateFloorActionLabel($item, selections[checkboxId] || '', isChecked);
        }
      } catch (e) {
        console.warn('Error restoring variant selections:', e);
      }

      // Load meta info
      const crew = localStorage.getItem(STORAGE_KEYS.crew);
      const date = localStorage.getItem(STORAGE_KEYS.date);
      if (crew) this.$crewInput.val(crew);
      if (date) this.$dateInput.val(date);

      if (typeof this.updateFloorSummary === 'function') {
        this.updateFloorSummary();
      }
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

      // Keep the selected tab visible in the horizontally scrollable strip
      try {
        const selectedTab = document.querySelector('.service-tabs .tab.is-tab-selected');
        if (selectedTab && typeof selectedTab.scrollIntoView === 'function') {
          selectedTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      } catch (_) {
        // ignore
      }

      // Hide all service content tabs
      $('.service-tab-content').removeClass('is-active');

      // Show selected service content tab
      $('#service-' + serviceType).addClass('is-active');

      // Collapse all disclosure cards in the newly activated tab (mobile-friendly default)
      try {
        $('#service-' + serviceType).find('details').prop('open', false);
      } catch (e) {
        // Non-fatal: tab switching should still work
      }

      // Save preference to localStorage
      localStorage.setItem(STORAGE_KEYS.serviceType, serviceType);

      // If this tab supports generated rooms, swap the active generator to it.
      // (For settings/quotes/custom tabs, no generator swap occurs.)
      try {
        this.setActiveChecklistGenerator(serviceType);
      } catch (_) {
        // ignore
      }

      // Re-cache DOM elements for the active tab
      this.cacheDOM();
      this.updateAllProgress();
      this.updateFloorSummary();
      
      // Update client summary when switching tabs (especially for Quote tab)
      this.updateClientSummary();
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
      
      // Use the database ID as the quote ID (single source of truth)
      // Format: Q-{database_id} for display purposes
      const draftId = this.getCurrentQuoteId();
      const quoteId = draftId ? ('Q-' + draftId) : ('Q-UNSAVED');
      
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
        carpark_open_price: $('#setting-carpark-open-price').val(),
        carpark_covered_price: $('#setting-carpark-covered-price').val(),
        surcharge_single_oven: $('#surcharge-single-oven').val(),
        surcharge_double_oven: $('#surcharge-double-oven').val(),
        surcharge_windows: $('#surcharge-windows').val(),
        surcharge_windows_2br_hours: $('#surcharge-windows-2br-hours').val(),
        surcharge_windows_2br: $('#surcharge-windows-2br').val(),
        surcharge_windows_3br_hours: $('#surcharge-windows-3br-hours').val(),
        surcharge_windows_3br: $('#surcharge-windows-3br').val(),
        surcharge_windows_4br_hours: $('#surcharge-windows-4br-hours').val(),
        surcharge_windows_4br: $('#surcharge-windows-4br').val(),
        surcharge_windows_2story_hours: $('#surcharge-windows-2story-hours').val(),
        surcharge_windows_2story: $('#surcharge-windows-2story').val(),
        surcharge_carpet: $('#surcharge-carpet').val(),
        surcharge_drawers: $('#surcharge-drawers').val(),
        surcharge_garage: $('#surcharge-garage').val(),
        service_api_endpoint: ($('#system-service-api-endpoint').val() || $('#service-api-endpoint').val())
      };
      
      localStorage.setItem('checklist_settings', JSON.stringify(settings));

      this.applyTheme(settings.theme);
      
      // Initialize VariantManager with new settings
      if (window.VariantManager) {
        window.VariantManager.init(settings);
      }

      if (this._eventWorker) {
        this._eventWorker.postMessage({
          op: 'config',
          config: {
            endpoint: settings.service_api_endpoint || null
          }
        });
        this.flushEventQueue();
      }

      if (settings.service_api_endpoint) {
        this.saveEndpointToIdb(settings.service_api_endpoint);
      }
      this.updateEndpointBanner();
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
      $('#setting-carpark-open-price').val('40');
      $('#setting-carpark-covered-price').val('180');
      $('#surcharge-single-oven').val('150');
      $('#surcharge-double-oven').val('200');
      $('#surcharge-windows').val('65');
      $('#surcharge-carpet').val('52');
      $('#surcharge-drawers').val('50');
      $('#surcharge-garage').val('100');
      $('#service-api-endpoint').val('');
      $('#system-service-api-endpoint').val('');
      
      localStorage.removeItem('checklist_settings');
      this.saveEndpointToIdb('');
      this.updateEndpointBanner();

      // Return to explicit light theme after reset.
      this.applyTheme('light');
      alert('Settings reset to defaults!');
    },

    registerServiceWorker: function() {
      if (!('serviceWorker' in navigator)) return;
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {
          // silent fail
        });
      });
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
    
    // Initialize VariantManager with current settings
    const settings = Checklist.getSettings();
    if (window.VariantManager && settings) {
      window.VariantManager.init(settings);
    }
    
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
        '2br': { hours: 0.75, charge: 120, label: '2BR' },
        '3br': { hours: 1.0, charge: 150, label: '3BR' },
        '4br': { hours: 1.5, charge: 180, label: '4BR' },
        '2story': { hours: 2.0, charge: 240, label: '2-Story' }
      }
    },
    
    // Initialize from settings — call this on app startup and when settings change
    init: function(settings) {
      if (!settings) return;
      
      // Load window pricing & hours from settings (BR-specific multipliers)
      if (settings.surcharge_windows_2br_hours !== undefined && settings.surcharge_windows_2br_hours !== null) {
        this.variants.windows['2br'].hours = parseFloat(settings.surcharge_windows_2br_hours) || 0.75;
      }
      if (settings.surcharge_windows_2br !== undefined && settings.surcharge_windows_2br !== null) {
        this.variants.windows['2br'].charge = parseInt(settings.surcharge_windows_2br) || 120;
      }
      
      if (settings.surcharge_windows_3br_hours !== undefined && settings.surcharge_windows_3br_hours !== null) {
        this.variants.windows['3br'].hours = parseFloat(settings.surcharge_windows_3br_hours) || 1.0;
      }
      if (settings.surcharge_windows_3br !== undefined && settings.surcharge_windows_3br !== null) {
        this.variants.windows['3br'].charge = parseInt(settings.surcharge_windows_3br) || 150;
      }
      
      if (settings.surcharge_windows_4br_hours !== undefined && settings.surcharge_windows_4br_hours !== null) {
        this.variants.windows['4br'].hours = parseFloat(settings.surcharge_windows_4br_hours) || 1.5;
      }
      if (settings.surcharge_windows_4br !== undefined && settings.surcharge_windows_4br !== null) {
        this.variants.windows['4br'].charge = parseInt(settings.surcharge_windows_4br) || 180;
      }
      
      if (settings.surcharge_windows_2story_hours !== undefined && settings.surcharge_windows_2story_hours !== null) {
        this.variants.windows['2story'].hours = parseFloat(settings.surcharge_windows_2story_hours) || 2.0;
      }
      if (settings.surcharge_windows_2story !== undefined && settings.surcharge_windows_2story !== null) {
        this.variants.windows['2story'].charge = parseInt(settings.surcharge_windows_2story) || 240;
      }
      
      // Load oven pricing from settings
      if (settings.surcharge_single_oven !== undefined && settings.surcharge_single_oven !== null) {
        this.variants.oven.single.charge = parseInt(settings.surcharge_single_oven) || 150;
      }
      if (settings.surcharge_double_oven !== undefined && settings.surcharge_double_oven !== null) {
        this.variants.oven.double.charge = parseInt(settings.surcharge_double_oven) || 200;
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
