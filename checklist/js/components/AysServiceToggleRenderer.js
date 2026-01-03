/**
 * AysServiceToggleRenderer.js
 * 
 * Renders conditional service toggles based on property type.
 * Only shows toggles relevant to the selected property type (windows, carpet, gardening, etc.)
 * 
 * ARCHITECTURE:
 * - Reads PROPERTY_CONFIG.property_type
 * - Gets available services from AysPropertyType.getAvailableServices()
 * - WAITS for ITEM_DEFINITIONS to load (defensive for slow networks/devices)
 * - Loops through ITEM_DEFINITIONS to build toggle controls
 * - Renders into #service-toggles-container
 * 
 * PERFORMANCE NOTES:
 * - Waits up to 5 seconds for dependencies to load (handles slow 4G/3G devices)
 * - Shows loading indicator while waiting
 * - Returns promise for upstream flow control (don't fire-and-forget)
 * 
 * USAGE:
 *   // Render toggles for current property type (await for completion)
 *   await AysServiceToggleRenderer.render();
 *   
 *   // Or trigger re-render when property type changes
 *   PROPERTY_CONFIG.setPropertyType('commercial_gym');
 *   await AysServiceToggleRenderer.render();
 */

const AysServiceToggleRenderer = (function() {
  'use strict';

  const CONTAINER_ID = 'service-toggles-container';
  const DEPENDENCY_TIMEOUT_MS = 5000; // Wait up to 5 seconds for definitions

  /**
   * Wait for a dependency to exist on window
   * @param {string} dependencyName - e.g., 'ITEM_DEFINITIONS', 'AysPropertyType'
   * @param {number} timeoutMs - Max wait time
   * @returns {Promise<void>}
   */
  async function waitForDependency(dependencyName, timeoutMs = DEPENDENCY_TIMEOUT_MS) {
    const startTime = Date.now();
    
    while (!window[dependencyName]) {
      const elapsed = Date.now() - startTime;
      if (elapsed > timeoutMs) {
        throw new Error(
          `Timeout waiting for ${dependencyName} (waited ${elapsed}ms). ` +
          `Make sure the file is loaded before calling render().`
        );
      }
      // Yield to browser (non-blocking wait)
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`[AysServiceToggleRenderer] ${dependencyName} loaded after ${Date.now() - startTime}ms`);
  }

  /**
   * Show loading state in container
   */
  function showLoadingState() {
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
      container.innerHTML = `
        <div style="
          padding: var(--space-md);
          text-align: center;
          color: var(--color-secondary);
          font-size: var(--font-size-sm);
        ">
          <div style="margin-bottom: 8px;">⏳ Loading service options...</div>
          <div style="font-size: 12px; opacity: 0.7;">This may take a moment on slower connections</div>
        </div>
      `;
    }
  }

  /**
   * Render service toggles for current property type
   * WAITS for all dependencies to load before rendering
   * @returns {Promise<void>}
   */
  async function render() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.warn(`[AysServiceToggleRenderer] Container #${CONTAINER_ID} not found`);
      return;
    }

    try {
      // Show loading state while dependencies load
      showLoadingState();

      // WAIT for critical dependencies (defensive for slow networks)
      console.log('[AysServiceToggleRenderer] Waiting for dependencies...');
      await Promise.all([
        waitForDependency('PROPERTY_CONFIG'),
        waitForDependency('AysPropertyType'),
        waitForDependency('ITEM_DEFINITIONS')
      ]);

      console.log('[AysServiceToggleRenderer] All dependencies ready, rendering toggles');

      // Check property type is set
      if (!PROPERTY_CONFIG.property_type) {
        container.innerHTML = '<p style="color: red;">Error: Property type not configured</p>';
        return;
      }

      const propertyType = PROPERTY_CONFIG.property_type;
      const availableServices = AysPropertyType.getAvailableServices(propertyType);

      if (!availableServices || availableServices.length === 0) {
        container.innerHTML = '<p style="color: var(--color-secondary);">No optional services available for this property type.</p>';
        return;
      }

      // Clear container
      container.innerHTML = '';

      // Render toggles for each available service
      const togglesHTML = availableServices.map(serviceId => 
        buildToggleHTML(serviceId)
      ).filter(html => html !== null).join('');

      if (!togglesHTML) {
        container.innerHTML = '<p style="color: var(--color-secondary);">Unable to render service toggles.</p>';
        return;
      }

      container.innerHTML = togglesHTML;

      // Attach event listeners
      attachToggleListeners();

      console.log(`[AysServiceToggleRenderer] Successfully rendered ${availableServices.length} toggles for ${propertyType}`);
    } catch (error) {
      console.error('[AysServiceToggleRenderer] Render error:', error);
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        container.innerHTML = `
          <div style="
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: var(--space-md);
            color: #856404;
          ">
            <strong>⚠️ Service toggles unavailable:</strong>
            <div style="font-size: 12px; margin-top: 4px;">
              ${error.message}
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Build HTML for a single service toggle
   * ASSUMES ITEM_DEFINITIONS is already loaded (render() waits for it)
   * @param {string} serviceId - e.g., 'windows', 'carpet', 'gardening'
   * @returns {string|null} HTML string or null if service not found
   */
  function buildToggleHTML(serviceId) {
    // Defensive check (should always pass after render() waits for dependencies)
    if (!window.ITEM_DEFINITIONS) {
      console.error('[AysServiceToggleRenderer] ITEM_DEFINITIONS not available in buildToggleHTML');
      return null;
    }

    const itemDef = window.ITEM_DEFINITIONS[serviceId];
    if (!itemDef) {
      console.warn(`[AysServiceToggleRenderer] Service "${serviceId}" not found in ITEM_DEFINITIONS`);
      return null;
    }

    const toggleId = `toggle-service-${serviceId}`;
    const settingKey = itemDef.priceSetting || `include_${serviceId}`;

    // Get current state from settings
    const settings = getSettings();
    const isChecked = settings && settings[settingKey];

    return `
      <div class="service-toggle-item" data-service="${serviceId}" style="
        display: flex;
        align-items: center;
        padding: var(--space-md);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        margin-bottom: var(--space-sm);
        background: ${isChecked ? 'var(--color-light)' : 'transparent'};
        transition: background-color 0.2s;
      ">
        <label style="
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;
          margin: 0;
        ">
          <input 
            type="checkbox" 
            id="${toggleId}"
            class="service-toggle-input"
            data-service="${serviceId}"
            data-setting-key="${settingKey}"
            ${isChecked ? 'checked' : ''}
            style="width: 20px; height: 20px; cursor: pointer;"
          />
          <div>
            <strong style="color: var(--color-secondary); font-size: var(--font-size-base);">
              ${itemDef.label || serviceId}
            </strong>
            ${itemDef.description ? `
              <div style="color: var(--color-secondary); font-size: var(--font-size-sm); margin-top: 4px;">
                ${itemDef.description}
              </div>
            ` : ''}
          </div>
        </label>
      </div>
    `;
  }

  /**
   * Attach event listeners to toggle inputs
   */
  function attachToggleListeners() {
    const toggleInputs = document.querySelectorAll('.service-toggle-input');
    
    toggleInputs.forEach(input => {
      input.addEventListener('change', async (e) => {
        const serviceId = e.target.dataset.service;
        const settingKey = e.target.dataset.settingKey;
        const isChecked = e.target.checked;

        // Update settings
        updateSetting(settingKey, isChecked);

        // Highlight the toggle item
        const item = e.target.closest('.service-toggle-item');
        if (item) {
          item.style.backgroundColor = isChecked ? 'var(--color-light)' : 'transparent';
        }

        console.log(`[AysServiceToggleRenderer] Toggled ${serviceId} to ${isChecked}`);

        // Trigger any downstream updates (factory refresh, etc.)
        if (window.Checklist && typeof window.Checklist.renderCustomItems === 'function') {
          await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay for DOM update
          window.Checklist.renderCustomItems();
        }
      });
    });
  }

  /**
   * Get settings from localStorage
   * @returns {Object|null}
   */
  function getSettings() {
    try {
      const stored = localStorage.getItem('checklist_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('[AysServiceToggleRenderer] Error reading settings:', error);
      return {};
    }
  }

  /**
   * Update a single setting in localStorage
   * @param {string} key
   * @param {*} value
   */
  function updateSetting(key, value) {
    try {
      const settings = getSettings();
      settings[key] = value;
      localStorage.setItem('checklist_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('[AysServiceToggleRenderer] Error updating setting:', error);
    }
  }

  /**
   * Public API
   */
  return {
    render: render,
    
    /**
     * Call this after property type changes to re-render toggles
     */
    async onPropertyTypeChanged() {
      console.log('[AysServiceToggleRenderer] Property type changed, re-rendering toggles');
      await render();
    }
  };
})();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AysServiceToggleRenderer;
}
