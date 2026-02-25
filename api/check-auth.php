<?php

require_once __DIR__ . '/lib/auth.php';

if (is_authenticated()) {
    send_json([
        'authenticated' => true,
        'user' => current_admin(),
    ]);
}

send_json([
    'authenticated' => false,
]);
