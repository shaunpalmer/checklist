<?php
/**
 * @file login.php
 * @description Login page for AYS Checklist PWA.
 *              Converted from login.html template (2026-02-08).
 * @version 2.0
 * @date 2026-02-09
 */

require_once __DIR__ . '/config/auth-config.php';

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

// ─── Already logged in? Redirect to app ────────────────────────────────────────
if (!empty($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
    header('Location: ' . AFTER_LOGIN_URL);
    exit;
}

// ─── Get flash messages ─────────────────────────────────────────────────────────
$error_message   = $_SESSION['login_error'] ?? '';
$old_email       = $_SESSION['login_old_email'] ?? '';
$success_message = '';

// Session expired notification
if (isset($_GET['expired'])) {
    $error_message = 'Your session has expired. Please sign in again.';
}
// Logged out notification
if (isset($_GET['logged_out'])) {
    $success_message = 'You have been signed out successfully.';
}

// Clear flash data
unset($_SESSION['login_error'], $_SESSION['login_old_email']);

// ─── Generate CSRF token ────────────────────────────────────────────────────────
$csrf_token = generate_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars(APP_NAME); ?> — Login</title>
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
        }

        :root {
            --primary-color: dodgerblue;
            --primary-hover: royalblue;
            --secondary-color: slategray;
            --background-color: whitesmoke;
            --text-color: #212529;
            --input-border: darkgray;
            --border-color: gainsboro;
            --error-color: crimson;
            --success-color: seagreen;
            --shadow: 0 0 10px rgba(0,0,0,0.1);
            --brand-green: #1cc950;
        }

        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--background-color);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .login-container {
            background-image: url(imgs/shapes/4.svg);
            background-size: cover;
            background-position: center;
            padding: 2rem;
            border: 1px solid var(--secondary-color);
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(112, 128, 144, 0.3);
            max-width: 400px;
            width: 100%;
        }

        .login-box {
            background: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
        }

        .logo-area {
            margin-bottom: 1.5rem;
        }

        .logo-area img {
            width: 80px;
            height: 80px;
            border-radius: 18px;
            box-shadow: 0 2px 8px rgba(28, 201, 80, 0.3);
        }

        h1 {
            color: var(--text-color);
            margin-bottom: 0.25rem;
            font-size: 1.5rem;
        }

        .subtitle {
            color: var(--secondary-color);
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        input[type="email"],
        input[type="password"],
        input[type="text"].password-visible {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--input-border);
            border-radius: 6px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }

        .password-wrapper {
            position: relative;
        }

        .password-wrapper input {
            padding-right: 2.75rem;
        }

        .password-toggle {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--secondary-color);
            padding: 4px;
            line-height: 1;
            opacity: 0.6;
            transition: opacity 0.2s;
        }

        .password-toggle:hover {
            opacity: 1;
        }

        input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
        }

        button[type="submit"] {
            width: 100%;
            padding: 0.75rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        button[type="submit"]:hover {
            background-color: var(--primary-hover);
        }

        button[type="submit"]:disabled {
            background-color: var(--border-color);
            cursor: not-allowed;
        }

        .form-message {
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.85rem;
        }

        .form-message.error {
            background-color: lavenderblush;
            color: var(--error-color);
            border: 1px solid var(--error-color);
        }

        .form-message.success {
            background-color: honeydew;
            color: var(--success-color);
            border: 1px solid var(--success-color);
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-box">

            <!-- Logo -->
            <div class="logo-area">
                <img src="<?php echo htmlspecialchars(LOGO_PATH); ?>" alt="<?php echo htmlspecialchars(APP_NAME); ?>">
            </div>

            <h1><?php echo htmlspecialchars(LOGIN_HEADING); ?></h1>
            <p class="subtitle"><?php echo htmlspecialchars(LOGIN_SUBTITLE); ?></p>

            <?php if ($error_message): ?>
                <div class="form-message error"><?php echo htmlspecialchars($error_message); ?></div>
            <?php endif; ?>

            <?php if ($success_message): ?>
                <div class="form-message success"><?php echo htmlspecialchars($success_message); ?></div>
            <?php endif; ?>

            <form method="POST" action="auth/login-handler.php" autocomplete="on">
                <input type="hidden" name="<?php echo CSRF_TOKEN_NAME; ?>" value="<?php echo htmlspecialchars($csrf_token); ?>">

                <div class="form-group">
                    <input type="email" name="email" placeholder="Email" required
                           autocomplete="email"
                           value="<?php echo htmlspecialchars($old_email); ?>">
                </div>
                <div class="form-group">
                    <div class="password-wrapper">
                        <input type="password" id="login-password" name="password" placeholder="Password" required
                               autocomplete="current-password">
                        <button type="button" class="password-toggle" aria-label="Show password" onclick="togglePasswordVisibility()">👁</button>
                    </div>
                </div>
                <div class="form-group">
                    <button type="submit">Sign In</button>
                </div>
            </form>

        </div>
    </div>
    <script>
        function togglePasswordVisibility() {
            const input = document.getElementById('login-password');
            const btn = input.nextElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                input.classList.add('password-visible');
                btn.textContent = '🙈';
                btn.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                input.classList.remove('password-visible');
                btn.textContent = '👁';
                btn.setAttribute('aria-label', 'Show password');
            }
        }
    </script>
</body>
</html>
