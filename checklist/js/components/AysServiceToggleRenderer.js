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
      const wrapper = document.createElement('div');
      wrapper.style.padding = 'var(--space-md)';
      wrapper.style.textAlign = 'center';
      wrapper.style.color = 'var(--color-secondary)';
      wrapper.style.fontSize = 'var(--font-size-sm)';

      const title = document.createElement('div');
      title.style.marginBottom = '8px';
      title.textContent = '⏳ Loading service options...';

      const subtitle = document.createElement('div');
      subtitle.style.fontSize = '12px';
      subtitle.style.opacity = '0.7';
      subtitle.textContent = 'This may take a moment on slower connections';

      wrapper.appendChild(title);
      wrapper.appendChild(subtitle);
      container.replaceChildren(wrapper);
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
        container.replaceChildren(buildMessage('Error: Property type not configured', 'red'));
        return;
      }

      const propertyType = PROPERTY_CONFIG.property_type;
      const availableServices = AysPropertyType.getAvailableServices(propertyType);

      if (!availableServices || availableServices.length === 0) {
        container.replaceChildren(buildMessage('No optional services available for this property type.', 'var(--color-secondary)'));
        return;
      }

      // Clear container
      container.replaceChildren();

      // Render toggles for each available service
      const toggles = availableServices.map(serviceId =>
        buildToggleElement(serviceId)
      ).filter(toggle => toggle !== null);

      if (toggles.length === 0) {
        container.replaceChildren(buildMessage('Unable to render service toggles.', 'var(--color-secondary)'));
        return;
      }

      const fragment = document.createDocumentFragment();
      toggles.forEach(toggle => fragment.appendChild(toggle));
      container.appendChild(fragment);

      // Attach event listeners
      attachToggleListeners();

      console.log(`[AysServiceToggleRenderer] Successfully rendered ${availableServices.length} toggles for ${propertyType}`);
    } catch (error) {
      console.error('[AysServiceToggleRenderer] Render error:', error);
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        container.replaceChildren(buildErrorNotice(error));
      }
    }
  }

  /**
   * Build DOM for a single service toggle
   * ASSUMES ITEM_DEFINITIONS is already loaded (render() waits for it)
   * @param {string} serviceId - e.g., 'windows', 'carpet', 'gardening'
   * @returns {HTMLElement|null} Toggle element or null if service not found
   */
  function buildToggleElement(serviceId) {
    // Defensive check (should always pass after render() waits for dependencies)
    if (!window.ITEM_DEFINITIONS) {
      console.error('[AysServiceToggleRenderer] ITEM_DEFINITIONS not available in buildToggleElement');
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

    const wrapper = document.createElement('div');
    wrapper.className = 'service-toggle-item';
    wrapper.dataset.service = serviceId;
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.padding = 'var(--space-md)';
    wrapper.style.border = '1px solid var(--color-border)';
    wrapper.style.borderRadius = '4px';
    wrapper.style.marginBottom = 'var(--space-sm)';
    wrapper.style.background = isChecked ? 'var(--color-light)' : 'transparent';
    wrapper.style.transition = 'background-color 0.2s';

    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '12px';
    label.style.cursor = 'pointer';
    label.style.flex = '1';
    label.style.margin = '0';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = toggleId;
    input.className = 'service-toggle-input';
    input.dataset.service = serviceId;
    input.dataset.settingKey = settingKey;
    input.checked = Boolean(isChecked);
    input.style.width = '20px';
    input.style.height = '20px';
    input.style.cursor = 'pointer';

    const textWrapper = document.createElement('div');

    const title = document.createElement('strong');
    title.style.color = 'var(--color-secondary)';
    title.style.fontSize = 'var(--font-size-base)';
    title.textContent = itemDef.label || serviceId;

    textWrapper.appendChild(title);

    if (itemDef.description) {
      const description = document.createElement('div');
      description.style.color = 'var(--color-secondary)';
      description.style.fontSize = 'var(--font-size-sm)';
      description.style.marginTop = '4px';
      description.textContent = itemDef.description;
      textWrapper.appendChild(description);
    }

    label.appendChild(input);
    label.appendChild(textWrapper);
    wrapper.appendChild(label);

    return wrapper;
  }

  /**
   * Build a simple message element for the container
   * @param {string} message
   * @param {string} color
   * @returns {HTMLElement}
   */
  function buildMessage(message, color) {
    const text = document.createElement('p');
    text.style.color = color;
    text.textContent = message;
    return text;
  }

  /**
   * Build error notice element
   * @param {Error} error
   * @returns {HTMLElement}
   */
  function buildErrorNotice(error) {
    const wrapper = document.createElement('div');
    wrapper.style.background = '#fff3cd';
    wrapper.style.border = '1px solid #ffc107';
    wrapper.style.borderRadius = '4px';
    wrapper.style.padding = 'var(--space-md)';
    wrapper.style.color = '#856404';

    const title = document.createElement('strong');
    title.textContent = '⚠️ Service toggles unavailable:';

    const message = document.createElement('div');
    message.style.fontSize = '12px';
    message.style.marginTop = '4px';
    message.textContent = error.message;

    wrapper.appendChild(title);
    wrapper.appendChild(message);

    return wrapper;
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
