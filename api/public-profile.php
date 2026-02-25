<?php

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$publicIdRaw = $_GET['publicId'] ?? null;
$publicId = 0;

if ($publicIdRaw !== null && $publicIdRaw !== '') {
    $digits = preg_replace('/\D/', '', (string)$publicIdRaw);
    if ($digits === '') {
        $publicId = 0;
    } else {
        $publicId = (int)$digits;
    }
}

$fetchByPublicId = function (PDO $pdo, int $pid) {
    $stmt = $pdo->prepare(
        'SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at
         FROM public_profiles
         WHERE public_id = :pid
         LIMIT 1'
    );
    $stmt->execute([':pid' => $pid]);
    return $stmt->fetch();
};

try {
    $pdo = db();

    $row = $fetchByPublicId($pdo, $publicId);

    if (!$row && $publicId !== 0) {
        $row = $fetchByPublicId($pdo, 0);
    }

    if (!$row) {
        send_json(['success' => false, 'message' => 'Profile not found'], 404);
    }

    $profile = [
        'id' => (string)$row['id'],
        'publicId' => $row['public_id'] !== null ? (int)$row['public_id'] : null,
        'name' => (string)($row['name'] ?? ''),
        'position' => (string)($row['job_title'] ?? ''),
        'phone' => (string)($row['phone'] ?? ''),
        'whatsapp' => (string)($row['whatsapp'] ?? ''),
        'email' => (string)($row['email'] ?? ''),
        'imageUrl' => (string)($row['avatar_url'] ?? ''),
        'status' => ((bool)($row['status'] ?? true)) ? 'active' : 'inactive',
        'slug' => (string)($row['slug'] ?? ''),
        'createdAt' => (string)($row['created_at'] ?? ''),
    ];

    send_json(['success' => true, 'profile' => $profile]);
} catch (Throwable $e) {
    send_json(['success' => false, 'message' => $e->getMessage()], 500);
}
