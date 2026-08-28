import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDb } from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bconnect-super-secret-key-change-in-prod';
const COOKIE_NAME = 'auth_token';

// Middleware to verify JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Exclude passcodeHash from req.user
    const { passcodeHash, ...userWithoutPassword } = user;
    (req as any).user = userWithoutPassword;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.post('/login', async (req: Request, res: Response) => {
  const { emailOrId, passcode } = req.body;
  
  if (!emailOrId || !passcode) {
    res.status(400).json({ success: false, message: 'Missing credentials' });
    return;
  }

  try {
    const db = await getDb();
    const cleanQuery = emailOrId.trim().toLowerCase();
    
    // Find user by email, id, badgeOrIdNumber or name (since previous logic allowed name matching)
    // Note: Name matching is risky for auth, but to keep backwards compatibility with the requested behavior:
    const user = await db.get(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(id) = ? OR LOWER(badgeOrIdNumber) = ? OR LOWER(name) LIKE ?',
      [cleanQuery, cleanQuery, cleanQuery, `%${cleanQuery}%`]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication failed. No officer account found matching the provided identifier.' });
      return;
    }

    const isMatch = await bcrypt.compare(passcode, user.passcodeHash);
    
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Incorrect password. The password you entered does not match this account.' });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const { passcodeHash, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ success: true, user: (req as any).user });
});

export default router;
