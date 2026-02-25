<?php
/**
 * Fallback configuration when api/.env is not available.
 * Prefer using api/.env in production.
 */
return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '5432',
    'DB_NAME' => 'almajd_db',
    'DB_USER' => 'almajd_user',
    'DB_PASS' => '',
    'SESSION_NAME' => 'ALMAJDSESSID',
];
