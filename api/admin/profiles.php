<?php

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';

require_auth();

const DEFAULT_PUBLIC_PROFILE_ID = 0;
const DEFAULT_PUBLIC_PROFILE_SLUG = 'support-almajd';

function slugify(string $value): string
{
    $value = trim(strtolower($value));
    // Replace anything that is not letter/number with dash
    $value = preg_replace('/[^a-z0-9]+/u', '-', $value);
    $value = trim($value, '-');
    return $value;
}

function unique_slug(PDO $pdo, string $name, ?string $currentId = null): string
{
    $base = slugify($name);
    if ($base === '') {
        $base = 'profile';
    }

    $slug = $base;
    $i = 1;

    while (true) {
        if ($currentId) {
            $stmt = $pdo->prepare('SELECT 1 FROM public_profiles WHERE slug = :s AND id <> :id LIMIT 1');
            $stmt->execute([':s' => $slug, ':id' => $currentId]);
        } else {
            $stmt = $pdo->prepare('SELECT 1 FROM public_profiles WHERE slug = :s LIMIT 1');
            $stmt->execute([':s' => $slug]);
        }

        $exists = (bool)$stmt->fetchColumn();
        if (!$exists) {
            return $slug;
        }

        $i++;
        $slug = $base . '-' . $i;
        if ($i > 9999) {
            throw new RuntimeException('Unable to generate unique slug.');
        }
    }
}

