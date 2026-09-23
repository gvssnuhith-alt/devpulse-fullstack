import { verifyToken } from '../utils/auth.js';
import { db } from '../db/database.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = db.findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  next();
}
