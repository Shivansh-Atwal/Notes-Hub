import express from 'express';
import Subject from '../models/subject.js';

const router = express.Router();


router.get('/', async (req, res) => {
  const { trade, semester } = req.query;
  const filter = {};
  if (trade) filter.trade = trade;
  if (semester) filter.semester = semester;
  try {
    const subjects = await Subject.find(filter).populate('trade');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  const { code, name, trade, semester } = req.body;
 
  if (!code || !name || !Array.isArray(trade) || trade.length === 0 || !semester) {
    return res.status(400).json({ error: 'Code, name, at least one trade, and semester are required' });
  }
  try {
    const subject = new Subject({ code, name, trade, semester });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 