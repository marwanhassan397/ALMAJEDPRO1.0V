<?php

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

// Do not create a new session if the cookie does not exist.
$started = start_app_session(false);

if ($started) {
    // Clear session data
    $_SESSION = [];

    $params = session_get_cookie_params();
    $name = session_name();

    // Delete the cookie (ONE Set-Cookie only)
    setcookie($name, '', [
        'expires' => time() - 42000,
        'path' => $params['path'] ?? '/',
        'domain' => $params['domain'] ?? '',
        'secure' => (bool)($params['secure'] ?? false),
        'httponly' => (bool)($params['httponly'] ?? true),
        'samesite' => $params['samesite'] ?? 'Lax',
    ]);

    session_destroy();
}

send_json(['authenticated' => false]);
