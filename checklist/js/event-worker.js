/*
 * event-worker.js
 * Dedicated Web Worker: durable event queue (IndexedDB) + optional batch flush.
 */

const DB_NAME = 'checklist_event_queue';
const DB_VERSION = 1;
const STORE_EVENTS = 'events';
const STORE_SNAPSHOTS = 'snapshots';

let config = {
  endpoint: null
};

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  // crypto.randomUUID is widely supported in modern Chromium-based browsers.
  if (self.crypto && typeof self.crypto.randomUUID === 'function') {
    return self.crypto.randomUUID();
  }
  // Fallback: not cryptographically strong, but adequate for idempotency keys.
  return 'evt_' + Math.random().toString(36).slice(2) + '_' + Date.now();
}

function computeFingerprint(entry) {
  const type = entry?.type || '';
  const page = entry?.context?.page || '';
  const itemId = entry?.payload?.item_id || entry?.payload?.id || '';
  return [type, page, itemId].join('|');
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        const store = db.createObjectStore(STORE_EVENTS, { keyPath: 'event_id' });
        store.createIndex('by_delivered', 'delivered_at', { unique: false });
        store.createIndex('by_next_attempt', 'next_attempt_at', { unique: false });
        store.createIndex('by_fingerprint', 'fingerprint', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        const snap = db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
        snap.createIndex('by_updated_at', 'updated_at', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withSnapshotStore(mode, fn) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SNAPSHOTS, mode);
      const store = tx.objectStore(STORE_SNAPSHOTS);
      const resultPromise = Promise.resolve(fn(store, tx));

      tx.oncomplete = () => {
        db.close();
        resultPromise.then(resolve).catch(reject);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    });
  });
}

function idbSaveLatestSnapshot(snapshot) {
  const record = {
    id: 'latest',
    updated_at: nowIso(),
    snapshot
  };
  return withSnapshotStore('readwrite', (store) => {
    store.put(record);
  }).then(() => ({ ok: true, updated_at: record.updated_at }));
}

function idbLoadLatestSnapshot() {
  return withSnapshotStore('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.get('latest');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
}

function withStore(mode, fn) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, mode);
      const store = tx.objectStore(STORE_EVENTS);
      const resultPromise = Promise.resolve(fn(store, tx));

      tx.oncomplete = () => {
        db.close();
        resultPromise.then(resolve).catch(reject);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error);
      };
    });
  });
}

function idbPut(record) {
  return withStore('readwrite', (store) => {
    store.put(record);
  });
}

function idbGetManyPending(limit) {
  return withStore('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const results = [];
      const index = store.index('by_delivered');
      const req = index.openCursor(IDBKeyRange.only(null));

      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return resolve(results);
        const value = cursor.value;
        if (value && (!value.next_attempt_at || value.next_attempt_at <= nowIso())) {
          results.push(value);
        }
        if (results.length >= limit) return resolve(results);
        cursor.continue();
      };

      req.onerror = () => reject(req.error);
    });
  });
}

function idbMarkDelivered(eventIds) {
  const deliveredAt = nowIso();
  return withStore('readwrite', (store) => {
    return Promise.all(
      eventIds.map((id) => {
        return new Promise((resolve, reject) => {
          const getReq = store.get(id);
          getReq.onsuccess = () => {
            const record = getReq.result;
            if (!record) return resolve();
            record.delivered_at = deliveredAt;
            store.put(record);
            resolve();
          };
          getReq.onerror = () => reject(getReq.error);
        });
      })
    );
  });
}

function backoffMs(attempts) {
  const base = Math.min(60000, Math.pow(2, Math.max(0, attempts)) * 1000);
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function idbMarkFailed(eventIds) {
  const next = new Date(Date.now() + 1000).toISOString();
  return withStore('readwrite', (store) => {
    return Promise.all(
      eventIds.map((id) => {
        return new Promise((resolve, reject) => {
          const getReq = store.get(id);
          getReq.onsuccess = () => {
            const record = getReq.result;
            if (!record) return resolve();
            record.attempts = (record.attempts || 0) + 1;
            record.next_attempt_at = new Date(Date.now() + backoffMs(record.attempts)).toISOString();
            store.put(record);
            resolve();
          };
          getReq.onerror = () => reject(getReq.error);
        });
      })
    );
  });
}

async function flush({ online, limit = 50 } = {}) {
  if (!online) return { ok: false, reason: 'offline' };
  if (!config.endpoint) return { ok: false, reason: 'no-endpoint' };

  const pending = await idbGetManyPending(limit);
  if (!pending.length) return { ok: true, delivered: 0 };

  const envelope = {
    meta: {
      schema: 1,
      created_at: nowIso()
    },
    events: pending.map(({ event_id, type, ts, context, payload, fingerprint }) => ({
      event_id,
      type,
      ts,
      context,
      payload,
      fingerprint
    }))
  };

  try {
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envelope)
    });

    if (!res.ok) {
      await idbMarkFailed(pending.map((e) => e.event_id));
      return { ok: false, reason: 'http', status: res.status };
    }

    // Accept either { delivered_event_ids: [...] } or a simple ok.
    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      body = null;
    }

    const deliveredIds = Array.isArray(body?.delivered_event_ids)
      ? body.delivered_event_ids
      : pending.map((e) => e.event_id);

    await idbMarkDelivered(deliveredIds);
    return { ok: true, delivered: deliveredIds.length };
  } catch (e) {
    await idbMarkFailed(pending.map((ev) => ev.event_id));
    return { ok: false, reason: 'network', message: String(e?.message || e) };
  }
}

async function capture(entry) {
  const record = {
    event_id: uuid(),
    type: entry?.type || 'unknown',
    ts: entry?.ts || nowIso(),
    context: entry?.context || {},
    payload: entry?.payload || {},
    fingerprint: entry?.fingerprint || computeFingerprint(entry),
    delivered_at: null,
    attempts: 0,
    next_attempt_at: nowIso()
  };

  await idbPut(record);
  return { ok: true, event_id: record.event_id };
}

self.onmessage = async (e) => {
  const msg = e.data || {};

  try {
    if (msg.op === 'config') {
      config = { ...config, ...(msg.config || {}) };
      self.postMessage({ op: 'config', ok: true, config });
      return;
    }

    if (msg.op === 'capture') {
      const result = await capture(msg.event);
      self.postMessage({ op: 'capture', ...result });
      return;
    }

    if (msg.op === 'flush') {
      const result = await flush(msg);
      self.postMessage({ op: 'flush', ...result });
      return;
    }

    if (msg.op === 'save_snapshot') {
      const result = await idbSaveLatestSnapshot(msg.snapshot || null);
      self.postMessage({ op: 'save_snapshot', ...result });
      return;
    }

    if (msg.op === 'load_snapshot') {
      const record = await idbLoadLatestSnapshot();
      self.postMessage({ op: 'load_snapshot', ok: true, record });
      return;
    }

    if (msg.op === 'ping') {
      self.postMessage({ op: 'pong', ok: true, ts: nowIso() });
      return;
    }

    self.postMessage({ op: 'error', ok: false, reason: 'unknown-op' });
  } catch (err) {
    self.postMessage({ op: 'error', ok: false, message: String(err?.message || err) });
  }
};
