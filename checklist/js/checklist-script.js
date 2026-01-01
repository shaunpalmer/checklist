/**
 * End of Tenancy Checklist
 * jQuery/Vanilla JS interactions
 * Print, PDF, localStorage persistence, progress tracking
 */

(function($) {
  'use strict';

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
      this.cacheDOM();
      this.bindEvents();
      this.loadProgress();
      this.updateAllProgress();
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

      // Checkbox change - save and update progress
      this.$items.on('change', function() {
        self.saveProgress();
        self.updateProgress($(this).closest('details'));
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
      });
      this.$dateInput.on('change', function() {
        self.saveMeta();
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
        // This would pull from your lead data
        alert('Lead data integration coming - would pull from Lead form');
      });

      // Add new client button
      $(document).on('click', '#btn-add-new-client', function(e) {
        e.preventDefault();
        const name = prompt('Enter client name:');
        if (name) {
          $('#quote-client-name').val(name);
          $('#quote-client-email').focus();
        }
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
      localStorage.setItem('checklist_progress', JSON.stringify(progress));
    },

    /**
     * Load checkbox states from localStorage
     */
    loadProgress: function() {
      const saved = localStorage.getItem('checklist_progress');
      if (saved) {
        try {
          const progress = JSON.parse(saved);
          for (const id in progress) {
            const $checkbox = $('#' + id);
            if ($checkbox.length) {
              $checkbox.prop('checked', progress[id]);
            }
          }
        } catch (e) {
          console.warn('Error loading progress:', e);
        }
      }

      // Load meta info
      const crew = localStorage.getItem('checklist_crew');
      const date = localStorage.getItem('checklist_date');
      if (crew) this.$crewInput.val(crew);
      if (date) this.$dateInput.val(date);
    },

    /**
     * Save meta info (crew name, date)
     */
    saveMeta: function() {
      localStorage.setItem('checklist_crew', this.$crewInput.val());
      localStorage.setItem('checklist_date', this.$dateInput.val());
    },

    /**
     * Update progress for a specific room
     */
    updateProgress: function($detailsElem) {
      const $checkboxes = $detailsElem.find('input[type="checkbox"]');
      const total = $checkboxes.length;
      const checked = $checkboxes.filter(':checked').length;
      
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
      localStorage.removeItem('checklist_progress');
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
      localStorage.setItem('checklist_service_type', serviceType);

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
            <div style="padding: 10px; border-bottom: 1px solid #ddd; cursor: pointer; hover: background: #f5f5f5;" 
                 class="client-suggestion" 
                 data-client-id="${client.client_id}"
                 data-population-id="${client.population_id}">
              <strong>${client.name}</strong><br/>
              <small>${client.email} | ${client.phone}</small><br/>
              <small style="color: #999;">${client.address_line1}${client.address_line2 ? ', ' + client.address_line2 : ''}, ${client.suburb}</small>
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
      
      // Validate email
      if (!clientEmail) {
        $('#email-required-msg').show();
        alert('Please enter an email address before generating quote');
        return;
      }
      
      // Validate client_id exists
      if (!clientId) {
        alert('⚠️ Please select a client from the search list.\n\nIf creating a new client, use "Create Client" button.');
        return;
      }
      
      // Validate population_id exists
      if (!populationId) {
        alert('⚠️ Client address (population_id) not found.\n\nPlease search from existing clients.');
        return;
      }

      const checkedItems = this.$items.filter(':checked').length;
      const totalHours = checkedItems * 0.5;
      
      const baseRate = parseFloat($('#setting-base-hourly-rate').val()) || 50;
      const taxRate = parseFloat($('#setting-tax-rate').val()) || 10;
      
      const baseCost = totalHours * baseRate;
      const surcharges = 0;
      const subtotal = baseCost + surcharges;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + tax;
      
      // Generate quote ID
      const quoteId = 'Q-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Store quote ID
      $('#quote-id').val(quoteId);
      
      // Update quote summary display
      $('#quote-items-count').text(checkedItems);
      $('#quote-hours-total').text(totalHours.toFixed(1));
      $('#quote-base-cost').text('$' + baseCost.toFixed(2));
      $('#quote-surcharges').text('$' + surcharges.toFixed(2));
      $('#quote-subtotal').text('$' + subtotal.toFixed(2));
      $('#quote-tax').text('$' + tax.toFixed(2));
      $('#quote-total').text('$' + total.toFixed(2));
      
      // Pre-fill messages
      const clientName = $('#quote-client-name').val() || 'Valued Client';
      const crewName = $('#crew-name').val() || 'Our Team';
      const defaultMessage = `Hi ${clientName},\n\nHere's your cleaning quote:\n\nTotal Cost: $${total.toFixed(2)}\nEstimated Time: ${totalHours.toFixed(1)} hours\n\nPlease let us know if you'd like to proceed or have any questions.\n\nThank you,\n${crewName}`;
      $('#quote-email-message').val(defaultMessage);
      
      const smsMessage = `Hi ${clientName}, your quote is ready! Total: $${total.toFixed(2)}. Can you confirm?`;
      $('#quote-sms-message').val(smsMessage);
      
      // Generate shareable link
      $('#quote-share-link').val('https://quotes.yoursystem.com/q/' + quoteId);
      
      // BUILD COMPLETE JSON PACKET FOR STORAGE
      const quotePacket = {
        quote_id: quoteId,
        client_id: clientId,
        population_id: populationId,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: $('#quote-client-phone').val(),
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
        quote: {
          quote_id: quoteId,
          items_count: checkedItems,
          estimated_hours: totalHours,
          base_cost: baseCost,
          surcharges: surcharges,
          subtotal: subtotal,
          tax_rate: taxRate,
          tax_amount: tax,
          total: total,
          generated_at: new Date().toISOString()
        },
        status: 'generated',
        timestamp: new Date().toISOString()
      };
      
      // Store packet in hidden field for submission
      $('#quote-packet').val(JSON.stringify(quotePacket));
      
      alert('✅ Quote generated!\n\nClient: ' + clientName + '\nEmail: ' + clientEmail + '\nTotal: $' + total.toFixed(2) + '\n\nQuote ID: ' + quoteId + '\nClient ID: ' + clientId + '\nPopulation ID: ' + populationId);
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
      console.log(JSON.parse(quotePacket));
      
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
      console.log(JSON.parse(quotePacket));
      
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
        staff_threshold: $('#setting-staff-threshold').val(),
        currency: $('#setting-currency').val(),
        customer_id_prefix: $('#setting-customer-id-prefix').val(),
        surcharge_single_oven: $('#surcharge-single-oven').val(),
        surcharge_double_oven: $('#surcharge-double-oven').val(),
        surcharge_windows: $('#surcharge-windows').val(),
        surcharge_carpet: $('#surcharge-carpet').val(),
        surcharge_drawers: $('#surcharge-drawers').val(),
        surcharge_garage: $('#surcharge-garage').val(),
        service_api_endpoint: $('#service-api-endpoint').val()
      };
      
      localStorage.setItem('checklist_settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    },

    /**
     * Reset settings to defaults
     */
    resetSettings: function() {
      $('#setting-base-hourly-rate').val('50');
      $('#setting-premium-hourly-rate').val('75');
      $('#setting-tax-rate').val('10');
      $('#setting-staff-multiplier').val('25');
      $('#setting-staff-threshold').val('7');
      $('#setting-currency').val('USD');
      $('#setting-customer-id-prefix').val('CUST');
      $('#surcharge-single-oven').val('150');
      $('#surcharge-double-oven').val('200');
      $('#surcharge-windows').val('65');
      $('#surcharge-carpet').val('52');
      $('#surcharge-drawers').val('50');
      $('#surcharge-garage').val('100');
      $('#service-api-endpoint').val('');
      
      localStorage.removeItem('checklist_settings');
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

  // Expose globally for debugging
  window.Checklist = Checklist;

})(jQuery);
