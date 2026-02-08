<?php
/**
 * @file auth/logout.php
 * @description Destroys the session and redirects to login page.
 * @version 1.0
 * @date 2026-02-09
 */

require_once __DIR__ . '/../config/auth-config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Clear all session data
$_SESSION = [];

// Delete the session cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Destroy the session
session_destroy();

// Redirect to login
header('Location: ../' . LOGIN_URL . '?logged_out=1');
exit;
