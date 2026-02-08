/**
 * QuoteStorage - IndexedDB persistence for offline quote management
 * 
 * Database: ays_quotes
 * Object Store: drafts
 * 
 * Each quote stores the full form state (snapshot) plus metadata for sync tracking.
 * Designed for multi-draft workflow (multiple quotes per day).
 * 
 * INTEGRATION NOTE:
 * The `snapshot` field uses the exact schema from Checklist.buildSnapshot():
 *   { schema, updated_at, serviceType, crew, date, client, progress, variantSelections, customItemsSnapshot }
 * This allows direct use with Checklist.applySnapshot() for restoring form state.
 * 
 * LOAD ORDER:
 * This script must be loaded BEFORE checklist-script.js.
 * Call QuoteStorage.init() and WAIT for it to resolve before using any methods.
 * Use QuoteStorage.isReady() to check if initialized.
 * Use QuoteStorage.whenReady() to get a promise that resolves when ready.
 */

const QuoteStorage = (function() {
  'use strict';

  const DB_NAME = 'ays_quotes';
  const DB_VERSION = 2;  // Bumped to 2: autoIncrement IDs
  const STORE_NAME = 'drafts';

  let db = null;
  let _initPromise = null;  // Cached promise for whenReady()

  // ============================================================
  // DATABASE INITIALIZATION
  // ============================================================

  /**
   * Check if QuoteStorage is initialized and ready to use.
   * @returns {boolean}
   */
  function isReady() {
    return db !== null;
  }

  /**
   * Get a promise that resolves when QuoteStorage is ready.
   * Safe to call multiple times - returns cached promise.
   * Will attempt to initialize if not already started.
   * @returns {Promise<IDBDatabase>}
   */
  function whenReady() {
    if (db) {
      return Promise.resolve(db);
    }
    if (_initPromise) {
      return _initPromise;
    }
    // Not initialized yet - try to initialize
    console.log('[QuoteStorage] whenReady called before init, initializing now...');
    return init();
  }

  /**
   * Initialize the IndexedDB database.
   * Creates object store and indexes if needed.
   * Safe to call multiple times - returns cached promise.
   * @returns {Promise<IDBDatabase>}
   */
  function init() {
    // Return cached promise if already initializing/initialized
    if (_initPromise) {
      return _initPromise;
    }

    _initPromise = new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to open database:', request.error);
        _initPromise = null;  // Allow retry
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        console.log('[QuoteStorage] Database opened successfully');
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        const oldVersion = event.oldVersion;
        console.log('[QuoteStorage] Upgrading database schema from v' + oldVersion + ' to v' + DB_VERSION);

        // Version 2: Recreate store with autoIncrement
        // Delete old store if exists (test environment - no migration needed)
        if (database.objectStoreNames.contains(STORE_NAME)) {
          database.deleteObjectStore(STORE_NAME);
          console.log('[QuoteStorage] Deleted old store for schema upgrade');
        }

        // Create the drafts object store with AUTO-INCREMENT ID
        const store = database.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true  // Database generates IDs - single source of truth
        });
        
        // Indexes for querying
        store.createIndex('clientId', 'clientId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('serviceType', 'serviceType', { unique: false });
        
        console.log('[QuoteStorage] Created object store with autoIncrement IDs');
      };
    });

    return _initPromise;
  }

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  /**
   * Create a new quote record from a Checklist snapshot.
   * Uses the EXACT snapshot schema from Checklist.buildSnapshot().
   * 
   * NOTE: ID is NOT set here - IndexedDB auto-generates it.
   * This ensures the database is the single source of truth for IDs.
   * 
   * @param {Object} snapshot - Snapshot from Checklist.buildSnapshot()
   *   Expected shape: { schema, updated_at, serviceType, crew, date, client, progress, variantSelections, customItemsSnapshot }
   * @returns {Object} Quote record ready for storage (id will be added by IndexedDB)
   */
  function createQuote(snapshot = {}) {
    const now = new Date().toISOString();
    const client = snapshot.client || {};
    const address = client.address || {};
    
    // Build display-friendly address string
    const addressParts = [
      address.address_line1,
      address.address_line2,
      address.suburb,
      address.city
    ].filter(Boolean);
    const displayAddress = addressParts.join(', ') || '(no address)';
    
    // Display name: prefer client name, fall back to address
    const displayName = client.name || displayAddress;

    // NOTE: No 'id' field - IndexedDB autoIncrement generates it
    return {
      // Denormalized fields for list display (avoids digging into snapshot)
      clientId: client.client_id || null,
      clientName: client.name || '',
      displayName: displayName,
      displayAddress: displayAddress,
      serviceType: snapshot.serviceType || 'end-of-tenancy',
      // Sync status
      status: 'draft', // draft | synced | syncing | error
      syncError: null,
      // Timestamps
      createdAt: now,
      updatedAt: now,
      // THE FULL SNAPSHOT - used by Checklist.applySnapshot() to restore form
      snapshot: snapshot
    };
  }

  /**
   * Save a quote (insert or update).
   * For NEW quotes (no id), IndexedDB auto-generates the id.
   * For EXISTING quotes (has id), updates the existing record.
   * @param {Object} quote - Quote object (id optional for new quotes)
   * @returns {Promise<Object>} The saved quote WITH id populated
   */
  function save(quote) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      // Update timestamp on every save
      quote.updatedAt = new Date().toISOString();

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Use add() for new records (no id), put() for updates (has id)
      const isNew = !quote.id;
      const request = isNew ? store.add(quote) : store.put(quote);

      request.onsuccess = () => {
        // For new records, IndexedDB returns the auto-generated key
        if (isNew) {
          quote.id = request.result;  // Capture the auto-increment ID
          console.log('[QuoteStorage] Created new quote with ID:', quote.id);
        } else {
          console.log('[QuoteStorage] Updated quote:', quote.id);
        }
        resolve(quote);
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to save quote:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get a single quote by ID.
   * @param {string} id - Quote ID
   * @returns {Promise<Object|null>}
   */
  function get(id) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to get quote:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all quotes, optionally sorted.
   * @param {Object} options - { sortBy: 'updatedAt', sortOrder: 'desc' }
   * @returns {Promise<Array>}
   */
  function getAll(options = {}) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const { sortBy = 'updatedAt', sortOrder = 'desc' } = options;

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let quotes = request.result || [];
        
        // Sort in memory (IndexedDB cursor sorting is verbose)
        quotes.sort((a, b) => {
          const aVal = a[sortBy] || '';
          const bVal = b[sortBy] || '';
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortOrder === 'desc' ? -comparison : comparison;
        });

        resolve(quotes);
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to get all quotes:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get quotes filtered by status.
   * @param {string} status - 'draft' | 'synced' | 'syncing' | 'error'
   * @returns {Promise<Array>}
   */
  function getByStatus(status) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to get quotes by status:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get quotes filtered by service type.
   * @param {string} serviceType - 'end-of-tenancy' | 'residential' | 'commercial'
   * @returns {Promise<Array>}
   */
  function getByServiceType(serviceType) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('serviceType');
      const request = index.getAll(serviceType);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to get quotes by service type:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a single quote.
   * @param {string} id - Quote ID
   * @returns {Promise<void>}
   */
  function remove(id) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[QuoteStorage] Deleted quote:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to delete quote:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete multiple quotes.
   * @param {Array<string>} ids - Array of quote IDs
   * @returns {Promise<number>} Number of quotes deleted
   */
  function removeMany(ids) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      if (!ids || ids.length === 0) {
        resolve(0);
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      let deleted = 0;

      transaction.oncomplete = () => {
        console.log('[QuoteStorage] Bulk deleted', deleted, 'quotes');
        resolve(deleted);
      };

      transaction.onerror = () => {
        console.error('[QuoteStorage] Bulk delete failed:', transaction.error);
        reject(transaction.error);
      };

      ids.forEach(id => {
        const request = store.delete(id);
        request.onsuccess = () => deleted++;
      });
    });
  }

  /**
   * Update quote status (for sync workflow).
   * @param {string} id - Quote ID
   * @param {string} status - New status
   * @param {string|null} error - Error message if status is 'error'
   * @returns {Promise<Object>} Updated quote
   */
  function updateStatus(id, status, error = null) {
    return get(id).then(quote => {
      if (!quote) {
        throw new Error(`Quote not found: ${id}`);
      }
      quote.status = status;
      quote.syncError = error;
      return save(quote);
    });
  }

  /**
   * Update a quote's snapshot (when form changes).
   * Preserves metadata, updates snapshot and timestamp.
   * @param {string} id - Quote ID
   * @param {Object} snapshot - New snapshot from Checklist.buildSnapshot()
   * @returns {Promise<Object>} Updated quote
   */
  function updateSnapshot(id, snapshot) {
    return get(id).then(quote => {
      if (!quote) {
        throw new Error(`Quote not found: ${id}`);
      }
      
      // Update snapshot and denormalized display fields
      quote.snapshot = snapshot;
      quote.updatedAt = new Date().toISOString();
      
      const client = snapshot.client || {};
      const address = client.address || {};
      
      quote.clientId = client.client_id || quote.clientId;
      quote.clientName = client.name || '';
      quote.serviceType = snapshot.serviceType || quote.serviceType;
      
      // Rebuild display strings
      const addressParts = [
        address.address_line1,
        address.address_line2,
        address.suburb,
        address.city
      ].filter(Boolean);
      quote.displayAddress = addressParts.join(', ') || '(no address)';
      quote.displayName = client.name || quote.displayAddress;
      
      // Mark as draft since it changed
      if (quote.status === 'synced') {
        quote.status = 'draft';
      }
      
      return save(quote);
    });
  }

  /**
   * Count quotes by status.
   * @returns {Promise<Object>} { draft: n, synced: n, syncing: n, error: n, total: n }
   */
  function getCounts() {
    return getAll().then(quotes => {
      const counts = {
        draft: 0,
        synced: 0,
        syncing: 0,
        error: 0,
        total: quotes.length
      };
      quotes.forEach(q => {
        if (counts.hasOwnProperty(q.status)) {
          counts[q.status]++;
        }
      });
      return counts;
    });
  }

  /**
   * Clear all quotes from the database.
   * USE WITH CAUTION - primarily for testing/reset.
   * @returns {Promise<void>}
   */
  function clearAll() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized. Call init() first.'));
        return;
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[QuoteStorage] Cleared all quotes');
        resolve();
      };

      request.onerror = () => {
        console.error('[QuoteStorage] Failed to clear quotes:', request.error);
        reject(request.error);
      };
    });
  }

  // ============================================================
  // MIGRATION: Import existing single snapshot
  // ============================================================

  /**
   * Check for and migrate the existing single-snapshot from event-worker's IndexedDB.
   * This is a one-time migration when user first loads with QuoteStorage.
   * @returns {Promise<Object|null>} Migrated quote or null if nothing to migrate
   */
  function migrateFromEventWorker() {
    return new Promise((resolve, reject) => {
      // Open the OLD database used by event-worker
      const request = indexedDB.open('checklist_event_queue', 1);
      
      request.onerror = () => {
        // DB doesn't exist or can't open - nothing to migrate
        console.log('[QuoteStorage] No legacy snapshot DB found');
        resolve(null);
      };
      
      request.onsuccess = () => {
        const legacyDb = request.result;
        
        if (!legacyDb.objectStoreNames.contains('snapshots')) {
          legacyDb.close();
          resolve(null);
          return;
        }
        
        const tx = legacyDb.transaction('snapshots', 'readonly');
        const store = tx.objectStore('snapshots');
        const getReq = store.get('latest');
        
        getReq.onsuccess = () => {
          const record = getReq.result;
          legacyDb.close();
          
          if (!record || !record.snapshot) {
            console.log('[QuoteStorage] No legacy snapshot to migrate');
            resolve(null);
            return;
          }
          
          console.log('[QuoteStorage] Found legacy snapshot, migrating...');
          
          // Create a quote from the legacy snapshot
          const quote = createQuote(record.snapshot);
          quote.createdAt = record.updated_at || quote.createdAt;
          quote.updatedAt = record.updated_at || quote.updatedAt;
          
          // Save to new store
          save(quote)
            .then(() => {
              console.log('[QuoteStorage] Migration complete:', quote.id);
              // Set as current quote so user continues editing it
              localStorage.setItem('ays_current_quote_id', quote.id);
              resolve(quote);
            })
            .catch(reject);
        };
        
        getReq.onerror = () => {
          legacyDb.close();
          console.warn('[QuoteStorage] Failed to read legacy snapshot');
          resolve(null);
        };
      };
    });
  }

  /**
   * Check if migration has been done.
   * @returns {boolean}
   */
  function hasMigrated() {
    return localStorage.getItem('ays_quotes_migrated') === '1';
  }

  /**
   * Mark migration as complete.
   */
  function setMigrated() {
    localStorage.setItem('ays_quotes_migrated', '1');
  }

  /**
   * Check if seed data has been created.
   * @returns {boolean}
   */
  function hasSeeded() {
    return localStorage.getItem('ays_quotes_seeded') === '1';
  }

  /**
   * Mark seed data as created.
   */
  function setSeeded() {
    localStorage.setItem('ays_quotes_seeded', '1');
  }

  /**
   * Create sample seed data (John Doe & Jane Doe) for first-time users.
   * These demonstrate how the quote system works and can be deleted.
   * @returns {Promise<Array>} Array of created quotes
   */
  function seedDemoData() {
    if (hasSeeded()) {
      return Promise.resolve([]);
    }

    console.log('[QuoteStorage] Creating seed demo data...');

    // John Doe - Residential EOT example (partially complete)
    var johnDoeSnapshot = {
      crew: 'Demo Cleaning Co.',
      date: new Date().toISOString().split('T')[0],
      serviceType: 'eot_residential',
      propertyType: 'eot_residential',
      address: {
        line1: '123 Example Street',
        line2: 'Unit 4A',
        suburb: 'Sampletown',
        city: 'Demo City',
        region: 'Test Region',
        postcode: '12345',
        country: 'New Zealand'
      },
      clientId: 'demo_john_doe_001',
      settings: {
        bedrooms: 3,
        bathrooms: 2
      },
      progress: {
        'bedroom-1': { completed: 3, total: 3 },
        'bedroom-2': { completed: 2, total: 3 },
        'bathroom-1': { completed: 11, total: 11 },
        'kitchen': { completed: 25, total: 52 }
      },
      notes: 'Sample quote - John Doe. This is demo data you can delete or modify.'
    };

    // Jane Doe - Commercial example (fresh start)
    var janeDoeSnapshot = {
      crew: '',
      date: '',
      serviceType: 'commercial_office',
      propertyType: 'commercial_office',
      address: {
        line1: '456 Business Park',
        line2: 'Level 2',
        suburb: 'Commerce District',
        city: 'Demo City',
        region: 'Test Region',
        postcode: '67890',
        country: 'New Zealand'
      },
      clientId: 'demo_jane_doe_002',
      settings: {
        offices: 5,
        toilets: 2
      },
      progress: {},
      notes: 'Sample quote - Jane Doe (Commercial). Demo data - feel free to delete.'
    };

    var johnQuote = createQuote(johnDoeSnapshot);
    johnQuote.displayName = '123 Example Street, Sampletown';
    johnQuote.status = 'draft';
    
    var janeQuote = createQuote(janeDoeSnapshot);
    janeQuote.displayName = '456 Business Park, Commerce District';
    janeQuote.status = 'draft';

    // Backdate them slightly so they sort below any real user data
    var yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    johnQuote.createdAt = yesterday;
    johnQuote.updatedAt = yesterday;
    janeQuote.createdAt = yesterday;
    janeQuote.updatedAt = yesterday;

    return save(johnQuote)
      .then(function() {
        return save(janeQuote);
      })
      .then(function() {
        setSeeded();
        console.log('[QuoteStorage] Seed demo data created: John Doe & Jane Doe');
        return [johnQuote, janeQuote];
      })
      .catch(function(err) {
        console.warn('[QuoteStorage] Failed to create seed data:', err);
        return [];
      });
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Initialization & ready checks
    init,
    isReady,
    whenReady,
    // CRUD
    createQuote,
    save,
    get,
    getAll,
    getByStatus,
    getByServiceType,
    remove,
    removeMany,
    updateStatus,
    updateSnapshot,
    getCounts,
    clearAll,
    // Migration & Seeding
    migrateFromEventWorker,
    hasMigrated,
    setMigrated,
    seedDemoData,
    hasSeeded,
    setSeeded,
    // Expose for debugging
    get db() { return db; },
    DB_NAME,
    STORE_NAME
  };

})();

// Auto-export for module systems, but also works as global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuoteStorage;
}
