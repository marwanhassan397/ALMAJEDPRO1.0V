<?php

require_once __DIR__ . '/env.php';

/**
 * Start session safely.
 *
 * IMPORTANT requirements:
 * - Only ONE session cookie (same name + path "/")
 * - Avoid creating a brand-new session for unauthenticated requests
 *   (so endpoints like /check-auth.php or /api/admin/* do NOT emit Set-Cookie when not logged in)
 *
 * @return bool true when the session is active, false when skipped (no existing cookie and not forced)
 */
function start_app_session(bool $force = false): bool
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }

    $sessionName = env_get('SESSION_NAME', 'ALMAJDSESSID');
    if (is_string($sessionName) && $sessionName !== '') {
        session_name($sessionName);
    }

    // If not forcing, only start session when the cookie already exists.
    $cookieName = session_name();
    if (!$force && (!isset($_COOKIE[$cookieName]) || $_COOKIE[$cookieName] === '')) {
        return false;
    }

    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');

    // IMPORTANT: Path "/" avoids duplicated cookies across subfolders.
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
    return true;
}
