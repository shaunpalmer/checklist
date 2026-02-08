<?php
/**
 * @file config/auth-config.php
 * @description Authentication configuration — users, session settings, rate limiting.
 * @version 1.0
 * @date 2026-02-09
 *
 * DEV-ONLY FILE-BASED AUTH
 * ========================
 * This uses a simple array of hashed passwords instead of a database table.
 * When deploying into WordPress/AYS, replace verify_user() with wp_authenticate().
 *
 * To generate a password hash, run in terminal:
 *   php -r "echo password_hash('your_password_here', PASSWORD_BCRYPT) . PHP_EOL;"
 */

// ─── Session Configuration ──────────────────────────────────────────────────────
define('SESSION_NAME', 'ays_checklist_session');
define('SESSION_LIFETIME', 0);          // 0 = until browser closes (dev-friendly)
define('SESSION_IDLE_TIMEOUT', 0);      // 0 = disabled during dev. Set to 1800 (30 min) for production.
define('CSRF_TOKEN_NAME', 'csrf_token');

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
define('MAX_LOGIN_ATTEMPTS', 5);        // Lock after 5 failures
define('LOCKOUT_DURATION', 900);        // 15-minute lockout (seconds)
define('RATE_LIMIT_FILE', __DIR__ . '/../storage/rate-limits.json');

// ─── Application Settings ───────────────────────────────────────────────────────
define('APP_NAME', 'AYS Checklist');
define('LOGIN_HEADING', 'Welcome Back');
define('LOGIN_SUBTITLE', 'Sign in to your account');
define('LOGO_PATH', 'icons/icon-192.svg');
define('AFTER_LOGIN_URL', 'index.php');
define('LOGIN_URL', 'login.php');

// ─── Users (file-based, dev only) ───────────────────────────────────────────────
// To add a user:
//   1. Generate hash:  php -r "echo password_hash('password', PASSWORD_BCRYPT);"
//   2. Add entry below with email => ['name' => ..., 'hash' => ..., 'role' => ...]
//
// When migrating to WordPress:
//   Replace verify_user() with wp_authenticate() / wp_check_password()

$AUTH_USERS = [
    // Dev account — simple credentials for development
    'shaun.palmer0@gmail.com' => [
        'name' => 'Shaun',
        'hash' => '$2y$10$59.txrjK6wW./E1BHF5ZLe1PpPOmjXiqMrCIVezbjNsfe7SB5XSf6', // checklist
        'role' => 'supervisor',
    ],
    // Add more supervisors here:
    // 'jane@ays.co.nz' => [
    //     'name' => 'Jane',
    //     'hash' => password_hash('her_password', PASSWORD_BCRYPT),
    //     'role' => 'supervisor',
    // ],
];

/**
 * Verify user credentials against the local user array.
 *
 * @param string $email    Email address
 * @param string $password Plain text password
 * @return array|false     User data array on success, false on failure
 */
function verify_user(string $email, string $password) {
    global $AUTH_USERS;

    $email = strtolower(trim($email));

    if (!isset($AUTH_USERS[$email])) {
        // Constant-time comparison to prevent user enumeration
        password_verify($password, '$2y$10$dummyhashtopreventtimingattacks000000000000000000');
        return false;
    }

    $user = $AUTH_USERS[$email];

    if (password_verify($password, $user['hash'])) {
        return [
            'email' => $email,
            'name'  => $user['name'],
            'role'  => $user['role'],
        ];
    }

    return false;
}

// ─── Rate Limiting Functions ────────────────────────────────────────────────────

/**
 * Get rate limit data for an IP address.
 * Uses a JSON file (no DB needed for dev).
 */
function get_rate_limit_data(string $ip): array {
    $data = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $raw = file_get_contents(RATE_LIMIT_FILE);
        $data = json_decode($raw, true) ?: [];
    }

    // Clean expired entries while we're here
    $now = time();
    foreach ($data as $key => $entry) {
        if (isset($entry['locked_until']) && $entry['locked_until'] < $now) {
            $entry['attempts'] = 0;
            $entry['locked_until'] = null;
            $data[$key] = $entry;
        }
    }

    return $data[$ip] ?? ['attempts' => 0, 'locked_until' => null, 'last_attempt' => null];
}

/**
 * Check if an IP is currently locked out.
 */
function is_locked_out(string $ip): bool {
    $entry = get_rate_limit_data($ip);
    if (!empty($entry['locked_until']) && $entry['locked_until'] > time()) {
        return true;
    }
    return false;
}

/**
 * Record a failed login attempt. Lock out after MAX_LOGIN_ATTEMPTS.
 */
function record_failed_attempt(string $ip): void {
    $data = [];
    if (file_exists(RATE_LIMIT_FILE)) {
        $data = json_decode(file_get_contents(RATE_LIMIT_FILE), true) ?: [];
    }

    $entry = $data[$ip] ?? ['attempts' => 0, 'locked_until' => null, 'last_attempt' => null];
    $entry['attempts']++;
    $entry['last_attempt'] = time();

    if ($entry['attempts'] >= MAX_LOGIN_ATTEMPTS) {
        $entry['locked_until'] = time() + LOCKOUT_DURATION;
    }

    $data[$ip] = $entry;

    $dir = dirname(RATE_LIMIT_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents(RATE_LIMIT_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

/**
 * Clear rate limit data for an IP after successful login.
 */
function clear_rate_limit(string $ip): void {
    if (!file_exists(RATE_LIMIT_FILE)) return;

    $data = json_decode(file_get_contents(RATE_LIMIT_FILE), true) ?: [];
    unset($data[$ip]);
    file_put_contents(RATE_LIMIT_FILE, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

// ─── CSRF Functions ─────────────────────────────────────────────────────────────

/**
 * Generate a CSRF token and store in session.
 */
function generate_csrf_token(): string {
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Validate a CSRF token from POST data.
 */
function validate_csrf_token(string $token): bool {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}
