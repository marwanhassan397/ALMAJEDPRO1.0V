import express from 'express';
import db from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_PUBLIC_PROFILE_ID = 0;
const DEFAULT_PUBLIC_PROFILE_SLUG = 'support-almajd';

function slugify(value) {
  value = value.trim().toLowerCase();
  value = value.replace(/[^a-z0-9]+/g, '-');
  value = value.replace(/^-+|-+$/g, '');
  return value;
}

async function uniqueSlug(name, currentId = null) {
  const base = slugify(name) || 'profile';
  let slug = base;
  let i = 1;

  while (true) {
    let query, params;
    if (currentId) {
      query = 'SELECT 1 FROM public_profiles WHERE slug = ? AND id != ? LIMIT 1';
      params = [slug, currentId];
    } else {
      query = 'SELECT 1 FROM public_profiles WHERE slug = ? LIMIT 1';
      params = [slug];
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return slug;
    }

    i++;
    slug = `${base}-${i}`;
    if (i > 9999) {
      throw new Error('Unable to generate unique slug');
    }
  }
}

function normalizeProfile(row) {
  return {
    id: String(row.id),
    publicId: row.public_id !== null ? parseInt(row.public_id) : null,
    name: row.name || '',
    position: row.job_title || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    imageUrl: row.avatar_url || '',
    status: row.status ? 'active' : 'inactive',
    slug: row.slug || '',
    createdAt: row.created_at || ''
  };
}

function parsePublicId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Math.floor(value);
  const digits = String(value).replace(/\D/g, '');
  if (digits === '') return null;
  return parseInt(digits);
}

router.get('/profiles', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at
      FROM public_profiles
      ORDER BY (CASE WHEN public_id IS NULL THEN 1 ELSE 0 END), public_id ASC, created_at ASC
    `);

    const profiles = rows.map(normalizeProfile);
    res.json({ success: true, profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/profiles', requireAdmin, async (req, res) => {
  try {
    const { id, name, publicId: publicIdInput, position, phone, whatsapp, email, imageUrl, status } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    let publicId = parsePublicId(publicIdInput);
    const isActive = status !== 'inactive';
    const jobTitle = position?.trim() || '';
    const phoneNum = phone?.trim() || '';
    const whatsappNum = whatsapp?.trim() || '';
    const emailAddr = email?.trim() || '';
    const avatarUrl = imageUrl?.trim() || '';

    if (id) {
      const [existing] = await db.query(
        'SELECT id, public_id, slug FROM public_profiles WHERE id = ? LIMIT 1',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const existingPublicId = existing[0].public_id !== null ? parseInt(existing[0].public_id) : null;
      const existingSlug = existing[0].slug || '';

      if (existingPublicId === DEFAULT_PUBLIC_PROFILE_ID || existingSlug === DEFAULT_PUBLIC_PROFILE_SLUG) {
        return res.status(400).json({
          success: false,
          message: 'Default profile can only be edited from the database.'
        });
      }

      if (publicId !== null) {
        if (publicId === DEFAULT_PUBLIC_PROFILE_ID) {
          return res.status(400).json({
            success: false,
            message: '0000 is reserved for the default profile.'
          });
        }
        if (publicId < 0 || publicId > 9999) {
          return res.status(400).json({
            success: false,
            message: 'Public code must be between 0000 and 9999.'
          });
        }

        const [duplicate] = await db.query(
          'SELECT 1 FROM public_profiles WHERE public_id = ? AND id != ? LIMIT 1',
          [publicId, id]
        );
        if (duplicate.length > 0) {
          return res.status(400).json({ success: false, message: 'Public code already in use.' });
        }
      }

      const slug = await uniqueSlug(name, id);

      const [result] = await db.query(
        `UPDATE public_profiles
         SET public_id = COALESCE(?, public_id),
             name = ?,
             job_title = ?,
             phone = ?,
             whatsapp = ?,
             email = ?,
             avatar_url = ?,
             status = ?,
             slug = ?
         WHERE id = ?`,
        [
          publicId,
          name,
          jobTitle || null,
          phoneNum || null,
          whatsappNum || null,
          emailAddr || null,
          avatarUrl || null,
          isActive,
          slug,
          id
        ]
      );

      const [updated] = await db.query(
        'SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at FROM public_profiles WHERE id = ?',
        [id]
      );

      return res.json({ success: true, profile: normalizeProfile(updated[0]) });
    }

    if (publicId === null) {
      const [maxResult] = await db.query(
        'SELECT COALESCE(MAX(public_id), 0) AS max_id FROM public_profiles WHERE public_id IS NOT NULL AND public_id > 0'
      );
      publicId = (maxResult[0]?.max_id || 0) + 1;
    }

    if (publicId === DEFAULT_PUBLIC_PROFILE_ID) {
      return res.status(400).json({
        success: false,
        message: '0000 is reserved for the default profile.'
      });
    }
    if (publicId < 0 || publicId > 9999) {
      return res.status(400).json({
        success: false,
        message: 'Public code must be between 0000 and 9999.'
      });
    }

    const [duplicate] = await db.query(
      'SELECT 1 FROM public_profiles WHERE public_id = ? LIMIT 1',
      [publicId]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ success: false, message: 'Public code already in use.' });
    }

    const slug = await uniqueSlug(name);

    const [result] = await db.query(
      `INSERT INTO public_profiles (public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [publicId, name, jobTitle || null, phoneNum || null, whatsappNum || null, emailAddr || null, avatarUrl || null, isActive, slug]
    );

    const [inserted] = await db.query(
      'SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at FROM public_profiles WHERE id = ?',
      [result.insertId]
    );

    res.json({ success: true, profile: normalizeProfile(inserted[0]) });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/profiles', requireAdmin, async (req, res) => {
  try {
    const id = req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing id' });
    }

    const [existing] = await db.query(
      'SELECT id, public_id, slug FROM public_profiles WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const existingPublicId = existing[0].public_id !== null ? parseInt(existing[0].public_id) : null;
    const existingSlug = existing[0].slug || '';

    if (existingPublicId === DEFAULT_PUBLIC_PROFILE_ID || existingSlug === DEFAULT_PUBLIC_PROFILE_SLUG) {
      return res.status(400).json({ success: false, message: 'Default profile cannot be deleted.' });
    }

    await db.query('DELETE FROM public_profiles WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
