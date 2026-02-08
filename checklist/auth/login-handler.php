<?php
/**
 * @file auth/login-handler.php
 * @description Handles POST login form submissions.
 *              Validates CSRF, checks rate limits, verifies credentials, sets session.
 * @version 1.0
 * @date 2026-02-09
 */

require_once __DIR__ . '/../config/auth-config.php';

// ─── Start Session ──────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start([
        'cookie_httponly'  => true,
        'cookie_samesite'  => 'Strict',
        'cookie_secure'    => isset($_SERVER['HTTPS']),
        'use_strict_mode'  => true,
    ]);
}

// ─── Only accept POST ───────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../' . LOGIN_URL);
    exit;
}

// ─── CSRF Validation ────────────────────────────────────────────────────────────
$submitted_token = $_POST[CSRF_TOKEN_NAME] ?? '';
if (!validate_csrf_token($submitted_token)) {
    $_SESSION['login_error'] = 'Invalid form submission. Please try again.';
    header('Location: ../' . LOGIN_URL);
    exit;
}

// Regenerate CSRF token after use (one-time use)
unset($_SESSION[CSRF_TOKEN_NAME]);

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

if (is_locked_out($ip)) {
    $entry = get_rate_limit_data($ip);
    $remaining = ceil(($entry['locked_until'] - time()) / 60);
    $_SESSION['login_error'] = "Too many failed attempts. Try again in {$remaining} minute(s).";
    header('Location: ../' . LOGIN_URL);
    exit;
}

// ─── Get Credentials ────────────────────────────────────────────────────────────
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    $_SESSION['login_error'] = 'Please enter both email and password.';
    $_SESSION['login_old_email'] = $email;
    header('Location: ../' . LOGIN_URL);
    exit;
}

// ─── Verify Credentials ────────────────────────────────────────────────────────
$user = verify_user($email, $password);

if ($user === false) {
    // Failed login
    record_failed_attempt($ip);

    $entry = get_rate_limit_data($ip);
    $remaining_attempts = MAX_LOGIN_ATTEMPTS - $entry['attempts'];

    if ($remaining_attempts > 0) {
        $_SESSION['login_error'] = "Invalid email or password. {$remaining_attempts} attempt(s) remaining.";
    } else {
        $_SESSION['login_error'] = 'Account locked. Try again in ' . (LOCKOUT_DURATION / 60) . ' minutes.';
    }

    $_SESSION['login_old_email'] = $email;
    header('Location: ../' . LOGIN_URL);
    exit;
}

// ─── Successful Login ───────────────────────────────────────────────────────────
// Clear rate limiting
clear_rate_limit($ip);

// Regenerate session ID to prevent session fixation
session_regenerate_id(true);

// Set session data
$_SESSION['authenticated'] = true;
$_SESSION['user_email']    = $user['email'];
$_SESSION['user_name']     = $user['name'];
$_SESSION['user_role']     = $user['role'];
$_SESSION['login_time']    = time();
$_SESSION['last_activity'] = time();

// Clean up temporary session data
unset($_SESSION['login_error'], $_SESSION['login_old_email']);

// Redirect to app
header('Location: ../' . AFTER_LOGIN_URL);
exit;
