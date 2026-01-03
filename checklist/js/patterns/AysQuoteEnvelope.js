/**
 * AysQuoteEnvelope (Pattern Implementation)
 * 
 * Wraps all quote data into a single, structured JSON packet
 * ready for database storage and downstream processing.
 * 
 * Matches the schema from QUOTE-CLIENT-ID-FLOW.md:
 * - envelope metadata
 * - client + IDs (client_id, population_id)
 * - address (7 fields)
 * - service details
 * - rooms array (AysRoomOrchestrator instances)
 * - all items (flattened checklist)
 * - quote summary (pricing, hours)
 * - crew info
 * - status
 * 
 * SOLID: Single Responsibility = container + serialization
 */

class AysQuoteEnvelope {
  constructor() {
    // Envelope metadata
    this.envelope = {
      id: this._generateQuoteId(),
      type: 'quote',
      version: '1.0',
      timestamp: new Date().toISOString()
    };

    // Client identification (CRITICAL)
    this.client = {
      client_id: null,          // Required for database routing
      population_id: null,      // Required for address linking
      name: '',
      email: '',
      phone: ''
    };

    // Address (7 fields)
    this.address = {
      population_id: null,
      address_line1: '',
      address_line2: '',
      suburb: '',
      city: '',
      region: '',
      postcode: '',
      country: ''
    };

    // Service details
    this.service = {
      service_type: 'custom', // end-of-tenancy, residential, commercial, custom
      service_code: 'CUST',
      booking_date: null
    };

    // Rooms (array of AysRoomOrchestrator)
    this.rooms = [];

    // Flattened items (all checked items across all rooms)
    this.items = [];

    // Quote summary (pricing + hours)
    this.quote = {
      quote_id: this.envelope.id,
      items_count: 0,
      estimated_hours: 0,
      base_cost: 0,
      surcharges: 0,
      subtotal: 0,
      tax_rate: 15,     // Default NZ GST
      tax_amount: 0,
      total: 0,
      currency: 'NZD',
      generated_at: new Date().toISOString()
    };

    // Crew information
    this.crew = {
      crew_name: '',
      supervisor: '',
      staff_count: 1
    };

    // Status tracking
    this.status = {
      generated: false,
      sent: false,
      accepted: false,
      invoiced: false
    };

    // Special services (oven cleaning, carpet, windows, etc.)
    this.specialServices = [];

    // Special areas (granny flat, etc.)
    this.specialAreas = [];

    // Property configuration
    this.property = {
      numBedrooms: 0,
      numBathrooms: 0,
      propertySize: ''
    };
  }

