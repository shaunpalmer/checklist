<?php
/**
 * @file config/auth-guard.php
 * @description Include at the top of any protected page.
 *              Starts session, checks auth, redirects to login if not authenticated.
 * @version 1.0
 * @date 2026-02-09
 *
 * Usage:
 *   <?php require_once __DIR__ . '/config/auth-guard.php'; ?>
 *   (at the very top of any protected .php page)
 *
 * WORDPRESS MIGRATION:
 *   Replace this entire file with:
 *     if (!is_user_logged_in()) { wp_redirect(wp_login_url()); exit; }
 */

require_once __DIR__ . '/auth-config.php';

// ─── Start Session ──────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start([
        'cookie_httponly'  => true,
        'cookie_samesite'  => 'Strict',
        'cookie_secure'    => isset($_SERVER['HTTPS']),  // true if HTTPS
        'use_strict_mode'  => true,
    ]);
}

// ─── Check Authentication ───────────────────────────────────────────────────────
if (empty($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    // Not logged in — redirect to login page
    header('Location: ' . LOGIN_URL);
    exit;
}

// ─── Idle Timeout Check (disabled during dev, set SESSION_IDLE_TIMEOUT > 0 to enable) ─
if (SESSION_IDLE_TIMEOUT > 0) {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_IDLE_TIMEOUT) {
        // Session expired — destroy and redirect
        session_unset();
        session_destroy();
        header('Location: ' . LOGIN_URL . '?expired=1');
        exit;
    }
}
$_SESSION['last_activity'] = time();

// ─── Make user data available to protected pages ────────────────────────────────
$current_user = [
    'email' => $_SESSION['user_email'] ?? '',
    'name'  => $_SESSION['user_name'] ?? '',
    'role'  => $_SESSION['user_role'] ?? '',
];
