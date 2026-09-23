import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/summary', (req, res) => {
  const stats = db.getAnalytics();
  res.json({ analytics: stats });
});

export default router;
