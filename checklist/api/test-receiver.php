<?php
/**
 * @file api/test-receiver.php
 * @description Test endpoint for sync verification.
 *              Receives event envelopes from the event-worker, logs them,
 *              and returns the expected response format.
 *
 * Routes:
 *   GET  /api/test-receiver.php/health  → { "status": "ok" }
 *   POST /api/test-receiver.php         → accepts envelope, logs to received_events.json
 *
 * NOT FOR PRODUCTION. Delete after testing.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$LOG_FILE = __DIR__ . '/received_events.json';

// ─── Health Check ────────────────────────────────────────────────────────────
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($pathInfo === '/health' || str_contains($_SERVER['REQUEST_URI'] ?? '', '/health'))) {
    echo json_encode([
        'status' => 'ok',
        'server' => 'test-receiver',
        'timestamp' => date('c'),
    ]);
    exit;
}

// ─── Clear Log (DELETE) ──────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (file_exists($LOG_FILE)) {
        unlink($LOG_FILE);
    }
    echo json_encode(['ok' => true, 'action' => 'cleared']);
    exit;
}

// ─── Receive Events (POST) ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Show log viewer
    $events = file_exists($LOG_FILE) ? json_decode(file_get_contents($LOG_FILE), true) : [];
    $count = is_array($events) ? count($events) : 0;
    echo json_encode([
        'status' => 'log-viewer',
        'total_received' => $count,
        'batches' => $events,
    ], JSON_PRETTY_PRINT);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read and parse the incoming envelope
$rawBody = file_get_contents('php://input');
$envelope = json_decode($rawBody, true);

if (!$envelope) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON', 'raw_length' => strlen($rawBody)]);
    exit;
}

// Log the received envelope with server timestamp
$logEntry = [
    'received_at' => date('c'),
    'remote_ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'content_length' => strlen($rawBody),
    'envelope' => $envelope,
];

// Append to log file
$existing = [];
if (file_exists($LOG_FILE)) {
    $existing = json_decode(file_get_contents($LOG_FILE), true) ?: [];
}
$existing[] = $logEntry;
file_put_contents($LOG_FILE, json_encode($existing, JSON_PRETTY_PRINT));

// Extract event IDs for the delivery confirmation
$deliveredIds = [];
if (isset($envelope['events']) && is_array($envelope['events'])) {
    foreach ($envelope['events'] as $event) {
        if (isset($event['event_id'])) {
            $deliveredIds[] = $event['event_id'];
        }
    }
}

// Return the response format the event-worker expects
echo json_encode([
    'ok' => true,
    'delivered_event_ids' => $deliveredIds,
    'received_count' => count($deliveredIds),
    'server_timestamp' => date('c'),
]);
