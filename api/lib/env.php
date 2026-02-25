<?php

/**
 * Minimal .env loader (no external dependencies).
 */
function env_load(string $envPath): array
{
    if (!is_file($envPath) || !is_readable($envPath)) {
        return [];
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return [];
    }

    $vars = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $pos = strpos($line, '=');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));

        // Strip optional quotes
        if ((str_starts_with($val, '"') && str_ends_with($val, '"')) || (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
            $val = substr($val, 1, -1);
        }

        $vars[$key] = $val;
    }

    return $vars;
}

function env_get(string $key, $default = null)
{
    static $cache = null;

    if ($cache === null) {
        $envPath = __DIR__ . '/../.env';
        $cache = env_load($envPath);

        // Merge fallback config.php if present
        $fallback = __DIR__ . '/../config.php';
        if (is_file($fallback)) {
            $cfg = require $fallback;
            if (is_array($cfg)) {
                $cache = array_merge($cfg, $cache);
            }
        }
    }

    if (array_key_exists($key, $cache)) {
        return $cache[$key];
    }

    return $default;
}
