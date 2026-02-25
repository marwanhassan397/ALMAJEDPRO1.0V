<?php

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$body = read_json_body();
$username = isset($body['username']) ? trim((string)$body['username']) : '';
$password = isset($body['password']) ? (string)$body['password'] : '';

if ($username === '' || $password === '') {
    send_json(['authenticated' => false, 'message' => 'Missing username or password'], 400);
}

try {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = :u LIMIT 1');
    $stmt->execute([':u' => $username]);
    $row = $stmt->fetch();

    if (!$row || !isset($row['password_hash']) || !password_verify($password, (string)$row['password_hash'])) {
        // Avoid leaking whether the username exists
        send_json(['authenticated' => false, 'message' => 'Invalid username or password'], 401);
    }

    start_app_session(true);
    session_regenerate_id(true);

    $_SESSION['admin_username'] = (string)$row['username'];

    send_json([
        'authenticated' => true,
        'user' => [
            'username' => (string)$row['username'],
        ],
    ]);
} catch (Throwable $e) {
    send_json(['authenticated' => false, 'message' => $e->getMessage()], 500);
}
