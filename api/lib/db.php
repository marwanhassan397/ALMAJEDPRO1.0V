<?php

require_once __DIR__ . '/env.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env_get('DB_HOST', '127.0.0.1');
    $port = env_get('DB_PORT', '5432');
    $name = env_get('DB_NAME', '');
    $user = env_get('DB_USER', '');
    $pass = env_get('DB_PASS', '');

    if (!$name || !$user) {
        throw new RuntimeException('Database configuration is missing (DB_NAME / DB_USER).');
    }

    $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $host, $port, $name);

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Ensure UTF-8
    $pdo->exec("SET client_encoding TO 'UTF8'");

    return $pdo;
}
