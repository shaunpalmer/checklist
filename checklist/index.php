<?php
/**
 * @file index.php
 * @description Protected entry point for the Checklist PWA.
 *              Requires authentication, then includes checklist-modern.html.
 * @version 1.0
 * @date 2026-02-09
 *
 * This is a thin PHP wrapper. The actual app is still checklist-modern.html.
 * The auth guard checks the session; if not logged in, redirects to login.php.
 *
 * WORDPRESS MIGRATION:
 *   Replace auth-guard.php include with WordPress auth check.
 */

require_once __DIR__ . '/config/auth-guard.php';

// Signal to checklist-modern.php that auth has passed (prevents direct access)
define('AYS_AUTH_PASSED', true);

// $current_user is now available (set by auth-guard.php):
//   $current_user['email'], $current_user['name'], $current_user['role']

// Include the actual app
include __DIR__ . '/checklist-modern.php';