function normalize_profile(array $row): array
{
    return [
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
}

function parse_public_id($value): ?int
{
    if ($value === null) return null;
    if (is_int($value)) return $value;
    if (is_float($value)) return (int)$value;
    $digits = preg_replace('/\D/', '', (string)$value);
    if ($digits === '') return null;
    return (int)$digits;
}

try {
    $pdo = db();

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query(
            'SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at
             FROM public_profiles
             ORDER BY (CASE WHEN public_id IS NULL THEN 1 ELSE 0 END), public_id ASC, created_at ASC'
        );
        $rows = $stmt->fetchAll();
        $profiles = array_map('normalize_profile', $rows);
        send_json(['success' => true, 'profiles' => $profiles]);
    }

    if ($method === 'POST') {
        $body = read_json_body();

        $id = isset($body['id']) && $body['id'] !== '' ? (string)$body['id'] : null;

        $name = isset($body['name']) ? trim((string)$body['name']) : '';
        if ($name === '') {
            send_json(['success' => false, 'message' => 'Name is required'], 400);
        }

        $publicIdInput = $body['publicId'] ?? null;
        $publicId = parse_public_id($publicIdInput);

        $status = isset($body['status']) && (string)$body['status'] === 'inactive' ? false : true;

        $jobTitle = isset($body['position']) ? trim((string)$body['position']) : '';
        $phone = isset($body['phone']) ? trim((string)$body['phone']) : '';
        $whatsapp = isset($body['whatsapp']) ? trim((string)$body['whatsapp']) : '';
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $avatarUrl = isset($body['imageUrl']) ? trim((string)$body['imageUrl']) : '';

        if ($id) {
            // Update
            $stmt = $pdo->prepare('SELECT id, public_id, slug FROM public_profiles WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $existing = $stmt->fetch();

            if (!$existing) {
                send_json(['success' => false, 'message' => 'Profile not found'], 404);
            }

            $existingPublicId = $existing['public_id'] !== null ? (int)$existing['public_id'] : null;
            $existingSlug = (string)($existing['slug'] ?? '');

            if ($existingPublicId === DEFAULT_PUBLIC_PROFILE_ID || $existingSlug === DEFAULT_PUBLIC_PROFILE_SLUG) {
                send_json(['success' => false, 'message' => 'Default profile can only be edited from the database.'], 400);
            }

            // Validate publicId if provided
            if ($publicId !== null) {
                if ($publicId === DEFAULT_PUBLIC_PROFILE_ID) {
                    send_json(['success' => false, 'message' => '0000 is reserved for the default profile.'], 400);
                }
                if ($publicId < 0 || $publicId > 9999) {
                    send_json(['success' => false, 'message' => 'Public code must be between 0000 and 9999.'], 400);
                }

                // Ensure uniqueness
                $stmt = $pdo->prepare('SELECT 1 FROM public_profiles WHERE public_id = :pid AND id <> :id LIMIT 1');
                $stmt->execute([':pid' => $publicId, ':id' => $id]);
                if ($stmt->fetchColumn()) {
                    send_json(['success' => false, 'message' => 'Public code already in use.'], 400);
                }
            }

            $slug = unique_slug($pdo, $name, $id);

            $stmt = $pdo->prepare(
                'UPDATE public_profiles
                 SET public_id = COALESCE(:public_id, public_id),
                     name = :name,
                     job_title = :job_title,
                     phone = :phone,
                     whatsapp = :whatsapp,
                     email = :email,
                     avatar_url = :avatar_url,
                     status = :status,
                     slug = :slug
                 WHERE id = :id
                 RETURNING id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at'
            );

            $stmt->execute([
                ':public_id' => $publicId,
                ':name' => $name,
                ':job_title' => $jobTitle !== '' ? $jobTitle : null,
                ':phone' => $phone !== '' ? $phone : null,
                ':whatsapp' => $whatsapp !== '' ? $whatsapp : null,
                ':email' => $email !== '' ? $email : null,
                ':avatar_url' => $avatarUrl !== '' ? $avatarUrl : null,
                ':status' => $status,
                ':slug' => $slug,
                ':id' => $id,
            ]);

            $row = $stmt->fetch();
            send_json(['success' => true, 'profile' => normalize_profile($row)]);
        }

        // Insert (new)
        if ($publicId === null) {
            $stmt = $pdo->query('SELECT COALESCE(MAX(public_id), 0) AS max_id FROM public_profiles WHERE public_id IS NOT NULL AND public_id > 0');
            $max = (int)($stmt->fetchColumn() ?? 0);
            $publicId = $max + 1;
        }

        if ($publicId === DEFAULT_PUBLIC_PROFILE_ID) {
            send_json(['success' => false, 'message' => '0000 is reserved for the default profile.'], 400);
        }
        if ($publicId < 0 || $publicId > 9999) {
            send_json(['success' => false, 'message' => 'Public code must be between 0000 and 9999.'], 400);
        }

        $stmt = $pdo->prepare('SELECT 1 FROM public_profiles WHERE public_id = :pid LIMIT 1');
        $stmt->execute([':pid' => $publicId]);
        if ($stmt->fetchColumn()) {
            send_json(['success' => false, 'message' => 'Public code already in use.'], 400);
        }

        $slug = unique_slug($pdo, $name, null);

        $stmt = $pdo->prepare(
            'INSERT INTO public_profiles (public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug)
             VALUES (:public_id, :name, :job_title, :phone, :whatsapp, :email, :avatar_url, :status, :slug)
             RETURNING id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at'
        );

        $stmt->execute([
            ':public_id' => $publicId,
            ':name' => $name,
            ':job_title' => $jobTitle !== '' ? $jobTitle : null,
            ':phone' => $phone !== '' ? $phone : null,
            ':whatsapp' => $whatsapp !== '' ? $whatsapp : null,
            ':email' => $email !== '' ? $email : null,
            ':avatar_url' => $avatarUrl !== '' ? $avatarUrl : null,
            ':status' => $status,
            ':slug' => $slug,
        ]);

        $row = $stmt->fetch();
        send_json(['success' => true, 'profile' => normalize_profile($row)]);
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $body = read_json_body();
            $id = $body['id'] ?? null;
        }
        $id = $id ? (string)$id : '';

        if ($id === '') {
            send_json(['success' => false, 'message' => 'Missing id'], 400);
        }

        $stmt = $pdo->prepare('SELECT id, public_id, slug FROM public_profiles WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            send_json(['success' => false, 'message' => 'Profile not found'], 404);
        }

        $existingPublicId = $existing['public_id'] !== null ? (int)$existing['public_id'] : null;
        $existingSlug = (string)($existing['slug'] ?? '');

        if ($existingPublicId === DEFAULT_PUBLIC_PROFILE_ID || $existingSlug === DEFAULT_PUBLIC_PROFILE_SLUG) {
            send_json(['success' => false, 'message' => 'Default profile cannot be deleted.'], 400);
        }

        $stmt = $pdo->prepare('DELETE FROM public_profiles WHERE id = :id');
        $stmt->execute([':id' => $id]);

        send_json(['success' => true]);
    }

    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
} catch (Throwable $e) {
    send_json(['success' => false, 'message' => $e->getMessage()], 500);
}
