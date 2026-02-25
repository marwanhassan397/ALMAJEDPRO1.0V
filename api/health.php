<?php

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';

try {
    $pdo = db();
    $stmt = $pdo->query('SELECT 1 as ok');
    $row = $stmt->fetch();

    send_json([
        'success' => true,
        'db' => true,
        'result' => $row,
    ]);
} catch (Throwable $e) {
    send_json([
        'success' => false,
        'db' => false,
        'message' => $e->getMessage(),
    ], 500);
}
