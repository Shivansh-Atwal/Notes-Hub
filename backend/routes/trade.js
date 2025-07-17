import express from 'express';
import Trade from '../models/trade.js';

const router = express.Router();

// GET all trades or a trade by tradeCode
router.get('/', async (req, res) => {
  try {
    const { tradeCode } = req.query;
    if (tradeCode) {
      const trade = await Trade.findOne({ tradeCode });
      if (trade) return res.json(trade);
      return res.status(404).json({ error: 'Trade not found' });
    }
    const trades = await Trade.find();
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create a new trade
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const trade = new Trade({ name, description });
    await trade.save();
    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 