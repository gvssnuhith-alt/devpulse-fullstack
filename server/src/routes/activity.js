import { Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
  const activity = db.getActivityLogs(limit);
  res.json({ activity, count: activity.length });
});

export default router;
