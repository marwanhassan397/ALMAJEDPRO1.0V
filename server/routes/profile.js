import express from 'express';
import db from '../config/database.js';

const router = express.Router();

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

async function fetchByPublicId(publicId) {
  const [rows] = await db.query(
    `SELECT id, public_id, name, job_title, phone, whatsapp, email, avatar_url, status, slug, created_at
     FROM public_profiles
     WHERE public_id = ?
     LIMIT 1`,
    [publicId]
  );
  return rows[0] || null;
}

router.get('/public-profile', async (req, res) => {
  try {
    const publicIdRaw = req.query.publicId;
    let publicId = 0;

    if (publicIdRaw !== null && publicIdRaw !== undefined && publicIdRaw !== '') {
      const digits = String(publicIdRaw).replace(/\D/g, '');
      publicId = digits === '' ? 0 : parseInt(digits);
    }

    let row = await fetchByPublicId(publicId);

    if (!row && publicId !== 0) {
      row = await fetchByPublicId(0);
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = normalizeProfile(row);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
