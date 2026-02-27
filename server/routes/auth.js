import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        authenticated: false,
        message: 'Missing username or password'
      });
    }

    const [rows] = await db.query(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (rows.length === 0 || !await bcrypt.compare(password, rows[0].password_hash)) {
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid username or password'
      });
    }

    req.session.userId = rows[0].id;
    req.session.username = rows[0].username;
    req.session.role = 'admin';

    res.json({
      authenticated: true,
      user: {
        username: rows[0].username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      authenticated: false,
      message: 'Server error'
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        authenticated: true,
        message: 'Logout failed'
      });
    }
    res.clearCookie('connect.sid');
    res.json({ authenticated: false });
  });
});

router.get('/check-auth', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      authenticated: true,
      user: {
        username: req.session.username
      }
    });
  }
  res.json({ authenticated: false });
});

export default router;
