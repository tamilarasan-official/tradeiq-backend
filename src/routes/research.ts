import { Router } from 'express';
import { ResearchEvent } from '../models/ResearchEvent.js';

const router = Router();

router.post('/event', async (req, res, next) => {
  try {
    const event = await ResearchEvent.create(req.body);
    res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
});

router.get('/summary/:userId', (req, res) => {
  res.json({ data: { userId: req.params.userId, avgExecutionTimeMs: 0 } });
});

router.post('/survey', (_req, res) => {
  res.status(201).json({ message: 'Survey response recorded' });
});

export default router;
