import { Router } from 'express';
import { db } from '../db/database.js';
import { hashPassword, verifyPassword, signToken } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    role: role || 'developer',
    createdAt: new Date().toISOString()
  };

  db.createUser(newUser);
  db.logActivity({
    action: 'REGISTER',
    entity: 'user',
    entityId: newUser.id,
    details: `User registered: ${newUser.email}`,
    user: newUser.email
  });

  const token = signToken({ id: newUser.id, email: newUser.email });
  res.status(201).json({
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ id: user.id, email: user.email });
  db.logActivity({
    action: 'LOGIN',
    entity: 'user',
    entityId: user.id,
    details: `User logged in: ${user.email}`,
    user: user.email
  });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
