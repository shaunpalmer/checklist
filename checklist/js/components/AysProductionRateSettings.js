/**
 * AysProductionRateSettings Component
 * 
 * Configurable production rate setting for labor hour estimation.
 * Allows user to set custom production rate (sq ft/hr or sq m/hr).
 * 
 * Usage:
 *   const component = new AysProductionRateSettings({
 *     classification: 'light',  // or 'heavy'
 *     onSave: (settings) => { ... }
 *   });
 *   document.getElementById('settings-container').appendChild(component.render());
 */

class AysProductionRateSettings {
  
  // Default production rates (your measured baseline)
  static DEFAULTS = {
    light: { sq_ft: 400, sq_m: 37 },
    heavy: { sq_ft: 330, sq_m: 31 }
  };

  constructor(options = {}) {
    this.classification = options.classification || 'light';
    this.onSave = options.onSave || (() => {});
    
    // Load from localStorage if exists
    this.settings = this.loadSettings();
    
    // Current form state
    this.useCustom = this.settings.use_custom_rate || false;
    this.customRate = this.settings.production_rate || null;
    this.selectedUnit = this.settings.production_unit || 'sq_ft_per_hour';
    
    // DOM elements
    this.domElement = null;
    this.radioUseStandard = null;
    this.radioUseCustom = null;
    this.inputCustomRate = null;
    this.selectUnit = null;
    this.checkboxSaveDefault = null;
    this.displayStandard = null;
    this.displayCurrent = null;
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    const key = `ays_production_rate_${this.classification}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings) {
    const key = `ays_production_rate_${this.classification}`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  /**
   * Get default rate based on unit
   */
  getDefaultRate() {
    const unit = this.selectedUnit === 'sq_ft_per_hour' ? 'sq_ft' : 'sq_m';
    return AysProductionRateSettings.DEFAULTS[this.classification][unit];
  }

  /**
   * Convert sq ft to sq m
   */
  convertSqFtToSqM(sqFt) {
    return Math.round((sqFt / 10.764) * 100) / 100;
  }

  /**
   * Convert sq m to sq ft
   */
  convertSqMToSqFt(sqM) {
    return Math.round(sqM * 10.764 * 100) / 100;
  }

  /**
   * Get unit label
   */
  getUnitLabel() {
    if (this.selectedUnit === 'sq_ft_per_hour') {
      return 'square feet per hour';
    } else {
      return 'square meters per hour';
    }
  }

  /**
   * Update standard rate display when unit changes
   */
  updateDisplay() {
    const defaultRate = this.getDefaultRate();
    const unitLabel = this.getUnitLabel();
    
    if (this.displayStandard) {
      this.displayStandard.textContent = `${defaultRate} ${unitLabel}`;
    }
    
    // Update input placeholder
    if (this.inputCustomRate) {
      this.inputCustomRate.placeholder = defaultRate.toString();
    }
  }

  /**
   * Handle radio button change
   */
  handleUseStandardClick() {
    this.useCustom = false;
    this.inputCustomRate.disabled = true;
    this.selectUnit.disabled = true;
    this.inputCustomRate.value = '';
    this.updateCurrentDisplay();
  }

  /**
   * Handle custom radio button change
   */
  handleUseCustomClick() {
    this.useCustom = true;
    this.inputCustomRate.disabled = false;
    this.selectUnit.disabled = false;
    this.inputCustomRate.focus();
    this.updateCurrentDisplay();
  }

  /**
   * Handle unit change
   */
  handleUnitChange() {
    this.selectedUnit = this.selectUnit.value;
    this.updateDisplay();
    
    // If custom rate is set, convert it
    if (this.useCustom && this.inputCustomRate.value) {
      const currentValue = parseFloat(this.inputCustomRate.value);
      let newValue;
      
      if (this.selectedUnit === 'sq_ft_per_hour') {
        // Convert from sq_m to sq_ft
        newValue = this.convertSqMToSqFt(currentValue);
      } else {
        // Convert from sq_ft to sq_m
        newValue = this.convertSqFtToSqM(currentValue);
      }
      
      this.inputCustomRate.value = newValue;
    }
    
    this.updateCurrentDisplay();
  }

  /**
   * Handle rate input change
   */
  handleRateInput() {
    const value = parseFloat(this.inputCustomRate.value);
    
    // Validation
    if (value && (value < 100 || value > 1000)) {
      this.inputCustomRate.classList.add('warning');
      if (value < 100) {
        console.warn('[AysProductionRateSettings] Unusually low production rate entered:', value);
      } else {
        console.warn('[AysProductionRateSettings] Unusually high production rate entered:', value);
      }
    } else {
      this.inputCustomRate.classList.remove('warning');
    }
    this.updateCurrentDisplay();
  }

  /**
   * Update current rate display
   */
  updateCurrentDisplay() {
    if (!this.displayCurrent) return;
    
    let displayText = '';
    
    if (this.useCustom && this.inputCustomRate.value) {
      const customRate = parseFloat(this.inputCustomRate.value);
      displayText = `${customRate} ${this.getUnitLabel()}`;
    } else {
      const defaultRate = this.getDefaultRate();
      displayText = `${defaultRate} ${this.getUnitLabel()} (standard)`;
    }
    
    this.displayCurrent.textContent = `Current setting: ${displayText}`;
  }

  /**
   * Validate and save settings
   */
  handleSave() {
    if (this.useCustom) {
      const customRate = parseFloat(this.inputCustomRate.value);
      
      if (!customRate || isNaN(customRate)) {
        alert('Please enter a valid production rate');
        return;
      }
      
      if (customRate < 100 || customRate > 1000) {
        const proceed = confirm('Your rate seems unusual. Continue anyway?');
        if (!proceed) return;
      }
    }
    
    const settings = {
      classification: this.classification,
      use_custom_rate: this.useCustom,
      production_rate: this.useCustom ? parseFloat(this.inputCustomRate.value) : this.getDefaultRate(),
      production_unit: this.selectedUnit,
      timestamp: new Date().toISOString()
    };
    
    if (this.checkboxSaveDefault.checked) {
      this.saveSettings(settings);
    }
    
    this.onSave(settings);
  }

  /**
   * Render component
   */
  render() {
    const container = document.createElement('div');
    container.className = 'ays-production-rate-settings';
    
    const title = document.createElement('h3');
    title.className = 'setting-title';
    title.textContent = `${this.classification.charAt(0).toUpperCase() + this.classification.slice(1)} Commercial Production Rate`;
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.className = 'setting-description';
    description.textContent = 'Your team\'s cleaning speed (for labor estimates):';
    container.appendChild(description);
    
    // Radio buttons section
    const radioGroup = document.createElement('div');
    radioGroup.className = 'radio-group';
    
    // Standard rate option
    const labelStandard = document.createElement('label');
    labelStandard.className = 'radio-label';
    
    this.radioUseStandard = document.createElement('input');
    this.radioUseStandard.type = 'radio';
    this.radioUseStandard.name = `production-rate-${this.classification}`;
    this.radioUseStandard.value = 'standard';
    this.radioUseStandard.checked = !this.useCustom;
    this.radioUseStandard.addEventListener('change', () => this.handleUseStandardClick());
    labelStandard.appendChild(this.radioUseStandard);
    
    const labelText1 = document.createElement('span');
    labelText1.className = 'radio-text';
    labelText1.textContent = 'Use Standard Rate';
    labelStandard.appendChild(labelText1);
    
    radioGroup.appendChild(labelStandard);
    
    const standardDesc = document.createElement('div');
    standardDesc.className = 'radio-description';
    this.displayStandard = document.createElement('span');
    this.displayStandard.textContent = `${this.getDefaultRate()} ${this.getUnitLabel()}`;
    standardDesc.appendChild(this.displayStandard);
    radioGroup.appendChild(standardDesc);
    
    // Custom rate option
    const labelCustom = document.createElement('label');
    labelCustom.className = 'radio-label';
    
    this.radioUseCustom = document.createElement('input');
    this.radioUseCustom.type = 'radio';
    this.radioUseCustom.name = `production-rate-${this.classification}`;
    this.radioUseCustom.value = 'custom';
    this.radioUseCustom.checked = this.useCustom;
    this.radioUseCustom.addEventListener('change', () => this.handleUseCustomClick());
    labelCustom.appendChild(this.radioUseCustom);
    
    const labelText2 = document.createElement('span');
    labelText2.className = 'radio-text';
    labelText2.textContent = 'Custom Rate';
    labelCustom.appendChild(labelText2);
    
    radioGroup.appendChild(labelCustom);
    
    // Custom input section
    const customSection = document.createElement('div');
    customSection.className = 'custom-rate-section';
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    
    this.inputCustomRate = document.createElement('input');
    this.inputCustomRate.type = 'number';
    this.inputCustomRate.className = 'rate-input';
    this.inputCustomRate.placeholder = this.getDefaultRate().toString();
    this.inputCustomRate.disabled = !this.useCustom;
    this.inputCustomRate.min = '100';
    this.inputCustomRate.max = '1000';
    this.inputCustomRate.step = '10';
    this.inputCustomRate.addEventListener('input', () => this.handleRateInput());
    inputGroup.appendChild(this.inputCustomRate);
    
    this.selectUnit = document.createElement('select');
    this.selectUnit.className = 'unit-select';
    this.selectUnit.disabled = !this.useCustom;
    
    const optionFt = document.createElement('option');
    optionFt.value = 'sq_ft_per_hour';
    optionFt.textContent = 'square feet per hour';
    optionFt.selected = this.selectedUnit === 'sq_ft_per_hour';
    this.selectUnit.appendChild(optionFt);
    
    const optionM = document.createElement('option');
    optionM.value = 'sq_m_per_hour';
    optionM.textContent = 'square meters per hour';
    optionM.selected = this.selectedUnit === 'sq_m_per_hour';
    this.selectUnit.appendChild(optionM);
    
    this.selectUnit.addEventListener('change', () => this.handleUnitChange());
    inputGroup.appendChild(this.selectUnit);
    
    customSection.appendChild(inputGroup);
    
    radioGroup.appendChild(customSection);
    container.appendChild(radioGroup);
    
    // Checkbox: Save as default
    const checkboxSection = document.createElement('div');
    checkboxSection.className = 'checkbox-section';
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'checkbox-label';
    
    this.checkboxSaveDefault = document.createElement('input');
    this.checkboxSaveDefault.type = 'checkbox';
    this.checkboxSaveDefault.className = 'checkbox-input';
    checkboxLabel.appendChild(this.checkboxSaveDefault);
    
    const checkboxText = document.createElement('span');
    checkboxText.className = 'checkbox-text';
    checkboxText.textContent = 'Save as my default';
    checkboxLabel.appendChild(checkboxText);
    
    checkboxSection.appendChild(checkboxLabel);
    container.appendChild(checkboxSection);
    
    // Current setting display
    const currentDisplay = document.createElement('div');
    currentDisplay.className = 'current-setting';
    this.displayCurrent = document.createElement('span');
    this.updateCurrentDisplay();
    currentDisplay.appendChild(this.displayCurrent);
    container.appendChild(currentDisplay);
    
    // Save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.textContent = 'Apply Production Rate';
    saveButton.addEventListener('click', () => this.handleSave());
    container.appendChild(saveButton);
    
    this.domElement = container;
    return container;
  }

  /**
   * Get current settings object
   */
  getSettings() {
    return {
      classification: this.classification,
      use_custom_rate: this.useCustom,
      production_rate: this.useCustom ? parseFloat(this.inputCustomRate.value) : this.getDefaultRate(),
      production_unit: this.selectedUnit
    };
  }
}
