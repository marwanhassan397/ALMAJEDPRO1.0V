<?php

require_once __DIR__ . '/session.php';
require_once __DIR__ . '/response.php';

function is_authenticated(): bool
{
    $started = start_app_session(false);
    if (!$started) {
        return false;
    }

    return isset($_SESSION['admin_username']) && is_string($_SESSION['admin_username']) && $_SESSION['admin_username'] !== '';
}

function current_admin(): ?array
{
    if (!is_authenticated()) {
        return null;
    }
    return [
        'username' => $_SESSION['admin_username'],
    ];
}

function require_auth(): void
{
    if (!is_authenticated()) {
        send_json(['authenticated' => false, 'message' => 'Unauthorized'], 401);
    }
}