  /**
   * Generate a unique quote ID (Q-TIMESTAMP-RANDOM)
   * @private
   * @returns {string}
   */
  _generateQuoteId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `Q-${timestamp}-${random}`;
  }

  /**
   * Set client information
   * MUST be called with both client_id and population_id
   * @param {Object} clientData { client_id, population_id, name, email, phone }
   */
  setClient(clientData) {
    if (!clientData.client_id) {
      console.warn('⚠️ WARNING: client_id is missing. Quote will not route correctly to database.');
    }
    if (!clientData.population_id) {
      console.warn('⚠️ WARNING: population_id is missing. Address linking will fail.');
    }

    this.client = {
      client_id: clientData.client_id || null,
      population_id: clientData.population_id || null,
      name: clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || ''
    };
  }

  /**
   * Set address information
   * @param {Object} addressData { address_line1, address_line2, suburb, city, region, postcode, country }
   */
  setAddress(addressData) {
    this.address = {
      population_id: addressData.population_id || this.client.population_id,
      address_line1: addressData.address_line1 || '',
      address_line2: addressData.address_line2 || '',
      suburb: addressData.suburb || '',
      city: addressData.city || '',
      region: addressData.region || '',
      postcode: addressData.postcode || '',
      country: addressData.country || ''
    };
  }

  /**
   * Set service details
   * @param {Object} serviceData { service_type, service_code, booking_date }
   */
  setService(serviceData) {
    this.service = {
      service_type: serviceData.service_type || 'custom',
      service_code: serviceData.service_code || 'CUST',
      booking_date: serviceData.booking_date || null
    };
  }

  /**
   * Set crew information
   * @param {Object} crewData { crew_name, supervisor, staff_count }
   */
  setCrew(crewData) {
    this.crew = {
      crew_name: crewData.crew_name || '',
      supervisor: crewData.supervisor || '',
      staff_count: crewData.staff_count || 1
    };
  }

  /**
   * Set property configuration (bedrooms, bathrooms)
   * @param {Object} propertyData { numBedrooms, numBathrooms }
   */
  setProperty(propertyData) {
    this.property = {
      numBedrooms: propertyData.numBedrooms || 0,
      numBathrooms: propertyData.numBathrooms || 0,
      propertySize: `${propertyData.numBedrooms}-bed, ${propertyData.numBathrooms}-bath`
    };
  }

  /**
   * Add a room to the envelope
   * Called when a room card is closed
   * @param {AysRoomOrchestrator} roomSection
   */
  addRoom(roomSection) {
    if (!roomSection || !roomSection.serialize) {
      console.error('Invalid room section:', roomSection);
      return;
    }

    this.rooms.push(roomSection);
    this._updateQuoteSummary();
  }

  /**
   * Add multiple rooms at once
   * @param {Array<AysRoomOrchestrator>} roomSections
   */
  addRooms(roomSections) {
    roomSections.forEach(room => this.addRoom(room));
  }

  /**
   * Add special service (oven cleaning, carpet cleaning, etc.)
   * @param {Object} service { serviceId, label, charge, notes }
   */
  addSpecialService(service) {
    if (!this.specialServices.find(s => s.serviceId === service.serviceId)) {
      this.specialServices.push(service);
      this._updateQuoteSummary();
    }
  }

  /**
   * Add special area (granny flat, etc.)
   * @param {Object} area { areaId, label, notes }
   */
  addSpecialArea(area) {
    if (!this.specialAreas.find(a => a.areaId === area.areaId)) {
      this.specialAreas.push(area);
      this._updateQuoteSummary();
    }
  }

  /**
   * Update quote summary (totals, hours, counts)
   * Call after adding rooms or special services
   * @private
   */
  _updateQuoteSummary() {
    // Flatten items from all rooms
    this.items = [];
    let totalHours = 0;
    let baseCost = 0;

    this.rooms.forEach(room => {
      const roomData = room.serialize();
      this.items.push(...roomData.items);
      totalHours += room.getTotalHours();
    });

    // Add surcharges from special services
    let surcharges = 0;
    this.specialServices.forEach(service => {
      surcharges += service.charge || 0;
    });

    // Calculate costs (basic: $50/hour)
    const hourlyRate = 50;
    baseCost = Math.round(totalHours * hourlyRate);

    this.quote = {
      quote_id: this.envelope.id,
      items_count: this.items.length,
      estimated_hours: totalHours,
      base_cost: baseCost,
      surcharges: surcharges,
      subtotal: baseCost + surcharges,
      tax_rate: 15,
      tax_amount: Math.round((baseCost + surcharges) * 0.15),
      total: Math.round((baseCost + surcharges) * 1.15),
      currency: 'NZD',
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Validate envelope is ready to send
   * Checks for required fields
   * @returns {Object} { valid: boolean, errors: Array<string> }
   */
  validate() {
    const errors = [];

    if (!this.client.client_id) {
      errors.push('❌ Missing client_id - quote will not route to correct customer in database');
    }
    if (!this.client.population_id) {
      errors.push('❌ Missing population_id - cannot link address to quote');
    }
    if (!this.client.email) {
      errors.push('❌ Missing client email - cannot send quote');
    }
    if (this.rooms.length === 0) {
      errors.push('⚠️ No rooms added to envelope');
    }
    if (this.items.length === 0) {
      errors.push('⚠️ No items checked - quote may be empty');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Seal the envelope (finalize and mark ready)
   * Should be called before sending
   * @returns {boolean} True if valid and sealed
   */
  seal() {
    const validation = this.validate();
    if (!validation.valid) {
      console.error('Envelope validation failed:', validation.errors);
      return false;
    }

    this.status.generated = true;
    this.envelope.timestamp = new Date().toISOString();
    return true;
  }

  /**
   * Serialize entire envelope to JSON
   * Ready to send to PHP backend
   * @returns {string} JSON string
   */
  serialize() {
    return JSON.stringify({
      envelope: this.envelope,
      client: this.client,
      address: this.address,
      service: this.service,
      rooms: this.rooms.map(room => room.serialize()),
      items: this.items,
      quote: this.quote,
      crew: this.crew,
      specialServices: this.specialServices,
      specialAreas: this.specialAreas,
      property: this.property,
      status: this.status
    }, null, 2);
  }

  /**
   * Get envelope as JavaScript object (not stringified)
   * @returns {Object}
   */
  toObject() {
    return JSON.parse(this.serialize());
  }

  /**
   * Get envelope as compact JSON (for localStorage)
   * @returns {string}
   */
  toCompactJSON() {
    return JSON.stringify(this.toObject());
  }

  /**
   * Log envelope to console (for debugging)
   */
  log() {
    console.log('📦 QUOTE ENVELOPE:');
    console.log(this.toObject());
  }
}
